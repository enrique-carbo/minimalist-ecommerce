import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { db } from "@/src/lib/db"
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, shippingAddress, paymentMethod, subtotal, tax, shipping, total, notes } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order items are required" },
        { status: 400 }
      )
    }

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: "Shipping address and payment method are required" },
        { status: 400 }
      )
    }

    // Verify product availability and get current prices
    const productIds = items.map(item => item.productId)
    const products = await db.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    })

    // Check stock availability
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product.name}` },
          { status: 400 }
        )
      }
    }

    // Create order with transaction
    const result = await db.$transaction(async (prisma) => {
      // Create the order
      const order = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: OrderStatus.PENDING,
          subtotal,
          tax,
          shipping,
          total,
          shippingAddress: shippingAddress,
          billingAddress: shippingAddress, // Using same as shipping for now
          notes: notes || null,
        }
      })

      // Create order items
      const orderItems = await Promise.all(
        items.map((item: any) =>
          prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price, // Price at time of purchase
            }
          })
        )
      )

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: total,
          method: paymentMethod.toUpperCase() as PaymentMethod,
          status: PaymentStatus.PENDING,
        }
      })

      // Update product stock
      await Promise.all(
        items.map((item: any) =>
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        )
      )

      return { order, orderItems, payment }
    })

    return NextResponse.json({
      message: "Order created successfully",
      orderId: result.order.id,
      order: result.order
    })

  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  image: true,
                }
              }
            }
          },
          payments: true,
          files: true,
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit,
      }),
      db.order.count({
        where: {
          userId: session.user.id,
        }
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      }
    })

  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}