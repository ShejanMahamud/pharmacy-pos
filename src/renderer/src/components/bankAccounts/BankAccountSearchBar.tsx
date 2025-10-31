import { Add, Search } from '@mui/icons-material'
import { Box, Button, InputAdornment, Paper, TextField } from '@mui/material'

interface BankAccountSearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onAddClick: () => void
}

export default function BankAccountSearchBar({
  searchTerm,
  onSearchChange,
  onAddClick
}: BankAccountSearchBarProps): React.JSX.Element {
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
            size="small"
            placeholder="Search by name, account number, or bank..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ flex: 1, minWidth: 300, maxWidth: 500 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Button variant="contained" startIcon={<Add />} onClick={onAddClick}>
          Add Account
        </Button>
      </Box>
    </Paper>
  )
}
