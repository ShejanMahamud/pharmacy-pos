import { BankAccount } from '../../types/bankAccount'

interface BankAccountStatsProps {
  accounts: BankAccount[]
}

export default function BankAccountStats({ accounts }: BankAccountStatsProps): React.JSX.Element {
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
  )
}
