import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Find all active profiles with expiration date in the past
    const expiredProfiles = await base44.asServiceRole.entities.UserProfile.filter({
      subscription_status: 'active',
      subscription_expiration_date: { $lt: new Date().toISOString() }
    });

    for (const profile of expiredProfiles) {
      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        premium: false,
        premium_tier: 'free',
        subscription_status: 'expired',
        subscription_expiration_date: null
      });

      console.log(`✅ Expired profile reverted: ${profile.created_by}`);

      // Optional: Notify user
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: profile.created_by,
        subject: 'IBO Aftercare - Access Expired',
        body: 'Your 7-day pass has ended. Renew to continue premium access!'
      });
    }

    return Response.json({ success: true, expiredCount: expiredProfiles.length });
  } catch (error) {
    console.error('Expiration check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});