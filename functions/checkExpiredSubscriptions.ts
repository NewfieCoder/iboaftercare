import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();

    // Admin-only function (for scheduled automation)
    if (admin?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    
    // Get all profiles with active subscriptions
    const activeProfiles = await base44.asServiceRole.entities.UserProfile.filter({
      subscription_status: 'active',
      premium: true
    });

    let expiredCount = 0;
    let warned1DayCount = 0;

    for (const profile of activeProfiles) {
      // Skip if no expiration date (recurring subs)
      if (!profile.subscription_expiration_date) continue;

      const expirationDate = new Date(profile.subscription_expiration_date);
      const daysUntilExpiry = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

      // Expired - revert to free tier
      if (expirationDate <= now) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          premium: false,
          premium_tier: 'free',
          subscription_status: 'expired'
        });
        
        // Send expiration notice
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: profile.created_by,
            subject: 'Your IboAftercare Access Has Expired',
            body: `Your premium access has expired. You're now on the free tier with limited features.\n\nUpgrade anytime to restore unlimited access!`
          });
        } catch (e) {
          console.error('Failed to send expiration email:', e);
        }
        
        expiredCount++;
        console.log(`⏰ Expired: ${profile.created_by} - reverted to free tier`);
      }
      // Warn 1 day before expiration
      else if (daysUntilExpiry === 1) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: profile.created_by,
            subject: '⏰ Your IboAftercare Access Expires Tomorrow',
            body: `Your premium access will expire in 24 hours.\n\nRenew now to keep unlimited access to all features!`
          });
          warned1DayCount++;
          console.log(`⚠️ 1-day warning sent to: ${profile.created_by}`);
        } catch (e) {
          console.error('Failed to send warning email:', e);
        }
      }
    }

    return Response.json({ 
      success: true,
      expiredCount,
      warned1DayCount,
      message: `Processed ${activeProfiles.length} profiles: ${expiredCount} expired, ${warned1DayCount} warned`
    });
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});