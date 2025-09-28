import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { db } from "@/src/lib/db"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const { id: orderId, fileId } = await params
    
    // Verify the order exists and belongs to the user
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        files: {
          where: { id: fileId },
        },
      },
    })

    if (!order || order.files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const file = order.files[0]
    const filePath = join(process.cwd(), "uploads", file.fileName)

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 })
    }

    // Read file and return it
    const fileBuffer = readFileSync(filePath)
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${file.fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error downloading file:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}