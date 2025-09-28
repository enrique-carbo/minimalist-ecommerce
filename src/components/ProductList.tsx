"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
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

interface ProductListProps {
  categoryId?: string
  search?: string
  sortBy?: string
}

export default function ProductList({ categoryId, search, sortBy = "newest" }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchProducts()
  }, [categoryId, search, sortBy, currentPage])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sortBy,
      })

      if (categoryId) params.append("categoryId", categoryId)
      if (search) params.append("search", search)

      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setTotalPages(data.totalPages || 1)
        setTotalCount(data.totalCount || 0)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with count and sort */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {products.length} of {totalCount} products
        </p>
        <Select value={sortBy} onValueChange={(value) => setCurrentPage(1)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}