"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  images?: string
  stock: number
  featured: boolean
  category: {
    name: string
  }
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products/featured")
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        // Parse images if it's a JSON string
        let imagesArray = []
        try {
          imagesArray = product.images ? JSON.parse(product.images) : []
        } catch (e) {
          imagesArray = []
        }
        
        const mainImage = product.image || (imagesArray.length > 0 ? imagesArray[0] : "/placeholder-product.jpg")
        
        return (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 overflow-hidden">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.featured && (
                <Badge className="absolute top-2 left-2" variant="secondary">
                  Featured
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge className="absolute top-2 right-2" variant="destructive">
                  Out of Stock
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  {product.category.name}
                </Badge>
                <h3 className="font-semibold text-lg line-clamp-1">
                  <Link 
                    href={`/products/${product.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {product.name}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(24)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  <Button 
                    size="sm" 
                    disabled={product.stock === 0}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}