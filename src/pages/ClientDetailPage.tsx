import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Plus, Mail, Phone, Pencil } from 'lucide-react'
import { ProjectList } from '../components/ProjectList'
import { canEdit, canSeeMoney, UserRole } from '../lib/permissions'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: string | null
  created_at: string
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<any[]>([])
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

    const [roleData, clientData, projectsData] = await Promise.all([
      supabase.from('user_roles').select('role').eq('id', user.id).single(),
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('projects').select('*').eq('client_id', id).order('created_at', { ascending: false })
    ])

    setUserRole((roleData.data?.role as UserRole) || null)
    setClient(clientData.data)
    setProjects(projectsData.data || [])
    setLoading(false)
  }

  if (loading) {
    return <div className="text-gray-600">Loading...</div>
  }

  if (!client) {
    return <div className="text-gray-600">Client not found</div>
  }

  const showMoney = canSeeMoney(userRole)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              client.status === 'Active' ? 'bg-green-100 text-green-800' :
              client.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
              client.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
              client.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {client.status || 'Active'}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <span>{client.phone}</span>
              </div>
            )}
          </div>
        </div>
        {canEdit(userRole) && (
          <div className="flex items-center gap-3">
            <Link
              to={`/clients/${id}/edit`}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Pencil size={20} />
              <span>Edit Client</span>
            </Link>
            <Link
              to={`/projects/new?client_id=${id}`}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              <span>New Project</span>
            </Link>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Projects ({projects.length})
        </h2>
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No projects yet for this client.</p>
            {canEdit(userRole) && (
              <Link
                to={`/projects/new?client_id=${id}`}
                className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={20} />
                Create the first project
              </Link>
            )}
          </div>
        ) : (
          <ProjectList 
            projects={projects.map(p => ({ ...p, clients: { name: client.name } }))} 
            showMoney={showMoney}
            canEdit={canEdit(userRole)}
            onProjectsChange={fetchData}
          />
        )}
      </div>
    </div>
  )
}
