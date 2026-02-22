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

    // Handle checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userEmail = session.metadata.user_email;
      const tier = session.metadata.tier;
      const isAccessPass = session.metadata.access_pass === 'true';

      console.log('Checkout completed for:', userEmail, 'Tier:', tier, 'Access Pass:', isAccessPass);

      // Update user's profile with premium status
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ 
        created_by: userEmail 
      });

      if (profiles.length > 0) {
        const updateData = {
          premium: true,
          premium_tier: tier,
          subscription_status: 'active',
          stripe_customer_id: session.customer,
        };

        // If it's an access pass, set expiration to 7 days from now
        if (isAccessPass) {
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 7);
          updateData.subscription_expiration_date = expirationDate.toISOString();
        } else {
          // For subscriptions, store subscription ID
          updateData.stripe_subscription_id = session.subscription;
          // No expiration date for active subscriptions
          updateData.subscription_expiration_date = null;
        }

        await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, updateData);
        console.log('Updated profile for:', userEmail, 'with immediate unlock');
      }
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