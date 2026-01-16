import Link from 'next/link'
import { LayoutDashboard, Folder, Users, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/auth/actions'
import { getRoleLabel, type UserRole } from '@/utils/permissions'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/', icon: Users },
  { name: 'Projects', href: '/projects', icon: Folder },
]

export async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let isAdmin = false
  let userRoleData: { role: UserRole; email: string } | null = null
  
  if (user) {
    // Query user role - note: this runs on every page load but is fast due to index
    const { data } = await supabase
      .from('user_roles')
      .select('role, email')
      .eq('id', user.id)
      .single()
    
    if (data) {
      userRoleData = data as { role: UserRole; email: string }
      isAdmin = data.role === 'admin'
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <span className="font-bold text-xl">C</span>
        </div>
        <span className="font-bold text-xl text-gray-900">ClientTracker</span>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li>
              <Link 
                href="/admin/users"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                <Settings size={20} />
                <span>User Management</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
        {user && userRoleData && (
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Signed in as</p>
            <p className="text-sm text-gray-900 mt-1 truncate">{user.email}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2
              ${userRoleData.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 
                userRoleData.role === 'music_producer' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                'bg-green-50 text-green-700 border border-green-200'
              }`}>
              {getRoleLabel(userRoleData.role)}
            </span>
          </div>
        )}
        <form action={logout}>
          <button 
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  )
}
