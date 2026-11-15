# JIKZO Creative AI assistant — free setup

The website AI page and its secure Supabase Edge Function are included in this repository. The function uses Groq's Free plan and the open-weight `openai/gpt-oss-120b` model. It pauses when free limits are reached and never switches to paid usage.

## One-time owner setup (phone-friendly)

1. Create a free account at https://console.groq.com/ and create an API key. Stay on the Free plan; do not add a payment method or upgrade.
2. Create a Supabase personal access token at https://supabase.com/dashboard/account/tokens.
3. Open this GitHub repository: https://github.com/my-gaming-hub/jikzo-creative
4. Go to **Settings → Secrets and variables → Actions → New repository secret**.
5. Add these two repository secrets:
   - Name: `SUPABASE_ACCESS_TOKEN` — Value: your Supabase personal access token.
   - Name: `GROQ_API_KEY` — Value: your Groq API key.
6. Open the repository **Actions** tab.
7. Choose **Deploy JIKZO AI function** from the workflow list.
8. Tap **Run workflow** and wait for the run to finish successfully.

The workflow transfers the Groq key directly into Supabase Function Secrets and deploys the function. Neither key is written into the website files or committed to GitHub. Never paste either key into a chat, issue, or source file.

## Test the assistant

Open https://my-gaming-hub.github.io/jikzo-creative/assistant.html while signed in to your JIKZO account. If Groq's free limit is reached, the assistant pauses and asks you to try again later.

## Zero-cost safeguard

- Keep Groq on its Free plan. Do not add a payment method or upgrade.
- Free usage is subject to provider quotas and availability.
- When a free quota is reached, requests stop with a rate-limit message; there is no paid fallback.

## Security

Never put the Groq API key or Supabase service-role key in HTML, JavaScript, or public repository files. The Edge Function validates the signed-in user's Supabase access token before sending a request to Groq.
