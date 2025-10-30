import { Box, Typography } from '@mui/material'

export default function InventoryHeader() {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
        Inventory Management
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
        Track and manage stock levels across your pharmacy
      </Typography>
    </Box>
  )
}
