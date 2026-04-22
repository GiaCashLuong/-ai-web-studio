import Anthropic from 'npm:@anthropic-ai/sdk@0.27.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { title, type, description, budget, deadline, userId, lang } = await req.json();

    const isVi = lang !== 'en';

    const systemPrompt = isVi
      ? `Bạn là chuyên gia báo giá web agency. Hãy tạo báo giá chi tiết, chuyên nghiệp dựa trên yêu cầu của khách.
Trả về JSON với cấu trúc chính xác sau, không thêm text ngoài JSON:
{
  "summary": "Tóm tắt phân tích yêu cầu (2-3 câu)",
  "features": ["Tính năng 1", "Tính năng 2", ...],
  "timeline": "Mô tả timeline chi tiết",
  "items": [
    {"name": "Tên hạng mục", "price": 5000000},
    ...
  ],
  "totalVnd": 15000000
}
Giá tính bằng VND. Hãy thực tế và hợp lý theo thị trường Việt Nam.`
      : `You are a web agency quoting expert. Create a detailed, professional quote based on the client's requirements.
Return JSON with this exact structure, no text outside JSON:
{
  "summary": "Analysis summary (2-3 sentences)",
  "features": ["Feature 1", "Feature 2", ...],
  "timeline": "Detailed timeline description",
  "items": [
    {"name": "Item name", "price": 200},
    ...
  ],
  "totalUsd": 800
}
Price in USD. Be realistic and aligned with market rates.`;

    const userPrompt = isVi
      ? `Yêu cầu dự án:
- Tên: ${title}
- Loại: ${type}
- Mô tả: ${description}
- Ngân sách dự kiến: ${budget || 'không xác định'}
- Thời gian: ${deadline}`
      : `Project request:
- Name: ${title}
- Type: ${type}
- Description: ${description}
- Budget: ${budget || 'not specified'}
- Deadline: ${deadline}`;

    const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    });

    const rawText = (message.content[0] as { type: string; text: string }).text.trim();
    // Extract JSON from response (Claude sometimes wraps in ```json blocks)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response from Claude');
    const quoteData = JSON.parse(jsonMatch[0]);

    const totalPrice = isVi ? (quoteData.totalVnd || 0) : Math.round((quoteData.totalUsd || 0) * 25000);

    // Save to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        title,
        description,
        project_type: type,
        budget,
        deadline,
        status: 'quoted',
        quote_data: quoteData,
        total_price: totalPrice,
        created_at: new Date().toISOString(),
      }),
    });

    const [project] = await insertRes.json();

    return new Response(JSON.stringify({ projectId: project.id }), {
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
