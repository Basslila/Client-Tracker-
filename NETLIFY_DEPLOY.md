# Deploy Client Tracker to Netlify

This guide will help you deploy your Client Tracker application to Netlify.

## Prerequisites

- A Netlify account (sign up at https://www.netlify.com/)
- Your Supabase project URL and API keys
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Push Your Code to a Git Repository

If you haven't already, push your code to a Git repository:

```bash
cd client-tracker
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

## Step 2: Connect to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repository
5. Select your Client Tracker repository

## Step 3: Configure Build Settings

Netlify should automatically detect your Next.js project. Configure the following:

**Build settings:**
- Base directory: `client-tracker`
- Build command: `npm run build`
- Publish directory: `.next`

**Note:** The `netlify.toml` file in your project already contains these settings, so Netlify should auto-configure.

## Step 4: Set Environment Variables

In the Netlify dashboard, go to **Site settings** → **Environment variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://ousvpiqdtncqsqhznxxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91c3ZwaXFkdG5jcXNxaHpueHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMjA3ODcsImV4cCI6MjA4MTU5Njc4N30.z_vVhzgO6Egp4Qjy9sY3g3vGh60o7OviXiHO3e2dYyU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91c3ZwaXFkdG5jcXNxaHpueHhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjAyMDc4NywiZXhwIjoyMDgxNTk2Nzg3fQ.VSLoWkTFBZOFQ45eH2fcJX2Vc4yZOk0y1H-7GqHj-4g
```

⚠️ **Important:** Keep your `SUPABASE_SERVICE_ROLE_KEY` secret! Never commit it to your repository.

## Step 5: Install Netlify Next.js Plugin

The project is configured to use `@netlify/plugin-nextjs`. Netlify will automatically install this during the build process.

## Step 6: Deploy

1. Click **Deploy site** button
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, you'll get a URL like `https://your-site-name.netlify.app`

## Step 7: Configure Supabase Authentication

Update your Supabase project settings to allow authentication from your Netlify domain:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Netlify URL to **Site URL**: `https://your-site-name.netlify.app`
4. Add redirect URLs:
   - `https://your-site-name.netlify.app/auth/callback`
   - `https://your-site-name.netlify.app/**`

## Step 8: Custom Domain (Optional)

To use a custom domain:

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow the instructions to update your DNS settings

## Automatic Deployments

Netlify will automatically deploy your site whenever you push changes to your main branch.

To deploy from a different branch:
1. Go to **Site settings** → **Build & deploy** → **Continuous deployment**
2. Change the **Production branch** setting

## Troubleshooting

### Build Failures

If your build fails:
1. Check the build logs in the Netlify dashboard
2. Ensure all environment variables are set correctly
3. Try running `npm run build` locally to catch errors

### Authentication Issues

If users can't log in:
1. Verify Supabase URL configuration includes your Netlify domain
2. Check that environment variables are set correctly
3. Ensure your Supabase project is not paused

### Missing Features

If some features don't work:
1. Check browser console for errors
2. Verify all environment variables are present
3. Check Supabase database permissions and RLS policies

## Monitoring

Monitor your deployment:
- **Deploy logs:** Netlify dashboard → Deploys
- **Function logs:** Netlify dashboard → Functions
- **Analytics:** Netlify dashboard → Analytics

## Support

- Netlify Documentation: https://docs.netlify.com/
- Netlify Support: https://www.netlify.com/support/
- Next.js on Netlify: https://docs.netlify.com/frameworks/next-js/

---

Your Client Tracker application is now live on Netlify! 🎉
