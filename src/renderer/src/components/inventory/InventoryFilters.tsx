import { Add, Search } from '@mui/icons-material'
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  TextField
} from '@mui/material'

interface InventoryFiltersProps {
  searchTerm: string
  filterType: 'all' | 'low' | 'out'
  onSearchChange: (value: string) => void
  onFilterChange: (value: 'all' | 'low' | 'out') => void
  onAdjustStock: () => void
}

export default function InventoryFilters({
  searchTerm,
  filterType,
  onSearchChange,
  onFilterChange,
  onAdjustStock
}: InventoryFiltersProps) {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, flex: 1, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by product name, SKU or barcode..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 300, maxWidth: 500 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filterType}
              onChange={(e) => onFilterChange(e.target.value as 'all' | 'low' | 'out')}
            >
              <MenuItem value="all">All Items</MenuItem>
              <MenuItem value="low">Low Stock</MenuItem>
              <MenuItem value="out">Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Button variant="contained" startIcon={<Add />} onClick={onAdjustStock}>
          Adjust Stock
        </Button>
      </Box>
    </Paper>
  )
}
