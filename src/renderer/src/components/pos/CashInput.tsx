import { Box, Button, TextField, Typography } from '@mui/material'

interface CashInputProps {
  cashReceived: string
  total: number
  currencySymbol: string
  onCashChange: (value: string) => void
}

export default function CashInput({
  cashReceived,
  total,
  currencySymbol,
  onCashChange
}: CashInputProps): React.JSX.Element {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8rem' }}>
        Cash Received
      </Typography>
      <TextField
        fullWidth
        size="small"
        type="number"
        value={cashReceived}
        onChange={(e) => onCashChange(e.target.value)}
        placeholder="0.00"
        sx={{ mb: 0.5, bgcolor: 'white' }}
      />

      {/* Quick Amounts */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[50, 100, 200, 500, 1000].map((amount) => (
          <Button
            key={amount}
            fullWidth
            variant="outlined"
            size="small"
            onClick={() => onCashChange(amount.toString())}
            sx={{ textTransform: 'none', minWidth: 0, fontSize: '0.7rem', py: 0.25 }}
          >
            {amount}
          </Button>
        ))}
        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={() => onCashChange(total.toFixed(2))}
          sx={{ textTransform: 'none', minWidth: 0, fontSize: '0.7rem', py: 0.25 }}
        >
          Exact
        </Button>
      </Box>
    </Box>
  )
}
