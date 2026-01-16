'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTaskAction(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const projectId = formData.get('project_id') as string
  const status = formData.get('status') as string
  const dueDate = formData.get('due_date') as string

  if (!title) {
    return { error: 'Task title is required' }
  }

  if (!projectId) {
    return { error: 'Project is required' }
  }

  const { error } = await supabase.from('tasks').insert({
    title,
    project_id: projectId,
    status,
    due_date: dueDate || null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}`)
  return { success: true }
}
