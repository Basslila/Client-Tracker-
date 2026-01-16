import { ProjectList } from '@/components/ProjectList'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { canEdit, canSeeMoney } from '@/utils/permissions'
import { redirect } from 'next/navigation'

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Parallel query execution for better performance
  const [{ data: userRole }, { data: projects }] = await Promise.all([
    supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('projects')
      .select('*, clients(name)')
      .order('created_at', { ascending: false })
  ])

  const showMoney = canSeeMoney((userRole?.role as any) || null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Projects</h1>
        {canEdit((userRole?.role as any) || null) && (
          <Link 
            href="/projects/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>New Project</span>
          </Link>
        )}
      </div>

      <ProjectList projects={projects || []} showMoney={showMoney} />
    </div>
  )
}
