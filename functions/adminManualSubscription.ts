import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0'; // Not used here but kept for consistency

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();

    if (!admin || admin.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, action, tier, expirationDays, reason } = await req.json();

    console.log('Manual subscription request:', { userId, action, tier, expirationDays });

    // Get target user directly (more reliable than list/find)
    const targetUser = await base44.asServiceRole.entities.User.get(userId);
    if (!targetUser) {
      console.error(`User not found with ID: ${userId}`);
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`Found user: ${targetUser.email}`);

    // Get user profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ 
      created_by: targetUser.email.toLowerCase() 
    });

    if (profiles.length === 0) {
      return Response.json({ error: 'User profile not found' }, { status: 404 });
    }

    const profile = profiles[0];
    let updateData = {};
    let actionDescription = '';

    if (action === 'grant') {
      // Grant subscription manually
      updateData = {
        premium: true,
        premium_tier: tier || 'premium',
        subscription_status: 'active'
      };

      if (expirationDays) {
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + parseInt(expirationDays));
        updateData.subscription_expiration_date = expiration.toISOString();
        actionDescription = `Manually granted ${tier || 'premium'} tier for ${expirationDays} days to ${targetUser.email}`;
      } else {
        updateData.subscription_expiration_date = null;
        actionDescription = `Manually granted ${tier || 'premium'} tier (no expiration) to ${targetUser.email}`;
      }
    } else if (action === 'revoke') {
      // Revoke subscription
      updateData = {
        premium: false,
        premium_tier: 'free',
        subscription_status: 'canceled',
        subscription_expiration_date: null
      };
      actionDescription = `Manually revoked subscription from ${targetUser.email}`;
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update profile with retry
    let success = false;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, updateData);
        success = true;
        console.log(`✅ Manual update success (attempt ${attempt}): ${actionDescription}`);
        break;
      } catch (updateError) {
        console.error(`Update failed (attempt ${attempt}):`, updateError);
        if (attempt === 2) {
          // Alert admin
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: admin.email,
            subject: 'Manual Subscription Override Failed',
            body: `Failed to ${action} subscription for ${targetUser.email}. Error: ${updateError.message}`
          });
        }
      }
    }

    // Log admin action
    await base44.asServiceRole.entities.AdminActivityLog.create({
      admin_email: admin.email,
      action_type: action === 'grant' ? 'subscription_granted' : 'subscription_revoked',
      details: reason || actionDescription,
      target_entity_id: userId
    });

    // Optional real-time broadcast (if supported)
    // await base44.asServiceRole.realtime.broadcast('user_updated', { userId });

    return Response.json({ 
      success: true,
      message: actionDescription
    });
  } catch (error) {
    console.error('Manual subscription override error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});