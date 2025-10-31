import { Container } from '@mui/material'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CustomerFilters from '../components/customers/CustomerFilters'
import CustomerFormModal from '../components/customers/CustomerFormModal'
import CustomerHeader from '../components/customers/CustomerHeader'
import CustomersTable from '../components/customers/CustomersTable'
import CustomerStats from '../components/customers/CustomerStats'
import { useSettingsStore } from '../store/settingsStore'
import { Customer, CustomerFormData } from '../types/customer'

export default function Customers(): React.JSX.Element {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const currency = useSettingsStore((state) => state.currency)

  // Get currency symbol
  const getCurrencySymbol = (): string => {
    switch (currency) {
      case 'USD':
        return '$'
      case 'EUR':
        return '€'
      case 'GBP':
        return '£'
      case 'BDT':
        return '৳'
      case 'INR':
        return '₹'
      default:
        return '$'
    }
  }

  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    dateOfBirth: '',
    status: 'active'
  })

  useEffect(() => {
    initializeCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    filterCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, searchTerm, statusFilter])

  const initializeCustomers = async (): Promise<void> => {
    try {
      // First, recalculate customer stats from existing sales (one-time fix)
      await window.api.customers.recalculateStats()
      // Then load customers with updated stats
      await loadCustomers()
    } catch (_error) {
      // If recalculation fails, still try to load customers
      await loadCustomers()
    }
  }

  const loadCustomers = async (): Promise<void> => {
    try {
      const allCustomers = await window.api.customers.getAll()
      // Map isActive to status for frontend compatibility
      const mappedCustomers = allCustomers.map((customer: any) => ({
        ...customer,
        status: customer.isActive ? 'active' : 'inactive',
        loyaltyPoints: customer.loyaltyPoints || 0,
        totalPurchases: customer.totalPurchases || 0
      }))
      setCustomers(mappedCustomers)
    } catch (_error) {
      toast.error('Failed to load customers')
    }
  }

  const filterCustomers = (): void => {
    let filtered = [...customers]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((customer) => customer.status === statusFilter)
    }

    setFilteredCustomers(filtered)
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!formData.name || !formData.phone) {
      toast.error('Name and phone are required')
      return
    }

    try {
      if (editingCustomer) {
        await window.api.customers.update(editingCustomer.id, formData)
        toast.success('Customer updated successfully')
      } else {
        await window.api.customers.create(formData)
        toast.success('Customer added successfully')
      }
      handleCloseModal()
      await loadCustomers()
    } catch (_error) {
      toast.error(editingCustomer ? 'Failed to update customer' : 'Failed to add customer')
    }
  }

  const handleEdit = (customer: Customer): void => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      dateOfBirth: customer.dateOfBirth || '',
      status: customer.status || 'active'
    })
    setShowModal(true)
  }

  const handleCloseModal = (): void => {
    setShowModal(false)
    setEditingCustomer(null)
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      dateOfBirth: '',
      status: 'active'
    })
  }

  // Calculate stats
  const totalCustomers = filteredCustomers.length
  const activeCustomers = filteredCustomers.filter((c) => c.status === 'active').length
  const totalLoyaltyPoints = filteredCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0)
  const totalPurchaseValue = filteredCustomers.reduce((sum, c) => sum + c.totalPurchases, 0)

  return (
    <Container maxWidth="xl" sx={{ py: 4, bgcolor: 'grey.100', minHeight: '100vh' }}>
      <CustomerHeader />

      <CustomerStats
        totalCustomers={totalCustomers}
        activeCustomers={activeCustomers}
        totalLoyaltyPoints={totalLoyaltyPoints}
        totalPurchaseValue={totalPurchaseValue}
        currencySymbol={getCurrencySymbol()}
      />

      <CustomerFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onAddClick={() => setShowModal(true)}
      />

      <CustomersTable
        customers={filteredCustomers}
        currencySymbol={getCurrencySymbol()}
        onEdit={handleEdit}
      />

      <CustomerFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        customer={editingCustomer}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
      />
    </Container>
  )
}
