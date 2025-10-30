import { ArrowBack } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export default function CategoryUnitHeader() {
  return (
    <Box sx={{ mb: 4 }}>
      <Button component={Link} to="/products" startIcon={<ArrowBack />} sx={{ mb: 2 }}>
        Back to Products
      </Button>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Categories & Units Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage product categories and unit types
      </Typography>
    </Box>
  )
}
