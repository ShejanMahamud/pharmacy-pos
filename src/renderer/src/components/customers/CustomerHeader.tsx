import { Box, Typography } from '@mui/material'

export default function CustomerHeader() {
  return (
    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Customer Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage customer information and loyalty points
        </Typography>
      </Box>
    </Box>
  )
}
