import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { db } from "@/src/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const sort = searchParams.get("sort") || "newest"

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } }
      ]
    }
    
    if (status) {
      where.status = status
    }

    // Build order by clause
    let orderBy: any = { createdAt: "desc" }
    
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "total-high":
        orderBy = { total: "desc" }
        break
      case "total-low":
        orderBy = { total: "asc" }
        break
      case "newest":
      default:
        orderBy = { createdAt: "desc" }
        break
    }

    const orders = await db.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        payments: true,
        files: true,
      },
      orderBy
    })

    return NextResponse.json({
      orders
    })

  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}