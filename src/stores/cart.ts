import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image?: string
  quantity: number
  stock: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  isInCart: (productId: string) => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const existingItem = get().items.find(i => i.productId === item.productId)
        
        if (existingItem) {
          set((state) => ({
            items: state.items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
                : i
            )
          }))
        } else {
          set((state) => ({
            items: [...state.items, { ...item, id: Date.now().toString() }]
          }))
        }
      },
      
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }))
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity: Math.min(quantity, item.stock) }
              : item
          )
        }))
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
      
      isInCart: (productId) => {
        return get().items.some(item => item.productId === productId)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)