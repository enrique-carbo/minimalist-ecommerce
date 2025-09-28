import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { db } from "@/src/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      product
    })

  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Check if SKU already exists (excluding current product)
    const { id } = await params
    if (sku) {
      const existingProduct = await db.product.findFirst({
        where: {
          sku,
          NOT: {
            id
          }
        }
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

    const product = await db.product.update({
      where: { id },
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
      message: "Product updated successfully",
      product
    })

  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    // Check if product exists
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: {
        orderItems: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check if product has associated orders
    if (product.orderItems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete product with existing orders" },
        { status: 400 }
      )
    }

    await db.product.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Product deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}