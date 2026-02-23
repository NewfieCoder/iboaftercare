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

    // No subscription management needed - one-time purchase model

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
      message: `Role changed to ${newRole}`
    });
  } catch (error) {
    console.error('Role change error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});