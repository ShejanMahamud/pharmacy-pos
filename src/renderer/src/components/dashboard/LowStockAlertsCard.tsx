import { CheckCircle, ChevronRight, Warning } from '@mui/icons-material'
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
import { LowStockItem } from '../../types/dashboard'

interface LowStockAlertsCardProps {
  items: LowStockItem[]
  currencySymbol: string
}

export default function LowStockAlertsCard({
  items,
  currencySymbol
}: LowStockAlertsCardProps): React.JSX.Element {
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
            Low Stock Alerts
          </Typography>
          <Link
            href="#/inventory"
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

        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              All items are well stocked
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {items.map((item, index) => (
              <Box key={item.id}>
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
                    <Avatar sx={{ bgcolor: '#ffebee' }}>
                      <Warning sx={{ color: '#f44336' }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.productName}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Current: {item.currentStock} | Min: {item.minimumStock}
                      </Typography>
                    }
                  />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                      {item.currentStock} left
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {currencySymbol}
                      {item.unitPrice != null ? item.unitPrice.toFixed(2) : '0.00'}
                    </Typography>
                  </Box>
                </ListItem>
                {index < items.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}
