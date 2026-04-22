'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Receipt,
  RefreshCw,
  AlertCircle,
  Download,
  Eye,
  CreditCard,
  Calendar,
  FileText,
  ChevronRight,
  Loader2,
  CircleDollarSign,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/* ========================================================================= */
/* Types */
/* ========================================================================= */

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  currency: string
  status: string
  issuedAt: string
  dueDate: string | null
  paidAt: string | null
  items: string
  notes: string | null
  createdAt: string
  subscription: { id: string; status: string; package: { name: string } } | null
}

/* ========================================================================= */
/* Helpers */
/* ========================================================================= */

const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  SENT: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  PAID: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
  OVERDUE: 'bg-red-500/15 text-red-400 border-red-500/25',
  CANCELLED: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
}

function formatTZS(amount: number): string {
  return `TZS ${new Intl.NumberFormat('en-TZ').format(amount)}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function parseItems(itemsStr: string): InvoiceItem[] {
  try {
    return JSON.parse(itemsStr)
  } catch {
    return []
  }
}

/* ========================================================================= */
/* Main Component */
/* ========================================================================= */

export function MyInvoicesPage() {
  const { token } = useAppStore()
  const { toast } = useToast()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  /* ---- Fetch ---- */

  const fetchInvoices = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setFetchError(null)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') params.set('status', activeTab)
      params.set('limit', '50')

      const res = await fetch(`/api/invoices?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch')
      setInvoices(data.data?.invoices || [])
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }, [token, activeTab])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  /* ---- Render: Loading ---- */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      </div>
    )
  }

  /* ---- Render: Main ---- */

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">My Invoices</h1>
              <Badge variant="secondary" className="text-xs font-semibold">{invoices.length}</Badge>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">View and manage your invoices</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInvoices}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass-subtle rounded-xl overflow-x-auto">
        {[
          { key: 'all', label: 'All' },
          { key: 'DRAFT', label: 'Draft' },
          { key: 'SENT', label: 'Sent' },
          { key: 'PAID', label: 'Paid' },
          { key: 'OVERDUE', label: 'Overdue' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.key
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{fetchError}</span>
            <Button variant="outline" size="sm" onClick={fetchInvoices}>
              <RefreshCw className="h-4 w-4 mr-2" />Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty */}
      {invoices.length === 0 && !fetchError && (
        <div className="glass-card p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Receipt className="h-7 w-7 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300">No invoices found</h3>
          <p className="text-sm text-slate-400 mt-1">Invoices will appear here once they&apos;re created.</p>
        </div>
      )}

      {/* Invoice Cards */}
      <div className="space-y-3">
        {invoices.map((invoice) => {
          const items = parseItems(invoice.items)
          const isOverdue = invoice.status === 'OVERDUE'
          const isUnpaid = !['PAID', 'CANCELLED'].includes(invoice.status)

          return (
            <div key={invoice.id} className="glass-card p-5 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white text-base">{invoice.invoiceNumber}</h3>
                    <Badge variant="outline" className={`text-xs ${INVOICE_STATUS_COLORS[invoice.status] || ''}`}>
                      {invoice.status}
                    </Badge>
                    {isOverdue && (
                      <Badge variant="outline" className="text-xs bg-red-500/15 text-red-400 border-red-500/25">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(invoice.issuedAt)}</span>
                    <span>Due: {formatDate(invoice.dueDate)}</span>
                  </div>

                  {/* Items summary */}
                  {items.length > 0 && (
                    <div className="mt-2 text-sm text-slate-400">
                      {items.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="inline">
                          {idx > 0 && ', '}
                          {item.description}
                        </span>
                      ))}
                      {items.length > 2 && (
                        <span className="text-slate-500"> and {items.length - 2} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount + Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                  <p className={cn(
                    'text-lg font-bold',
                    invoice.status === 'PAID' ? 'text-teal-400' : isOverdue ? 'text-red-400' : 'text-white'
                  )}>
                    {formatTZS(invoice.amount)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setViewInvoice(invoice)}>
                      <Eye className="h-3.5 w-3.5 mr-1" />View
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => window.open(`/api/invoices/${invoice.id}/pdf?token=${token}`, '_blank')}>
                      <Download className="h-3.5 w-3.5 mr-1" />PDF
                    </Button>
                    {isUnpaid && (
                      <Button size="sm" className="h-8 text-xs bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
                        <CircleDollarSign className="h-3.5 w-3.5 mr-1" />Pay
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={(open) => !open && setViewInvoice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-400" />
              {viewInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {viewInvoice && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-xs ${INVOICE_STATUS_COLORS[viewInvoice.status] || ''}`}>
                  {viewInvoice.status}
                </Badge>
                <p className="text-xl font-bold text-white">{formatTZS(viewInvoice.amount)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400">Issued:</span><p className="text-slate-200">{formatDate(viewInvoice.issuedAt)}</p></div>
                <div><span className="text-slate-400">Due:</span><p className="text-slate-200">{formatDate(viewInvoice.dueDate)}</p></div>
                {viewInvoice.paidAt && (
                  <div><span className="text-slate-400">Paid:</span><p className="text-teal-400">{formatDate(viewInvoice.paidAt)}</p></div>
                )}
              </div>
              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Items</h4>
                <div className="space-y-2">
                  {parseItems(viewInvoice.items).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                      <div>
                        <p className="text-sm text-white">{item.description}</p>
                        <p className="text-xs text-slate-400">{item.quantity} × {formatTZS(item.unitPrice)}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-200">{formatTZS(item.quantity * item.unitPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>
              {viewInvoice.notes && (
                <div className="p-3 rounded-lg bg-white/[0.03]">
                  <p className="text-xs text-slate-400 mb-1">Notes</p>
                  <p className="text-sm text-slate-300">{viewInvoice.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`/api/invoices/${viewInvoice.id}/pdf?token=${token}`, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
