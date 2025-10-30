import InfoIcon from '@mui/icons-material/Info'
import {
  Alert,
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { ProductFormData, Unit } from '../../../types/product'

interface UnitSectionProps {
  formData: ProductFormData
  units: Unit[]
  onFormChange: (updates: Partial<ProductFormData>) => void
}

export default function UnitSection({
  formData,
  units,
  onFormChange
}: UnitSectionProps): React.JSX.Element {
  return (
    <>
      <FormControl fullWidth required>
        <InputLabel>Base Unit (Smallest Unit)</InputLabel>
        <Select
          value={formData.unit}
          label="Base Unit (Smallest Unit)"
          onChange={(e) => onFormChange({ unit: e.target.value })}
        >
          <MenuItem value="">Select Base Unit</MenuItem>
          {units
            .filter((u) => u.type === 'base')
            .map((unit) => (
              <MenuItem key={unit.id} value={unit.name.toLowerCase()}>
                {unit.name} ({unit.abbreviation})
              </MenuItem>
            ))}
        </Select>
        <FormHelperText>
          The smallest unit customers can buy (e.g., 1 tablet, 1 strip)
        </FormHelperText>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Package Unit (Bulk Unit)</InputLabel>
        <Select
          value={formData.packageUnit}
          label="Package Unit (Bulk Unit)"
          onChange={(e) => onFormChange({ packageUnit: e.target.value })}
        >
          <MenuItem value="">Select Package Unit</MenuItem>
          {units
            .filter((u) => u.type === 'package')
            .map((unit) => (
              <MenuItem key={unit.id} value={unit.name}>
                {unit.name} ({unit.abbreviation})
              </MenuItem>
            ))}
        </Select>
        <FormHelperText>How you purchase from suppliers (e.g., Box, Bottle)</FormHelperText>
      </FormControl>

      <TextField
        fullWidth
        type="number"
        label="Units Per Package"
        value={formData.unitsPerPackage}
        onChange={(e) => onFormChange({ unitsPerPackage: parseInt(e.target.value) || 1 })}
        placeholder="1"
        inputProps={{ min: 1 }}
        helperText="How many base units in one package? (e.g., 1 Box = 10 Strips)"
      />

      {formData.packageUnit && formData.unitsPerPackage > 1 && (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Alert severity="info" icon={<InfoIcon />}>
            <Typography variant="body2">
              Conversion: 1 {formData.packageUnit} = {formData.unitsPerPackage} {formData.unit}
              {formData.unitsPerPackage > 1 ? 's' : ''}
            </Typography>
          </Alert>
        </Box>
      )}
    </>
  )
}
