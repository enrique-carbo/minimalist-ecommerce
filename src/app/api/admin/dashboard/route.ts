import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { db } from "@/src/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    // Get dashboard stats
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      revenueResult,
      recentOrders,
      lowStockProducts
    ] = await Promise.all([
      // Total products
      db.product.count(),
      
      // Total orders
      db.order.count(),
      
      // Total users
      db.user.count(),
      
      // Total revenue from completed orders
      db.order.aggregate({
        where: {
          status: {
            in: ['DELIVERED', 'SHIPPED']
          }
        },
        _sum: {
          total: true
        }
      }),
      
      // Recent orders with user info
      db.order.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      
      // Low stock products (less than 10)
      db.product.findMany({
        where: {
          stock: {
            lt: 10
          }
        },
        take: 10,
        orderBy: {
          stock: 'asc'
        }
      })
    ])

    const totalRevenue = revenueResult._sum.total || 0

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
      lowStockProducts
    })

  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}