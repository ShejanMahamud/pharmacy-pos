import { Avatar, Box, Paper, Typography } from '@mui/material'
import { TopProduct } from '../../types/report'

interface TopProductsListProps {
  products: TopProduct[]
  currencySymbol: string
  title?: string
}

export default function TopProductsList({
  products,
  currencySymbol,
  title = 'Top Selling Products'
}: TopProductsListProps): React.JSX.Element {
  return (
    <Paper>
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="semibold">
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {products.length > 0 ? (
            products.map((product, index) => (
              <Box
                key={product.id}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 'bold',
                      mr: 2,
                      fontSize: '0.875rem'
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.quantity} units sold
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  fontWeight="semibold"
                  sx={{
                    color: 'primary.main'
                  }}
                >
                  {currencySymbol}
                  {product.revenue.toFixed(2)}
                </Typography>
              </Box>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No products sold in this period
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  )
}
