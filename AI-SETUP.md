# JIKZO Creative AI assistant — free setup

The website AI page and its secure Supabase Edge Function are included in this repository. The function uses Groq's Free plan and the open-weight `openai/gpt-oss-120b` model. The free plan is rate-limited; when a limit is reached, the assistant pauses and asks the visitor to try later. It does not switch to paid usage.

## One-time owner setup

1. Create a free account at https://console.groq.com/.
2. In GroqCloud, create an API key. Stay on the **Free** plan. Do not upgrade to Developer or add a payment method.
3. Install the Supabase CLI and sign in.
4. From the repository root, link the Supabase project:
   `supabase link --project-ref ylniprnidsrmnicjzayx`
5. Store the key as a server-side secret (replace the placeholder locally; never commit the key):
   `supabase secrets set GROQ_API_KEY=your_groq_key_here`
6. Deploy the Edge Function:
   `supabase functions deploy jikzo-ai --no-verify-jwt`

The function validates the signed-in Supabase user itself. The `--no-verify-jwt` option allows browser CORS preflight to reach the function; it does not remove the function's own user-token validation.

## Website route

After deployment, open:
https://my-gaming-hub.github.io/jikzo-creative/assistant.html

Users must sign in before chatting. If the function is not deployed or the Groq key is not set, the page displays a setup error.

## Zero-cost safeguard

- Stay on Groq's Free plan. Its free usage has published request/token limits.
- Do not add a payment method or upgrade the account.
- If free limits are reached, requests return a rate-limit message and stop. No automatic paid fallback is configured.
- Free-tier availability and quotas are controlled by Groq and may change.

## Security

Never put the Groq API key or Supabase service-role key in HTML, JavaScript, GitHub Pages files, or the public repository. The Edge Function validates the Supabase user's access token before sending a request to Groq.
