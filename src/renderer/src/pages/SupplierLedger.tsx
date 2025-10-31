import { Container } from '@mui/material'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import LedgerEntriesTable from '../components/supplierLedger/LedgerEntriesTable'
import SupplierInfoCard from '../components/supplierLedger/SupplierInfoCard'
import SupplierLedgerFilters from '../components/supplierLedger/SupplierLedgerFilters'
import SupplierLedgerHeader from '../components/supplierLedger/SupplierLedgerHeader'
import { usePdfExport } from '../hooks/usePdfExport'
import { useSettingsStore } from '../store/settingsStore'
import { LedgerEntry, Supplier } from '../types/supplierLedger'

export default function SupplierLedger(): React.JSX.Element {
  const { storeName, storePhone, storeEmail, storeAddress, currency } = useSettingsStore()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

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
  const currentBalance =
    (selectedSupplierData?.openingBalance || 0) + (selectedSupplierData?.currentBalance || 0)

  const { generatePDF } = usePdfExport({
    storeName,
    storePhone,
    storeEmail,
    storeAddress,
    formatCurrency
  })

  const handleExportPdf = (): void => {
    if (!selectedSupplierData || filteredEntries.length === 0) return
    generatePDF(
      selectedSupplierData,
      filteredEntries,
      dateFrom,
      dateTo,
      totalDebit,
      totalCredit,
      currentBalance
    )
  }

  const handleSupplierChange = (supplierId: string): void => {
    setSelectedSupplier(supplierId)
    setCurrentPage(1)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, bgcolor: 'grey.100', minHeight: '100vh' }}>
      <SupplierLedgerHeader
        onExportPdf={handleExportPdf}
        canExport={!!selectedSupplier && ledgerEntries.length > 0}
      />

      <SupplierLedgerFilters
        suppliers={suppliers}
        selectedSupplier={selectedSupplier}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSupplierChange={handleSupplierChange}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {selectedSupplierData && (
        <SupplierInfoCard
          supplier={selectedSupplierData}
          totalDebit={totalDebit}
          totalCredit={totalCredit}
          currentBalance={currentBalance}
          formatCurrency={formatCurrency}
        />
      )}

      <LedgerEntriesTable
        entries={paginatedEntries}
        loading={loading}
        selectedSupplier={selectedSupplier}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        totalItems={filteredEntries.length}
        formatCurrency={formatCurrency}
        getTypeColor={getTypeColor}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </Container>
  )
}
