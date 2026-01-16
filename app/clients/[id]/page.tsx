import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, ArrowLeft, Calendar, User, Pencil, IndianRupee } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { canEdit, canSeeMoney } from '@/utils/permissions'

export default async function ClientProjects({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Parallel query execution for better performance
  const [{ data: userRole }, { data: client }, { data: projects }] = await Promise.all([
    supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('clients')
      .select('id, name, email, phone, created_at')
      .eq('id', id)
      .single(),
    supabase
      .from('projects')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false })
  ])

  const canEditContent = canEdit((userRole?.role as any) || null)
  const showMoney = canSeeMoney((userRole?.role as any) || null)

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-sm text-gray-500">Projects</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {canEditContent && (
            <>
              <Link 
                href={`/clients/${id}/edit`}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Pencil size={20} />
                <span>Edit Client</span>
              </Link>
              <Link 
                href={`/projects/new?client_id=${id}`}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span>New Project</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Project Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">%</th>
              {showMoney && <th className="px-6 py-4 text-sm font-semibold text-gray-600">Budget</th>}
              {showMoney && <th className="px-6 py-4 text-sm font-semibold text-gray-600">Advance</th>}
              {showMoney && <th className="px-6 py-4 text-sm font-semibold text-gray-600">Money to Receive</th>}
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Start Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Created By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects?.map((project) => {
              const budget = project.budget ? Number(project.budget) : 0
              const advancePayment = project.amount_paid ? Number(project.amount_paid) : 0
              const moneyLeft = budget - advancePayment
              
              return (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/projects/${project.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{project.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${project.status === 'In Progress' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 
                      project.status === 'On Hold' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 
                      project.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' : 
                      project.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : 
                        'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                      {project.status}
                    </span>
                  </td>
                  {showMoney && (
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <IndianRupee size={14} className="text-green-600" />
                        ₹{budget.toLocaleString()}
                      </span>
                    </td>
                  )}
                  {showMoney && (
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                        <IndianRupee size={14} />
                        ₹{advancePayment.toLocaleString()}
                      </span>
                    </td>
                  )}
                  {showMoney && (
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium flex items-center gap-1 ${moneyLeft >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        <IndianRupee size={14} />
                        ₹{moneyLeft.toLocaleString()}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        <User size={12} />
                      </div>
                      <span className="text-sm text-gray-500">User</span>
                    </div>
                  </td>
                </tr>
              )
            })}
            {(!projects || projects.length === 0) && (
              <tr>
                <td colSpan={showMoney ? 8 : 5} className="px-6 py-12 text-center text-gray-500">
                  No projects found for this client.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
