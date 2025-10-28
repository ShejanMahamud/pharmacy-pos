import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'
import { LedgerEntry, Supplier } from '../types/supplierLedger'

interface UsePdfExportParams {
  storeName: string
  storePhone: string
  storeEmail: string
  storeAddress: string
  formatCurrency: (amount: number) => string
}

export function usePdfExport({
  storeName,
  storePhone,
  storeEmail,
  storeAddress,
  formatCurrency
}: UsePdfExportParams) {
  const generatePDF = (
    supplier: Supplier,
    entries: LedgerEntry[],
    dateFrom: string,
    dateTo: string,
    totalDebit: number,
    totalCredit: number,
    currentBalance: number
  ): void => {
    if (!supplier || entries.length === 0) {
      toast.error('No data to export')
      return
    }

    try {
      const doc = new jsPDF()

      // Add company header
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
      doc.text('SUPPLIER LEDGER STATEMENT', 105, 55, { align: 'center' })

      // Line separator
      doc.setLineWidth(0.5)
      doc.line(20, 60, 190, 60)

      // Supplier information
      let yPos = 70
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('SUPPLIER DETAILS:', 20, yPos)

      yPos += 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Name: ${supplier.name}`, 20, yPos)
      doc.text(`Code: ${supplier.code}`, 120, yPos)

      if (supplier.contactPerson) {
        yPos += 6
        doc.text(`Contact Person: ${supplier.contactPerson}`, 20, yPos)
      }

      if (supplier.phone || supplier.email) {
        yPos += 6
        if (supplier.phone) {
          doc.text(`Phone: ${supplier.phone}`, 20, yPos)
        }
        if (supplier.email) {
          doc.text(`Email: ${supplier.email}`, 120, yPos)
        }
      }

      // Date range
      yPos += 8
      doc.setFont('helvetica', 'bold')
      doc.text('Period:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      const fromDate = dateFrom ? new Date(dateFrom).toLocaleDateString() : 'Beginning'
      const toDate = dateTo ? new Date(dateTo).toLocaleDateString() : 'Today'
      doc.text(`${fromDate} to ${toDate}`, 45, yPos)

      // Summary section
      yPos += 10
      doc.setLineWidth(0.3)
      doc.line(20, yPos, 190, yPos)
      yPos += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('ACCOUNT SUMMARY:', 20, yPos)

      yPos += 8
      doc.setFont('helvetica', 'normal')
      doc.text(`Total Purchases (Debit):`, 20, yPos)
      doc.text(formatCurrency(totalDebit), 100, yPos)

      yPos += 6
      doc.text(`Total Payments (Credit):`, 20, yPos)
      doc.text(formatCurrency(totalCredit), 100, yPos)

      yPos += 6
      doc.setFont('helvetica', 'bold')
      doc.text(`Current Balance:`, 20, yPos)
      const balanceText = `${formatCurrency(Math.abs(currentBalance))} ${currentBalance > 0 ? '(Payable)' : currentBalance < 0 ? '(Receivable)' : ''}`
      doc.text(balanceText, 100, yPos)

      // Ledger table
      yPos += 10
      doc.setLineWidth(0.3)
      doc.line(20, yPos, 190, yPos)
      yPos += 5

      // Use autoTable for the ledger entries
      const tableData = entries.map((entry) => [
        new Date(entry.transactionDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        entry.type.replace('_', ' ').toUpperCase(),
        entry.referenceNumber,
        entry.description,
        entry.debit > 0 ? formatCurrency(entry.debit) : '-',
        entry.credit > 0 ? formatCurrency(entry.credit) : '-',
        formatCurrency(entry.balance)
      ])

      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Type', 'Reference', 'Description', 'Debit', 'Credit', 'Balance']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: 50
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 45 },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 20, halign: 'right' },
          6: { cellWidth: 20, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => {
          // Footer on each page
          const pageCount = doc.internal.pages.length - 1
          doc.setFontSize(8)
          doc.setFont('helvetica', 'italic')
          doc.text(
            `Generated on: ${new Date().toLocaleString()}`,
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          )
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            190,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
          )
        }
      })

      // Save PDF
      const fileName = `Supplier_Ledger_${supplier.code}_${dateFrom || 'all'}_to_${dateTo || 'all'}.pdf`
      doc.save(fileName)
      toast.success('Ledger exported to PDF successfully!')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF. Please try again.')
    }
  }

  return { generatePDF }
}
