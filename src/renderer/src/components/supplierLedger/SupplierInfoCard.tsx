import { Box, Paper, Typography } from '@mui/material'
import { Supplier } from '../../types/supplierLedger'

interface SupplierInfoCardProps {
  supplier: Supplier
  totalDebit: number
  totalCredit: number
  currentBalance: number
  formatCurrency: (amount: number) => string
}

export default function SupplierInfoCard({
  supplier,
  totalDebit,
  totalCredit,
  currentBalance,
  formatCurrency
}: SupplierInfoCardProps): React.JSX.Element {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        {/* Supplier Details */}
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Supplier Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130 }}>
                Supplier Name:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {supplier.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130 }}>
                Supplier Code:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {supplier.code}
              </Typography>
            </Box>
            {supplier.contactPerson && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130 }}>
                  Contact Person:
                </Typography>
                <Typography variant="body2">{supplier.contactPerson}</Typography>
              </Box>
            )}
            {supplier.phone && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130 }}>
                  Phone:
                </Typography>
                <Typography variant="body2">{supplier.phone}</Typography>
              </Box>
            )}
            {supplier.email && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130 }}>
                  Email:
                </Typography>
                <Typography variant="body2">{supplier.email}</Typography>
              </Box>
            )}
            {supplier.creditLimit !== undefined && supplier.creditLimit > 0 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130 }}>
                  Credit Limit:
                </Typography>
                <Typography variant="body2">{formatCurrency(supplier.creditLimit)}</Typography>
              </Box>
            )}
            {supplier.creditDays !== undefined && supplier.creditDays > 0 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130 }}>
                  Credit Days:
                </Typography>
                <Typography variant="body2">{supplier.creditDays} days</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Account Summary */}
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Account Summary
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ bgcolor: 'primary.50', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Purchases (Debit)
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {formatCurrency(totalDebit)}
                </Typography>
              </Box>
            </Paper>

            <Paper sx={{ bgcolor: 'success.50', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Payments (Credit)
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(totalCredit)}
                </Typography>
              </Box>
            </Paper>

            <Paper
              sx={{
                bgcolor:
                  currentBalance > 0 ? 'error.50' : currentBalance < 0 ? 'success.50' : 'grey.100',
                p: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  Current Balance
                </Typography>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={
                      currentBalance > 0
                        ? 'error.main'
                        : currentBalance < 0
                          ? 'success.main'
                          : 'text.primary'
                    }
                  >
                    {formatCurrency(Math.abs(currentBalance))}
                  </Typography>
                  {currentBalance !== 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {currentBalance > 0 ? '(Payable)' : '(Receivable)'}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}
