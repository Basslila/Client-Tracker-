'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProjectAction(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const clientId = formData.get('client_id') as string
  const status = formData.get('status') as string
  const progress = parseInt(formData.get('progress') as string) || 0
  const startDate = formData.get('start_date') as string
  const budget = formData.get('budget') ? parseFloat(formData.get('budget') as string) : null
  const amountPaid = formData.get('amount_paid') ? parseFloat(formData.get('amount_paid') as string) : null

  if (!name) {
    return { error: 'Project name is required' }
  }

  if (!clientId) {
    return { error: 'Client is required' }
  }

  const { error } = await supabase.from('projects').insert({
    name,
    client_id: clientId,
    status,
    progress,
    start_date: startDate || null,
    budget,
    amount_paid: amountPaid,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/clients/${clientId}`)
  redirect(`/clients/${clientId}`)
  return { success: true }
}

export async function updateProjectAction(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const clientId = formData.get('client_id') as string
  const status = formData.get('status') as string
  const progress = parseInt(formData.get('progress') as string) || 0
  const startDate = formData.get('start_date') as string
  const budget = formData.get('budget') ? parseFloat(formData.get('budget') as string) : null
  const amountPaid = formData.get('amount_paid') ? parseFloat(formData.get('amount_paid') as string) : null

  if (!name) {
    return { error: 'Project name is required' }
  }

  if (!clientId) {
    return { error: 'Client is required' }
  }

  const { error } = await supabase
    .from('projects')
    .update({
      name,
      client_id: clientId,
      status,
      progress,
      start_date: startDate || null,
      budget,
      amount_paid: amountPaid,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/projects/${id}`)
  revalidatePath(`/clients/${clientId}`)
  revalidatePath('/projects')
  redirect(`/projects/${id}`)
  return { success: true }
}

export async function deleteProjectAction(projectId: string, clientId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/clients/${clientId}`)
  revalidatePath('/projects')
  redirect(`/clients/${clientId}`)
  return { success: true }
}
