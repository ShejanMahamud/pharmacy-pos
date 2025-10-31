interface SaleItem {
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface ThermalReceiptData {
  invoiceNumber: string
  customerName?: string
  date: string
  items: SaleItem[]
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  changeAmount: number
  paymentMethod: string
  pointsRedeemed?: number
  storeName?: string
  storeAddress?: string
  storePhone?: string
}

export const generateThermalReceipt = (
  receiptData: ThermalReceiptData,
  currencySymbol: string
): string => {
  const width = 32 // Characters width for thermal printer (typically 32 or 40)
  const line = '='.repeat(width)
  const dashes = '-'.repeat(width)

  let receipt = ''

  // Helper functions
  const center = (text: string): string => {
    const padding = Math.max(0, Math.floor((width - text.length) / 2))
    return ' '.repeat(padding) + text
  }

  const leftRight = (left: string, right: string): string => {
    const spaces = Math.max(1, width - left.length - right.length)
    return left + ' '.repeat(spaces) + right
  }

  const truncate = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text
  }

  // Header
  receipt += center(receiptData.storeName || 'MedixPOS') + '\n'
  if (receiptData.storeAddress) {
    receipt += center(receiptData.storeAddress) + '\n'
  }
  if (receiptData.storePhone) {
    receipt += center(receiptData.storePhone) + '\n'
  }
  receipt += line + '\n'

  // Invoice Details
  receipt += center('SALES RECEIPT') + '\n'
  receipt += dashes + '\n'
  receipt += leftRight('Invoice:', receiptData.invoiceNumber) + '\n'
  receipt += `Date: ${new Date(receiptData.date).toLocaleDateString()}\n`
  receipt += `Time: ${new Date(receiptData.date).toLocaleTimeString()}\n`

  if (receiptData.customerName) {
    receipt += leftRight('Customer:', truncate(receiptData.customerName, 20)) + '\n'
  }

  const paymentMethodLabel =
    receiptData.paymentMethod === 'cash'
      ? 'Cash'
      : receiptData.paymentMethod === 'bank'
        ? 'Bank'
        : receiptData.paymentMethod === 'mobile_banking'
          ? 'Mobile Banking'
          : receiptData.paymentMethod

  receipt += leftRight('Payment:', paymentMethodLabel) + '\n'
  receipt += line + '\n'

  // Items Header
  receipt += 'Item                  Qty  Total\n'
  receipt += dashes + '\n'

  // Items
  receiptData.items.forEach((item) => {
    const name = truncate(item.productName, 20)
    receipt += name + '\n'
    const qtyPrice = `${item.quantity} x ${currencySymbol}${item.unitPrice.toFixed(2)}`
    const total = `${currencySymbol}${item.subtotal.toFixed(2)}`
    receipt += leftRight('  ' + qtyPrice, total) + '\n'
  })

  receipt += line + '\n'

  // Summary
  receipt += leftRight('Subtotal:', `${currencySymbol}${receiptData.subtotal.toFixed(2)}`) + '\n'

  if (receiptData.discountAmount > 0) {
    let discountLine = 'Discount:'
    if (receiptData.pointsRedeemed && receiptData.pointsRedeemed > 0) {
      discountLine += ` (${receiptData.pointsRedeemed}pts)`
    }
    receipt +=
      leftRight(discountLine, `-${currencySymbol}${receiptData.discountAmount.toFixed(2)}`) + '\n'
  }

  if (receiptData.taxAmount > 0) {
    receipt += leftRight('Tax:', `${currencySymbol}${receiptData.taxAmount.toFixed(2)}`) + '\n'
  }

  receipt += dashes + '\n'
  receipt += leftRight('TOTAL:', `${currencySymbol}${receiptData.totalAmount.toFixed(2)}`) + '\n'
  receipt += dashes + '\n'

  receipt += leftRight('Paid:', `${currencySymbol}${receiptData.paidAmount.toFixed(2)}`) + '\n'

  if (receiptData.changeAmount > 0) {
    receipt +=
      leftRight('Change:', `${currencySymbol}${receiptData.changeAmount.toFixed(2)}`) + '\n'
  }

  receipt += line + '\n'

  // Footer
  receipt += center('Thank you for your') + '\n'
  receipt += center('business!') + '\n'
  receipt += '\n'
  receipt += center('Please keep this receipt') + '\n'
  receipt += '\n'
  receipt += center(new Date().toLocaleString()) + '\n'
  receipt += '\n\n\n' // Extra line feeds for paper cut

  return receipt
}

export const printThermalReceipt = (
  receiptData: ThermalReceiptData,
  currencySymbol: string
): void => {
  const receiptText = generateThermalReceipt(receiptData, currencySymbol)

  // Create a hidden iframe for printing
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to print receipts')
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${receiptData.invoiceNumber}</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            margin: 0;
            padding: 5mm;
            white-space: pre-wrap;
            width: 80mm;
            background: white;
          }
        </style>
      </head>
      <body>${receiptText}</body>
    </html>
  `)

  printWindow.document.close()

  // Wait for content to load then print
  setTimeout(() => {
    printWindow.focus()
    printWindow.print()
    // Close after printing or if user cancels
    setTimeout(() => {
      printWindow.close()
    }, 100)
  }, 250)
}

export const downloadThermalReceipt = (
  receiptData: ThermalReceiptData,
  currencySymbol: string
): void => {
  const receiptText = generateThermalReceipt(receiptData, currencySymbol)

  // Create a blob and download as text file
  const blob = new Blob([receiptText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `receipt-${receiptData.invoiceNumber}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
