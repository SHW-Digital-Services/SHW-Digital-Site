# SHW Digital Services

Production site: https://shwdigitalservices.site

## Local Development

```bash
npm install
npm run dev
```

Use local development only for editing and testing. Production deployments should use the live domain above and Vercel environment variables.

## Production Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
MAILCHIMP_API_KEY=optional
MAILCHIMP_SERVER_PREFIX=optional
MAILCHIMP_AUDIENCE_ID=optional
STRIPE_SECRET_KEY=optional
BITRIX_WEBHOOK_URL=optional
```

## Deploy

Deploy through Vercel from the connected Git repository, or run:

```bash
vercel deploy --prod
```
