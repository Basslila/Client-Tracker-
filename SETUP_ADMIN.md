# Initial Admin User Setup

To create the initial admin user with email `Utkersh42@gmail.com` and password `Utkersh@123`, follow these steps:

## Option 1: Using Automated Script (Recommended)

1. Get your Service Role Key from Supabase:
   - Go to https://supabase.com/dashboard/project/ousvpiqdtncqsqhznxxb/settings/api
   - Under "Project API keys", copy the **service_role** key (keep this secret!)

2. Add it to your `.env.local` file:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. Install ts-node if not installed:
   ```bash
   npm install -D ts-node
   ```

4. Run the script:
   ```bash
   npx ts-node scripts/create-admin.ts
   ```

## Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/ousvpiqdtncqsqhznxxb
2. Navigate to **Authentication** > **Users**
3. Click **Add User** > **Create new user**
4. Enter:
   - Email: `Utkersh42@gmail.com`
   - Password: `Utkersh@123`
   - Check "Auto Confirm User"
5. Click **Create User**
6. Copy the User ID (UUID) that was created
7. Go to **Table Editor** > **user_roles**
8. Click **Insert** > **Insert row**
9. Enter:
   - id: [paste the User ID you copied]
   - role: `admin`
   - email: `Utkersh42@gmail.com`
10. Click **Save**

## Option 2: Using SQL Editor

Go to **SQL Editor** in your Supabase dashboard and run:

```sql
-- First, you need to create the user in Supabase Auth manually through the dashboard
-- Then run this with the actual user ID:

INSERT INTO public.user_roles (id, role, email)
VALUES ('[USER_ID_FROM_AUTH]', 'admin', 'Utkersh42@gmail.com');
```

## Login

After setup, you can login at: http://localhost:3000/login

- Email: Utkersh42@gmail.com
- Password: Utkersh@123

## Adding More Users

Once logged in as admin:
1. Go to **User Management** in the sidebar
2. Click **Add User**
3. Enter email, password, and select role (Admin, Music Producer, or Sales Team)
