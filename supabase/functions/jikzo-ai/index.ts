// JIKZO Creative AI concierge — Groq free plan
// Store GROQ_API_KEY as a Supabase Function secret. Never expose it in frontend code.
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
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\\s+/i, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!token || !supabaseUrl || !anonKey) return new Response(JSON.stringify({ error: "Sign in is required." }), { status: 401, headers: cors });
    if (!groqKey) return new Response(JSON.stringify({ error: "The free AI connection has not been configured by the site owner yet." }), { status: 503, headers: cors });
    const userCheck = await fetch(supabaseUrl + "/auth/v1/user", { headers: { apikey: anonKey, Authorization: "Bearer " + token } });
    if (!userCheck.ok) return new Response(JSON.stringify({ error: "Your session is invalid or expired. Please sign in again." }), { status: 401, headers: cors });
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    const safeMessages = messages.filter((m) => ["user", "assistant"].includes(m.role) && typeof m.content === "string").map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") return new Response(JSON.stringify({ error: "Please enter a question." }), { status: 400, headers: cors });
    const instructions = "You are the JIKZO Creative website concierge. JIKZO Creative offers affordable digital, creative, gaming and online services, including graphic design, video/content support, gaming creator visuals, and websites/digital setup. Help visitors understand services, prepare project briefs, and navigate the website. Never invent prices, discounts, availability, customer reviews, completed projects, or delivery dates. Explain that each quote, scope and timeline is confirmed directly before work begins and the website does not currently process online payments. For account problems, direct users to account.html. For human support, give jikzoboyrsa0@gmail.com and WhatsApp +27 81 003 0559 (https://wa.me/27810030559). Keep answers concise, friendly, and honest. Do not request passwords, payment-card details, or secrets.";
    const ai = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + groqKey, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "system", content: instructions }, ...safeMessages], max_tokens: 450, temperature: 0.4 })
    });
    const result = await ai.json();
    if (!ai.ok) {
      const message = ai.status === 429 ? "The free AI daily or minute limit has been reached. Please try again later; no paid usage will be triggered." : (result.error?.message || "The free AI provider returned an error.");
      return new Response(JSON.stringify({ error: message }), { status: ai.status === 429 ? 429 : 502, headers: cors });
    }
    const answer = result.choices?.[0]?.message?.content?.trim();
    if (!answer) return new Response(JSON.stringify({ error: "The AI returned an empty answer. Please try again." }), { status: 502, headers: cors });
    return new Response(JSON.stringify({ answer }), { headers: cors });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "The assistant had a temporary problem. Please try again." }), { status: 500, headers: cors });
  }
});