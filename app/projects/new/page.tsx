import { createProjectAction } from '../actions'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { SubmitButton } from './submit-button'

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ client_id?: string }> }) {
  const { client_id: clientId } = await searchParams
  
  const supabase = await createClient()
  
  // Fetch clients list
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .order('name', { ascending: true })
  
  // If client_id is provided, fetch that specific client
  let selectedClient = null
  if (clientId) {
    const { data } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', clientId)
      .single()
    selectedClient = data
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href={clientId ? `/clients/${clientId}` : '/projects'} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Project</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form action={async (formData: FormData) => {
          'use server'
          await createProjectAction(formData)
        }} className="space-y-6">
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Website Redesign"
            />
          </div>

          {/* If client_id is provided, show read-only client name, otherwise show dropdown */}
          {clientId && selectedClient ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <div className="flex items-center gap-3 w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <User size={16} />
                </div>
                <span className="font-medium text-gray-900">{selectedClient.name}</span>
              </div>
              <input type="hidden" name="client_id" value={clientId} />
            </div>
          ) : (
            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                id="client_id"
                name="client_id"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select a client</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget (₹)
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              min="0"
              step="0.01"
              placeholder="10000"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="amount_paid" className="block text-sm font-medium text-gray-700 mb-1">
              Amount Paid (₹)
            </label>
            <input
              type="number"
              id="amount_paid"
              name="amount_paid"
              min="0"
              step="0.01"
              placeholder="5000"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href={clientId ? `/clients/${clientId}` : '/projects'}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <SubmitButton label="Create Project" />
          </div>
        </form>
      </div>
    </div>
  )
}
