import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not set');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    console.log('Webhook event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userEmail = session.metadata?.user_email?.toLowerCase();
      const userId = session.metadata?.user_id;
      const tier = session.metadata?.tier?.toLowerCase();
      const expirationDays = session.metadata?.expiration_days;
      const isAccessPass = expirationDays !== undefined && expirationDays !== null;

      if (!userEmail || !tier) {
        console.error('Missing metadata: user_email or tier');
        return Response.json({ received: true });
      }

      console.log('✅ Checkout completed:', { userId, userEmail, tier, isAccessPass });

      // FIXED: Use created_by for lookup
      let profiles = await base44.asServiceRole.entities.UserProfile.filter({ 
        created_by: userEmail 
      });

      if (profiles.length === 0) {
        const newProfile = await base44.asServiceRole.entities.UserProfile.create({
          created_by: userEmail,
          premium: true,
          premium_tier: tier,
          subscription_status: 'active',
          stripe_customer_id: session.customer,
          treatment_confirmed: false
        });
        profiles = [newProfile];
        console.log('✅ Created new profile for:', userEmail);
      }

      const profileId = profiles[0].id;
      const updateData = {
        premium: true,
        premium_tier: tier,
        subscription_status: 'active',
        stripe_customer_id: session.customer,
      };

      if (isAccessPass) {
        const days = parseInt(expirationDays) || 7;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);
        updateData.subscription_expiration_date = expirationDate.toISOString();
      } else {
        updateData.stripe_subscription_id = session.subscription;
        updateData.subscription_expiration_date = null;
      }

      // Update with retry
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await base44.asServiceRole.entities.UserProfile.update(profileId, updateData);
          console.log(`✅ Profile updated (attempt ${attempt}): ${userEmail} → ${tier}`);
          break;
        } catch (e) {
          console.error(`Update failed (attempt ${attempt}):`, e);
          if (attempt === 2) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: 'your-email@example.com', // ← REPLACE
              subject: 'Webhook Update Failed',
              body: `Failed to update ${userEmail} to ${tier}. Error: ${e.message}`
            });
          }
        }
      }

      // Success email
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: userEmail,
          subject: `IBO Aftercare - ${tier} Access Activated!`,
          body: `Your ${tier} access is active! Features unlocked. https://iboaftercare.base44.app`
        });
      } catch (e) {
        console.error('Email failed:', e);
      }
    }

    // Handle subscription updated (cancel at period end, past_due, etc.)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const userEmail = subscription.metadata?.user_email?.toLowerCase();

      if (!userEmail) return Response.json({ received: true });

      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ 
        created_by: userEmail 
      });

      if (profiles.length > 0) {
        const profile = profiles[0];
        if (subscription.cancel_at_period_end) {
          const expirationDate = new Date(subscription.current_period_end * 1000);
          await base44.asServiceRole.entities.UserProfile.update(profile.id, {
            subscription_status: 'canceled',
            subscription_expiration_date: expirationDate.toISOString(),
          });
        } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
          await base44.asServiceRole.entities.UserProfile.update(profile.id, {
            premium: false,
            premium_tier: 'free',
            subscription_status: 'expired',
          });
        }
      }
    }

    // Handle subscription deletion
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const userEmail = subscription.metadata?.user_email?.toLowerCase();

      if (!userEmail) return Response.json({ received: true });

      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ 
        created_by: userEmail 
      });

      if (profiles.length > 0) {
        await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
          premium: false,
          premium_tier: 'free',
          subscription_status: 'expired',
          stripe_subscription_id: null,
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});