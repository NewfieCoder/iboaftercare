import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only function
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch users and profiles with service role
    const [users, profiles] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.UserProfile.list()
    ]);

    // Merge user data with profile data
    const enrichedUsers = users.map(u => {
      const profile = profiles.find(p => p.created_by === u.email);
      return {
        ...u,
        profile: profile || null,
        premium: profile?.premium || false,
        treatment_date: profile?.treatment_date || null
      };
    });

    return Response.json(enrichedUsers);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});