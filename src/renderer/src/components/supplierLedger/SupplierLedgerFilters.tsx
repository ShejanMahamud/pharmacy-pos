import { Box, FormControl, InputLabel, MenuItem, Paper, Select, TextField } from '@mui/material'
import { Supplier } from '../../types/supplierLedger'

interface SupplierLedgerFiltersProps {
  suppliers: Supplier[]
  selectedSupplier: string
  dateFrom: string
  dateTo: string
  onSupplierChange: (supplierId: string) => void
  onDateFromChange: (date: string) => void
  onDateToChange: (date: string) => void
}

export default function SupplierLedgerFilters({
  suppliers,
  selectedSupplier,
  dateFrom,
  dateTo,
  onSupplierChange,
  onDateFromChange,
  onDateToChange
}: SupplierLedgerFiltersProps): React.JSX.Element {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: 2
        }}
      >
        <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
          <FormControl fullWidth required>
            <InputLabel>Select Supplier</InputLabel>
            <Select
              value={selectedSupplier}
              label="Select Supplier"
              onChange={(e) => onSupplierChange(e.target.value)}
            >
              <MenuItem value="">-- Select a supplier --</MenuItem>
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.name} ({supplier.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TextField
          fullWidth
          label="From Date"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          fullWidth
          label="To Date"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    </Paper>
  )
}
