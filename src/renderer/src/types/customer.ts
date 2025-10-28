export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  dateOfBirth?: string
  loyaltyPoints: number
  totalPurchases: number
  status: string
  createdAt: string
}

export interface CustomerFormData {
  name: string
  phone: string
  email: string
  address: string
  dateOfBirth: string
  status: string
}
