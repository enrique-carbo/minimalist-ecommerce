import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Star, ShoppingCart, Heart, Share2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import AddToCartButton from "@/src/components/AddToCartButton"
import Navigation from "@/src/components/Navigation"

async function getProduct(id: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/products/${id}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.product
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise <{ id: string }>
}) {
  const { id } = await params   
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  // Parse images if it's a JSON string
  let imagesArray = []
  try {
    imagesArray = product.images ? JSON.parse(product.images) : []
  } catch (e) {
    imagesArray = []
  }

  const allImages = [product.image, ...imagesArray].filter(Boolean)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" className="text-gray-600 hover:text-gray-900">
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <Link href={`/categories/${product.categoryId}`} className="text-gray-600 hover:text-gray-900">
              {product.category.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Content */}
      <div className="flex-1 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-lg border">
                <Image
                  src={allImages[0] || "/placeholder-product.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square relative overflow-hidden rounded border cursor-pointer hover:opacity-80 transition-opacity">
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {product.category.name}
                    </Badge>
                    {product.featured && (
                      <Badge className="ml-2" variant="secondary">
                        Featured
                      </Badge>
                    )}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h1>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600">(24 reviews)</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-3xl font-bold text-primary mb-4">
                  ${product.price.toFixed(2)}
                </div>

                <p className="text-gray-600 mb-6">
                  {product.description || "No description available for this product."}
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Availability:</span>
                    <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                      {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">SKU:</span>
                    <span className="text-gray-900">{product.sku || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <AddToCartButton product={product} />
                  
                  <Button variant="outline" className="w-full">
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description || "No detailed description available for this product. This is a premium fashion item that combines style, comfort, and quality craftsmanship."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="specifications" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <span className="ml-2 font-medium">{product.category.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">SKU:</span>
                        <span className="ml-2 font-medium">{product.sku || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Stock:</span>
                        <span className="ml-2 font-medium">{product.stock} units</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Featured:</span>
                        <span className="ml-2 font-medium">{product.featured ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                    <div className="space-y-4">
                      {/* Sample reviews */}
                      <div className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < 5 ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-medium">John Doe</span>
                          </div>
                          <span className="text-sm text-gray-500">2 days ago</span>
                        </div>
                        <p className="text-gray-600">
                          Great product! Exactly what I was looking for. High quality and fast shipping.
                        </p>
                      </div>
                      
                      <div className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-medium">Jane Smith</span>
                          </div>
                          <span className="text-sm text-gray-500">1 week ago</span>
                        </div>
                        <p className="text-gray-600">
                          Good value for money. The material is nice and the fit is perfect.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}