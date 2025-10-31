import { ChevronRight, Error, Warning } from '@mui/icons-material'
import { Box, Button, Chip, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

interface InventoryAlertsProps {
  lowStockCount: number
  outOfStockCount: number
}

export default function InventoryAlerts({
  lowStockCount,
  outOfStockCount
}: InventoryAlertsProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3
      }}
    >
      {/* Low Stock Alert */}
      <Paper>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6" fontWeight="semibold">
            Low Stock Alert
          </Typography>
          <Chip
            label={`${lowStockCount} items`}
            color="warning"
            size="small"
            sx={{ fontWeight: 'medium' }}
          />
        </Box>
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4
            }}
          >
            <Warning sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" fontWeight="semibold" gutterBottom>
              {lowStockCount} Products Need Restocking
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 3, maxWidth: 300 }}
            >
              These items are running low and should be restocked soon
            </Typography>
            <Button
              component={Link}
              to="/inventory"
              variant="contained"
              color="warning"
              endIcon={<ChevronRight />}
            >
              View Inventory
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Out of Stock Alert */}
      <Paper>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6" fontWeight="semibold">
            Out of Stock
          </Typography>
          <Chip
            label={`${outOfStockCount} items`}
            color="error"
            size="small"
            sx={{ fontWeight: 'medium' }}
          />
        </Box>
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4
            }}
          >
            <Error sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" fontWeight="semibold" gutterBottom>
              {outOfStockCount} Products Out of Stock
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 3, maxWidth: 300 }}
            >
              These items are completely out of stock and need immediate restocking
            </Typography>
            <Button
              component={Link}
              to="/purchases"
              variant="contained"
              color="error"
              endIcon={<ChevronRight />}
            >
              Create Purchase Order
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
