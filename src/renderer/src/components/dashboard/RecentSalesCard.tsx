import { CheckCircle, ChevronRight, Description } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material'
import { RecentSale } from '../../types/dashboard'

interface RecentSalesCardProps {
  sales: RecentSale[]
  currencySymbol: string
}

export default function RecentSalesCard({
  sales,
  currencySymbol
}: RecentSalesCardProps): React.JSX.Element {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        border: '1px solid #e0e0e0'
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Sales
          </Typography>
          <Link
            href="#/sales"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            View All
            <ChevronRight sx={{ fontSize: 16 }} />
          </Link>
        </Box>

        {sales.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
            <CheckCircle sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No recent sales
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {sales.map((sale, index) => (
              <Box key={sale.id}>
                <ListItem
                  sx={{
                    px: 3,
                    py: 2,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#e3f2fd' }}>
                      <Description sx={{ color: '#2196f3' }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {sale.invoiceNumber}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {sale.customerName || 'Walk-in Customer'}
                      </Typography>
                    }
                  />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {currencySymbol}
                      {sale.totalAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {new Date(sale.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                </ListItem>
                {index < sales.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}
