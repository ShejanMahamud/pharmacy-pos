import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import { Category } from '../../types/product'

interface ProductFiltersProps {
  searchTerm: string
  categoryFilter: string
  categories: Category[]
  onSearchChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
}

export default function ProductFilters({
  searchTerm,
  categoryFilter,
  categories,
  onSearchChange,
  onCategoryFilterChange
}: ProductFiltersProps): React.JSX.Element {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <TextField
        placeholder="Search by name, SKU or barcode..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        sx={{ flex: 1, minWidth: 300, maxWidth: 500 }}
      />

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={categoryFilter}
          label="Category"
          onChange={(e) => onCategoryFilterChange(e.target.value)}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}
