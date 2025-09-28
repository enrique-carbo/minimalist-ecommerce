"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { 
  ArrowLeft, 
  Save, 
  Package,
  DollarSign,
  Hash,
  Layers,
  Image as ImageIcon
} from "lucide-react"
import Link from "next/link"

interface Category {
  id: string
  name: string
}

interface NewProduct {
  name: string
  description: string
  price: number
  image?: string
  images?: string[]
  stock: number
  sku: string
  featured: boolean
  categoryId: string
}

export default function NewProductPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [product, setProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    sku: "",
    featured: false,
    categoryId: "",
  })

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/admin/products")
      return
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    
    fetchCategories()
  }, [session, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })
      
      if (response.ok) {
        setSuccess("Product created successfully")
        setTimeout(() => {
          router.push("/admin/products")
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to create product")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      setError("Error creating product")
    } finally {
      setSaving(false)
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/admin/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Products
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">New Product</h1>
                <p className="mt-2 text-gray-600">
                  Create a new product
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Form */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          <form onSubmit={createProduct} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={product.name}
                      onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={product.sku}
                      onChange={(e) => setProduct(prev => ({ ...prev, sku: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={product.categoryId} 
                      onValueChange={(value) => setProduct(prev => ({ ...prev, categoryId: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={product.description}
                      onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing and Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.price}
                      onChange={(e) => setProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={(e) => setProduct(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={product.featured}
                      onChange={(e) => setProduct(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image">Main Image URL</Label>
                  <Input
                    id="image"
                    value={product.image || ""}
                    onChange={(e) => setProduct(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="images">Additional Images (comma-separated URLs)</Label>
                  <Textarea
                    id="images"
                    value={product.images?.join(", ") || ""}
                    onChange={(e) => setProduct(prev => ({ 
                      ...prev, 
                      images: e.target.value.split(",").map(url => url.trim()).filter(url => url.length > 0) 
                    }))}
                    rows={3}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/products">Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}