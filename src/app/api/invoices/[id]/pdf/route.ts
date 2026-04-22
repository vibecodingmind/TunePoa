import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authenticate, isAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return new Response('Unauthorized', { status: 401 })

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, businessName: true, businessCategory: true },
        },
        subscription: {
          select: { id: true, package: { select: { name: true } } },
        },
      },
    })

    if (!invoice) return new Response('Invoice not found', { status: 404 })

    if (invoice.userId !== auth.user.id && !isAdmin(auth.user.role)) {
      return new Response('Forbidden', { status: 403 })
    }

    const items: Array<{ description: string; quantity: number; unitPrice: number }> = []
    try {
      items.push(...JSON.parse(invoice.items))
    } catch {
      // ignore parse error
    }

    const formatTZS = (n: number) => new Intl.NumberFormat('en-TZ').format(n)

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice ${invoice.invoiceNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f8fafc;
    color: #1e293b;
    padding: 40px 20px;
  }
  .invoice-container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  .header {
    background: linear-gradient(135deg, #0d7490, #14b8a6);
    padding: 32px 40px;
    color: white;
  }
  .header h1 { font-size: 24px; font-weight: 700; }
  .header .invoice-number { font-size: 14px; opacity: 0.9; margin-top: 4px; }
  .body { padding: 32px 40px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
  .value { font-size: 14px; color: #1e293b; font-weight: 500; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th {
    text-align: left;
    padding: 12px 16px;
    background: #f1f5f9;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    border-bottom: 2px solid #e2e8f0;
  }
  td {
    padding: 12px 16px;
    font-size: 14px;
    border-bottom: 1px solid #f1f5f9;
  }
  .total-row td {
    border-bottom: none;
    border-top: 2px solid #e2e8f0;
    font-weight: 700;
    font-size: 16px;
  }
  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
  }
  .status-PAID { background: #dcfce7; color: #166534; }
  .status-DRAFT { background: #f1f5f9; color: #475569; }
  .status-SENT { background: #dbeafe; color: #1e40af; }
  .status-OVERDUE { background: #fee2e2; color: #991b1b; }
  .status-CANCELLED { background: #f3f4f6; color: #6b7280; }
  .notes { margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; }
  .notes h3 { font-size: 13px; color: #64748b; margin-bottom: 8px; }
  .notes p { font-size: 14px; color: #475569; }
  .footer {
    padding: 20px 40px;
    border-top: 1px solid #e2e8f0;
    text-align: center;
    font-size: 12px;
    color: #94a3b8;
  }
  @media print {
    body { background: white; padding: 0; }
    .invoice-container { box-shadow: none; border-radius: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="invoice-container">
  <div class="header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <h1>TunePoa</h1>
        <p style="font-size:14px;opacity:0.85;">Ringback Tone Management Platform</p>
      </div>
      <div style="text-align:right;">
        <h1>INVOICE</h1>
        <p class="invoice-number">${invoice.invoiceNumber}</p>
      </div>
    </div>
  </div>
  <div class="body">
    <div class="grid-2">
      <div>
        <p class="label">Bill To</p>
        <p class="value" style="font-size:16px;margin-top:4px;">${invoice.user.name}</p>
        <p class="value" style="color:#64748b;font-weight:400;">${invoice.user.businessName || ''}</p>
        <p class="value" style="color:#64748b;font-weight:400;">${invoice.user.email}</p>
        ${invoice.user.phone ? `<p class="value" style="color:#64748b;font-weight:400;">${invoice.user.phone}</p>` : ''}
      </div>
      <div style="text-align:right;">
        <p class="label">Status</p>
        <span class="status-badge status-${invoice.status}">${invoice.status}</span>
        <p class="label" style="margin-top:16px;">Issue Date</p>
        <p class="value">${new Date(invoice.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p class="label" style="margin-top:12px;">Due Date</p>
        <p class="value">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Unit Price</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item, i) => `
          <tr>
            <td>${item.description}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">TZS ${formatTZS(item.unitPrice)}</td>
            <td style="text-align:right;">TZS ${formatTZS(item.quantity * item.unitPrice)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="3" style="text-align:right;">Total</td>
          <td style="text-align:right;">TZS ${formatTZS(invoice.amount)}</td>
        </tr>
      </tbody>
    </table>

    ${invoice.notes ? `
    <div class="notes">
      <h3>Notes</h3>
      <p>${invoice.notes}</p>
    </div>
    ` : ''}

    ${invoice.paidAt ? `
    <div style="margin-top:24px;padding:12px 16px;background:#dcfce7;border-radius:8px;color:#166534;font-size:14px;">
      <strong>Paid on:</strong> ${new Date(invoice.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>
    ` : ''}
  </div>
  <div class="footer">
    <p>Thank you for your business — TunePoa &middot; Dar es Salaam, Tanzania</p>
  </div>
</div>
<div class="no-print" style="text-align:center;margin-top:16px;">
  <button onclick="window.print()" style="padding:10px 24px;background:#0d7490;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">Print / Save as PDF</button>
</div>
</body>
</html>`

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch {
    return new Response('Internal server error', { status: 500 })
  }
}
