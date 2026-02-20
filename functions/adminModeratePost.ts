import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const adminUser = await base44.auth.me();

    if (adminUser?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { action, postId, updateData } = await req.json();

    if (action === 'delete') {
      await base44.asServiceRole.entities.ForumPost.delete(postId);
      await base44.entities.AdminActivityLog.create({
        admin_email: adminUser.email,
        action_type: 'forum_post_deleted',
        details: 'Deleted forum post',
        target_entity_id: postId
      });
    } else if (action === 'update') {
      await base44.asServiceRole.entities.ForumPost.update(postId, updateData);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});