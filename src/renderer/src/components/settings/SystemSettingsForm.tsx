import { Paper, Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material'

interface SystemSettingsFormProps {
  taxRate: string
  currency: string
  lowStockThreshold: string
  onTaxRateChange: (value: string) => void
  onCurrencyChange: (value: string) => void
  onLowStockThresholdChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export default function SystemSettingsForm({
  taxRate,
  currency,
  lowStockThreshold,
  onTaxRateChange,
  onCurrencyChange,
  onLowStockThresholdChange,
  onSubmit
}: SystemSettingsFormProps): React.JSX.Element {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="semibold" gutterBottom>
          System Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure system-wide settings
        </Typography>
      </Box>

      <Box component="form" onSubmit={onSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3
          }}
        >
          <TextField
            label="Default Tax Rate (%)"
            type="number"
            value={taxRate}
            onChange={(e) => onTaxRateChange(e.target.value)}
            placeholder="Enter tax rate"
            inputProps={{ step: '0.01' }}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select value={currency} onChange={(e) => onCurrencyChange(e.target.value)} label="Currency">
              <MenuItem value="USD">USD - US Dollar</MenuItem>
              <MenuItem value="EUR">EUR - Euro</MenuItem>
              <MenuItem value="GBP">GBP - British Pound</MenuItem>
              <MenuItem value="BDT">BDT - Bangladeshi Taka</MenuItem>
              <MenuItem value="INR">INR - Indian Rupee</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Low Stock Threshold"
            type="number"
            value={lowStockThreshold}
            onChange={(e) => onLowStockThresholdChange(e.target.value)}
            placeholder="Enter threshold quantity"
            fullWidth
          />
        </Box>

        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Button type="submit" variant="contained" size="large">
            Save Changes
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}
