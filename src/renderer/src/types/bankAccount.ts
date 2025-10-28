export interface BankAccount {
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

export interface BankAccountFormData {
  name: string
  accountType: 'cash' | 'bank' | 'mobile_banking'
  accountNumber: string
  bankName: string
  branchName: string
  accountHolder: string
  openingBalance: string
  description: string
}

export interface BalanceAdjustmentData {
  amount: string
  type: 'credit' | 'debit'
  reason: string
}
