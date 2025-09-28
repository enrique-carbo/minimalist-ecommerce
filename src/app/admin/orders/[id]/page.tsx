"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Separator } from "@/src/components/ui/separator"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { 
  ArrowLeft, 
  Package, 
  User, 
  DollarSign, 
  Calendar,
  MapPin,
  Truck,
  CreditCard,
  FileText,
  Download,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  status: string
  total: number
  subtotal: number
  tax: number
  shipping: number
  createdAt: string
  updatedAt: string
  notes?: string
  user: {
    id: string
    name: string
    email: string
  }
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    phone: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      image?: string
      sku: string
    }
  }>
  payments: Array<{
    id: string
    method: string
    status: string
    amount: number
    transactionId?: string
    createdAt: string
  }>
  files: Array<{
    id: string
    fileName: string
    fileSize: number
    mimeType: string
    uploadedAt: string
  }>
}

export default function OrderDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [statusNotes, setStatusNotes] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/admin/orders")
      return
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [session, router, params.id])

  const fetchOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
        setNewStatus(data.status)
      } else {
        setError("Order not found")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      setError("Error loading order")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async () => {
    if (!order || !newStatus) return

    setUpdating(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: newStatus,
          notes: statusNotes 
        }),
      })
      
      if (response.ok) {
        setSuccess("Order status updated successfully")
        fetchOrder(order.id)
        setStatusNotes("")
      } else {
        setError("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      setError("Error updating order status")
    } finally {
      setUpdating(false)
    }
  }

  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await 
      //fetch(`/api/admin/orders/${order?.id}/files/${fileId}/download`)
      fetch(`/api/orders/${order?.id}/files/${fileId}`) // ← url corregida
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error downloading file:", error)
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
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "refunded":
        return <DollarSign className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button asChild>
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Order not found</h2>
          <Button asChild>
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/admin/orders">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(-8)}</h1>
                <p className="mt-2 text-gray-600">
                  Order details and management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Order Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.image ? (
                            <img 
                              src={item.product.image} 
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{order.user.name}</p>
                      <p className="text-sm text-gray-600">{order.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium mb-2">Shipping Address</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p>{order.shippingAddress.phone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium capitalize">{payment.method.replace("_", " ")}</p>
                          <p className="text-sm text-gray-600">
                            {payment.transactionId && `Transaction ID: ${payment.transactionId}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={payment.status === "COMPLETED" ? "default" : "secondary"}
                          className={payment.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {payment.status}
                        </Badge>
                        <p className="text-sm font-medium mt-1">${payment.amount.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Order Files */}
              {order.files.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{file.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(file.id, file.fileName)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Notes */}
              {order.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{order.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Order Status Update */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Order Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">New Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="PROCESSING">Processing</SelectItem>
                          <SelectItem value="SHIPPED">Shipped</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          <SelectItem value="REFUNDED">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Status Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add notes about this status change..."
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={updateOrderStatus} 
                    disabled={updating || !newStatus || newStatus === order.status}
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>${order.shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Update Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">New Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Status Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add notes about this status change..."
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={updateOrderStatus} 
                    disabled={updating || newStatus === order.status}
                    className="w-full"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </Button>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Order Placed</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.updatedAt).toLocaleDateString()} {new Date(order.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}