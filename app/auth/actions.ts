'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userRole?.role !== 'admin') {
      return { error: 'Only admins can create new users' }
    }
  } else {
    return { error: 'User not allowed' }
  }

  // Use admin client to create user
  const adminClient = createAdminClient()
  
  // Create user in Supabase Auth
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    return { error: error.message }
  }

  // Add role to user_roles table
  if (data.user) {
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        id: data.user.id,
        email,
        role,
      })

    if (roleError) {
      return { error: roleError.message }
    }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
