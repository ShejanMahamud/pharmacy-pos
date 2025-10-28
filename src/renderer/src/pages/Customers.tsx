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
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(25)

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
    loadCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, searchTerm, statusFilter])

  const loadCustomers = async (): Promise<void> => {
    try {
      const allCustomers = await window.api.customers.getAll()
      setCustomers(allCustomers)
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
    setCurrentPage(1)
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
      status: customer.status
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

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate stats
  const totalCustomers = filteredCustomers.length
  const activeCustomers = filteredCustomers.filter((c) => c.status === 'active').length
  const totalLoyaltyPoints = filteredCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0)
  const totalPurchaseValue = filteredCustomers.reduce((sum, c) => sum + c.totalPurchases, 0)

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
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
        customers={paginatedCustomers}
        currencySymbol={getCurrencySymbol()}
        onEdit={handleEdit}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredCustomers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(items) => {
          setItemsPerPage(items)
          setCurrentPage(1)
        }}
      />

      <CustomerFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        customer={editingCustomer}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
