import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();

    if (!admin || admin.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, action, tier, expirationDays, reason } = await req.json();

    const targetUser = await base44.asServiceRole.entities.User.get(userId);
    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

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
      updateData = {
        premium: true,
        premium_tier: tier || 'premium',
        subscription_status: 'active'
      };

      if (expirationDays) {
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + parseInt(expirationDays));
        updateData.subscription_expiration_date = expiration.toISOString();
        actionDescription = `Granted ${tier || 'premium'} for ${expirationDays} days to ${targetUser.email}`;
      } else {
        updateData.subscription_expiration_date = null;
        actionDescription = `Granted ${tier || 'premium'} (no expiration) to ${targetUser.email}`;
      }
    } else if (action === 'revoke') {
      updateData = {
        premium: false,
        premium_tier: 'free',
        subscription_status: 'canceled',
        subscription_expiration_date: null
      };
      actionDescription = `Revoked subscription from ${targetUser.email}`;
    }

    await base44.asServiceRole.entities.UserProfile.update(profile.id, updateData);

    await base44.asServiceRole.entities.AdminActivityLog.create({
      admin_email: admin.email,
      action_type: action === 'grant' ? 'subscription_granted' : 'subscription_revoked',
      details: reason || actionDescription,
      target_entity_id: userId
    });

    return Response.json({ success: true, message: actionDescription });
  } catch (error) {
    console.error('Manual subscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});