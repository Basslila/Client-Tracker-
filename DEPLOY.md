# Client Tracker

## Deployment Instructions

### Database
Your database is already hosted on Supabase.
Project URL: `https://ousvpiqdtncqsqhznxxb.supabase.co`

### Frontend (Vercel)
The easiest way to deploy this Next.js app is with Vercel.

1. **Install Vercel CLI** (optional, or use npx):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   Run the following command in your terminal:
   ```bash
   npx vercel
   ```
   Follow the prompts to log in and deploy.

3. **Environment Variables**:
   When asked about environment variables, or in the Vercel Dashboard settings, ensure you add these:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ousvpiqdtncqsqhznxxb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91c3ZwaXFkdG5jcXNxaHpueHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMjA3ODcsImV4cCI6MjA4MTU5Njc4N30.z_vVhzgO6Egp4Qjy9sY3g3vGh60o7OviXiHO3e2dYyU
   ```

### Alternative: Deploy via Git
1. Push this code to a GitHub repository.
2. Go to [Vercel.com](https://vercel.com) and "Add New Project".
3. Import your repository.
4. Add the Environment Variables listed above.
5. Click Deploy.
