import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"
import { db } from "@/src/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Verify order belongs to user
    const { id } = await params
    const order = await db.order.findFirst({
      where: {
        id,
        userId: session.user.id,
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not supported" },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`
    
    // Save file to uploads directory
    const uploadsDir = join(process.cwd(), 'uploads')
    const filePath = join(uploadsDir, uniqueFileName)

    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      console.error("Error saving file:", error)
      return NextResponse.json(
        { error: "Failed to save file" },
        { status: 500 }
      )
    }

    // Save file record to database
    const fileRecord = await db.fileUpload.create({
      data: {
        orderId: id,
        fileName: file.name,
        filePath: uniqueFileName,
        fileSize: file.size,
        mimeType: file.type,
      }
    })

    return NextResponse.json({
      message: "File uploaded successfully",
      file: fileRecord
    })

  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Verify order belongs to user
    const { id } = await params
    const order = await db.order.findFirst({
      where: {
        id,
        userId: session.user.id,
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const files = await db.fileUpload.findMany({
      where: {
        orderId: id,
      },
      orderBy: {
        uploadedAt: "desc"
      }
    })

    return NextResponse.json({
      files
    })

  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    )
  }
}