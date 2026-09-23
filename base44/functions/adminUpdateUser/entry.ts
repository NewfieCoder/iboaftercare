import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const adminUser = await base44.auth.me();

    // Admin-only function
    if (adminUser?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { userId, updates, logAction } = await req.json();

    // Update user with service role
    await base44.asServiceRole.entities.User.update(userId, updates);

    // Log admin action if provided
    if (logAction) {
      await base44.asServiceRole.entities.AdminActivityLog.create({
        admin_email: adminUser.email,
        action_type: logAction.type,
        details: logAction.details,
        target_entity_id: userId
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});