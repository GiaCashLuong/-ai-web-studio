import Stripe from 'npm:stripe@16.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { projectId, lang } = await req.json();
    const isVi = lang !== 'en';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Fetch project
    const projRes = await fetch(`${supabaseUrl}/rest/v1/projects?id=eq.${projectId}&select=*`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const [project] = await projRes.json();
    if (!project) throw new Error('Project not found');

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });

    const siteUrl = Deno.env.get('SITE_URL') || 'https://your-site.vercel.app';

    // Amount in smallest currency unit
    // Store price in VND or USD depending on lang
    // For simplicity, always charge in USD (convert VND if needed)
    const amountInCents = Math.round((project.total_price || 1000) / 25000 * 100); // VND → USD cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: project.title,
            description: isVi ? 'Dịch vụ thiết kế website – AI Web Studio' : 'Web Design Service – AI Web Studio',
          },
          unit_amount: Math.max(amountInCents, 100), // minimum $1
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${siteUrl}/success.html?project_id=${projectId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/quote.html?id=${projectId}`,
      metadata: { projectId },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
