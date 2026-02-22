import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access for scheduled task
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    console.log('Checking expired subscriptions at:', now.toISOString());

    // Get all profiles with expiration dates
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({});
    
    let expiredCount = 0;
    let notifiedCount = 0;

    for (const profile of profiles) {
      // Skip if no expiration date or already free
      if (!profile.subscription_expiration_date || profile.premium_tier === 'free') {
        continue;
      }

      const expirationDate = new Date(profile.subscription_expiration_date);
      const oneDayBeforeExpiration = new Date(expirationDate);
      oneDayBeforeExpiration.setDate(oneDayBeforeExpiration.getDate() - 1);

      // Check if subscription has expired
      if (now >= expirationDate) {
        // Revert to free tier
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          premium: false,
          premium_tier: 'free',
          subscription_status: 'expired',
          subscription_expiration_date: null,
        });

        // Send expiration notification email
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: profile.created_by,
            subject: 'Your IboAftercare Access Has Expired',
            body: `
              <h2>Your Premium Access Has Ended</h2>
              <p>Your IboAftercare subscription or access pass has expired.</p>
              <p>To continue enjoying premium features, please renew your subscription:</p>
              <a href="https://iboaftercare.base44.app/ProfileSettings" style="display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Renew Now</a>
              <p>Thank you for being part of our recovery community!</p>
            `
          });
        } catch (emailError) {
          console.error('Failed to send expiration email:', emailError);
        }

        expiredCount++;
        console.log('Expired and downgraded:', profile.created_by);
      }
      // Send reminder 1 day before expiration
      else if (now >= oneDayBeforeExpiration && now < expirationDate) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: profile.created_by,
            subject: 'Your IboAftercare Access Expires Soon',
            body: `
              <h2>Your Access Expires Tomorrow</h2>
              <p>Your IboAftercare premium access will expire in less than 24 hours.</p>
              <p>Renew now to avoid interruption:</p>
              <a href="https://iboaftercare.base44.app/ProfileSettings" style="display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Renew Now</a>
              <p>Continue your recovery journey without interruption.</p>
            `
          });
          notifiedCount++;
          console.log('Sent expiration reminder to:', profile.created_by);
        } catch (emailError) {
          console.error('Failed to send reminder email:', emailError);
        }
      }
    }

    return Response.json({ 
      success: true,
      expired: expiredCount,
      reminded: notifiedCount,
      checked_at: now.toISOString()
    });
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});