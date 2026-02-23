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

    // Check profile subscription (filter by created_by for RLS)
    const profiles = await base44.entities.UserProfile.filter({ 
      created_by: user.email.toLowerCase() 
    });
    
    if (profiles.length === 0) {
      return Response.json({ 
        premium: false, 
        tier: 'free',
        role: user.role 
      });
    }

    const profile = profiles[0];
    
    // Check expiration
    let isActive = profile.subscription_status === 'active';
    if (profile.subscription_expiration_date) {
      const expires = new Date(profile.subscription_expiration_date);
      if (expires < new Date()) {
        isActive = false;
      }
    }
    
    const effectivePremium = profile.premium === true && isActive;
    const effectiveTier = effectivePremium ? (profile.premium_tier || 'premium') : 'free';

    return Response.json({ 
      premium: effectivePremium, 
      tier: effectiveTier,
      role: user.role,
      status: profile.subscription_status,
      expires: profile.subscription_expiration_date,
      reason: effectivePremium ? 'active subscription' : 'expired or inactive'
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