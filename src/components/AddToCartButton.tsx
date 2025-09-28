"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { ShoppingCart, Check } from "lucide-react"
import { useCartStore } from "@/src/stores/cart"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  image?: string
}

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const addItem = useCartStore(state => state.addItem)

  const handleAddToCart = async () => {
    setIsLoading(true)
    
    try {
      // Add item to cart store
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        stock: product.stock,
      })
      
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={isLoading || product.stock === 0 || isAdded}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Adding...
        </>
      ) : isAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  )
}