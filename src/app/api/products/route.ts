import { NextRequest, NextResponse } from "next/server"
import { db } from "@/src/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "newest"
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const featured = searchParams.get("featured")

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }
    
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    
    if (featured === "true") {
      where.featured = true
    }

    // Build order by clause
    let orderBy: any = { createdAt: "desc" }
    
    switch (sortBy) {
      case "price-low":
        orderBy = { price: "asc" }
        break
      case "price-high":
        orderBy = { price: "desc" }
        break
      case "name":
        orderBy = { name: "asc" }
        break
      case "newest":
      default:
        orderBy = { createdAt: "desc" }
        break
    }

    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.product.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}