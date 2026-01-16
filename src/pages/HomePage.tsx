import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Phone, Mail, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { canEdit } from '../lib/permissions'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  created_at: string
}

export default function HomePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

    fetchData()
  }, [])

  if (loading) {
    return <div className="text-gray-600">Loading...</div>
  }

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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Created At</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map((client) => (
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
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
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
