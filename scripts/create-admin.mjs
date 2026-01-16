/**
 * Script to create the initial admin user
 * Run with: node scripts/create-admin.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
const envPath = join(__dirname, '..', '.env.local')
const envFile = readFileSync(envPath, 'utf8')
const envVars = {}

envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  console.log('🚀 Creating admin user...')

  const email = 'Utkersh42@gmail.com'
  const password = 'Utkersh@123'

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm the email
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message)
      return
    }

    if (!authData.user) {
      console.error('❌ No user data returned')
      return
    }

    console.log('✅ Auth user created:', authData.user.id)

    // Insert role into user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        id: authData.user.id,
        email: email,
        role: 'admin'
      })

    if (roleError) {
      console.error('❌ Error creating role:', roleError.message)
      return
    }

    console.log('✅ Admin role assigned')
    console.log('\n🎉 Admin user created successfully!')
    console.log('\nLogin credentials:')
    console.log('  Email:', email)
    console.log('  Password:', password)
    console.log('\nYou can now login at: http://localhost:3000/login')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createAdminUser()
