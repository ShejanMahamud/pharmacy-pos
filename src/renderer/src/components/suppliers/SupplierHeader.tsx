import { Box, Typography } from '@mui/material'

export default function SupplierHeader(): React.JSX.Element {
  return (
    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Suppliers Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your pharmacy suppliers and vendor information
        </Typography>
      </Box>
    </Box>
  )
}
