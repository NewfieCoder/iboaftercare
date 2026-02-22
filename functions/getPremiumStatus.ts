import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * getPremiumStatus: Fast endpoint for checking user's premium access
 * Used for real-time UI updates after payments/role changes
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ 
        premium: false, 
        tier: 'free',
        role: null 
      });
    }

    // Admin & Tester = Always premium
    if (user.role === 'admin' || user.role === 'tester') {
      return Response.json({ 
        premium: true, 
        tier: 'premium',
        role: user.role,
        reason: `${user.role} role (free access)`
      });
    }

    // Check profile subscription
    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length === 0) {
      return Response.json({ 
        premium: false, 
        tier: 'free',
        role: user.role 
      });
    }

    const profile = profiles[0];
    const isPremium = profile.premium && profile.subscription_status === 'active';
    const tier = profile.premium_tier || 'free';

    return Response.json({ 
      premium: isPremium, 
      tier: tier,
      role: user.role,
      status: profile.subscription_status,
      expires: profile.subscription_expiration_date,
      reason: isPremium ? 'paid subscription' : 'no subscription'
    });
  } catch (error) {
    console.error('Premium status check error:', error);
    return Response.json({ 
      premium: false, 
      tier: 'free',
      error: error.message 
    }, { status: 500 });
  }
});