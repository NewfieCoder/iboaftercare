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

    // Map tiers to price IDs
    const priceIds = {
      'standard-monthly': 'price_1T35QJIca4bvjpuWlT5QG642',  // $9.99/month
      'standard-annual': 'price_1T36kfIca4bvjpuWRlXZBE6f',   // $109.89/year
      'premium-monthly': 'price_1T35QLIca4bvjpuWqNKqfMcK',   // $19.99/month
      'premium-annual': 'price_1T36kfIca4bvjpuWJIwv695y',    // $219.89/year
      'access-pass': 'price_1T3eNMIca4bvjpuWcMz428ZX'        // $5 one-time 7-day pass
    };

    let priceId;
    let mode = 'subscription';

    if (accessPass) {
      priceId = priceIds['access-pass'];
      mode = 'payment';
    } else {
      const priceKey = `${tier}-${billing}`;
      priceId = priceIds[priceKey];
    }

    if (!priceId) {
      return Response.json({ error: 'Invalid tier or billing cycle' }, { status: 400 });
    }

    // Get origin from request or use default
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('?')[0].replace(/\/$/, '') || 'https://iboaftercare.base44.app';

    const sessionConfig = {
      mode: mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/ProfileSettings?success=true`,
      cancel_url: `${origin}/ProfileSettings?canceled=true`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        tier: accessPass ? 'standard' : tier,
        access_pass: accessPass.toString(),
      }
    };

    // Add subscription_data only for subscriptions
    if (mode === 'subscription') {
      sessionConfig.subscription_data = {
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          user_email: user.email,
          tier: tier,
        }
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});