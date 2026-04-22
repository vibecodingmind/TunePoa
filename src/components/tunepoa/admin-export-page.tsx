'use client'

import { useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  CreditCard,
  Banknote,
  FileText,
  Receipt,
  Download,
  Loader2,
  CalendarDays,
} from 'lucide-react'

/* ─── Export Entity Definition ─── */
interface ExportEntity {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  gradient: string
  hasStatusFilter: boolean
  statusOptions: { value: string; label: string }[]
}

const exportEntities: ExportEntity[] = [
  {
    id: 'users',
    label: 'Users',
    description: 'Export all user accounts',
    icon: <Users className="h-5 w-5 text-white" />,
    gradient: 'from-tp-500 to-ts-400',
    hasStatusFilter: true,
    statusOptions: [
      { value: '', label: 'All Statuses' },
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
      { value: 'SUSPENDED', label: 'Suspended' },
    ],
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    description: 'Export subscription data',
    icon: <CreditCard className="h-5 w-5 text-white" />,
    gradient: 'from-teal-500 to-emerald-400',
    hasStatusFilter: true,
    statusOptions: [
      { value: '', label: 'All Statuses' },
      { value: 'ACTIVE', label: 'Active' },
      { value: 'EXPIRED', label: 'Expired' },
      { value: 'CANCELLED', label: 'Cancelled' },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    description: 'Export payment records',
    icon: <Banknote className="h-5 w-5 text-white" />,
    gradient: 'from-amber-500 to-orange-400',
    hasStatusFilter: true,
    statusOptions: [
      { value: '', label: 'All Statuses' },
      { value: 'COMPLETED', label: 'Completed' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'FAILED', label: 'Failed' },
    ],
  },
  {
    id: 'requests',
    label: 'Requests',
    description: 'Export service requests',
    icon: <FileText className="h-5 w-5 text-white" />,
    gradient: 'from-violet-500 to-purple-400',
    hasStatusFilter: true,
    statusOptions: [
      { value: '', label: 'All Statuses' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'IN_PROGRESS', label: 'In Progress' },
      { value: 'COMPLETED', label: 'Completed' },
      { value: 'CANCELLED', label: 'Cancelled' },
    ],
  },
  {
    id: 'invoices',
    label: 'Invoices',
    description: 'Export invoice records',
    icon: <Receipt className="h-5 w-5 text-white" />,
    gradient: 'from-rose-500 to-pink-400',
    hasStatusFilter: true,
    statusOptions: [
      { value: '', label: 'All Statuses' },
      { value: 'PAID', label: 'Paid' },
      { value: 'UNPAID', label: 'Unpaid' },
      { value: 'OVERDUE', label: 'Overdue' },
    ],
  },
]

/* ─── Single Export Card ─── */
function ExportCard({ entity }: { entity: ExportEntity }) {
  const { token } = useAppStore()
  const { toast } = useToast()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const handleExport = useCallback(async () => {
    if (!token) return

    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      params.set('type', entity.id)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      if (status) params.set('status', status)

      const url = `/api/export?${params.toString()}`

      // Try fetching to get a blob and trigger download
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error(`Export failed: ${res.status}`)
      }

      const blob = await res.blob()
      const contentDisposition = res.headers.get('Content-Disposition')
      let filename = `${entity.id}-export.csv`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '')
        }
      }

      // Create temp link to trigger download
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)

      toast({
        title: 'Export started',
        description: `${entity.label} data is being downloaded.`,
      })
    } catch {
      toast({
        title: 'Export failed',
        description: `Could not export ${entity.label} data. Please try again.`,
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }, [token, entity.id, entity.label, startDate, endDate, status, toast])

  const hasFilters = startDate || endDate || status

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-white/[0.12] transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${entity.gradient} flex items-center justify-center shadow-lg shrink-0`}>
          {entity.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">{entity.label}</h3>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/10 text-slate-400 bg-white/5">
              CSV
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{entity.description}</p>
        </div>
      </div>

      {/* Toggle filters */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        <CalendarDays className="h-3.5 w-3.5" />
        {showFilters ? 'Hide filters' : 'Date & status filters'}
        {hasFilters && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-400 text-[10px] font-medium">
            Active
          </span>
        )}
      </button>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-3 pl-0.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs bg-white/5 border-white/[0.08] text-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs bg-white/5 border-white/[0.08] text-slate-200"
              />
            </div>
          </div>
          {entity.hasStatusFilter && (
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/[0.08] text-slate-200">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="glass-dark border-white/[0.08]">
                  {entity.statusOptions.map((opt) => (
                    <SelectItem key={opt.value || 'all'} value={opt.value || 'all'}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Export Button */}
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full h-9 bg-gradient-to-r from-tp-500 to-ts-400 hover:from-tp-600 hover:to-ts-500 text-white text-sm font-medium rounded-xl shadow-md shadow-tp-500/15 transition-all duration-200"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export {entity.label}
          </>
        )}
      </Button>
    </div>
  )
}

/* ─── Admin Export Page ─── */
export function AdminExportPage() {
  const { isAdmin: isAdminUser } = useAppStore()

  if (!isAdminUser) return null

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Data Export</h1>
        <p className="text-slate-400 text-sm mt-1">Export platform data as CSV files</p>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {exportEntities.map((entity) => (
          <ExportCard key={entity.id} entity={entity} />
        ))}
      </div>
    </div>
  )
}
