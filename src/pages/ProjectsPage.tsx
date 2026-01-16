import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { canEdit, canSeeMoney, UserRole } from '../lib/permissions'
import { ProjectList } from '../components/ProjectList'

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('All')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const [roleData, projectsData] = await Promise.all([
        supabase.from('user_roles').select('role').eq('id', user.id).single(),
        supabase.from('projects').select('*, clients(name)').order('created_at', { ascending: false })
      ])

      setUserRole((roleData.data?.role as UserRole) || null)
      setProjects(projectsData.data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-gray-600">Loading...</div>
  }

  const showMoney = canSeeMoney(userRole)
  const filteredProjects = statusFilter === 'All' 
    ? projects 
    : projects.filter(project => (project.status || 'Active') === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Projects</h1>
        {canEdit(userRole) && (
          <Link
            to="/projects/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>New Project</span>
          </Link>
        )}
      </div>

      <div className="flex gap-2">
        {['All', 'Active', 'On Hold', 'Cancelled', 'Completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <ProjectList projects={filteredProjects} showMoney={showMoney} canEdit={canEdit(userRole)} onProjectsChange={fetchData} />
    </div>
  )
}
