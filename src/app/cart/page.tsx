"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Separator } from "@/src/components/ui/separator"
import { useCartStore } from "@/src/stores/cart"
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart } from "lucide-react"

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice, clearCart } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/cart")
      return
    }

    setIsLoading(true)
    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button asChild size="lg">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="mt-2 text-gray-600">
                {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ShoppingCart className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              <Link 
                                href={`/products/${item.productId}`}
                                className="hover:text-primary transition-colors"
                              >
                                {item.name}
                              </Link>
                            </h3>
                            <p className="text-gray-600">${item.price.toFixed(2)}</p>
                            {item.stock < 10 && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                Only {item.stock} left in stock
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value)
                                if (value > 0 && value <= item.stock) {
                                  updateQuantity(item.id, value)
                                }
                              }}
                              className="w-16 text-center"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm text-gray-600">Item Total:</span>
                          <span className="font-semibold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${(getTotalPrice() * 0.08).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${(getTotalPrice() * 1.08).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? "Processing..." : "Proceed to Checkout"}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={clearCart}
                      className="w-full"
                    >
                      Clear Cart
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    <p>Free shipping on orders over $50</p>
                    <p>Secure checkout powered by NextAuth</p>
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