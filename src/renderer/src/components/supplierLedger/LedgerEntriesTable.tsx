import { Receipt } from '@mui/icons-material'
import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material'
import { useState } from 'react'
import { LedgerEntry } from '../../types/supplierLedger'

interface LedgerEntriesTableProps {
  entries: LedgerEntry[]
  loading: boolean
  selectedSupplier: string
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalItems: number
  formatCurrency: (amount: number) => string
  getTypeColor: (type: string) => string
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

export default function LedgerEntriesTable({
  entries,
  loading,
  selectedSupplier,
  currentPage,
  itemsPerPage,
  totalPages,
  totalItems,
  formatCurrency,
  getTypeColor,
  onPageChange,
  onItemsPerPageChange
}: LedgerEntriesTableProps): React.JSX.Element {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.grey[300],
      color: theme.palette.text.secondary,
      fontWeight: 600,
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      letterSpacing: '0.5px'
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14
    }
  }))

  const handleChangePage = (_: unknown, newPage: number): void => {
    setPage(newPage)
    onPageChange(newPage + 1)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    onItemsPerPageChange(newRowsPerPage)
    setPage(0)
    onPageChange(1)
  }

  const getTypeChipColor = (
    type: string
  ): 'primary' | 'success' | 'warning' | 'secondary' | 'default' => {
    switch (type) {
      case 'purchase':
        return 'primary'
      case 'payment':
        return 'success'
      case 'return':
        return 'warning'
      case 'adjustment':
        return 'secondary'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <Paper sx={{ p: 12, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading ledger entries...
        </Typography>
      </Paper>
    )
  }

  if (!selectedSupplier) {
    return (
      <Paper sx={{ p: 12, textAlign: 'center' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'grey.200',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}
        >
          <Receipt sx={{ color: 'text.secondary' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          No Supplier Selected
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Please select a supplier to view ledger
        </Typography>
      </Paper>
    )
  }

  if (entries.length === 0) {
    return (
      <Paper sx={{ p: 12, textAlign: 'center' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'grey.200',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}
        >
          <Receipt sx={{ color: 'text.secondary' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          No Entries Found
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No ledger entries found for the selected period
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <TableContainer component={Paper} sx={{ maxHeight: 540, bgcolor: 'white' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Reference No</StyledTableCell>
              <StyledTableCell>Description</StyledTableCell>
              <StyledTableCell align="right">Debit</StyledTableCell>
              <StyledTableCell align="right">Credit</StyledTableCell>
              <StyledTableCell align="right">Balance</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(entry.transactionDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.type.replace('_', ' ')}
                    size="small"
                    color={getTypeChipColor(entry.type)}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {entry.referenceNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{entry.description}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600} color="error.main">
                    {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(entry.balance)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Paper>
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </Box>
  )
}
