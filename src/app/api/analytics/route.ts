import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
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
      db.user.count(),

      // Active subscriptions
      db.subscription.count({ where: { status: 'ACTIVE' } }),

      // Pending requests
      db.serviceRequest.count({ where: { status: 'PENDING' } }),

      // Completed requests
      db.serviceRequest.count({ where: { status: { in: ['APPROVED', 'COMPLETED'] } } }),

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

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
