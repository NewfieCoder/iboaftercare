import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This is an admin-only scheduled function
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('🔍 Checking for expired subscriptions...');

    // Get all profiles with premium access
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list();
    const now = new Date();
    let expiredCount = 0;
    let revokedUsers = [];

    for (const profile of allProfiles) {
      // Skip if not premium or no expiration date set
      if (!profile.premium || !profile.subscription_expiration_date) {
        continue;
      }

      const expirationDate = new Date(profile.subscription_expiration_date);
      
      // Check if expired
      if (expirationDate <= now) {
        console.log(`⏰ Expiring subscription for: ${profile.created_by} (expired: ${expirationDate.toISOString()})`);
        
        // Revert to free tier
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          premium: false,
          premium_tier: 'free',
          subscription_status: 'expired',
          subscription_expiration_date: null
        });

        expiredCount++;
        revokedUsers.push(profile.created_by);

        // Optional: Send notification email
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: profile.created_by,
            subject: 'IboAftercare - Subscription Expired',
            body: `Your subscription has expired. To continue accessing premium features, please upgrade at iboaftercare.base44.app/ProfileSettings`
          });
          console.log(`📧 Sent expiration notice to: ${profile.created_by}`);
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }
      }
    }

    console.log(`✅ Expiration check complete: ${expiredCount} subscriptions expired`);

    return Response.json({ 
      success: true,
      expired_count: expiredCount,
      revoked_users: revokedUsers,
      checked_at: now.toISOString()
    });
  } catch (error) {
    console.error('❌ Error checking expirations:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});