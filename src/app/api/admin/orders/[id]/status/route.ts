import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { db } from "@/src/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    // Check if order exists
    const order = await db.order.findUnique({
      where: { id: params.id }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: params.id },
      data: {
        status: status,
        updatedAt: new Date()
      },
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
      }
    })

    return NextResponse.json({
      message: "Order status updated successfully",
      order: updatedOrder
    })

  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    )
  }
}