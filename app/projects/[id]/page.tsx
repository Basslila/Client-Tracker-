import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, ArrowLeft, IndianRupee, Pencil } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { TaskList } from '@/components/TaskList'
import { canEdit, canSeeMoney } from '@/utils/permissions'

export default async function ProjectTasks({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Parallel query execution for better performance
  const [{ data: userRole }, { data: project }, { data: tasks }] = await Promise.all([
    supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('projects')
      .select('*, clients(id, name)')
      .eq('id', id)
      .single(),
    supabase
      .from('tasks')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
  ])

  const canEditContent = canEdit((userRole?.role as any) || null)
  const showMoney = canSeeMoney((userRole?.role as any) || null)

  if (!project) {
    notFound()
  }

  // Helper to safely access client data
  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients;

  // Calculate money left to be received
  const budget = project.budget ? Number(project.budget) : 0
  const advancePayment = project.amount_paid ? Number(project.amount_paid) : 0
  const moneyLeft = budget - advancePayment

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/clients/${client?.id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/" className="hover:text-blue-600">Clients</Link>
            <span>/</span>
            <Link href={`/clients/${client?.id}`} className="hover:text-blue-600">{client?.name}</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {canEditContent && (
            <>
              <Link 
                href={`/projects/${id}/edit`}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Pencil size={20} />
                <span>Edit Project</span>
              </Link>
              <Link 
                href={`/tasks/new?project_id=${id}`}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span>New Task</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 gap-6 ${showMoney ? 'md:grid-cols-6' : 'md:grid-cols-3'}`}>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${project.status === 'In Progress' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 
                  project.status === 'On Hold' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 
                  project.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' : 
                  project.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : 
                  'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                {project.status}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Progress</label>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{project.progress || 0}%</span>
            </div>
          </div>
          {showMoney && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Budget</label>
              <p className="mt-2 text-sm font-medium text-gray-900 flex items-center gap-1">
                <IndianRupee size={16} className="text-green-600" />
                ₹{project.budget ? Number(project.budget).toLocaleString() : 'Not set'}
              </p>
            </div>
          )}
          {showMoney && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Advance Payment</label>
              <p className="mt-2 text-sm font-medium text-green-600 flex items-center gap-1">
                <IndianRupee size={16} className="text-green-600" />
                ₹{project.amount_paid ? Number(project.amount_paid).toLocaleString() : '0'}
              </p>
            </div>
          )}
          {showMoney && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Money to be Received</label>
              <p className={`mt-2 text-sm font-medium flex items-center gap-1 ${moneyLeft >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                <IndianRupee size={16} />
                ₹{moneyLeft.toLocaleString()}
              </p>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Start Date</label>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}
            </p>
          </div>
        </div>

        <TaskList tasks={tasks || []} projectId={id} />
      </div>
    </div>
  )
}
