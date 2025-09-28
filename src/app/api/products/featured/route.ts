import { NextResponse } from "next/server"
import { db } from "@/src/lib/db"

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: {
        featured: true,
        stock: {
          gt: 0
        }
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 8 // Limit to 8 featured products
    })

    return NextResponse.json({
      products,
      count: products.length
    })
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}