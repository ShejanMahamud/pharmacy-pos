import { create } from 'zustand'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  discount: number
  taxRate: number
  batchNumber?: string
  expiryDate?: string
}

interface CartState {
  items: CartItem[]
  customerId?: string
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateDiscount: (id: string, discount: number) => void
  clearCart: () => void
  setCustomer: (customerId?: string) => void
  getSubtotal: () => number
  getTaxAmount: () => number
  getDiscountAmount: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: undefined,
  addItem: (item) => {
    const items = get().items
    const existingItem = items.find((i) => i.productId === item.productId)

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === existingItem.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      })
    } else {
      set({
        items: [...items, { ...item, id: crypto.randomUUID() }]
      })
    }
  },
  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) })
  },
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i))
    })
  },
  updateDiscount: (id, discount) => {
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, discount } : i))
    })
  },
  clearCart: () => {
    set({ items: [], customerId: undefined })
  },
  setCustomer: (customerId) => {
    set({ customerId })
  },
  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity
      return sum + itemTotal
    }, 0)
  },
  getTaxAmount: () => {
    return get().items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity
      const discountAmount = (itemTotal * item.discount) / 100
      const taxableAmount = itemTotal - discountAmount
      const tax = (taxableAmount * item.taxRate) / 100
      return sum + tax
    }, 0)
  },
  getDiscountAmount: () => {
    return get().items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity
      const discount = (itemTotal * item.discount) / 100
      return sum + discount
    }, 0)
  },
  getTotal: () => {
    const subtotal = get().getSubtotal()
    const tax = get().getTaxAmount()
    const discount = get().getDiscountAmount()
    return subtotal + tax - discount
  }
}))
