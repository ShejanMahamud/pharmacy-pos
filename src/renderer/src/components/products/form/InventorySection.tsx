import { Box, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material'
import { ProductFormData } from '../../../types/product'

interface InventorySectionProps {
  formData: ProductFormData
  onFormChange: (updates: Partial<ProductFormData>) => void
}

export default function InventorySection({
  formData,
  onFormChange
}: InventorySectionProps): React.JSX.Element {
  return (
    <>
      <Box sx={{ gridColumn: '1 / -1' }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
        >
          Inventory Settings
        </Typography>
      </Box>

      <TextField
        fullWidth
        required
        type="number"
        label="Current Stock Quantity"
        value={formData.stockQuantity}
        onChange={(e) => onFormChange({ stockQuantity: parseInt(e.target.value) || 0 })}
        placeholder="0"
        inputProps={{ min: 0 }}
        helperText="Enter the current available stock quantity"
      />

      <TextField
        fullWidth
        type="number"
        label="Reorder Level"
        value={formData.reorderLevel}
        onChange={(e) => onFormChange({ reorderLevel: parseInt(e.target.value) || 0 })}
        placeholder="10"
        inputProps={{ min: 0 }}
        helperText="Alert when stock falls below this level"
      />

      <Box sx={{ gridColumn: '1 / -1' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.prescriptionRequired}
              onChange={(e) => onFormChange({ prescriptionRequired: e.target.checked })}
            />
          }
          label="Prescription Required"
        />
      </Box>
    </>
  )
}
