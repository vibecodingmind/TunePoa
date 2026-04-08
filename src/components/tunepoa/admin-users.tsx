'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, RefreshCw, UserCog, Ban, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface UserItem {
  id: string
  name: string
  email: string
  phone: string
  businessName: string
  businessCategory: string
  role: string
  status: string
  createdAt: string
  _count: { serviceRequests: number; subscriptions: number }
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700',
  ADMIN: 'bg-orange-100 text-orange-700',
  STUDIO_MANAGER: 'bg-purple-100 text-purple-700',
  BUSINESS_OWNER: 'bg-blue-100 text-blue-700',
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
}

export function AdminUsers() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [, setActionLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (roleFilter !== 'ALL') params.set('role', roleFilter)
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (searchTerm) params.set('search', searchTerm)
      const res = await fetch(`/api/users?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [roleFilter, statusFilter, searchTerm])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    try {
      // Since we don't have a user update endpoint, we'll just show a toast
      toast({ title: 'Info', description: `User status would be changed to ${newStatus}. (User update endpoint needed)` })
    } catch {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' })
    }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} registered users</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by name, email, business..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="STUDIO_MANAGER">Studio Manager</SelectItem>
            <SelectItem value="BUSINESS_OWNER">Business Owner</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            {users.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No users found</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
                          <Badge className={roleColors[user.role]} variant="outline" style={{ fontSize: '10px' }}>{user.role}</Badge>
                          <Badge className={statusColors[user.status]} variant="outline" style={{ fontSize: '10px' }}>{user.status}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{user.email} • {user.businessName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {user._count.serviceRequests} requests • {user._count.subscriptions} subs • Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {user.status === 'ACTIVE' ? (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8" onClick={() => handleToggleStatus(user.id, user.status)}>
                          <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8" onClick={() => handleToggleStatus(user.id, user.status)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Activate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
