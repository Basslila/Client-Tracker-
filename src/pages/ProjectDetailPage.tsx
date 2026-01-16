import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Pencil } from 'lucide-react'
import { TaskList } from '../components/TaskList'
import { canEdit, UserRole } from '../lib/permissions'

interface Project {
  id: string
  name: string
  status: string
  progress: number
  budget: number | null
  client_id: string
  created_at: string
  clients?: {
    name: string
  }
}

interface Task {
  id: string
  title: string
  status: string | null
  due_date: string | null
  project_id: string
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [userRole, setUserRole] = useState<UserRole>(null)

  useEffect(() => {
    fetchData()
  }, [id, navigate])

  async function fetchData() {
    if (!id) return

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const [roleData, projectData, tasksData] = await Promise.all([
      supabase.from('user_roles').select('role').eq('id', user.id).single(),
      supabase.from('projects').select('*, clients(name)').eq('id', id).single(),
      supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: false })
    ])

    setUserRole((roleData.data?.role as UserRole) || null)
    setProject(projectData.data)
    setTasks(tasksData.data || [])
    setLoading(false)
  }

  if (loading) {
    return <div className="text-gray-600">Loading...</div>
  }

  if (!project) {
    return <div className="text-gray-600">Project not found</div>
  }

  const statusColors = {
    'Approved': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'On Hold': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-gray-100 text-gray-800',
    'Cancelled': 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projects" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            {project.clients && (
              <Link 
                to={`/clients/${project.client_id}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {project.clients.name}
              </Link>
            )}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[project.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
              {project.status}
            </span>
          </div>
        </div>
        {canEdit(userRole) && (
          <Link
            to={`/projects/${id}/edit`}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Pencil size={20} />
            <span>Edit Project</span>
          </Link>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tasks ({tasks.length})
        </h2>
        <TaskList tasks={tasks} projectId={id!} onTasksChange={fetchData} />
      </div>
    </div>
  )
}