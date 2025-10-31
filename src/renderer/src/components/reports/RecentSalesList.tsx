import { People, Person } from '@mui/icons-material'
import { Avatar, Box, Paper, Typography } from '@mui/material'
import { RecentSale } from '../../types/report'

interface RecentSalesListProps {
  sales: RecentSale[]
  currencySymbol: string
  title?: string
  showCustomerIcon?: boolean
}

export default function RecentSalesList({
  sales,
  currencySymbol,
  title = 'Recent Sales',
  showCustomerIcon = false
}: RecentSalesListProps): React.JSX.Element {
  return (
    <Paper>
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="semibold">
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sales.length > 0 ? (
            sales.map((sale) => (
              <Box
                key={sale.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  ...(showCustomerIcon && {
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1
                  })
                }}
              >
                {showCustomerIcon ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {sale.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sale.invoiceNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {new Date(sale.date).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {sale.invoiceNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {sale.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {new Date(sale.date).toLocaleString()}
                    </Typography>
                  </Box>
                )}
                <Typography
                  variant={showCustomerIcon ? 'h6' : 'body2'}
                  fontWeight="semibold"
                  sx={{ textAlign: 'right', color: 'primary.main' }}
                >
                  {currencySymbol}
                  {sale.total.toFixed(2)}
                </Typography>
              </Box>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {showCustomerIcon ? (
                <Box>
                  <People sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No customer transactions yet
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent sales
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  )
}
