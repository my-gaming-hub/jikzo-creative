// Supabase Edge Function: JIKZO Creative AI concierge
// Set OPENAI_API_KEY as a Supabase Function secret. Never expose it in website code.
const cors = {
  "Access-Control-Allow-Origin": "https://my-gaming-hub.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed." }), { status: 405, headers: cors });
  try {
    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!token || !supabaseUrl || !anonKey) return new Response(JSON.stringify({ error: "Sign in is required." }), { status: 401, headers: cors });
    if (!openaiKey) return new Response(JSON.stringify({ error: "The AI service still needs its private API key configured by the site owner." }), { status: 503, headers: cors });
    const userCheck = await fetch(supabaseUrl + "/auth/v1/user", { headers: { apikey: anonKey, Authorization: "Bearer " + token } });
    if (!userCheck.ok) return new Response(JSON.stringify({ error: "Your session is invalid or expired. Please sign in again." }), { status: 401, headers: cors });
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    const safeMessages = messages.filter((m) => ["user", "assistant"].includes(m.role) && typeof m.content === "string").map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") return new Response(JSON.stringify({ error: "Please enter a question." }), { status: 400, headers: cors });
    const instructions = "You are the JIKZO Creative website concierge. JIKZO Creative offers affordable digital, creative, gaming and online services, including graphic design, video/content support, gaming creator visuals, and websites/digital setup. Help visitors understand services, prepare project briefs, and navigate the website. Never invent prices, discounts, availability, customer reviews, completed projects, or delivery dates. Explain that each quote, scope and timeline is confirmed directly before work begins and the website does not currently process online payments. For account problems, direct users to account.html. For human support, give jikzoboyrsa0@gmail.com and WhatsApp +27 81 003 0559 (https://wa.me/27810030559). Keep answers concise, friendly, and honest. Do not request passwords, payment-card details, or secrets.";
    const ai = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": "Bearer " + openaiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ model: Deno.env.get("OPENAI_MODEL") || "gpt-6-luna", instructions, input: safeMessages, max_output_tokens: 450 })
    });
    const result = await ai.json();
    if (!ai.ok) return new Response(JSON.stringify({ error: result.error?.message || "The AI provider returned an error." }), { status: 502, headers: cors });
    const answer = (result.output || []).flatMap((item) => item.content || []).filter((part) => part.type === "output_text").map((part) => part.text).join("\n").trim();
    if (!answer) return new Response(JSON.stringify({ error: "The AI returned an empty answer. Please try again." }), { status: 502, headers: cors });
    return new Response(JSON.stringify({ answer }), { headers: cors });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "The assistant had a temporary problem. Please try again." }), { status: 500, headers: cors });
  }
});