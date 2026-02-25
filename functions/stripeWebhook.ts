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

      console.log('Checkout completed for:', userEmail, 'Tier:', tier);

      // Update user's profile with premium status
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ 
        created_by: userEmail 
      });

      if (profiles.length > 0) {
        await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
          premium: true,
          premium_tier: tier,
        });
        console.log('Updated profile for:', userEmail);
      }
    }

    // Handle subscription updates
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const userEmail = subscription.metadata.user_email;
      
      console.log('Subscription updated for:', userEmail);

      // Update profile if subscription is canceled or past_due
      if (subscription.status === 'canceled' || subscription.status === 'past_due') {
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({ 
          created_by: userEmail 
        });

        if (profiles.length > 0) {
          await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
            premium: false,
            premium_tier: 'free',
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