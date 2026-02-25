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
    const validRoles = ['user', 'tester', 'editor', 'moderator', 'admin'];
    if (!validRoles.includes(newRole)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Get current user data
    const targetUser = await base44.asServiceRole.entities.User.get(userId);
    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const oldRole = targetUser.role || 'user';

    // Update user role
    await base44.asServiceRole.entities.User.update(userId, { role: newRole });

    // If assigning Tester role, grant premium access automatically
    if (newRole === 'tester') {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by: targetUser.email });
      if (profiles.length > 0) {
        await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, { premium: true });
      }
    }

    // If removing Tester role, revoke premium unless they have a real subscription
    if (oldRole === 'tester' && newRole !== 'tester') {
      // Here you could check for actual subscription status
      // For now, we'll revoke premium when Tester is removed
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by: targetUser.email });
      if (profiles.length > 0) {
        await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, { premium: false });
      }
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