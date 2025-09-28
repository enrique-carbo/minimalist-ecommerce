// src/app/api/orders/[id]/files/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { readFile, unlink } from "fs/promises"
import { join } from "path"
import { db } from "@/src/lib/db"

/* ----------  GET  ---------- */
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id: orderId, fileId } = await params

    // 1. la orden debe existir
    const order = await db.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    // 2. admin o dueño
    if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 3. el archivo debe existir para esa orden
    const fileRecord = await db.fileUpload.findFirst({
      where: { id: fileId, orderId },
    })
    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // 4. servir el archivo
    const buffer = await readFile(join(process.cwd(), "uploads", fileRecord.filePath))
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": fileRecord.mimeType,
        "Content-Disposition": `attachment; filename="${fileRecord.fileName}"`,
      },
    })
  } catch (e) {
    console.error("Download error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/* ----------  DELETE  ---------- */
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id: orderId, fileId } = await params

    // 1. la orden debe existir
    const order = await db.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    // 2. admin o dueño
    if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 3. el archivo debe existir para esa orden
    const fileRecord = await db.fileUpload.findFirst({
      where: { id: fileId, orderId },
    })
    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // 4. borrar archivo del disco
    try {
      await unlink(join(process.cwd(), "uploads", fileRecord.filePath))
    } catch (e) {
      console.error("Disk delete error:", e)
    }

    // 5. borrar registro de BD
    await db.fileUpload.delete({ where: { id: fileId } })

    return NextResponse.json({ message: "File deleted successfully" })
  } catch (e) {
    console.error("Delete error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}