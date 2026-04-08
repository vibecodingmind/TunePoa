'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, RefreshCw, PlusCircle, ArrowLeft } from 'lucide-react'

interface ServiceRequest {
  id: string
  businessName: string
  adType: string
  status: string
  preferredLanguage: string
  adScript: string
  specialInstructions: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
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

export function MyRequests() {
  const { currentUser, navigate } = useAppStore()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/service-requests?userId=${currentUser.id}`)
      const data = await res.json()
      setRequests(data.requests || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [currentUser])

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Service Requests</h1>
            <p className="text-gray-500 text-sm mt-1">{requests.length} total requests</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRequests}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('new-request')}><PlusCircle className="h-4 w-4 mr-2" /> New Request</Button>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No service requests yet</p>
            <p className="text-sm mt-1">Create your first ringback tone request</p>
            <Button className="mt-4 bg-emerald-600" onClick={() => navigate('new-request')}>
              <PlusCircle className="h-4 w-4 mr-2" /> Create Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <Card key={req.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{req.businessName}</h3>
                      <Badge variant="outline">{req.adType}</Badge>
                      <Badge className={statusColors[req.status] || ''} variant="outline">{req.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{req.adScript}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>📝 {req.preferredLanguage}</span>
                      <span>📅 {new Date(req.createdAt).toLocaleDateString()}</span>
                      <span>🔄 {new Date(req.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {req.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-600">
                        <span className="font-medium">Rejection Reason:</span> {req.rejectionReason}
                      </div>
                    )}
                    {req.specialInstructions && (
                      <div className="mt-2 text-xs text-gray-500 italic">
                        💡 {req.specialInstructions}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
