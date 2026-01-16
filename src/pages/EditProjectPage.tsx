import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { UserRole } from '../lib/permissions'

interface Client {
  id: string
  name: string
}

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    status: 'Active',
    budget: '',
    commission_enabled: false,
    commission_percentage: '10',
  })

  useEffect(() => {
    async function fetchData() {
      if (!id) return

      const [clientsData, projectData, { data: { user } }] = await Promise.all([
        supabase.from('clients').select('id, name').order('name'),
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.auth.getUser()
      ])
      
      if (clientsData.data) setClients(clientsData.data)
      
      if (projectData.data) {
        setFormData({
          name: projectData.data.name,
          client_id: projectData.data.client_id,
          status: projectData.data.status,
          budget: projectData.data.budget?.toString() || '',
          commission_enabled: projectData.data.commission_enabled || false,
          commission_percentage: projectData.data.commission_percentage?.toString() || '10',
        })
      }
      
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (roleData) setUserRole(roleData.role as UserRole)
      }
    }
    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const projectData = {
      name: formData.name,
      client_id: formData.client_id,
      status: formData.status,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      commission_enabled: formData.commission_enabled,
      commission_percentage: parseFloat(formData.commission_percentage),
    }

    const { error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)

    if (error) {
      console.error('Error updating project:', error)
      alert('Error updating project: ' + error.message)
      setLoading(false)
      return
    }

    navigate(`/projects/${id}`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      return
    }

    setDeleting(true)

    // Delete associated tasks first
    await supabase.from('tasks').delete().eq('project_id', id)

    // Delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      alert('Error deleting project: ' + error.message)
      setDeleting(false)
      return
    }

    navigate('/projects')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/projects/${id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
            Client <span className="text-red-500">*</span>
          </label>
          <select
            id="client_id"
            required
            value={formData.client_id}
            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter project name"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {userRole === 'admin' && (
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
              Budget ($)
            </label>
            <input
              type="number"
              id="budget"
              step="0.01"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        )}

        {userRole === 'admin' && (
          <>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Commission
                </label>
                <p className="text-xs text-gray-500">Enable commission tracking for this project</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, commission_enabled: !formData.commission_enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.commission_enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.commission_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {formData.commission_enabled && (
              <div>
                <label htmlFor="commission_percentage" className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Percentage (%)
                </label>
                <input
                  type="number"
                  id="commission_percentage"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.commission_percentage}
                  onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10.00"
                />
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            to={`/projects/${id}`}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Trash2 size={18} />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </form>
    </div>
  )
}
