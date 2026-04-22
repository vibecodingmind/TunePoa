'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { STATUS_LABELS, STATUS_COLORS, VALID_STATUSES } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  PlusCircle,
  RefreshCw,
  Search,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Tag,
} from 'lucide-react'

/* ========================================================================= */
/* Types                                                                     */
/* ========================================================================= */

interface ServiceRequest {
  id: string
  businessName: string
  businessCategory: string
  adType: string
  status: string
  preferredLanguage: string
  adScript: string
  specialInstructions: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

/* ========================================================================= */
/* Constants                                                                 */
/* ========================================================================= */

const ITEMS_PER_PAGE = 10

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatDate(dateStr)
}

/* ========================================================================= */
/* Status-specific contextual message component                              */
/* ========================================================================= */

function StatusMessage({ req }: { req: ServiceRequest }) {
  if (req.status === 'REJECTED') {
    return (
      <div className="flex items-start gap-2.5 mt-3 p-3 rounded-xl bg-red-50 border border-red-100">
        <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="h-3.5 w-3.5 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700">Request Rejected</p>
          {req.rejectionReason && (
            <p className="text-xs text-red-600 mt-1 leading-relaxed">
              Reason: {req.rejectionReason}
            </p>
          )}
          <p className="text-xs text-red-500 mt-1">You can re-submit a new request.</p>
        </div>
      </div>
    )
  }

  if (req.status === 'APPROVED') {
    return (
      <div className="flex items-start gap-2.5 mt-3 p-3 rounded-xl bg-tp-50 border border-tp-100">
        <div className="h-7 w-7 rounded-full bg-tp-100 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-tp-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-tp-700">Request Approved</p>
          <p className="text-xs text-tp-600 mt-1">
            Your ad has been approved! A subscription has been created automatically.
          </p>
        </div>
      </div>
    )
  }

  return null
}

/* ========================================================================= */
/* Main Component                                                            */
/* ========================================================================= */

export function MyRequests() {
  const { user, token, navigate } = useAppStore()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  /* ---- Fetch ---- */

  const fetchRequests = useCallback(async () => {
    if (!user || !token) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('userId', user.id)
      if (statusFilter !== 'ALL') params.set('status', statusFilter)

      const res = await fetch(`/api/service-requests?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch requests')
      }

      setRequests(data.data?.requests || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [user, token, statusFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, searchQuery])

  /* ---- Filter & Pagination ---- */

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests
    const q = searchQuery.toLowerCase()
    return requests.filter(
      (r) =>
        r.businessName.toLowerCase().includes(q) ||
        r.adType.toLowerCase().includes(q) ||
        r.adScript.toLowerCase().includes(q) ||
        (r.businessCategory && r.businessCategory.toLowerCase().includes(q)),
    )
  }, [requests, searchQuery])

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
  const paginatedRequests = filteredRequests.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  /* ---- Status filter options ---- */

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    ...VALID_STATUSES.SERVICE_REQUEST.map((s) => ({
      value: s,
      label: STATUS_LABELS[s] || s,
    })),
  ]

  /* ---- Render: Loading ---- */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 sm:max-w-xs" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  /* ---- Render: Error ---- */

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchRequests}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  /* ---- Render: Main ---- */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('dashboard')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">My Service Requests</h1>
              <Badge variant="secondary" className="text-xs font-semibold">
                {filteredRequests.length}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">View and manage your ad requests</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRequests}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-tp-600 hover:bg-tp-700 text-white"
            onClick={() => navigate('new-request')}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            New Request
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, type, or script..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-52 h-11">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && !loading && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No matching requests'
                : 'No service requests yet'}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first ringback tone ad request to get started.'}
            </p>
            {!searchQuery && statusFilter === 'ALL' && (
              <Button
                className="mt-5 bg-tp-600 hover:bg-tp-700 text-white"
                onClick={() => navigate('new-request')}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Request
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Request Cards */}
      {paginatedRequests.length > 0 && (
        <div className="space-y-3">
          {paginatedRequests.map((req) => {
            const isExpanded = expandedId === req.id
            return (
              <Card
                key={req.id}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{req.businessName}</h3>
                        <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                          <Tag className="h-2.5 w-2.5 mr-1" />
                          {req.adType}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                        >
                          {STATUS_LABELS[req.status] || req.status}
                        </Badge>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        {req.businessCategory && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {req.businessCategory}
                          </span>
                        )}
                        <span>{req.preferredLanguage}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {getTimeAgo(req.createdAt)}
                        </span>
                      </div>

                      {/* Script preview */}
                      <div className="text-sm text-slate-600 mt-3 leading-relaxed">
                        {isExpanded || req.adScript.length <= 100
                          ? req.adScript
                          : `${req.adScript.slice(0, 100)}...`}
                        {req.adScript.length > 100 && (
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : req.id)}
                            className="text-tp-600 hover:text-tp-700 text-xs font-semibold ml-1 inline-flex items-center gap-0.5"
                          >
                            {isExpanded ? (
                              <>
                                Show less <ChevronUp className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                Read more <ChevronDown className="h-3 w-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Status-specific message */}
                      <StatusMessage req={req} />

                      {/* Expanded section */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                          {req.specialInstructions && (
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                                Special Instructions
                              </p>
                              <p className="text-sm text-slate-700 mt-1">{req.specialInstructions}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created: {formatDate(req.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              Updated: {formatDate(req.updatedAt)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(page * ITEMS_PER_PAGE, filteredRequests.length)} of{' '}
            {filteredRequests.length} requests
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-9"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1
                const isCurrentPage = pageNum === page
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                      isCurrentPage
                        ? 'bg-tp-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-9"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
