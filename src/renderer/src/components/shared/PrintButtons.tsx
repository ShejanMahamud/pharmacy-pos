import { Print, Receipt } from '@mui/icons-material'
import { Box, Button } from '@mui/material'

interface PrintButtonsProps {
  onPdfPrint: () => void
  onThermalPrint: () => void
  disabled?: boolean
}

export default function PrintButtons({
  onPdfPrint,
  onThermalPrint,
  disabled = false
}: PrintButtonsProps): React.JSX.Element {
  return (
    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
      <Button
        variant="outlined"
        startIcon={<Print />}
        onClick={onPdfPrint}
        disabled={disabled}
        sx={{ flex: 1, textTransform: 'none' }}
      >
        PDF Print
      </Button>
      <Button
        variant="contained"
        startIcon={<Receipt />}
        onClick={onThermalPrint}
        disabled={disabled}
        sx={{ flex: 1, textTransform: 'none' }}
      >
        Thermal Print
      </Button>
    </Box>
  )
}
