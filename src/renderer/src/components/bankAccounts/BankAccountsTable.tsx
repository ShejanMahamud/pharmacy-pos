import { BankAccount } from '../../types/bankAccount'
import Pagination from '../Pagination'

interface BankAccountsTableProps {
  accounts: BankAccount[]
  loading: boolean
  currentPage: number
  itemsPerPage: number
  hasAdjustPermission: boolean
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  onEdit: (account: BankAccount) => void
  onDelete: (id: string) => void
  onAdjustBalance: (account: BankAccount) => void
}

export default function BankAccountsTable({
  accounts,
  loading,
  currentPage,
  itemsPerPage,
  hasAdjustPermission,
  onPageChange,
  onItemsPerPageChange,
  onEdit,
  onDelete,
  onAdjustBalance
}: BankAccountsTableProps): React.JSX.Element {
  const totalPages = Math.ceil(accounts.length / itemsPerPage)
  const paginatedAccounts = accounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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

  return (
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
                        account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(account)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    {hasAdjustPermission && (
                      <button
                        onClick={() => onAdjustBalance(account)}
                        className="text-purple-600 hover:text-purple-900 mr-4"
                      >
                        Adjust
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(account.id)}
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
      {accounts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={accounts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={(items) => {
            onItemsPerPageChange(items)
            onPageChange(1)
          }}
        />
      )}
    </div>
  )
}
