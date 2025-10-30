import { Alert, Box, InputAdornment, TextField, Typography } from '@mui/material'
import { ProductFormData } from '../../../types/product'

interface PricingSectionProps {
  formData: ProductFormData
  currencySymbol: string
  onFormChange: (updates: Partial<ProductFormData>) => void
}

export default function PricingSection({
  formData,
  currencySymbol,
  onFormChange
}: PricingSectionProps): React.JSX.Element {
  const profitMargin =
    formData.sellingPrice > 0 && formData.costPrice > 0
      ? ((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100
      : 0

  return (
    <>
      <Box sx={{ gridColumn: '1 / -1' }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
        >
          Pricing & Tax
        </Typography>
      </Box>

      <TextField
        fullWidth
        required
        type="number"
        label="Cost Price (per base unit)"
        value={formData.costPrice}
        onChange={(e) => onFormChange({ costPrice: parseFloat(e.target.value) || 0 })}
        placeholder="0.00"
        InputProps={{
          startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>
        }}
        inputProps={{ min: 0, step: 0.01 }}
        helperText={`Cost per ${formData.unit} (not per ${formData.packageUnit || 'package'})`}
      />

      <TextField
        fullWidth
        required
        type="number"
        label="Selling Price (per base unit)"
        value={formData.sellingPrice}
        onChange={(e) => onFormChange({ sellingPrice: parseFloat(e.target.value) || 0 })}
        placeholder="0.00"
        InputProps={{
          startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>
        }}
        inputProps={{ min: 0, step: 0.01 }}
        helperText={`Selling price per ${formData.unit} to customers`}
      />

      <TextField
        fullWidth
        type="number"
        label="Tax Rate (%)"
        value={formData.taxRate}
        onChange={(e) => onFormChange({ taxRate: parseFloat(e.target.value) || 0 })}
        placeholder="0.00"
        inputProps={{ min: 0, step: 0.01 }}
      />

      <TextField
        fullWidth
        type="number"
        label="Discount (%)"
        value={formData.discountPercent}
        onChange={(e) => onFormChange({ discountPercent: parseFloat(e.target.value) || 0 })}
        placeholder="0.00"
        inputProps={{ min: 0, step: 0.01 }}
      />

      {profitMargin > 0 && (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Alert severity="success">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Profit Margin:</Typography>
              <Typography variant="h6">
                {profitMargin.toFixed(2)}% ({currencySymbol}
                {(formData.sellingPrice - formData.costPrice).toFixed(2)})
              </Typography>
            </Box>
          </Alert>
        </Box>
      )}
    </>
  )
}
