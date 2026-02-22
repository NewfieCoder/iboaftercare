import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  // Set up base44 client first
  const base44 = createClientFromRequest(req);
  
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not set');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify webhook signature - MUST use async version for Deno
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook event type:', event.type);

    // Handle checkout completion - INSTANT UNLOCK
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userEmail = session.metadata.user_email;
      const tier = session.metadata.tier;
      const expirationDays = session.metadata.expiration_days;
      const isAccessPass = expirationDays !== undefined && expirationDays !== null;

      console.log('✅ Checkout completed:', { userEmail, tier, isAccessPass, expirationDays });

      // Get or create user profile
      let profiles = await base44.asServiceRole.entities.UserProfile.filter({ 
        created_by: userEmail 
      });

      if (profiles.length === 0) {
        // Create profile if doesn't exist
        const newProfile = await base44.asServiceRole.entities.UserProfile.create({
          premium: true,
          premium_tier: tier,
          subscription_status: 'active',
          stripe_customer_id: session.customer,
          treatment_confirmed: false
        });
        profiles = [newProfile];
        console.log('✅ Created new profile for:', userEmail);
      }

      const updateData = {
        premium: true,
        premium_tier: tier,
        subscription_status: 'active',
        stripe_customer_id: session.customer,
      };

      // Set expiration for access passes
      if (isAccessPass) {
        const days = parseInt(expirationDays) || 7;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);
        updateData.subscription_expiration_date = expirationDate.toISOString();
        console.log(`✅ ${days}-day pass expires:`, expirationDate.toISOString());
      } else {
        // For recurring subscriptions
        updateData.stripe_subscription_id = session.subscription;
        updateData.subscription_expiration_date = null; // No expiration
        console.log('✅ Recurring subscription activated');
      }

      await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, updateData);
      console.log(`✅ INSTANT UNLOCK: ${userEmail} → ${tier} tier (premium: true)`);
    }

    // Handle subscription updates
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const userEmail = subscription.metadata.user_email;
      
      console.log('Subscription updated for:', userEmail, 'Status:', subscription.status);

      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ 
        created_by: userEmail 
      });

      if (profiles.length > 0) {
        // If subscription is canceled but still active (cancel_at_period_end), set expiration
        if (subscription.cancel_at_period_end) {
          const expirationDate = new Date(subscription.current_period_end * 1000);
          await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
            subscription_status: 'canceled',
            subscription_expiration_date: expirationDate.toISOString(),
          });
          console.log('Subscription canceled at period end for:', userEmail, 'Expires:', expirationDate);
        } 
        // If subscription is past_due or inactive, downgrade immediately
        else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
          await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
            premium: false,
            premium_tier: 'free',
            subscription_status: 'expired',
          });
          console.log('Downgraded profile for:', userEmail);
        }
      }
    }

    // Handle subscription deletion
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const userEmail = subscription.metadata.user_email;

      console.log('Subscription deleted for:', userEmail);

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
        console.log('Removed premium from:', userEmail);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});