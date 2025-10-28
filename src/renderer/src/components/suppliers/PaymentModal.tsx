import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { BankAccount, PaymentFormData, PaymentReceipt, Supplier } from '../../types/supplier'

interface PaymentModalProps {
  show: boolean
  supplier: Supplier | null
  bankAccounts: BankAccount[]
  paymentData: PaymentFormData
  loading: boolean
  storeName?: string
  storePhone?: string
  storeEmail?: string
  storeAddress?: string
  currency: string
  userName?: string
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onPaymentDataChange: (data: Partial<PaymentFormData>) => void
}

export default function PaymentModal({
  show,
  supplier,
  bankAccounts,
  paymentData,
  loading,
  onClose,
  onSubmit,
  onPaymentDataChange
}: PaymentModalProps): React.JSX.Element | null {
  if (!show || !supplier) return null

  const totalBalance = (supplier.openingBalance || 0) + (supplier.currentBalance || 0)
  const selectedAccount = bankAccounts.find((acc) => acc.id === paymentData.accountId)
  const paymentAmount = parseFloat(paymentData.amount)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
            <div className="text-lg font-semibold text-gray-900">{supplier.name}</div>
            <div className="text-sm text-gray-600 mt-2">
              Current Balance:{' '}
              <span className="font-bold text-red-600">${totalBalance.toFixed(2)} (Payable)</span>
            </div>
          </div>

          <form onSubmit={onSubmit}>
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
                    onChange={(e) => onPaymentDataChange({ amount: e.target.value })}
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
                  onChange={(e) => onPaymentDataChange({ accountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select Payment Account --</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - Balance: ${account.currentBalance.toFixed(2)}
                    </option>
                  ))}
                </select>
                {paymentData.accountId && paymentData.amount && selectedAccount && (
                  <>
                    {!isNaN(paymentAmount) && selectedAccount.currentBalance < paymentAmount ? (
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
                    ) : !isNaN(paymentAmount) ? (
                      <div className="mt-2 text-xs text-green-600">
                        ✓ Remaining balance after payment: $
                        {(selectedAccount.currentBalance - paymentAmount).toFixed(2)}
                      </div>
                    ) : null}
                  </>
                )}
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
                  onChange={(e) => onPaymentDataChange({ paymentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => onPaymentDataChange({ notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add payment notes..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
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
  )
}

// Export the PDF generation function separately
export function generatePaymentPDF(
  supplier: Supplier,
  payment: PaymentReceipt,
  storeInfo: {
    storeName?: string
    storePhone?: string
    storeEmail?: string
    storeAddress?: string
    currency: string
    userName?: string
  }
): void {
  const doc = new jsPDF()
  const { storeName, storePhone, storeEmail, storeAddress, currency, userName } = storeInfo

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
  doc.text(`Generated on: ${new Date().toLocaleString()} by ${userName || 'System'}`, 105, 277, {
    align: 'center'
  })

  // Save PDF
  const fileName = `Payment_${payment.referenceNumber}_${supplier.code}.pdf`
  doc.save(fileName)
}
