import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const codes = await base44.asServiceRole.entities.DiscountCode.list('-created_date');
    return Response.json(codes);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});