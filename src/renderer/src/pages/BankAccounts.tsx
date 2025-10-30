import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { usePermissions } from '../hooks/usePermissions'
import { useAuthStore } from '../store/authStore'
import { BankAccount, BankAccountFormData, BalanceAdjustmentData } from '../types/bankAccount'
import BankAccountHeader from '../components/bankAccounts/BankAccountHeader'
import BankAccountStats from '../components/bankAccounts/BankAccountStats'
import BankAccountSearchBar from '../components/bankAccounts/BankAccountSearchBar'
import BankAccountsTable from '../components/bankAccounts/BankAccountsTable'
import BankAccountFormModal from '../components/bankAccounts/BankAccountFormModal'
import BalanceAdjustmentModal from '../components/bankAccounts/BalanceAdjustmentModal'

export default function BankAccounts(): React.JSX.Element {
  const { hasPermission } = usePermissions()
  const user = useAuthStore((state) => state.user)
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [adjustingAccount, setAdjustingAccount] = useState<BankAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  const [formData, setFormData] = useState<BankAccountFormData>({
    name: '',
    accountType: 'cash',
    accountNumber: '',
    bankName: '',
    branchName: '',
    accountHolder: '',
    openingBalance: '0',
    description: ''
  })

  const [adjustmentData, setAdjustmentData] = useState<BalanceAdjustmentData>({
    amount: '',
    type: 'credit',
    reason: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true)
      const accountsData = await window.api.bankAccounts.getAll()
      setAccounts(accountsData)
    } catch (error) {
      toast.error('Failed to load bank accounts')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.accountNumber && account.accountNumber.includes(searchTerm)) ||
      (account.bankName && account.bankName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!formData.name || !formData.accountType) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        openingBalance: parseFloat(formData.openingBalance) || 0
      }

      if (editingAccount) {
        await window.api.bankAccounts.update(editingAccount.id, submitData)
        toast.success('Account updated successfully')
      } else {
        await window.api.bankAccounts.create(submitData)
        toast.success('Account created successfully')
      }
      handleCloseModal()
      loadData()
    } catch (error) {
      toast.error(editingAccount ? 'Failed to update account' : 'Failed to create account')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (account: BankAccount): void => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      accountType: account.accountType,
      accountNumber: account.accountNumber || '',
      bankName: account.bankName || '',
      branchName: account.branchName || '',
      accountHolder: account.accountHolder || '',
      openingBalance: account.openingBalance?.toString() || '0',
      description: account.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this account?')) return

    try {
      await window.api.bankAccounts.delete(id)
      toast.success('Account deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete account')
      console.error(error)
    }
  }

  const handleCloseModal = (): void => {
    setShowModal(false)
    setEditingAccount(null)
    setFormData({
      name: '',
      accountType: 'cash',
      accountNumber: '',
      bankName: '',
      branchName: '',
      accountHolder: '',
      openingBalance: '0',
      description: ''
    })
  }

  const handleAdjustBalance = (account: BankAccount): void => {
    setAdjustingAccount(account)
    setAdjustmentData({
      amount: '',
      type: 'credit',
      reason: ''
    })
    setShowAdjustmentModal(true)
  }

  const handleSubmitAdjustment = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!adjustingAccount || !adjustmentData.amount || !adjustmentData.reason) {
      toast.error('Please fill in all required fields')
      return
    }

    const amount = parseFloat(adjustmentData.amount)
    if (amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    setLoading(true)
    try {
      await window.api.bankAccounts.updateBalance(
        adjustingAccount.id,
        amount,
        adjustmentData.type,
        user?.id || null,
        user?.username || null
      )
      toast.success(
        `Balance ${adjustmentData.type === 'credit' ? 'increased' : 'decreased'} successfully`
      )
      handleCloseAdjustmentModal()
      loadData()
    } catch (error) {
      toast.error('Failed to adjust balance')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseAdjustmentModal = (): void => {
    setShowAdjustmentModal(false)
    setAdjustingAccount(null)
    setAdjustmentData({
      amount: '',
      type: 'credit',
      reason: ''
    })
  }

  const handleSearchChange = (value: string): void => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFormChange = (data: Partial<BankAccountFormData>): void => {
    setFormData({ ...formData, ...data })
  }

  const handleAdjustmentDataChange = (data: Partial<BalanceAdjustmentData>): void => {
    setAdjustmentData({ ...adjustmentData, ...data })
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <BankAccountHeader />

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <BankAccountSearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onAddClick={() => setShowModal(true)}
        />

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <BankAccountStats accounts={accounts} />
        </div>
      </div>

      {/* Accounts Table */}
      <BankAccountsTable
        accounts={filteredAccounts}
        loading={loading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        hasAdjustPermission={hasPermission('manage_roles')}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdjustBalance={handleAdjustBalance}
      />

      {/* Add/Edit Modal */}
      <BankAccountFormModal
        show={showModal}
        editingAccount={editingAccount}
        formData={formData}
        loading={loading}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />

      {/* Adjust Balance Modal */}
      <BalanceAdjustmentModal
        show={showAdjustmentModal}
        account={adjustingAccount}
        adjustmentData={adjustmentData}
        loading={loading}
        onClose={handleCloseAdjustmentModal}
        onSubmit={handleSubmitAdjustment}
        onAdjustmentDataChange={handleAdjustmentDataChange}
      />
    </div>
  )
}
