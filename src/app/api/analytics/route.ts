import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Auth required - admin only
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    // ─── Overview stats ───
    const [
      totalUsers,
      activeSubscriptions,
      pendingRequests,
      totalRevenueResult,
    ] = await Promise.all([
      db.user.count({ where: { status: { not: 'INACTIVE' } } }),
      db.subscription.count({ where: { status: 'ACTIVE' } }),
      db.serviceRequest.count({ where: { status: 'PENDING' } }),
      db.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ])

    // ─── Revenue chart (last 12 months) ───
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
    twelveMonthsAgo.setDate(1)
    twelveMonthsAgo.setHours(0, 0, 0, 0)

    const completedPayments = await db.payment.findMany({
      where: {
        status: 'COMPLETED',
        paidAt: { gte: twelveMonthsAgo },
      },
      select: { amount: true, paidAt: true },
    })

    // Group revenue by month
    const revenueByMonth: Record<string, number> = {}
    for (let i = 0; i < 12; i++) {
      const d = new Date()
      d.setMonth(d.getMonth() - (11 - i))
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      revenueByMonth[key] = 0
    }

    for (const p of completedPayments) {
      if (p.paidAt) {
        const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, '0')}`
        if (revenueByMonth[key] !== undefined) {
          revenueByMonth[key] += p.amount
        }
      }
    }

    const revenue = Object.entries(revenueByMonth).map(([month, rev]) => ({
      month,
      revenue: rev,
    }))

    // ─── Subscription breakdown ───
    const subscriptionsByStatus = await db.subscription.groupBy({
      by: ['status'],
      _count: true,
    })

    const subscriptionsByTier = await db.subscription.findMany({
      include: {
        pricingTier: { select: { name: true } },
        package: { select: { name: true } },
      },
    })

    const tierMap: Record<string, number> = {}
    for (const s of subscriptionsByTier) {
      const tierName = s.pricingTier?.name || s.package?.name || 'Custom'
      tierMap[tierName] = (tierMap[tierName] || 0) + 1
    }

    const byStatus: Record<string, number> = {}
    for (const s of subscriptionsByStatus) {
      byStatus[s.status] = s._count
    }

    // ─── User stats ───
    const usersByRole = await db.user.groupBy({
      by: ['role'],
      _count: true,
      where: { status: { not: 'INACTIVE' } },
    })

    const usersByStatus = await db.user.groupBy({
      by: ['status'],
      _count: true,
    })

    // New users per month (last 12 months)
    const newUsersRaw = await db.user.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    })

    const newUsersByMonth: Record<string, number> = {}
    for (let i = 0; i < 12; i++) {
      const d = new Date()
      d.setMonth(d.getMonth() - (11 - i))
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      newUsersByMonth[key] = 0
    }

    for (const u of newUsersRaw) {
      const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, '0')}`
      if (newUsersByMonth[key] !== undefined) {
        newUsersByMonth[key]++
      }
    }

    const userRoleMap: Record<string, number> = {}
    for (const r of usersByRole) {
      userRoleMap[r.role] = r._count
    }

    const userStatusMap: Record<string, number> = {}
    for (const r of usersByStatus) {
      userStatusMap[r.status] = r._count
    }

    const newUsers = Object.entries(newUsersByMonth).map(([month, count]) => ({
      month,
      count,
    }))

    // ─── Request stats ───
    const requestsByStatus = await db.serviceRequest.groupBy({
      by: ['status'],
      _count: true,
    })

    const requestsByCategory = await db.serviceRequest.groupBy({
      by: ['businessCategory'],
      _count: true,
    })

    const requestStatusMap: Record<string, number> = {}
    for (const r of requestsByStatus) {
      requestStatusMap[r.status] = r._count
    }

    const requestCategoryMap: Record<string, number> = {}
    for (const r of requestsByCategory) {
      requestCategoryMap[r.businessCategory] = r._count
    }

    // ─── Payment stats ───
    const paymentsByMethod = await db.payment.groupBy({
      by: ['method'],
      _count: true,
    })

    const paymentsByStatus = await db.payment.groupBy({
      by: ['status'],
      _count: true,
    })

    const paymentMethodMap: Record<string, number> = {}
    for (const p of paymentsByMethod) {
      paymentMethodMap[p.method] = p._count
    }

    const paymentStatusMap: Record<string, number> = {}
    for (const p of paymentsByStatus) {
      paymentStatusMap[p.status] = p._count
    }

    // ─── Recent activity ───
    const recentActivity = await db.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    return success({
      overview: {
        totalUsers,
        activeSubscriptions,
        totalRevenue: totalRevenueResult._sum.amount || 0,
        pendingRequests,
      },
      revenue,
      subscriptions: {
        byStatus,
        byTier: Object.entries(tierMap).map(([name, count]) => ({ name, count })),
      },
      users: {
        byRole: userRoleMap,
        byStatus: userStatusMap,
        newUsers,
      },
      requests: {
        byStatus: requestStatusMap,
        byCategory: requestCategoryMap,
      },
      payments: {
        byMethod: paymentMethodMap,
        byStatus: paymentStatusMap,
      },
      recentActivity,
    })
  } catch {
    return error('Internal server error', 500)
  }
}
