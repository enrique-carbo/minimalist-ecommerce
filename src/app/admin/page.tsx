"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  Eye
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  recentOrders: Array<{
    id: string
    status: string
    total: number
    createdAt: string
    user: {
      name: string
      email: string
    }
  }>
  lowStockProducts: Array<{
    id: string
    name: string
    stock: number
  }>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/admin")
      return
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    
    fetchDashboardStats()
  }, [session, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
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

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading dashboard</h2>
          <p className="text-gray-600">Please try again later.</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Manage your e-commerce store
              </p>
            </div>
            <div className="flex space-x-4">
              <Button asChild>
                <Link href="/admin/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">View Store</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
              <TabsTrigger value="products">Low Stock</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild className="w-full justify-start">
                      <Link href="/admin/products">
                        <Package className="mr-2 h-4 w-4" />
                        Manage Products
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin/orders">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Manage Orders
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin/users">
                        <Users className="mr-2 h-4 w-4" />
                        Manage Users
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin/categories">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Manage Categories
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Server Status</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment System</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">File Upload</span>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentOrders.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No recent orders</p>
                    ) : (
                      stats.recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium">Order #{order.id.slice(-8)}</p>
                              <p className="text-sm text-gray-600">
                                {order.user.name} • {order.user.email}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <p className="font-semibold">${order.total.toFixed(2)}</p>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.lowStockProducts.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">All products are well stocked</p>
                    ) : (
                      stats.lowStockProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              Only {product.stock} left in stock
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="destructive">Low Stock</Badge>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}