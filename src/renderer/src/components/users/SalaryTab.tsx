import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface User {
  id: string
  username: string
  fullName: string
}

interface Salary {
  id: string
  userId: string
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  paymentFrequency: string
  effectiveFrom: string
}

interface SalaryPayment {
  id: string
  userId: string
  periodStart: string
  periodEnd: string
  netAmount: number
  paymentDate: string
  paymentMethod: string
  status: string
}

interface SalaryStats {
  totalEmployees: number
  monthlyPayroll: number
  paidThisMonth: number
  pendingPayments: number
}

interface SalaryFormData {
  userId: string
  basicSalary: number
  allowances: number
  deductions: number
  paymentFrequency: string
  bankAccountNumber: string
  bankName: string
  notes: string
  effectiveFrom: string
}

interface PaymentFormData {
  userId: string
  salaryId: string
  paymentDate: string
  payPeriodStart: string
  payPeriodEnd: string
  basicAmount: number
  allowances: number
  deductions: number
  bonuses: number
  paymentMethod: string
  accountId: string
  transactionReference: string
  notes: string
}

interface SalaryTabProps {
  users: User[]
  currentUser: User | null
}

export default function SalaryTab({ users, currentUser }: SalaryTabProps): React.JSX.Element {
  const [salaries, setSalaries] = useState<Salary[]>([])
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([])
  const [showSalaryModal, setShowSalaryModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [salaryFormData, setSalaryFormData] = useState<SalaryFormData>({
    userId: '',
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    paymentFrequency: 'monthly',
    bankAccountNumber: '',
    bankName: '',
    notes: '',
    effectiveFrom: new Date().toISOString().split('T')[0]
  })
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    userId: '',
    salaryId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    payPeriodStart: '',
    payPeriodEnd: '',
    basicAmount: 0,
    allowances: 0,
    deductions: 0,
    bonuses: 0,
    paymentMethod: 'bank_transfer',
    accountId: '',
    transactionReference: '',
    notes: ''
  })
  const [salaryStats, setSalaryStats] = useState<SalaryStats>({
    totalEmployees: 0,
    monthlyPayroll: 0,
    paidThisMonth: 0,
    pendingPayments: 0
  })

  useEffect(() => {
    loadSalaries()
  }, [users])

  const loadSalaries = async (): Promise<void> => {
    try {
      const [salariesData, paymentsData] = await Promise.all([
        window.api.salaries.getAll(),
        window.api.salaryPayments.getAll()
      ])

      setSalaries(salariesData)
      setSalaryPayments(paymentsData)

      // Calculate stats
      const totalEmployees = users.length
      const monthlyPayroll = salariesData.reduce(
        (sum, s) => sum + (s.paymentFrequency === 'monthly' ? s.netSalary : 0),
        0
      )

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const paidThisMonth = paymentsData
        .filter((p) => {
          const paymentDate = new Date(p.paymentDate)
          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear &&
            p.status === 'paid'
          )
        })
        .reduce((sum, p) => sum + p.netAmount, 0)

      const pendingPayments = paymentsData
        .filter((p) => p.status === 'pending')
        .reduce((sum, p) => sum + p.netAmount, 0)

      setSalaryStats({ totalEmployees, monthlyPayroll, paidThisMonth, pendingPayments })
    } catch (error) {
      console.error('Failed to load salaries:', error)
      toast.error('Failed to load salaries')
    }
  }

  const handleAddSalary = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!currentUser) return

    try {
      await window.api.salaries.create({
        ...salaryFormData,
        createdBy: currentUser.id
      })
      toast.success('Salary added successfully')
      setShowSalaryModal(false)
      setSalaryFormData({
        userId: '',
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
        paymentFrequency: 'monthly',
        bankAccountNumber: '',
        bankName: '',
        notes: '',
        effectiveFrom: new Date().toISOString().split('T')[0]
      })
      loadSalaries()
    } catch (error) {
      console.error('Failed to add salary:', error)
      toast.error('Failed to add salary')
    }
  }

  const handleProcessPayment = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!currentUser) return

    try {
      await window.api.salaryPayments.create({
        ...paymentFormData,
        paidBy: currentUser.id
      })
      toast.success('Payment processed successfully')
      setShowPaymentModal(false)
      setPaymentFormData({
        userId: '',
        salaryId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        payPeriodStart: '',
        payPeriodEnd: '',
        basicAmount: 0,
        allowances: 0,
        deductions: 0,
        bonuses: 0,
        paymentMethod: 'bank_transfer',
        accountId: '',
        transactionReference: '',
        notes: ''
      })
      loadSalaries()
    } catch (error) {
      console.error('Failed to process payment:', error)
      toast.error('Failed to process payment')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Salary Management</h2>
            <p className="text-sm text-gray-600 mt-1">Manage employee salaries and payments</p>
          </div>
          <button
            onClick={() => setShowSalaryModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Salary
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 font-semibold text-sm">Total Employees</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{users.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 font-semibold text-sm">Monthly Payroll</div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                ${salaryStats.monthlyPayroll.toFixed(2)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 font-semibold text-sm">Paid This Month</div>
              <div className="text-2xl font-bold text-purple-900 mt-1">
                ${salaryStats.paidThisMonth.toFixed(2)}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-orange-600 font-semibold text-sm">Pending Payments</div>
              <div className="text-2xl font-bold text-orange-900 mt-1">
                ${salaryStats.pendingPayments.toFixed(2)}
              </div>
            </div>
          </div>
          {salaries.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
              <p className="text-lg font-medium">No salary records yet</p>
              <p className="text-sm mt-1">Add salary information for employees to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Salary Configurations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Configurations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Basic Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Allowances
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deductions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Effective From
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salaries.map((salary) => {
                        const user = users.find((u) => u.id === salary.userId)
                        return (
                          <tr key={salary.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {user?.fullName || 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${salary.basicSalary.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              +${salary.allowances.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              -${salary.deductions.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              ${salary.netSalary.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {salary.paymentFrequency}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(salary.effectiveFrom).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  setPaymentFormData({
                                    ...paymentFormData,
                                    salaryId: salary.id,
                                    userId: salary.userId,
                                    basicAmount: salary.basicSalary,
                                    allowances: salary.allowances,
                                    deductions: salary.deductions
                                  })
                                  setShowPaymentModal(true)
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                Process Payment
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment History */}
              {salaryPayments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Period
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salaryPayments.map((payment) => {
                          const user = users.find((u) => u.id === payment.userId)
                          return (
                            <tr key={payment.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {user?.fullName || 'Unknown'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(payment.periodStart).toLocaleDateString()} -{' '}
                                {new Date(payment.periodEnd).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                ${payment.netAmount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(payment.paymentDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.paymentMethod}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    payment.status === 'paid'
                                      ? 'bg-green-100 text-green-800'
                                      : payment.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {payment.status}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Salary Modal - Add Salary Configuration */}
      {showSalaryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Salary Configuration</h2>
                <p className="text-sm text-gray-600 mt-1">Set up salary details for an employee</p>
              </div>
              <button
                onClick={() => setShowSalaryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSalary} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Employee</label>
                <select
                  value={salaryFormData.userId}
                  onChange={(e) => setSalaryFormData({ ...salaryFormData, userId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an employee</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Basic Salary
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={salaryFormData.basicSalary}
                    onChange={(e) =>
                      setSalaryFormData({
                        ...salaryFormData,
                        basicSalary: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="5000.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Allowances
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={salaryFormData.allowances}
                    onChange={(e) =>
                      setSalaryFormData({
                        ...salaryFormData,
                        allowances: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="500.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deductions
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={salaryFormData.deductions}
                    onChange={(e) =>
                      setSalaryFormData({
                        ...salaryFormData,
                        deductions: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="200.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Frequency
                  </label>
                  <select
                    value={salaryFormData.paymentFrequency}
                    onChange={(e) =>
                      setSalaryFormData({ ...salaryFormData, paymentFrequency: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-blue-900">Net Salary:</span>
                  <span className="text-2xl font-bold text-blue-900">
                    $
                    {(
                      salaryFormData.basicSalary +
                      salaryFormData.allowances -
                      salaryFormData.deductions
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={salaryFormData.bankName}
                    onChange={(e) =>
                      setSalaryFormData({ ...salaryFormData, bankName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Bank of America"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={salaryFormData.bankAccountNumber}
                    onChange={(e) =>
                      setSalaryFormData({ ...salaryFormData, bankAccountNumber: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Effective From
                </label>
                <input
                  type="date"
                  value={salaryFormData.effectiveFrom}
                  onChange={(e) =>
                    setSalaryFormData({ ...salaryFormData, effectiveFrom: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={salaryFormData.notes}
                  onChange={(e) => setSalaryFormData({ ...salaryFormData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSalaryModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                >
                  Add Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal - Process Salary Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Process Salary Payment</h2>
                <p className="text-sm text-gray-600 mt-1">Record a salary payment transaction</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employee Salary
                </label>
                <select
                  value={paymentFormData.salaryId}
                  onChange={(e) => {
                    const salary = salaries.find((s) => s.id === e.target.value)
                    setPaymentFormData({
                      ...paymentFormData,
                      salaryId: e.target.value,
                      userId: salary?.userId || '',
                      basicAmount: salary?.basicSalary || 0,
                      allowances: salary?.allowances || 0,
                      deductions: salary?.deductions || 0
                    })
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select employee salary</option>
                  {salaries.map((salary) => {
                    const user = users.find((u) => u.id === salary.userId)
                    return (
                      <option key={salary.id} value={salary.id}>
                        {user?.fullName} - ${salary.netSalary.toFixed(2)} ({salary.paymentFrequency}
                        )
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Period Start
                  </label>
                  <input
                    type="date"
                    value={paymentFormData.payPeriodStart}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, payPeriodStart: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Period End
                  </label>
                  <input
                    type="date"
                    value={paymentFormData.payPeriodEnd}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, payPeriodEnd: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Basic Salary:</span>
                  <span className="font-semibold">${paymentFormData.basicAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Allowances:</span>
                  <span className="font-semibold text-green-600">
                    +${paymentFormData.allowances.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deductions:</span>
                  <span className="font-semibold text-red-600">
                    -${paymentFormData.deductions.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Net Amount:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    $
                    {(
                      paymentFormData.basicAmount +
                      paymentFormData.allowances -
                      paymentFormData.deductions
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentFormData.paymentMethod}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentFormData.paymentDate}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  value={paymentFormData.transactionReference}
                  onChange={(e) =>
                    setPaymentFormData({
                      ...paymentFormData,
                      transactionReference: e.target.value
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="TXN123456"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentFormData.notes}
                  onChange={(e) =>
                    setPaymentFormData({ ...paymentFormData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                >
                  Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
