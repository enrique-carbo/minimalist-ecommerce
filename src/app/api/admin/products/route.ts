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
    const category = searchParams.get("category") || ""
    const sort = searchParams.get("sort") || "newest"

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } }
      ]
    }
    
    if (category) {
      where.categoryId = category
    }

    // Build order by clause
    let orderBy: any = { createdAt: "desc" }
    
    switch (sort) {
      case "name":
        orderBy = { name: "asc" }
        break
      case "price-low":
        orderBy = { price: "asc" }
        break
      case "price-high":
        orderBy = { price: "desc" }
        break
      case "stock":
        orderBy = { stock: "asc" }
        break
      case "newest":
      default:
        orderBy = { createdAt: "desc" }
        break
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy
    })

    return NextResponse.json({
      products
    })

  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      price,
      stock,
      sku,
      featured,
      categoryId,
      image,
      images
    } = body

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      )
    }

    // Check if SKU already exists
    if (sku) {
      const existingProduct = await db.product.findUnique({
        where: { sku }
      })
      
      if (existingProduct) {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 400 }
        )
      }
    }

    // Verify category exists
    const category = await db.category.findUnique({
      where: { id: categoryId }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    const product = await db.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        sku,
        featured: featured || false,
        categoryId,
        image,
        images: images ? JSON.stringify(images) : null,
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Product created successfully",
      product
    })

  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}