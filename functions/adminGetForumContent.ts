import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const [posts, replies] = await Promise.all([
      base44.asServiceRole.entities.ForumPost.list('-created_date', 100),
      base44.asServiceRole.entities.ForumReply.list('-created_date', 100)
    ]);

    return Response.json({ posts, replies });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});