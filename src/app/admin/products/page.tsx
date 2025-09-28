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
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  DollarSign,
  Box
} from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  sku?: string
  featured: boolean
  category: {
    name: string
  }
  createdAt: string
}

interface Category {
  id: string
  name: string
}

export default function AdminProductsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/admin/products")
      return
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    
    fetchProducts()
    fetchCategories()
  }, [session, router])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory)
      if (sortBy) params.append("sort", sortBy)

      const response = await fetch(`/api/admin/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory, sortBy])

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
              <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
              <p className="mt-2 text-gray-600">
                Add, edit, and manage your product inventory
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="stock">Stock Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No products found</h2>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory 
                  ? "Try adjusting your search criteria." 
                  : "Get started by adding your first product."
                }
              </p>
              <Button asChild>
                <Link href="/admin/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">
                          {product.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {product.category.name}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        {product.featured && (
                          <Badge variant="secondary" className="text-xs">
                            Featured
                          </Badge>
                        )}
                        {product.stock < 10 && (
                          <Badge variant="destructive" className="text-xs">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Price</span>
                        <span className="font-semibold text-lg text-primary">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Stock</span>
                        <div className="flex items-center space-x-2">
                          <Box className="h-4 w-4 text-gray-400" />
                          <span className={`font-medium ${
                            product.stock < 10 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {product.stock}
                          </span>
                        </div>
                      </div>
                      
                      {product.sku && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">SKU</span>
                          <span className="text-sm font-mono">{product.sku}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${product.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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