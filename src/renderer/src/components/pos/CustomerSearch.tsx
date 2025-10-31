import { Search } from '@mui/icons-material'
import {
  Box,
  Chip,
  ClickAwayListener,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField
} from '@mui/material'
import { Customer } from '../../types/pos'

interface CustomerSearchProps {
  customerSearch: string
  selectedCustomer: Customer | null
  customers: Customer[]
  showDropdown: boolean
  onSearchChange: (value: string) => void
  onCustomerSelect: (customer: Customer) => void
  onCustomerClear: () => void
  onDropdownClose: () => void
  onFocus: () => void
}

export default function CustomerSearch({
  customerSearch,
  selectedCustomer,
  customers,
  showDropdown,
  onSearchChange,
  onCustomerSelect,
  onCustomerClear,
  onDropdownClose,
  onFocus
}: CustomerSearchProps): React.JSX.Element {
  return (
    <Box sx={{ position: 'relative', mb: 2 }}>
      <TextField
        fullWidth
        placeholder="Search customer..."
        value={customerSearch}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={onFocus}
        size="small"
        sx={{
          bgcolor: 'white',
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: selectedCustomer ? '#4caf50' : '#e0e0e0' }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          endAdornment: selectedCustomer ? (
            <Chip
              label={selectedCustomer.name}
              size="small"
              color="success"
              onDelete={onCustomerClear}
              sx={{ height: 24 }}
            />
          ) : null
        }}
      />
      {/* Customer Dropdown */}
      {showDropdown && customers.length > 0 && (
        <ClickAwayListener onClickAway={onDropdownClose}>
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              maxHeight: 200,
              overflow: 'auto',
              zIndex: 1000,
              mt: 0.5,
              boxShadow: 3
            }}
          >
            <List dense>
              {customers.map((customer) => (
                <ListItem
                  key={customer.id}
                  onClick={() => onCustomerSelect(customer)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#f5f5f5'
                    }
                  }}
                >
                  <ListItemText
                    primary={customer.name}
                    secondary={customer.phone || customer.email}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </ClickAwayListener>
      )}
    </Box>
  )
}
