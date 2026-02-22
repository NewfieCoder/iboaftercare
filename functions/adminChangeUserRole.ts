import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();

    if (!admin || admin.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, newRole, reason } = await req.json();

    // Validate role
    const validRoles = ['user', 'tester', 'admin'];
    if (!validRoles.includes(newRole)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Get current user data
    const targetUser = await base44.asServiceRole.entities.User.get(userId);
    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const oldRole = targetUser.role || 'user';

    // Note: User roles cannot be updated via backend functions
    // This is a platform limitation - roles must be updated via Base44.users.updateUserRole
    // Instead, we'll use UserProfile to grant permissions

    // Get or create user profile
    let profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by: targetUser.email });
    let profile;
    
    if (profiles.length > 0) {
      profile = profiles[0];
    } else {
      // Create profile if doesn't exist
      profile = await base44.asServiceRole.entities.UserProfile.create({
        premium: false,
        premium_tier: 'free',
        subscription_status: 'expired',
        treatment_confirmed: false
      });
      console.log(`✅ Created profile for: ${targetUser.email}`);
    }

    // TESTER ROLE = INSTANT FREE PREMIUM
    if (newRole === 'tester') {
      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        premium: true,
        premium_tier: 'premium',
        subscription_status: 'active',
        subscription_expiration_date: null // No expiration
      });
      console.log(`✅ INSTANT UNLOCK: Tester ${targetUser.email} → Premium (free)`);
    }
    
    // REVOKING TESTER = REMOVE FREE PREMIUM (unless paid sub)
    if (oldRole === 'tester' && newRole !== 'tester') {
      // Only revoke if no paid Stripe subscription
      if (!profile.stripe_subscription_id && !profile.stripe_customer_id) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          premium: false,
          premium_tier: 'free',
          subscription_status: 'expired'
        });
        console.log(`❌ Revoked free premium from ex-Tester: ${targetUser.email}`);
      } else {
        console.log(`✓ Keeping paid subscription for ex-Tester: ${targetUser.email}`);
      }
    }

    // Update platform role via Base44 API
    try {
      await base44.users.updateUserRole(targetUser.email, newRole);
      console.log(`✅ Platform role updated: ${targetUser.email} → ${newRole}`);
    } catch (roleError) {
      console.error('Platform role update failed (continuing):', roleError);
    }

    // Log the role change
    await base44.asServiceRole.entities.AdminActivityLog.create({
      admin_email: admin.email,
      action_type: 'user_promoted',
      details: reason || `Changed ${targetUser.email} role from ${oldRole} to ${newRole}`,
      target_entity_id: userId
    });

    return Response.json({ 
      success: true, 
      message: `User role changed from ${oldRole} to ${newRole}`,
      premiumGranted: newRole === 'tester'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});