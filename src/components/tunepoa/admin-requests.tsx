'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Search, Eye, UserCheck, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ServiceRequest {
  id: string
  businessName: string
  businessCategory: string
  adType: string
  targetAudience: string | null
  adScript: string
  preferredLanguage: string
  specialInstructions: string | null
  status: string
  assignedTo: string | null
  rejectionReason: string | null
  createdAt: string
  user: { id: string; name: string; email: string; businessName: string }
  recordings: { id: string; title: string; status: string }[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  RECORDING: 'bg-purple-100 text-purple-700 border-purple-200',
  AWAITING_VERIFICATION: 'bg-orange-100 text-orange-700 border-orange-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
}

export function AdminRequests() {
  const { navigate } = useAppStore()
  const { toast } = useToast()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [assignTo, setAssignTo] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [newStatus, setNewStatus] = useState('')

  const fetchRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      const res = await fetch(`/api/service-requests?${params}`)
      const data = await res.json()
      setRequests(data.data.requests || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const filteredRequests = requests.filter(r =>
    !searchTerm ||
    r.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.adScript.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUpdateStatus = async (id: string, status: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast({ title: 'Updated', description: `Status changed to ${status}` })
        fetchRequests()
        setDetailOpen(false)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedReq) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/service-requests/${selectedReq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: assignTo, status: 'IN_PROGRESS' }),
      })
      if (res.ok) {
        toast({ title: 'Assigned', description: 'Studio manager assigned' })
        fetchRequests()
        setAssignOpen(false)
        setDetailOpen(false)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to assign', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedReq || !rejectionReason) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/service-requests/${selectedReq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', rejectionReason }),
      })
      if (res.ok) {
        toast({ title: 'Rejected', description: 'Request rejected with reason' })
        fetchRequests()
        setRejectOpen(false)
        setDetailOpen(false)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to reject', variant: 'destructive' })
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
          <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-gray-500 text-sm mt-1">{filteredRequests.length} requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRequests}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RECORDING">Recording</SelectItem>
            <SelectItem value="AWAITING_VERIFICATION">Awaiting Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No service requests found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-gray-900 truncate">{req.businessName}</p>
                        <Badge variant="outline" className="text-xs shrink-0">{req.adType}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        by {req.user.name} • {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-md">{req.adScript}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <Badge className={statusColors[req.status] || ''} variant="outline">
                        {req.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedReq(req); setDetailOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedReq && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedReq.businessName}</DialogTitle>
                <Badge className={statusColors[selectedReq.status] || ''} variant="outline" style={{ width: 'fit-content' }}>
                  {selectedReq.status}
                </Badge>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Client:</span> <span className="font-medium">{selectedReq.user.name}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedReq.user.email}</span></div>
                  <div><span className="text-gray-500">Category:</span> <span className="font-medium">{selectedReq.businessCategory}</span></div>
                  <div><span className="text-gray-500">Ad Type:</span> <span className="font-medium">{selectedReq.adType}</span></div>
                  <div><span className="text-gray-500">Language:</span> <span className="font-medium">{selectedReq.preferredLanguage}</span></div>
                  <div><span className="text-gray-500">Assigned:</span> <span className="font-medium">{selectedReq.assignedTo || 'Not assigned'}</span></div>
                  <div className="sm:col-span-2"><span className="text-gray-500">Audience:</span> <span className="font-medium">{selectedReq.targetAudience || 'Not specified'}</span></div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Ad Script:</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">{selectedReq.adScript}</div>
                </div>
                {selectedReq.specialInstructions && (
                  <div>
                    <span className="text-sm text-gray-500">Special Instructions:</span>
                    <div className="mt-1 p-3 bg-yellow-50 rounded-lg text-sm">{selectedReq.specialInstructions}</div>
                  </div>
                )}
                {selectedReq.rejectionReason && (
                  <div>
                    <span className="text-sm text-red-600">Rejection Reason:</span>
                    <div className="mt-1 p-3 bg-red-50 rounded-lg text-sm">{selectedReq.rejectionReason}</div>
                  </div>
                )}
                {selectedReq.recordings.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Recordings ({selectedReq.recordings.length}):</span>
                    <div className="mt-1 space-y-1">
                      {selectedReq.recordings.map(rec => (
                        <div key={rec.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>{rec.title}</span>
                          <Badge variant="outline" className="text-xs">{rec.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
                  <UserCheck className="h-4 w-4 mr-1" /> Assign
                </Button>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RECORDING">Recording</SelectItem>
                    <SelectItem value="AWAITING_VERIFICATION">Awaiting Review</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="bg-emerald-600" disabled={!newStatus} onClick={() => handleUpdateStatus(selectedReq.id, newStatus)}>
                  Update Status
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setRejectOpen(true)}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Studio Manager</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Studio Manager User ID</Label>
            <Input value={assignTo} onChange={(e) => setAssignTo(e.target.value)} placeholder="Enter user ID" />
            <p className="text-xs text-gray-400">Enter the user ID of the studio manager</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600" disabled={actionLoading || !assignTo} onClick={handleAssign}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Rejection Reason</Label>
            <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Provide a reason for rejection..." rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={actionLoading || !rejectionReason} onClick={handleReject}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
