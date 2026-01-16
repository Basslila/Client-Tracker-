export type UserRole = 'admin' | 'music_producer' | 'sales_team'

export function canEdit(role: UserRole | null): boolean {
  // Admin and music_producer can edit, sales_team is read-only
  return role === 'admin' || role === 'music_producer'
}

export function canDelete(role: UserRole | null): boolean {
  // Only admin can delete
  return role === 'admin'
}

export function canSeeMoney(role: UserRole | null): boolean {
  // Admin and sales_team can see money, music_producer cannot
  return role === 'admin' || role === 'sales_team'
}

export function canAccessAdmin(role: UserRole | null): boolean {
  // Only admin can access admin pages
  return role === 'admin'
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: 'Admin',
    music_producer: 'Music Producer',
    sales_team: 'Sales Team'
  }
  return labels[role]
}
