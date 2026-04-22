'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Receipt,
  Plus,
  RefreshCw,
  AlertCircle,
  Eye,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  CheckCircle2,
  Calendar,
  FileText,
  CircleDollarSign,
  Download,
  X,
  User,
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
  user: {
    id: string
    name: string
    email: string
    businessName: string
  }
  subscription: {
    id: string
    status: string
    package: { name: string } | null
  } | null
}

interface UserOption {
  id: string
  name: string
  email: string
  businessName: string
}

/* ========================================================================= */
/* Helpers */
/* ========================================================================= */

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

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'SENT', label: 'Sent' },
  { key: 'PAID', label: 'Paid' },
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

const PAGE_SIZE = 20

/* ========================================================================= */
/* Main Component */
/* ========================================================================= */

export function AdminInvoicesPage() {
  const { token } = useAppStore()
  const { toast } = useToast()

  // --- Data state ---
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // --- Create invoice form ---
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [users, setUsers] = useState<UserOption[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [formItems, setFormItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ])
  const [formNotes, setFormNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // --- Detail dialog ---
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  // --- Action loading ---
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // --- Refs ---
  const userSearchRef = useRef<HTMLInputElement>(null)

  /* ---- Fetch users for create form ---- */

  const fetchUsers = useCallback(async (search?: string) => {
    setUsersLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      params.set('role', 'BUSINESS_OWNER')
      const res = await fetch(`/api/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data) {
        setUsers(data.data.users || [])
      }
    } catch {
      // silent
    } finally {
      setUsersLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (showCreateForm && users.length === 0) {
      fetchUsers()
    }
  }, [showCreateForm, users.length, fetchUsers])

  /* ---- Fetch invoices ---- */

  const fetchInvoices = useCallback(async (append = false) => {
    if (!token) return
    if (!append) setLoading(true)
    setFetchError(null)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') params.set('status', activeTab)
      if (searchTerm) params.set('search', searchTerm)
      params.set('limit', String(PAGE_SIZE))
      params.set('offset', append ? String(invoices.length) : '0')

      const res = await fetch(`/api/invoices?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch')

      const fetched: Invoice[] = data.data?.invoices || []
      const fetchedTotal: number = data.data?.total || 0

      if (append) {
        setInvoices((prev) => [...prev, ...fetched])
      } else {
        setInvoices(fetched)
      }
      setTotal(fetchedTotal)
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }, [token, activeTab, searchTerm, invoices.length])

  useEffect(() => {
    fetchInvoices()
  }, [token, activeTab])

  /* ---- Form handlers ---- */

  const addItem = () => {
    setFormItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (formItems.length <= 1) return
    setFormItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setFormItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const resetForm = () => {
    setSelectedUserId('')
    setFormItems([{ description: '', quantity: 1, unitPrice: 0 }])
    setFormNotes('')
  }

  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast({ title: 'Validation Error', description: 'Please select a user', variant: 'destructive' })
      return
    }

    const validItems = formItems.filter((i) => i.description.trim() && i.quantity > 0 && i.unitPrice > 0)
    if (validItems.length === 0) {
      toast({ title: 'Validation Error', description: 'Please add at least one valid item', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: selectedUserId,
          items: validItems,
          notes: formNotes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create invoice')

      toast({ title: 'Invoice Created', description: `Invoice ${data.data.invoice.invoiceNumber} created successfully` })
      setShowCreateForm(false)
      resetForm()
      fetchInvoices()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create invoice',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  /* ---- Action handlers ---- */

  const handleMarkPaid = async (invoice: Invoice) => {
    setActionLoading(invoice.id)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'PAID' }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast({ title: 'Invoice Paid', description: `${invoice.invoiceNumber} marked as paid` })
      fetchInvoices()
      setViewInvoice(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to mark invoice as paid', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkSent = async (invoice: Invoice) => {
    setActionLoading(invoice.id)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'SENT' }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast({ title: 'Invoice Sent', description: `${invoice.invoiceNumber} marked as sent` })
      fetchInvoices()
      setViewInvoice(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to mark invoice as sent', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  /* ---- Client-side search ---- */

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.user.name.toLowerCase().includes(q) ||
      inv.user.businessName.toLowerCase().includes(q) ||
      inv.user.email.toLowerCase().includes(q)
    )
  })

  const hasMore = filteredInvoices.length < total

  const formTotal = formItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  /* ---- Render: Loading skeleton ---- */

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-7 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  /* ---- Render: Main ---- */

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold gradient-text">Invoices</h1>
              <Badge variant="secondary" className="text-xs font-semibold">
                {total}
              </Badge>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">
              Manage and track all invoices
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchInvoices()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
            onClick={() => {
              setShowCreateForm(!showCreateForm)
              if (!showCreateForm) fetchUsers()
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* ── Create Invoice Form (Collapsible) ── */}
      {showCreateForm && (
        <div className="glass-card p-6 animate-fade-in-down space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-400" />
              New Invoice
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={() => {
                setShowCreateForm(false)
                resetForm()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User select */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Customer</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="glass-input">
                <SelectValue placeholder={usersLoading ? 'Loading users...' : 'Select a customer'} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    <span className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {u.name} ({u.businessName})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* User search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <Input
                ref={userSearchRef}
                placeholder="Search users..."
                className="glass-input h-8 pl-9 text-sm"
                onChange={(e) => fetchUsers(e.target.value)}
              />
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">Line Items</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-teal-400 hover:text-teal-300"
                onClick={addItem}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {formItems.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-start"
                >
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    className="glass-input h-9 text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                    className="glass-input h-9 text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    min={0}
                    value={item.unitPrice}
                    onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="glass-input h-9 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-500 hover:text-red-400 shrink-0"
                    onClick={() => removeItem(idx)}
                    disabled={formItems.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Total preview */}
            <div className="flex items-center justify-end pt-2 border-t border-white/[0.06]">
              <span className="text-sm text-slate-400 mr-3">Total:</span>
              <span className="text-lg font-bold text-teal-400">{formatTZS(formTotal)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Notes (optional)</Label>
            <Textarea
              placeholder="Add any notes or terms..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="glass-input text-sm min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCreateForm(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
              disabled={submitting || !selectedUserId}
              onClick={handleSubmit}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-1.5" />
              )}
              {submitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div className="flex gap-1 p-1 glass-subtle rounded-xl overflow-x-auto">
        {FILTER_TABS.map((tab) => (
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

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by invoice number or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input pl-10"
        />
      </div>

      {/* ── Error State ── */}
      {fetchError && (
        <Alert variant="destructive" className="glass-card border-red-500/20 bg-red-500/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{fetchError}</span>
            <Button variant="outline" size="sm" onClick={() => fetchInvoices()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Empty State ── */}
      {!fetchError && invoices.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Receipt className="h-7 w-7 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300">No invoices found</h3>
          <p className="text-sm text-slate-400 mt-1">
            {activeTab === 'all'
              ? 'Create your first invoice to get started.'
              : `No ${STATUS_LABELS[activeTab]?.toLowerCase() || activeTab.toLowerCase()} invoices.`}
          </p>
        </div>
      )}

      {/* ── Invoice List ── */}
      {invoices.length > 0 && (
        <div className="space-y-3">
          {/* Desktop Table Header (hidden on mobile) */}
          <div className="hidden md:grid md:grid-cols-[1fr_1.2fr_0.8fr_0.6fr_0.8fr_0.8fr_auto] gap-3 px-5 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>Invoice</span>
            <span>Customer</span>
            <span className="text-right">Amount</span>
            <span>Status</span>
            <span>Issued</span>
            <span>Due</span>
            <span>Actions</span>
          </div>

          {filteredInvoices.map((invoice, idx) => {
            const items = parseItems(invoice.items)
            const statusColor = STATUS_COLORS[invoice.status] || 'bg-slate-500/15 text-slate-400 border-slate-500/25'
            const statusLabel = STATUS_LABELS[invoice.status] || invoice.status

            return (
              <div
                key={invoice.id}
                className={cn(
                  'glass-card p-4 md:p-5 animate-fade-in-up transition-all',
                  actionLoading === invoice.id && 'opacity-60 pointer-events-none'
                )}
                style={{ animationDelay: `${Math.min(idx * 40, 300)}ms` }}
              >
                {/* Desktop layout */}
                <div className="hidden md:grid md:grid-cols-[1fr_1.2fr_0.8fr_0.6fr_0.8fr_0.8fr_auto] gap-3 items-center">
                  <div>
                    <span className="font-bold text-white text-sm">{invoice.invoiceNumber}</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-medium truncate">{invoice.user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{invoice.user.businessName}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        'text-sm font-bold',
                        invoice.status === 'PAID'
                          ? 'text-teal-400'
                          : invoice.status === 'OVERDUE'
                            ? 'text-red-400'
                            : 'text-white'
                      )}
                    >
                      {formatTZS(invoice.amount)}
                    </span>
                  </div>
                  <div>
                    <Badge variant="outline" className={cn('text-xs', statusColor)}>
                      {statusLabel}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400">{formatDate(invoice.issuedAt)}</div>
                  <div className="text-xs text-slate-400">{formatDate(invoice.dueDate)}</div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-teal-400"
                      onClick={() => setViewInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-teal-400"
                        onClick={() => handleMarkPaid(invoice)}
                        title="Mark as Paid"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    {invoice.status === 'DRAFT' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-teal-400"
                        onClick={() => handleMarkSent(invoice)}
                        title="Mark as Sent"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="md:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-sm">{invoice.invoiceNumber}</h3>
                        <Badge variant="outline" className={cn('text-xs', statusColor)}>
                          {statusLabel}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-200 mt-1">{invoice.user.name}</p>
                      <p className="text-xs text-slate-400">{invoice.user.businessName}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(invoice.issuedAt)}
                        </span>
                        <span>Due: {formatDate(invoice.dueDate)}</span>
                      </div>
                      {items.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {items[0].description}
                          {items.length > 1 && ` +${items.length - 1} more`}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={cn(
                          'text-sm font-bold',
                          invoice.status === 'PAID'
                            ? 'text-teal-400'
                            : invoice.status === 'OVERDUE'
                              ? 'text-red-400'
                              : 'text-white'
                        )}
                      >
                        {formatTZS(invoice.amount)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-teal-400"
                          onClick={() => setViewInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-teal-400"
                            onClick={() => handleMarkPaid(invoice)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-teal-400"
                            onClick={() => handleMarkSent(invoice)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Load More ── */}
      {hasMore && !fetchError && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            className="glass-subtle text-slate-300 hover:text-white"
            onClick={() => fetchInvoices(true)}
          >
            <ChevronDown className="h-4 w-4 mr-1.5" />
            Load More ({total - invoices.length} remaining)
          </Button>
        </div>
      )}

      {/* ── View Invoice Detail Dialog ── */}
      <Dialog open={!!viewInvoice} onOpenChange={(open) => !open && setViewInvoice(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-400" />
              {viewInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {viewInvoice && (
            <div className="space-y-4 py-2">
              {/* Top row */}
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    STATUS_COLORS[viewInvoice.status] || ''
                  )}
                >
                  {STATUS_LABELS[viewInvoice.status] || viewInvoice.status}
                </Badge>
                <p
                  className={cn(
                    'text-xl font-bold',
                    viewInvoice.status === 'PAID'
                      ? 'text-teal-400'
                      : viewInvoice.status === 'OVERDUE'
                        ? 'text-red-400'
                        : 'text-white'
                  )}
                >
                  {formatTZS(viewInvoice.amount)}
                </p>
              </div>

              {/* Customer info */}
              <div className="p-3 rounded-lg bg-white/[0.03] space-y-1">
                <p className="text-sm font-medium text-white">{viewInvoice.user.name}</p>
                <p className="text-xs text-slate-400">{viewInvoice.user.businessName}</p>
                <p className="text-xs text-slate-400">{viewInvoice.user.email}</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400">Issued:</span>
                  <p className="text-slate-200">{formatDate(viewInvoice.issuedAt)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Due:</span>
                  <p className="text-slate-200">{formatDate(viewInvoice.dueDate)}</p>
                </div>
                {viewInvoice.paidAt && (
                  <div>
                    <span className="text-slate-400">Paid:</span>
                    <p className="text-teal-400">{formatDate(viewInvoice.paidAt)}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Items</h4>
                <div className="space-y-2">
                  {parseItems(viewInvoice.items).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]"
                    >
                      <div>
                        <p className="text-sm text-white">{item.description}</p>
                        <p className="text-xs text-slate-400">
                          {item.quantity} × {formatTZS(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-200">
                        {formatTZS(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {viewInvoice.notes && (
                <div className="p-3 rounded-lg bg-white/[0.03]">
                  <p className="text-xs text-slate-400 mb-1">Notes</p>
                  <p className="text-sm text-slate-300">{viewInvoice.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    window.open(
                      `/api/invoices/${viewInvoice.id}/pdf?token=${token}`,
                      '_blank'
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {viewInvoice.status !== 'PAID' && viewInvoice.status !== 'CANCELLED' && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                    disabled={actionLoading === viewInvoice.id}
                    onClick={() => handleMarkPaid(viewInvoice)}
                  >
                    {actionLoading === viewInvoice.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                    )}
                    Mark Paid
                  </Button>
                )}
                {viewInvoice.status === 'DRAFT' && (
                  <Button
                    variant="outline"
                    disabled={actionLoading === viewInvoice.id}
                    onClick={() => handleMarkSent(viewInvoice)}
                  >
                    {actionLoading === viewInvoice.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Send
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
