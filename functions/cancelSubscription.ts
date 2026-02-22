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
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      created_by: user.email.toLowerCase()
    });

    if (profiles.length === 0) {
      return Response.json({ success: false, error: 'No profile found' }, { status: 404 });
    }

    const profile = profiles[0];

    if (!profile.stripe_subscription_id) {
      return Response.json({ success: false, error: 'No active subscription found' }, { status: 400 });
    }

    // Cancel subscription at period end (safe default)
    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    // Update profile to reflect cancellation
    await base44.asServiceRole.entities.UserProfile.update(profile.id, {
      subscription_status: 'canceled',
      // Keep expiration as-is (period end date will be set by Stripe)
    });

    // Log the action
    await base44.asServiceRole.entities.AdminActivityLog.create({
      admin_email: user.email, // or 'system' if user-initiated
      action_type: 'subscription_canceled',
      details: `User ${user.email} canceled subscription ${profile.stripe_subscription_id}`,
      target_entity_id: profile.id
    });

    console.log(`✅ Subscription canceled at period end for: ${user.email}`);

    return Response.json({ 
      success: true, 
      message: 'Subscription canceled successfully. Access retained until end of billing period.'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to cancel subscription'
    }, { status: 500 });
  }
});