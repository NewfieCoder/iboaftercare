import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to find subscription ID
    const profiles = await base44.entities.UserProfile.filter({ 
      created_by: user.email 
    });

    if (profiles.length === 0 || !profiles[0].stripe_subscription_id) {
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const profile = profiles[0];

    // Cancel subscription at period end (user retains access until end of billing cycle)
    const subscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    // Calculate expiration date
    const expirationDate = new Date(subscription.current_period_end * 1000);

    // Update profile immediately to reflect canceled status
    await base44.entities.UserProfile.update(profile.id, {
      subscription_status: 'canceled',
      subscription_expiration_date: expirationDate.toISOString(),
    });

    console.log('Subscription canceled for:', user.email, 'Expires:', expirationDate);

    return Response.json({ 
      success: true, 
      message: 'Subscription canceled successfully',
      expires_at: expirationDate.toISOString()
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});