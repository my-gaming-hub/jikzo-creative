# JIKZO Creative AI assistant setup

The website AI page and its secure Supabase Edge Function are included in this repository. The function keeps the OpenAI API key server-side and requires a signed-in Supabase user.

## One-time owner setup

1. Create an OpenAI API key in the OpenAI Platform. API billing is separate from a ChatGPT subscription. Set a small usage budget/limit before enabling it.
2. Install the Supabase CLI and sign in.
3. From the repository root, link the Supabase project:
   `supabase link --project-ref ylniprnidsrmnicjzayx`
4. Set the secret (never paste it into GitHub or website code):
   `supabase secrets set OPENAI_API_KEY=your_key_here`
5. Optional model override:
   `supabase secrets set OPENAI_MODEL=gpt-6-luna`
6. Deploy:
   `supabase functions deploy jikzo-ai --no-verify-jwt`

The default model is gpt-6-luna and the function uses OpenAI's Responses API. You can change the model using the OPENAI_MODEL secret if needed.

## Website route

After deployment, open:
https://my-gaming-hub.github.io/jikzo-creative/assistant.html

Users must sign in before chatting. If the function is not deployed or the API secret is not set, the page displays a clear setup error instead of pretending the AI works.

## Security

Never put an OpenAI API key or Supabase service-role key in any HTML, JavaScript, GitHub Pages file, or public repository. The Edge Function validates the Supabase user's access token before sending a request to OpenAI.
