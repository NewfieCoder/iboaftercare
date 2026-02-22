import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();

    if (!admin || admin.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, newRole, reason } = await req.json();

    const validRoles = ['user', 'tester', 'admin'];
    if (!validRoles.includes(newRole)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    const targetUser = await base44.asServiceRole.entities.User.get(userId);
    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const oldRole = targetUser.role || 'user';

    let profiles = await base44.asServiceRole.entities.UserProfile.filter({ 
      created_by: targetUser.email.toLowerCase() 
    });

    let profile;
    if (profiles.length > 0) {
      profile = profiles[0];
    } else {
      profile = await base44.asServiceRole.entities.UserProfile.create({
        created_by: targetUser.email.toLowerCase(),
        premium: false,
        premium_tier: 'free',
        subscription_status: 'expired',
        treatment_confirmed: false
      });
    }

    if (newRole === 'tester') {
      if (!profile.stripe_subscription_id && profile.subscription_status !== 'active') {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          premium: true,
          premium_tier: 'premium',
          subscription_status: 'active',
          subscription_expiration_date: null
        });
        console.log(`✅ Tester unlock: ${targetUser.email} → premium`);
      }
    }

    if (oldRole === 'tester' && newRole !== 'tester') {
      if (!profile.stripe_subscription_id && profile.subscription_status !== 'active') {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          premium: false,
          premium_tier: 'free',
          subscription_status: 'expired'
        });
        console.log(`❌ Revoked Tester premium: ${targetUser.email}`);
      }
    }

    try {
      await base44.users.updateUserRole(targetUser.email, newRole);
    } catch (e) {
      console.error('Platform role update failed:', e);
    }

    await base44.asServiceRole.entities.AdminActivityLog.create({
      admin_email: admin.email,
      action_type: 'user_promoted',
      details: reason || `Role change ${targetUser.email}: ${oldRole} → ${newRole}`,
      target_entity_id: userId
    });

    return Response.json({ 
      success: true, 
      message: `Role changed to ${newRole}`,
      premiumGranted: newRole === 'tester' && !profile.stripe_subscription_id
    });
  } catch (error) {
    console.error('Role change error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});