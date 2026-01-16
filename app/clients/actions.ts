'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  if (!name) {
    return { error: 'Name is required' }
  }

  const { error } = await supabase.from('clients').insert({
    name,
    email,
    phone,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  redirect('/')
}

export async function updateClientAction(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  if (!name) {
    return { error: 'Name is required' }
  }

  const { error } = await supabase
    .from('clients')
    .update({
      name,
      email,
      phone,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/clients/${id}`)
  revalidatePath('/')
  redirect(`/clients/${id}`)
  return { success: true }
}

export async function deleteClientAction(clientId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  redirect('/')
}
