import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Pagination from '../components/Pagination'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'

interface Supplier {
  id: string
  name: string
  code: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  taxNumber?: string
  openingBalance?: number
  currentBalance?: number
  totalPurchases?: number
  totalPayments?: number
  creditLimit?: number
  creditDays?: number
  isActive: boolean
}

interface BankAccount {
  id: string
  name: string
  accountType: string
  currentBalance: number
}

export default function Suppliers(): React.JSX.Element {
  const { user } = useAuthStore()
  const { storeName, storePhone, storeEmail, storeAddress, currency } = useSettingsStore()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    openingBalance: '0',
    creditLimit: '0',
    creditDays: '0'
  })

  const [paymentData, setPaymentData] = useState({
    amount: '',
    accountId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true)
      const [suppliersData, accountsData] = await Promise.all([
        window.api.suppliers.getAll(),
        window.api.bankAccounts.getAll()
      ])
      setSuppliers(suppliersData)
      setBankAccounts(accountsData)
    } catch (error) {
      toast.error('Failed to load suppliers')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.phone && supplier.phone.includes(searchTerm)) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!formData.name || !formData.code) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        creditLimit: parseFloat(formData.creditLimit) || 0,
        creditDays: parseInt(formData.creditDays) || 0
      }

      if (editingSupplier) {
        await window.api.suppliers.update(editingSupplier.id, submitData)
        toast.success('Supplier updated successfully')
      } else {
        await window.api.suppliers.create(submitData)
        toast.success('Supplier created successfully')
      }
      handleCloseModal()
      loadData()
    } catch (error) {
      toast.error(editingSupplier ? 'Failed to update supplier' : 'Failed to create supplier')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (supplier: Supplier): void => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      code: supplier.code,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      taxNumber: supplier.taxNumber || '',
      openingBalance: supplier.openingBalance?.toString() || '0',
      creditLimit: supplier.creditLimit?.toString() || '0',
      creditDays: supplier.creditDays?.toString() || '0'
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this supplier?')) return

    try {
      await window.api.suppliers.delete(id)
      toast.success('Supplier deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete supplier')
      console.error(error)
    }
  }

  const handleCloseModal = (): void => {
    setShowModal(false)
    setEditingSupplier(null)
    setFormData({
      name: '',
      code: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      taxNumber: '',
      openingBalance: '0',
      creditLimit: '0',
      creditDays: '0'
    })
  }

  const handleRecordPayment = (supplier: Supplier): void => {
    setPayingSupplier(supplier)
    setPaymentData({
      amount: '',
      accountId: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setShowPaymentModal(true)
  }

  const generatePaymentPDF = (
    supplier: Supplier,
    payment: {
      referenceNumber: string
      amount: number
      accountName: string
      paymentDate: string
      notes: string
    }
  ): void => {
    const doc = new jsPDF()

    // Add company logo/header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(storeName || 'Pharmacy POS', 105, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    if (storeAddress) doc.text(storeAddress, 105, 28, { align: 'center' })
    if (storePhone) doc.text(`Phone: ${storePhone}`, 105, 34, { align: 'center' })
    if (storeEmail) doc.text(`Email: ${storeEmail}`, 105, 40, { align: 'center' })

    // Title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('PAYMENT RECEIPT', 105, 55, { align: 'center' })

    // Line separator
    doc.setLineWidth(0.5)
    doc.line(20, 60, 190, 60)

    // Payment details
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    let yPos = 70

    // Left column
    doc.setFont('helvetica', 'bold')
    doc.text('Receipt No:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(payment.referenceNumber, 70, yPos)

    yPos += 8
    doc.setFont('helvetica', 'bold')
    doc.text('Date:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(new Date(payment.paymentDate).toLocaleDateString(), 70, yPos)

    yPos += 8
    doc.setFont('helvetica', 'bold')
    doc.text('Payment Account:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(payment.accountName, 70, yPos)

    // Supplier information
    yPos += 15
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('PAID TO:', 20, yPos)

    yPos += 8
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Supplier: ${supplier.name}`, 20, yPos)

    yPos += 6
    doc.text(`Code: ${supplier.code}`, 20, yPos)

    if (supplier.contactPerson) {
      yPos += 6
      doc.text(`Contact Person: ${supplier.contactPerson}`, 20, yPos)
    }

    if (supplier.phone) {
      yPos += 6
      doc.text(`Phone: ${supplier.phone}`, 20, yPos)
    }

    if (supplier.email) {
      yPos += 6
      doc.text(`Email: ${supplier.email}`, 20, yPos)
    }

    // Payment amount box
    yPos += 15
    doc.setLineWidth(0.5)
    doc.rect(20, yPos, 170, 25)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Amount Paid:', 25, yPos + 10)

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    const currencySymbol = currency === 'BDT' ? '৳' : '$'
    doc.text(`${currencySymbol}${payment.amount.toFixed(2)}`, 185, yPos + 15, { align: 'right' })

    // Notes
    if (payment.notes) {
      yPos += 35
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Notes:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      const splitNotes = doc.splitTextToSize(payment.notes, 170)
      doc.text(splitNotes, 20, yPos + 6)
      yPos += 6 * splitNotes.length + 10
    }

    // Footer
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text('Thank you for your business!', 105, 270, { align: 'center' })
    doc.text(
      `Generated on: ${new Date().toLocaleString()} by ${user?.fullName || 'System'}`,
      105,
      277,
      { align: 'center' }
    )

    // Save PDF
    const fileName = `Payment_${payment.referenceNumber}_${supplier.code}.pdf`
    doc.save(fileName)
  }

  const handlePaymentSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    if (!payingSupplier) {
      toast.error('No supplier selected')
      return
    }

    if (!user) {
      toast.error('User not authenticated')
      return
    }

    // Account selection is now required
    if (!paymentData.accountId) {
      toast.error('Please select a payment account')
      return
    }

    const totalBalance = (payingSupplier.openingBalance || 0) + (payingSupplier.currentBalance || 0)
    if (parseFloat(paymentData.amount) > totalBalance && totalBalance > 0) {
      toast.error(`Payment amount cannot exceed balance of $${totalBalance.toFixed(2)}`)
      return
    }

    // Validate account balance
    const selectedAccount = bankAccounts.find((acc) => acc.id === paymentData.accountId)
    if (!selectedAccount) {
      toast.error('Selected account not found')
      return
    }

    if (selectedAccount.currentBalance < parseFloat(paymentData.amount)) {
      toast.error(
        `Insufficient balance in ${selectedAccount.name}. Available: $${selectedAccount.currentBalance.toFixed(2)}`
      )
      return
    }

    setLoading(true)
    try {
      const referenceNumber = `PAY-${Date.now()}`
      await window.api.supplierPayments.create({
        supplierId: payingSupplier.id,
        accountId: paymentData.accountId,
        userId: user.id,
        referenceNumber,
        amount: parseFloat(paymentData.amount),
        paymentMethod: 'bank', // Default to bank since account is selected
        paymentDate: paymentData.paymentDate,
        notes: paymentData.notes
      })

      // Generate PDF receipt
      generatePaymentPDF(payingSupplier, {
        referenceNumber,
        amount: parseFloat(paymentData.amount),
        accountName: selectedAccount.name,
        paymentDate: paymentData.paymentDate,
        notes: paymentData.notes
      })

      toast.success('Payment recorded successfully and receipt generated')
      handleClosePaymentModal()
      loadData()
    } catch (error) {
      toast.error('Failed to record payment')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleClosePaymentModal = (): void => {
    setShowPaymentModal(false)
    setPayingSupplier(null)
    setPaymentData({
      amount: '',
      accountId: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    })
  }

  const generateCode = (): void => {
    const code = 'SUP' + Date.now().toString().slice(-6)
    setFormData({ ...formData, code })
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Suppliers Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your pharmacy suppliers and vendor information
          </p>
        </div>
        <Link
          to="/supplier-ledger"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Supplier Ledger
        </Link>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name, code, phone or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Supplier
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-blue-600">{suppliers.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-bold text-green-600">
                {suppliers.filter((s) => s.isActive).length}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">With Email</p>
              <p className="text-2xl font-bold text-purple-600">
                {suppliers.filter((s) => s.email).length}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">With Tax ID</p>
              <p className="text-2xl font-bold text-orange-600">
                {suppliers.filter((s) => s.taxNumber).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedSuppliers.length > 0 ? (
                paginatedSuppliers.map((supplier) => {
                  // Calculate total balance including opening balance
                  const totalBalance =
                    (supplier.openingBalance || 0) + (supplier.currentBalance || 0)

                  return (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{supplier.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{supplier.contactPerson || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{supplier.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{supplier.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className={`text-sm font-semibold ${
                            totalBalance > 0
                              ? 'text-red-600'
                              : totalBalance < 0
                                ? 'text-green-600'
                                : 'text-gray-900'
                          }`}
                        >
                          {totalBalance !== 0 ? `$${Math.abs(totalBalance).toFixed(2)}` : '$0.00'}
                          {totalBalance > 0
                            ? ' (Payable)'
                            : totalBalance < 0
                              ? ' (Receivable)'
                              : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            supplier.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {supplier.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {totalBalance > 0 && (
                            <button
                              onClick={() => handleRecordPayment(supplier)}
                              className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              title="Record Payment"
                            >
                              <svg
                                className="h-3 w-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Pay
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg
                        className="h-12 w-12 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new supplier
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSuppliers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSuppliers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(items) => {
              setItemsPerPage(items)
              setCurrentPage(1)
            }}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supplier Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ABC Pharmaceuticals"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supplier Code *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="SUP001"
                        />
                        <button
                          type="button"
                          onClick={generateCode}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+1 234 567 8900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="supplier@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main Street, City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Number / VAT ID
                    </label>
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="TAX123456"
                    />
                  </div>

                  {/* Accounting Information */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Accounting Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opening Balance
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.openingBalance}
                          onChange={(e) =>
                            setFormData({ ...formData, openingBalance: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Positive = Payable, Negative = Receivable
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Credit Limit
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.creditLimit}
                          onChange={(e) =>
                            setFormData({ ...formData, creditLimit: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum credit allowed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Credit Days
                        </label>
                        <input
                          type="number"
                          value={formData.creditDays}
                          onChange={(e) => setFormData({ ...formData, creditDays: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Payment terms in days</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && payingSupplier && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
                <button
                  onClick={handleClosePaymentModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Supplier Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600">Supplier</div>
                <div className="text-lg font-semibold text-gray-900">{payingSupplier.name}</div>
                <div className="text-sm text-gray-600 mt-2">
                  Current Balance:{' '}
                  <span className="font-bold text-red-600">
                    $
                    {(
                      (payingSupplier.openingBalance || 0) + (payingSupplier.currentBalance || 0)
                    ).toFixed(2)}{' '}
                    (Payable)
                  </span>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Account *
                    </label>
                    <select
                      required
                      value={paymentData.accountId}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, accountId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Select Payment Account --</option>
                      {bankAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} - Balance: ${account.currentBalance.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    {paymentData.accountId &&
                      paymentData.amount &&
                      (() => {
                        const selectedAccount = bankAccounts.find(
                          (acc) => acc.id === paymentData.accountId
                        )
                        const paymentAmount = parseFloat(paymentData.amount)
                        if (
                          selectedAccount &&
                          !isNaN(paymentAmount) &&
                          selectedAccount.currentBalance < paymentAmount
                        ) {
                          return (
                            <div className="mt-2 flex items-center text-xs text-red-600">
                              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Insufficient balance! Available: $
                              {selectedAccount.currentBalance.toFixed(2)}
                            </div>
                          )
                        } else if (selectedAccount && !isNaN(paymentAmount)) {
                          return (
                            <div className="mt-2 text-xs text-green-600">
                              ✓ Remaining balance after payment: $
                              {(selectedAccount.currentBalance - paymentAmount).toFixed(2)}
                            </div>
                          )
                        }
                        return null
                      })()}
                    {bankAccounts.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        No accounts available. Please create a bank account first.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentData.paymentDate}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, paymentDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add payment notes..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClosePaymentModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
