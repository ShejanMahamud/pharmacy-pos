import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '../store/settingsStore'

interface Supplier {
  id: string
  name: string
  code: string
  contactPerson?: string
  phone?: string
  email?: string
  openingBalance?: number
  currentBalance?: number
  totalPurchases?: number
  totalPayments?: number
  creditLimit?: number
  creditDays?: number
}

interface LedgerEntry {
  id: string
  supplierId: string
  transactionDate: string
  type: 'purchase' | 'payment' | 'return' | 'adjustment' | 'opening_balance'
  referenceNumber: string
  description: string
  debit: number
  credit: number
  balance: number
  createdBy?: string
}

export default function SupplierLedger(): React.JSX.Element {
  const { storeName, storePhone, storeEmail, storeAddress, currency } = useSettingsStore()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    loadSuppliers()
    // Set default date range (last 30 days)
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0])
    setDateTo(today.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (selectedSupplier) {
      loadLedgerEntries()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSupplier, dateFrom, dateTo])

  const loadSuppliers = async (): Promise<void> => {
    try {
      const suppliersData = await window.api.suppliers.getAll()
      setSuppliers(suppliersData.filter((s) => s.isActive))
    } catch (error) {
      toast.error('Failed to load suppliers')
      console.error(error)
    }
  }

  const loadLedgerEntries = async (): Promise<void> => {
    if (!selectedSupplier) return

    setLoading(true)
    try {
      const entries = await window.api.supplierLedger.getEntries(selectedSupplier, dateFrom, dateTo)
      setLedgerEntries(entries)
    } catch (error) {
      toast.error('Failed to load ledger entries')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEntries = ledgerEntries.filter((entry) => {
    const entryDate = new Date(entry.transactionDate)
    const from = dateFrom ? new Date(dateFrom) : null
    const to = dateTo ? new Date(dateTo) : null

    if (from && entryDate < from) return false
    if (to && entryDate > to) return false
    return true
  })

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getCurrencySymbol = (): string => {
    return currency === 'BDT' ? '৳' : '$'
  }

  const formatCurrency = (amount: number): string => {
    return `${getCurrencySymbol()}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'purchase':
        return 'bg-blue-100 text-blue-800'
      case 'payment':
        return 'bg-green-100 text-green-800'
      case 'return':
        return 'bg-yellow-100 text-yellow-800'
      case 'adjustment':
        return 'bg-purple-100 text-purple-800'
      case 'opening_balance':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const selectedSupplierData = suppliers.find((s) => s.id === selectedSupplier)
  const totalDebit = filteredEntries.reduce((sum, entry) => sum + entry.debit, 0)
  const totalCredit = filteredEntries.reduce((sum, entry) => sum + entry.credit, 0)
  // Calculate total balance the same way as Suppliers page: openingBalance + currentBalance
  const currentBalance =
    (selectedSupplierData?.openingBalance || 0) + (selectedSupplierData?.currentBalance || 0)

  const generatePDF = (): void => {
    if (!selectedSupplierData || filteredEntries.length === 0) {
      toast.error('No data to export')
      return
    }

    try {
      const doc = new jsPDF()

      // Add company header
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
      doc.text('SUPPLIER LEDGER STATEMENT', 105, 55, { align: 'center' })

      // Line separator
      doc.setLineWidth(0.5)
      doc.line(20, 60, 190, 60)

      // Supplier information
      let yPos = 70
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('SUPPLIER DETAILS:', 20, yPos)

      yPos += 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Name: ${selectedSupplierData.name}`, 20, yPos)
      doc.text(`Code: ${selectedSupplierData.code}`, 120, yPos)

      if (selectedSupplierData.contactPerson) {
        yPos += 6
        doc.text(`Contact Person: ${selectedSupplierData.contactPerson}`, 20, yPos)
      }

      if (selectedSupplierData.phone || selectedSupplierData.email) {
        yPos += 6
        if (selectedSupplierData.phone) {
          doc.text(`Phone: ${selectedSupplierData.phone}`, 20, yPos)
        }
        if (selectedSupplierData.email) {
          doc.text(`Email: ${selectedSupplierData.email}`, 120, yPos)
        }
      }

      // Date range
      yPos += 8
      doc.setFont('helvetica', 'bold')
      doc.text('Period:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      const fromDate = dateFrom ? new Date(dateFrom).toLocaleDateString() : 'Beginning'
      const toDate = dateTo ? new Date(dateTo).toLocaleDateString() : 'Today'
      doc.text(`${fromDate} to ${toDate}`, 45, yPos)

      // Summary section
      yPos += 10
      doc.setLineWidth(0.3)
      doc.line(20, yPos, 190, yPos)
      yPos += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('ACCOUNT SUMMARY:', 20, yPos)

      yPos += 8
      doc.setFont('helvetica', 'normal')
      doc.text(`Total Purchases (Debit):`, 20, yPos)
      doc.text(formatCurrency(totalDebit), 100, yPos)

      yPos += 6
      doc.text(`Total Payments (Credit):`, 20, yPos)
      doc.text(formatCurrency(totalCredit), 100, yPos)

      yPos += 6
      doc.setFont('helvetica', 'bold')
      doc.text(`Current Balance:`, 20, yPos)
      const balanceText = `${formatCurrency(Math.abs(currentBalance))} ${currentBalance > 0 ? '(Payable)' : currentBalance < 0 ? '(Receivable)' : ''}`
      doc.text(balanceText, 100, yPos)

      // Ledger table
      yPos += 10
      doc.setLineWidth(0.3)
      doc.line(20, yPos, 190, yPos)
      yPos += 5

      // Use autoTable for the ledger entries
      const tableData = filteredEntries.map((entry) => [
        new Date(entry.transactionDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        entry.type.replace('_', ' ').toUpperCase(),
        entry.referenceNumber,
        entry.description,
        entry.debit > 0 ? formatCurrency(entry.debit) : '-',
        entry.credit > 0 ? formatCurrency(entry.credit) : '-',
        formatCurrency(entry.balance)
      ])

      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Type', 'Reference', 'Description', 'Debit', 'Credit', 'Balance']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: 50
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 45 },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 20, halign: 'right' },
          6: { cellWidth: 20, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => {
          // Footer on each page
          const pageCount = doc.internal.pages.length - 1
          doc.setFontSize(8)
          doc.setFont('helvetica', 'italic')
          doc.text(
            `Generated on: ${new Date().toLocaleString()}`,
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          )
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            190,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
          )
        }
      })

      // Save PDF
      const fileName = `Supplier_Ledger_${selectedSupplierData.code}_${dateFrom || 'all'}_to_${dateTo || 'all'}.pdf`
      doc.save(fileName)
      toast.success('Ledger exported to PDF successfully!')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF. Please try again.')
    }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/suppliers" className="text-gray-600 hover:text-gray-800 transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Supplier Ledger</h1>
              <p className="text-sm text-gray-600 mt-1">
                View supplier account statements and transactions
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={generatePDF}
          disabled={!selectedSupplier || ledgerEntries.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export PDF
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Supplier *
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => {
                setSelectedSupplier(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select a supplier --</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} ({supplier.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Supplier Info & Summary */}
      {selectedSupplierData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supplier Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Supplier Information</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-sm text-gray-600 w-32">Supplier Name:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedSupplierData.name}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-sm text-gray-600 w-32">Supplier Code:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedSupplierData.code}
                  </span>
                </div>
                {selectedSupplierData.contactPerson && (
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-32">Contact Person:</span>
                    <span className="text-sm text-gray-900">
                      {selectedSupplierData.contactPerson}
                    </span>
                  </div>
                )}
                {selectedSupplierData.phone && (
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-32">Phone:</span>
                    <span className="text-sm text-gray-900">{selectedSupplierData.phone}</span>
                  </div>
                )}
                {selectedSupplierData.email && (
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-32">Email:</span>
                    <span className="text-sm text-gray-900">{selectedSupplierData.email}</span>
                  </div>
                )}
                {selectedSupplierData.creditLimit !== undefined &&
                  selectedSupplierData.creditLimit > 0 && (
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-32">Credit Limit:</span>
                      <span className="text-sm text-gray-900">
                        {formatCurrency(selectedSupplierData.creditLimit)}
                      </span>
                    </div>
                  )}
                {selectedSupplierData.creditDays !== undefined &&
                  selectedSupplierData.creditDays > 0 && (
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-32">Credit Days:</span>
                      <span className="text-sm text-gray-900">
                        {selectedSupplierData.creditDays} days
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Account Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Summary</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-700">Total Purchases (Debit)</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(totalDebit)}
                  </span>
                </div>
                <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-700">Total Payments (Credit)</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(totalCredit)}
                  </span>
                </div>
                <div
                  className={`rounded-lg p-3 flex items-center justify-between ${
                    currentBalance > 0
                      ? 'bg-red-50'
                      : currentBalance < 0
                        ? 'bg-green-50'
                        : 'bg-gray-50'
                  }`}
                >
                  <span className="text-sm text-gray-700 font-medium">Current Balance</span>
                  <span
                    className={`text-xl font-bold ${
                      currentBalance > 0
                        ? 'text-red-600'
                        : currentBalance < 0
                          ? 'text-green-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {formatCurrency(Math.abs(currentBalance))}
                    {currentBalance > 0 ? ' (Payable)' : currentBalance < 0 ? ' (Receivable)' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : !selectedSupplier ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p>Please select a supplier to view ledger</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedEntries.length > 0 ? (
                paginatedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(entry.transactionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeColor(entry.type)}`}
                      >
                        {entry.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.referenceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{entry.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-red-600">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-green-600">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(entry.balance)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
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
                      <p>No ledger entries found for the selected period</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredEntries.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredEntries.length}</span> entries
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
