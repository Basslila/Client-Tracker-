import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Phone, Mail, Plus, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { canEdit } from '../lib/permissions'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: string | null
  created_at: string
}

export default function HomePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const [roleData, clientsData] = await Promise.all([
        supabase.from('user_roles').select('role').eq('id', user.id).single(),
        supabase.from('clients').select('*').order('created_at', { ascending: false })
      ])

      setUserRole(roleData.data?.role || null)
      setClients(clientsData.data || [])
    }
    setLoading(false)
  }

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    const { error } = await supabase
      .from('clients')
      .update({ status: newStatus })
      .eq('id', clientId)

    if (error) {
      console.error('Error updating status:', error)
      alert('Error updating status')
      return
    }

    setEditingStatusId(null)
    fetchData()
  }

  if (loading) {
    return <div className="text-gray-600">Loading...</div>
  }

  const filteredClients = statusFilter === 'All' 
    ? clients 
    : clients.filter(client => (client.status || 'Active') === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        {canEdit(userRole as any) && (
          <Link
            to="/clients/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>New Client</span>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Client Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Phone</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                        statusFilter !== 'All' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      <Filter size={16} />
                    </button>
                    {showFilterDropdown && (
                      <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        {['All', 'Active', 'On Hold', 'Cancelled', 'Completed'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setStatusFilter(status)
                              setShowFilterDropdown(false)
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                              statusFilter === status ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Created At</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <Link to={`/clients/${client.id}`} className="flex items-center gap-3 font-medium text-gray-900 hover:text-blue-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <User size={16} />
                    </div>
                    {client.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {client.email ? (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <span>{client.email}</span>
                    </div>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {client.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  ) : '-'}
                </td>
                <td className="px-6 py-4">
                  {editingStatusId === client.id && canEdit(userRole as any) ? (
                    <select
                      value={client.status || 'Active'}
                      onChange={(e) => handleStatusChange(client.id, e.target.value)}
                      onBlur={() => setEditingStatusId(null)}
                      autoFocus
                      className="px-2.5 py-0.5 text-xs font-medium rounded-full border focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 border-gray-200"
                    >
                      <option value="Active">Active</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Completed">Completed</option>
                    </select>
                  ) : (
                    <span 
                      onClick={() => canEdit(userRole as any) && setEditingStatusId(client.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        canEdit(userRole as any) ? 'cursor-pointer hover:opacity-80' : ''
                      } ${
                        client.status === 'Active' ? 'bg-green-100 text-green-800' :
                        client.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                        client.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        client.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {client.status || 'Active'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(client.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/clients/${client.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View Projects
                  </Link>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                      <User size={24} />
                    </div>
                    <p className="font-medium text-gray-900">No clients yet</p>
                    <p className="text-sm text-gray-500 mt-1">Get started by creating a new client.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
