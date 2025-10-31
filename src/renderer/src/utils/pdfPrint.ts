import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface SaleItem {
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface ReceiptData {
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

export const generatePDFReceipt = (receiptData: ReceiptData, currencySymbol: string): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = 20

  // Header - Store Info
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(receiptData.storeName || 'MedixPOS', pageWidth / 2, yPos, { align: 'center' })

  yPos += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (receiptData.storeAddress) {
    doc.text(receiptData.storeAddress, pageWidth / 2, yPos, { align: 'center' })
    yPos += 5
  }
  if (receiptData.storePhone) {
    doc.text(receiptData.storePhone, pageWidth / 2, yPos, { align: 'center' })
    yPos += 5
  }

  // Divider
  yPos += 5
  doc.setLineWidth(0.5)
  doc.line(20, yPos, pageWidth - 20, yPos)
  yPos += 10

  // Invoice Details
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('SALES RECEIPT', pageWidth / 2, yPos, { align: 'center' })
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice: ${receiptData.invoiceNumber}`, 20, yPos)
  doc.text(
    `Date: ${new Date(receiptData.date).toLocaleDateString()} ${new Date(receiptData.date).toLocaleTimeString()}`,
    pageWidth - 20,
    yPos,
    { align: 'right' }
  )
  yPos += 6

  if (receiptData.customerName) {
    doc.text(`Customer: ${receiptData.customerName}`, 20, yPos)
    yPos += 6
  }

  const paymentMethodLabel =
    receiptData.paymentMethod === 'cash'
      ? 'Cash'
      : receiptData.paymentMethod === 'bank'
        ? 'Bank'
        : receiptData.paymentMethod === 'mobile_banking'
          ? 'Mobile Banking'
          : receiptData.paymentMethod

  doc.text(`Payment: ${paymentMethodLabel}`, 20, yPos)
  yPos += 10

  // Items Table
  const tableData = receiptData.items.map((item) => [
    item.productName,
    item.quantity.toString(),
    `${currencySymbol}${item.unitPrice.toFixed(2)}`,
    `${currencySymbol}${item.subtotal.toFixed(2)}`
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Product', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  })

  // Get Y position after table
  yPos = (doc as any).lastAutoTable.finalY + 10

  // Summary Section
  const summaryX = pageWidth - 70
  doc.setFontSize(10)

  doc.text('Subtotal:', summaryX, yPos)
  doc.text(`${currencySymbol}${receiptData.subtotal.toFixed(2)}`, pageWidth - 20, yPos, {
    align: 'right'
  })
  yPos += 6

  if (receiptData.discountAmount > 0) {
    doc.text('Discount:', summaryX, yPos)
    if (receiptData.pointsRedeemed && receiptData.pointsRedeemed > 0) {
      doc.setFontSize(8)
      doc.text(`(incl. ${receiptData.pointsRedeemed} points)`, summaryX + 25, yPos)
      doc.setFontSize(10)
    }
    doc.text(`-${currencySymbol}${receiptData.discountAmount.toFixed(2)}`, pageWidth - 20, yPos, {
      align: 'right'
    })
    yPos += 6
  }

  if (receiptData.taxAmount > 0) {
    doc.text('Tax:', summaryX, yPos)
    doc.text(`${currencySymbol}${receiptData.taxAmount.toFixed(2)}`, pageWidth - 20, yPos, {
      align: 'right'
    })
    yPos += 6
  }

  // Total Line
  yPos += 2
  doc.setLineWidth(0.3)
  doc.line(summaryX, yPos, pageWidth - 20, yPos)
  yPos += 7

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL:', summaryX, yPos)
  doc.text(`${currencySymbol}${receiptData.totalAmount.toFixed(2)}`, pageWidth - 20, yPos, {
    align: 'right'
  })
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Paid:', summaryX, yPos)
  doc.text(`${currencySymbol}${receiptData.paidAmount.toFixed(2)}`, pageWidth - 20, yPos, {
    align: 'right'
  })
  yPos += 6

  if (receiptData.changeAmount > 0) {
    doc.text('Change:', summaryX, yPos)
    doc.text(`${currencySymbol}${receiptData.changeAmount.toFixed(2)}`, pageWidth - 20, yPos, {
      align: 'right'
    })
  }

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 30
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' })
  yPos += 5
  doc.text('Please keep this receipt for your records', pageWidth / 2, yPos, { align: 'center' })
  yPos += 10
  doc.setFontSize(8)
  doc.text(`Printed: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' })

  return doc
}

export const printPDFReceipt = (receiptData: ReceiptData, currencySymbol: string): void => {
  const doc = generatePDFReceipt(receiptData, currencySymbol)
  doc.autoPrint()
  window.open(doc.output('bloburl'), '_blank')
}

export const downloadPDFReceipt = (receiptData: ReceiptData, currencySymbol: string): void => {
  const doc = generatePDFReceipt(receiptData, currencySymbol)
  doc.save(`receipt-${receiptData.invoiceNumber}.pdf`)
}
