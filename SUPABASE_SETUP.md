# Supabase Setup Guide

This guide will help you set up Supabase for your Knowledge-Graph Builder application with authentication and database.

## Table of Contents
1. [Create Supabase Account](#create-supabase-account)
2. [Create a New Project](#create-a-new-project)
3. [Get Your API Keys](#get-your-api-keys)
4. [Configure Authentication](#configure-authentication)
5. [Set Up OAuth Providers](#set-up-oauth-providers)
6. [Database Setup](#database-setup)
7. [Environment Variables](#environment-variables)
8. [Testing Authentication](#testing-authentication)
9. [Troubleshooting](#troubleshooting)

## Create Supabase Account

1. Go to [Supabase](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email
4. Verify your email address

## Create a New Project

1. Click "New project"
2. Fill in project details:
   - **Organization**: Choose or create an organization
   - **Project name**: Your project name (e.g., "graphmind")
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier (perfect for hackathons)
3. Click "Create new project" (takes 1-2 minutes)

## Get Your API Keys

1. Once project is created, go to **Settings** (gear icon) → **API**
2. You'll find these keys:
   - **Project URL**: `https://YOUR_PROJECT_ID.supabase.co`
   - **anon/public key**: Safe for browser (starts with `eyJ...`)
   - **service_role key**: Server-side only (keep secret!)
3. Copy these for your `.env.local` file

## Configure Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. **Email** provider should be enabled by default
3. Configure email settings:
   - **Enable Email Confirmations**: Toggle based on preference
   - **Enable Email Sign-ups**: On
   - **Confirm Email**: Optional for development
   - **Secure Email Change**: On for production

### Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - Confirm signup
   - Reset password
   - Magic link
   - Change email address
3. Use variables like `{{ .ConfirmationURL }}` in templates

### URL Configuration

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. Add redirect URLs:
   ```
   http://localhost:3000/**
   https://yourdomain.com/**
   ```

## Set Up OAuth Providers

### GitHub OAuth

1. Go to **Authentication** → **Providers** → **GitHub**
2. Toggle **Enable GitHub** to ON
3. Note the callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Create GitHub OAuth App:
   - Go to GitHub → Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Fill in:
     ```
     Application name: Your App Name
     Homepage URL: http://localhost:3000
     Authorization callback URL: [Supabase callback URL from step 3]
     ```
   - Click "Register application"
5. Copy **Client ID** and generate **Client Secret**
6. Paste into Supabase GitHub provider settings
7. Click "Save"

### Google OAuth

1. Go to **Authentication** → **Providers** → **Google**
2. Toggle **Enable Google** to ON
3. Note the callback URL
4. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth client ID
   - Choose "Web application"
   - Add authorized redirect URI from step 3
5. Copy **Client ID** and **Client Secret**
6. Paste into Supabase Google provider settings
7. Configure consent screen if needed
8. Click "Save"

## Database Setup

### Create Tables (Optional for Graph Data)

If you want to store graph data:

1. Go to **SQL Editor**
2. Create a graphs table:

```sql
-- Create graphs table
CREATE TABLE graphs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nodes JSONB,
  edges JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE graphs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own graphs
CREATE POLICY "Users can manage their own graphs"
  ON graphs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_graphs_updated_at
  BEFORE UPDATE ON graphs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

3. Click "Run" to execute

### Row Level Security (RLS)

Always enable RLS for user data:

1. Go to **Table Editor**
2. Click on your table
3. Click **RLS** → **Enable RLS**
4. Add policies for user access

## Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Anthropic AI (for graph features)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
```

## Testing Authentication

### Test Email Signup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3000/signup
3. Create a new account
4. Check email for confirmation (if enabled)
5. Verify in Supabase Dashboard:
   - Go to **Authentication** → **Users**
   - You should see your new user

### Test OAuth Login

1. Go to http://localhost:3000/login
2. Click "Sign in with GitHub" or "Sign in with Google"
3. Authorize the application
4. You should be redirected to /dashboard

### Test Password Reset

1. Go to http://localhost:3000/login
2. Click "Forgot password?"
3. Enter your email
4. Check email for reset link
5. Follow link to reset password

## Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - All variables from `.env.local`
4. Deploy

### Update Supabase Settings

1. Go to **Authentication** → **URL Configuration**
2. Update site URL to production domain
3. Add production redirect URLs
4. Update OAuth app callback URLs in GitHub/Google

## Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Check that keys are correctly copied
   - Ensure no extra spaces or quotes

2. **"Email not confirmed"**
   - Check email spam folder
   - Disable email confirmation in development

3. **OAuth redirect error**
   - Verify callback URLs match exactly
   - Check redirect URLs in Supabase settings

4. **CORS errors**
   - Add your domain to allowed origins
   - Check URL configuration

5. **User can't access data**
   - Verify RLS policies are correct
   - Check that user is authenticated

### Debug Mode

Enable debug logging:
```javascript
const supabase = createClient({
  auth: {
    debug: true
  }
})
```

### Check Auth State

```javascript
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

const { data: { session } } = await supabase.auth.getSession()
console.log('Current session:', session)
```

## Security Best Practices

1. **Never expose service_role key** in client-side code
2. **Always enable RLS** on tables with user data
3. **Use environment variables** for all keys
4. **Validate data** on both client and server
5. **Set up rate limiting** in production
6. **Configure CORS** properly
7. **Use secure password requirements**
8. **Enable MFA** for production apps

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Discord](https://discord.supabase.com/)

## Quick Checklist

- [ ] Created Supabase account
- [ ] Created new project
- [ ] Copied API keys to `.env.local`
- [ ] Configured authentication settings
- [ ] Set up OAuth providers (optional)
- [ ] Added site URLs and redirect URLs
- [ ] Created database tables (optional)
- [ ] Enabled RLS on tables
- [ ] Tested signup/login flow
- [ ] Verified users appear in dashboard

Congratulations! Your Supabase setup is complete. Your application now has a robust authentication system with email/password and OAuth support, plus a PostgreSQL database with real-time capabilities.