import { AutoAwesome } from '@mui/icons-material'
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { Category, ProductFormData, Supplier } from '../../../types/product'

interface BasicInfoSectionProps {
  formData: ProductFormData
  categories: Category[]
  suppliers: Supplier[]
  onFormChange: (updates: Partial<ProductFormData>) => void
  onGenerateSKU: () => void
}

export default function BasicInfoSection({
  formData,
  categories,
  suppliers,
  onFormChange,
  onGenerateSKU
}: BasicInfoSectionProps): React.JSX.Element {
  return (
    <>
      <Box sx={{ gridColumn: '1 / -1' }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
        >
          Basic Information
        </Typography>
      </Box>
      <TextField
        fullWidth
        required
        label="Product Name"
        value={formData.name}
        onChange={(e) => onFormChange({ name: e.target.value })}
        placeholder="Enter product name"
      />
      <TextField
        fullWidth
        label="Generic Name"
        value={formData.genericName}
        onChange={(e) => onFormChange({ genericName: e.target.value })}
        placeholder="Enter generic name"
      />
      <TextField
        fullWidth
        label="Strength"
        value={formData.strength}
        onChange={(e) => onFormChange({ strength: e.target.value })}
        placeholder="e.g., 500mg, 10ml, 250mg/5ml"
        helperText="Medicine strength (e.g., 500mg, 650mg, 10ml)"
      />
      <TextField
        fullWidth
        required
        label="SKU"
        value={formData.sku}
        onChange={(e) => onFormChange({ sku: e.target.value })}
        placeholder="Enter SKU"
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={onGenerateSKU}
              size="small"
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.50' }
              }}
              title="Generate SKU"
            >
              <AutoAwesome fontSize="small" />
            </IconButton>
          )
        }}
      />
      <TextField
        fullWidth
        disabled
        label="Barcode (Auto-generated)"
        value={formData.barcode}
        placeholder="Barcode will be generated automatically"
        helperText="Barcode is automatically generated when product is created"
      />
      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select
          value={formData.categoryId}
          label="Category"
          onChange={(e) => onFormChange({ categoryId: e.target.value })}
        >
          <MenuItem value="">Select Category</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Supplier</InputLabel>
        <Select
          value={formData.supplierId}
          label="Supplier"
          onChange={(e) => onFormChange({ supplierId: e.target.value })}
        >
          <MenuItem value="">Select Supplier</MenuItem>
          {suppliers.map((sup) => (
            <MenuItem key={sup.id} value={sup.id}>
              {sup.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Manufacturer"
        value={formData.manufacturer}
        onChange={(e) => onFormChange({ manufacturer: e.target.value })}
        placeholder="Enter manufacturer"
      />
      <TextField
        fullWidth
        required
        label="Shelf Location"
        value={formData.shelf}
        onChange={(e) => onFormChange({ shelf: e.target.value })}
        placeholder="e.g., A1, B2, C3"
        helperText="Which shelf the medicine is stored (e.g., A1, B2, Rack-5)"
      />
      <Box sx={{ gridColumn: '1 / -1' }}>
        <TextField
          fullWidth
          label="Product Image URL"
          value={formData.imageUrl}
          onChange={(e) => onFormChange({ imageUrl: e.target.value })}
          placeholder="Enter image URL (optional)"
          helperText="Optional: URL or path to product image"
        />
      </Box>
      <Box sx={{ gridColumn: '1 / -1' }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          value={formData.description}
          onChange={(e) => onFormChange({ description: e.target.value })}
          placeholder="Enter product description"
        />
      </Box>
    </>
  )
}
