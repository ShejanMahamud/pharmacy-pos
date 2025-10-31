import { ArrowBack, PictureAsPdf } from '@mui/icons-material'
import { Box, Button, IconButton, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

interface SupplierLedgerHeaderProps {
  onExportPdf: () => void
  canExport: boolean
}

export default function SupplierLedgerHeader({
  onExportPdf,
  canExport
}: SupplierLedgerHeaderProps): React.JSX.Element {
  return (
    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton component={Link} to="/suppliers" sx={{ color: 'text.secondary' }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Supplier Ledger
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View supplier account statements and transactions
          </Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        startIcon={<PictureAsPdf />}
        onClick={onExportPdf}
        disabled={!canExport}
      >
        Export PDF
      </Button>
    </Box>
  )
}
