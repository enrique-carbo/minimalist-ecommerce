"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Progress } from "@/src/components/ui/progress"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { Upload, FileText, Download, Eye, Trash2 } from "lucide-react"

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
      image?: string
    }
  }>
  files: Array<{
    id: string
    fileName: string
    fileSize: number
    mimeType: string
    uploadedAt: string
  }>
}

interface FileUploadProps {
  orderId: string
  onUploadComplete: () => void
}

function FileUpload({ orderId, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(0)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("orderId", orderId)

      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          setProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          onUploadComplete()
          setUploading(false)
          setProgress(0)
        } else {
          setError("Upload failed")
          setUploading(false)
        }
      }

      xhr.onerror = () => {
        setError("Upload failed")
        setUploading(false)
      }

      xhr.open("POST", `/api/orders/${orderId}/files`)
      xhr.send(formData)
    } catch (error) {
      setError("Upload failed")
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-600 mb-4">
          Upload proof of purchase, receipt, or any relevant documents
        </p>
        <Label htmlFor="file-upload" className="cursor-pointer">
          <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
            Choose File
          </div>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            disabled={uploading}
          />
        </Label>
        <p className="text-xs text-gray-500 mt-2">
          PDF, JPG, PNG, DOC up to 10MB
        </p>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/orders")
      return
    }
    fetchOrders()
  }, [session, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFile = async (orderId: string, fileId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/files/${fileId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchOrders() // Refresh the orders list
      }
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-indigo-100 text-indigo-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            View your order history and upload proof of purchase
          </p>
        </div>
      </div>

      {/* Orders Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <Button asChild>
                <a href="/products">Start Shopping</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Orders List */}
              <div className="lg:col-span-2 space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader 
                      className="pb-3"
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <p className="text-lg font-semibold mt-1">
                            ${order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {selectedOrder === order.id && (
                      <CardContent className="pt-0">
                        {/* Order Items */}
                        <div className="space-y-3 mb-6">
                          <h4 className="font-medium">Order Items</h4>
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 py-2 border-b">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {item.product.image ? (
                                  <img 
                                    src={item.product.image} 
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <FileText className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Proof of Purchase</h4>
                          
                          {/* Existing Files */}
                          {order.files.length > 0 && (
                            <div className="space-y-2">
                              {order.files.map((file) => (
                                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                    <div>
                                      <p className="text-sm font-medium">{file.fileName}</p>
                                      <p className="text-xs text-gray-500">
                                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(`/api/orders/${order.id}/files/${file.id}/download`, '_blank')}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteFile(order.id, file.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Upload New File */}
                          <FileUpload 
                            orderId={order.id} 
                            onUploadComplete={fetchOrders} 
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Orders</span>
                        <span className="font-medium">{orders.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Spent</span>
                        <span className="font-medium">
                          ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Order Status</h4>
                      <div className="space-y-1">
                        {Object.entries(
                          orders.reduce((acc, order) => {
                            acc[order.status] = (acc[order.status] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                        ).map(([status, count]) => (
                          <div key={status} className="flex justify-between text-sm">
                            <span className="capitalize">{status}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 text-center pt-4 border-t">
                      <p>Upload proof of purchase for faster processing</p>
                      <p>Supported formats: PDF, JPG, PNG, DOC</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}