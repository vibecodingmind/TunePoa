'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Search, RefreshCw, Ban, CheckCircle2, UserPlus, Loader2, Shield } from 'lucide-react'
import { useAppStore } from '@/lib/store'
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
  BUSINESS_OWNER: 'bg-blue-100 text-blue-700',
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  BUSINESS_OWNER: 'Business Owner',
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
}

const defaultForm = {
  name: '',
  email: '',
  phone: '',
  businessName: '',
  businessCategory: 'general',
  password: '',
  role: 'BUSINESS_OWNER',
}

export function AdminUsers() {
  const { token, user: currentUser } = useAppStore()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Create user dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (roleFilter !== 'ALL') params.set('role', roleFilter)
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (searchTerm) params.set('search', searchTerm)
      const res = await fetch(`/api/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data) {
        setUsers(data.data?.users || [])
      } else {
        console.error('Failed to fetch users:', data.error)
        setUsers([])
      }
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
    setActionLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: 'User Updated', description: `User status changed to ${newStatus}` })
        fetchUsers()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to update user status', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!form.name || !form.email || !form.phone || !form.businessName || !form.password) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' })
      return
    }
    if (form.password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' })
      return
    }
    if (form.role !== 'BUSINESS_OWNER' && !isSuperAdmin) {
      toast({ title: 'Error', description: 'Only Super Admin can create admin users', variant: 'destructive' })
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({
          title: 'User Created',
          description: `${form.name} has been created as ${roleLabels[form.role] || form.role}`,
        })
        setCreateOpen(false)
        setForm(defaultForm)
        fetchUsers()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to create user', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setActionLoading(false)
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Add User
          </Button>
        </div>
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
                          <Badge className={roleColors[user.role]} variant="outline" style={{ fontSize: '10px' }}>{roleLabels[user.role] || user.role}</Badge>
                          <Badge className={statusColors[user.status]} variant="outline" style={{ fontSize: '10px' }}>{user.status}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{user.email} &bull; {user.businessName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {user._count.serviceRequests} requests &bull; {user._count.subscriptions} subs &bull; Joined {new Date(user.createdAt).toLocaleDateString()}
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

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="e.g., john@business.tz"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+255 7XX XXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Name *</Label>
                <Input
                  value={form.businessName}
                  onChange={(e) => setForm(p => ({ ...p, businessName: e.target.value }))}
                  placeholder="e.g., My Business Ltd"
                />
              </div>
              <div className="space-y-2">
                <Label>Business Category</Label>
                <Select value={form.businessCategory} onValueChange={(v) => setForm(p => ({ ...p, businessCategory: v }))}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="professional_services">Professional Services</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role *
              </Label>
              <Select value={form.role} onValueChange={(v) => setForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUSINESS_OWNER">Business Owner (Customer)</SelectItem>
                  {isSuperAdmin && (
                    <>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {form.role === 'ADMIN' && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Admin users can manage all platform data but cannot create other admins.
                </p>
              )}
              {form.role === 'SUPER_ADMIN' && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Super Admin has full control including creating other admins.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setForm(defaultForm) }}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={actionLoading || !form.name || !form.email || !form.phone || !form.businessName || !form.password}
              onClick={handleCreateUser}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
