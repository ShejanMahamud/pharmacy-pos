import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Pagination from '../components/Pagination'
import { usePermissions } from '../hooks/usePermissions'
import { useAuthStore } from '../store/authStore'

interface BankAccount {
  id: string
  name: string
  accountType: 'cash' | 'bank' | 'mobile_banking'
  accountNumber?: string
  bankName?: string
  branchName?: string
  accountHolder?: string
  openingBalance: number
  currentBalance: number
  totalDeposits: number
  totalWithdrawals: number
  description?: string
  isActive: boolean
}

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

  const [formData, setFormData] = useState({
    name: '',
    accountType: 'cash' as 'cash' | 'bank' | 'mobile_banking',
    accountNumber: '',
    bankName: '',
    branchName: '',
    accountHolder: '',
    openingBalance: '0',
    description: ''
  })

  const [adjustmentData, setAdjustmentData] = useState({
    amount: '',
    type: 'credit' as 'credit' | 'debit',
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

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage)
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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

  const getAccountTypeLabel = (type: string): string => {
    switch (type) {
      case 'cash':
        return 'Cash'
      case 'bank':
        return 'Bank Account'
      case 'mobile_banking':
        return 'Mobile Banking'
      default:
        return type
    }
  }

  const getAccountTypeColor = (type: string): string => {
    switch (type) {
      case 'cash':
        return 'bg-green-100 text-green-800'
      case 'bank':
        return 'bg-blue-100 text-blue-800'
      case 'mobile_banking':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0)
  const totalCash = accounts
    .filter((a) => a.accountType === 'cash')
    .reduce((sum, account) => sum + account.currentBalance, 0)
  const totalBank = accounts
    .filter((a) => a.accountType === 'bank')
    .reduce((sum, account) => sum + account.currentBalance, 0)
  const totalMobile = accounts
    .filter((a) => a.accountType === 'mobile_banking')
    .reduce((sum, account) => sum + account.currentBalance, 0)

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bank Accounts Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage cash, bank accounts, and mobile banking accounts
        </p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name, account number, or bank..."
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
            Add Account
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-indigo-600">${totalBalance.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Cash</p>
              <p className="text-2xl font-bold text-green-600">${totalCash.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Bank Accounts</p>
              <p className="text-2xl font-bold text-blue-600">${totalBank.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Mobile Banking</p>
              <p className="text-2xl font-bold text-purple-600">${totalMobile.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank/Provider
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Balance
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
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedAccounts.length > 0 ? (
                paginatedAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{account.name}</div>
                      {account.description && (
                        <div className="text-xs text-gray-500">{account.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeColor(account.accountType)}`}
                      >
                        {getAccountTypeLabel(account.accountType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{account.accountNumber || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{account.bankName || '-'}</div>
                      {account.branchName && (
                        <div className="text-xs text-gray-500">{account.branchName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div
                        className={`text-sm font-semibold ${
                          account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        ${Math.abs(account.currentBalance).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          account.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(account)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      {hasPermission('manage_roles') && (
                        <button
                          onClick={() => handleAdjustBalance(account)}
                          className="text-purple-600 hover:text-purple-900 mr-4"
                        >
                          Adjust
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new account
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAccounts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAccounts.length}
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAccount ? 'Edit Account' : 'Add New Account'}
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
                        Account Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Cash in Hand / HSBC Account"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type *
                      </label>
                      <select
                        required
                        value={formData.accountType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accountType: e.target.value as 'cash' | 'bank' | 'mobile_banking'
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="cash">Cash</option>
                        <option value="bank">Bank Account</option>
                        <option value="mobile_banking">Mobile Banking</option>
                      </select>
                    </div>
                  </div>

                  {/* Account Number & Bank/Provider Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, accountNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1234567890"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.accountType === 'bank'
                          ? 'Bank Name'
                          : formData.accountType === 'mobile_banking'
                            ? 'Provider Name'
                            : 'Bank/Provider'}
                      </label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={
                          formData.accountType === 'bank'
                            ? 'HSBC Bank'
                            : formData.accountType === 'mobile_banking'
                              ? 'bKash / Nagad'
                              : 'Bank or Provider Name'
                        }
                      />
                    </div>
                  </div>

                  {/* Bank/Mobile Banking Details */}
                  {formData.accountType !== 'cash' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.accountType === 'bank' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Branch Name
                            </label>
                            <input
                              type="text"
                              value={formData.branchName}
                              onChange={(e) =>
                                setFormData({ ...formData, branchName: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Main Branch"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Holder
                          </label>
                          <input
                            type="text"
                            value={formData.accountHolder}
                            onChange={(e) =>
                              setFormData({ ...formData, accountHolder: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Balance
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.openingBalance}
                      onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      disabled={!!editingAccount}
                    />
                    {editingAccount && (
                      <p className="text-xs text-gray-500 mt-1">
                        Opening balance cannot be changed after creation
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description / Notes
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Additional notes about this account"
                    />
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
                    {loading ? 'Saving...' : editingAccount ? 'Update Account' : 'Add Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {showAdjustmentModal && adjustingAccount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative z-10">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Adjust Account Balance</h2>
                <button
                  onClick={handleCloseAdjustmentModal}
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

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Account:</span> {adjustingAccount.name}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Current Balance:</span>{' '}
                  <span
                    className={`font-bold ${adjustingAccount.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    ${Math.abs(adjustingAccount.currentBalance).toFixed(2)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmitAdjustment}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adjustment Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={adjustmentData.type}
                      onChange={(e) =>
                        setAdjustmentData({
                          ...adjustmentData,
                          type: e.target.value as 'credit' | 'debit'
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="credit">Credit (Add Money)</option>
                      <option value="debit">Debit (Deduct Money)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={adjustmentData.amount}
                      onChange={(e) =>
                        setAdjustmentData({ ...adjustmentData, amount: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={adjustmentData.reason}
                      onChange={(e) =>
                        setAdjustmentData({ ...adjustmentData, reason: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Explain the reason for this adjustment (for audit trail)"
                      required
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> This adjustment will be recorded for audit purposes.
                      Make sure to provide a clear reason for the adjustment.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseAdjustmentModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Adjusting...' : 'Adjust Balance'}
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
