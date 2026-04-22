import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Auth required - admin only
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const [
      totalUsers,
      activeSubscriptions,
      pendingRequests,
      completedRequests,
      totalRevenue,
      monthlyRevenue,
      usersByRole,
      subscriptionsByStatus,
      requestsByStatus,
      recentActivity,
    ] = await Promise.all([
      // Total users
      db.user.count({ where: { status: { not: 'INACTIVE' } } }),

      // Active subscriptions
      db.subscription.count({ where: { status: 'ACTIVE' } }),

      // Pending requests
      db.serviceRequest.count({ where: { status: 'PENDING' } }),

      // Completed requests (APPROVED status)
      db.serviceRequest.count({ where: { status: 'APPROVED' } }),

      // Total revenue
      db.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),

      // Monthly revenue (last 30 days)
      db.payment.aggregate({
        where: {
          status: 'COMPLETED',
          paidAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Users by role
      db.user.groupBy({
        by: ['role'],
        _count: true,
        where: { status: { not: 'INACTIVE' } },
      }),

      // Subscriptions by status
      db.subscription.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Requests by status
      db.serviceRequest.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Recent activity
      db.activityLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      }),
    ])

    // Package revenue breakdown
    const packageRevenue = await db.payment.findMany({
      where: { status: 'COMPLETED' },
      include: {
        subscription: {
          include: { package: { select: { id: true, name: true } } },
        },
      },
    })

    const packageRevenueMap: Record<string, number> = {}
    for (const p of packageRevenue) {
      const pkgName = p.subscription.package?.name || 'Unknown'
      packageRevenueMap[pkgName] = (packageRevenueMap[pkgName] || 0) + p.amount
    }

    // Payments by method
    const paymentsByMethod = await db.payment.groupBy({
      by: ['method'],
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _count: true,
    })

    // Active MNO providers
    const activeMnoProviders = await db.mnoProvider.count({
      where: { isActive: true },
    })

    // Subscriptions active on MNO
    const activeOnMno = await db.subscription.count({
      where: { mnoStatus: 'ACTIVE_MNO' },
    })

    return success({
      totalUsers,
      activeSubscriptions,
      pendingRequests,
      completedRequests,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      monthlyPayments: monthlyRevenue._count,
      usersByRole,
      subscriptionsByStatus,
      requestsByStatus,
      recentActivity,
      packageRevenue: Object.entries(packageRevenueMap).map(([name, amount]) => ({ name, amount })),
      paymentsByMethod,
      activeMnoProviders,
      activeOnMno,
    })
  } catch (err) {
    console.error('Get analytics error:', err)
    return error('Internal server error', 500)
  }
}
