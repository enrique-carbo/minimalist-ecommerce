"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { 
  Search, 
  Eye, 
  Package, 
  User, 
  DollarSign,
  Calendar,
  Filter
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
  user: {
    id: string
    name: string
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
      image?: string
    }
  }>
  payments: Array<{
    id: string
    method: string
    status: string
    amount: number
    transactionId?: string
  }>
  files: Array<{
    id: string
    fileName: string
    uploadedAt: string
  }>
}

export default function AdminOrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/admin/orders")
      return
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    
    fetchOrders()
  }, [session, router])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)
      if (sortBy) params.append("sort", sortBy)

      const response = await fetch(`/api/admin/orders?${params}`)
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error("Error updating order status:", error)
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, sortBy])

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
              <p className="mt-2 text-gray-600">
                View and manage customer orders
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="total-high">Total: High to Low</SelectItem>
                <SelectItem value="total-low">Total: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
              <p className="text-gray-600">
                {searchTerm || statusFilter 
                  ? "Try adjusting your search criteria." 
                  : "There are no orders in the system yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{order.user.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-lg font-semibold">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Order Items Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Order Items ({order.items.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              {item.product.image ? (
                                <img 
                                  src={item.product.image} 
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.product.name}</p>
                              <p className="text-xs text-gray-600">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex items-center justify-center p-2 bg-gray-50 rounded text-sm text-gray-600">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>Subtotal: ${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Tax: ${order.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Shipping: ${order.shipping.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-sm text-gray-600">Payment:</span>
                          <div className="flex items-center space-x-2">
                            {order.payments.map((payment) => (
                              <Badge 
                                key={payment.id}
                                variant={payment.status === "COMPLETED" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {payment.method} - {payment.status}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {order.files.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">Files:</span>
                            <Badge variant="outline" className="text-xs ml-1">
                              {order.files.length} uploaded
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Select 
                          value={order.status} 
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-40">
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
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}