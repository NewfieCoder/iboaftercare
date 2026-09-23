import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const adminUser = await base44.auth.me();

    if (adminUser?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { action, discountData, discountId } = await req.json();

    if (action === 'create') {
      await base44.asServiceRole.entities.DiscountCode.create(discountData);
      await base44.entities.AdminActivityLog.create({
        admin_email: adminUser.email,
        action_type: 'discount_created',
        details: `Created discount code: ${discountData.code}`
      });
    } else if (action === 'update') {
      await base44.asServiceRole.entities.DiscountCode.update(discountId, discountData);
    } else if (action === 'delete') {
      await base44.asServiceRole.entities.DiscountCode.delete(discountId);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});