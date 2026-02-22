import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, billing = 'monthly', accessPass = false } = await req.json();

    const validTiers = ['standard', 'premium'];
    if (!validTiers.includes(tier)) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const priceIds = {
      'standard-monthly': 'price_1T35QJIca4bvjpuWlT5QG642',
      'standard-annual': 'price_1T36kfIca4bvjpuWRlXZBE6f',
      'premium-monthly': 'price_1T35QLIca4bvjpuWqNKqfMcK', // VERIFY this is $29.99 in Stripe
      'premium-annual': 'price_1T36kfIca4bvjpuWJIwv695y',
      'standard-pass': 'price_1T3eNMIca4bvjpuWcMz428ZX',     // $5 7-day Standard
      'premium-pass': 'price_1T3hdgIca4bvjpuWIx6PuzBY'       // $10 7-day Premium
    };

    let priceId;
    let mode = 'subscription';
    let finalTier = tier;

    if (accessPass) {
      priceId = priceIds[`${tier}-pass`];
      mode = 'payment';
    } else {
      const priceKey = `${tier}-${billing}`;
      priceId = priceIds[priceKey];
    }

    if (!priceId) {
      console.error(`Invalid price: tier=${tier}, billing=${billing}, accessPass=${accessPass}`);
      return Response.json({ error: 'Invalid tier or billing cycle' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://iboaftercare.base44.app';

    const sessionConfig = {
      mode,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/ProfileSettings?success=true`,
      cancel_url: `${origin}/ProfileSettings?canceled=true`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_id: user.id,               // Reliable lookup key
        user_email: user.email.toLowerCase(),
        tier: finalTier.toLowerCase(),
        ...(accessPass && { expiration_days: '7', is_access_pass: 'true' })
      },
      idempotency_key: `${user.id}_${Date.now()}` // Prevent duplicates
    };

    if (mode === 'subscription') {
      sessionConfig.subscription_data = {
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          user_id: user.id,
          user_email: user.email.toLowerCase(),
          tier: finalTier.toLowerCase()
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Checkout session created:', { id: session.id, tier: finalTier, user: user.email });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});