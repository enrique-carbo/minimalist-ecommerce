import { NextResponse } from "next/server"
import { db } from "@/src/lib/db"

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: "asc"
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return NextResponse.json({
      categories,
      count: categories.length
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}