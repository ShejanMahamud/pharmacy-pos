import { FilterList as FilterListIcon, Search as SearchIcon } from '@mui/icons-material'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material'

interface AuditLogFiltersProps {
  startDate: string
  endDate: string
  actionFilter: string
  entityTypeFilter: string
  searchUsername: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onActionFilterChange: (value: string) => void
  onEntityTypeFilterChange: (value: string) => void
  onSearchUsernameChange: (value: string) => void
  onApplyFilters: () => void
  onClearFilters: () => void
}

export default function AuditLogFilters({
  startDate,
  endDate,
  actionFilter,
  entityTypeFilter,
  searchUsername,
  onStartDateChange,
  onEndDateChange,
  onActionFilterChange,
  onEntityTypeFilterChange,
  onSearchUsernameChange,
  onApplyFilters,
  onClearFilters
}: AuditLogFiltersProps): React.JSX.Element {
  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <FilterListIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Filters
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
          gap: 2,
          mb: 2
        }}
      >
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          fullWidth
        />

        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          fullWidth
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Action</InputLabel>
          <Select
            value={actionFilter}
            label="Action"
            onChange={(e) => onActionFilterChange(e.target.value)}
          >
            <MenuItem value="">All Actions</MenuItem>
            <MenuItem value="create">Create</MenuItem>
            <MenuItem value="update">Update</MenuItem>
            <MenuItem value="delete">Delete</MenuItem>
            <MenuItem value="login">Login</MenuItem>
            <MenuItem value="logout">Logout</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>Entity Type</InputLabel>
          <Select
            value={entityTypeFilter}
            label="Entity Type"
            onChange={(e) => onEntityTypeFilterChange(e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="product">Product</MenuItem>
            <MenuItem value="sale">Sale</MenuItem>
            <MenuItem value="purchase">Purchase</MenuItem>
            <MenuItem value="customer">Customer</MenuItem>
            <MenuItem value="supplier">Supplier</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Username"
          placeholder="Search by username"
          value={searchUsername}
          onChange={(e) => onSearchUsernameChange(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            endAdornment: <SearchIcon sx={{ color: 'text.secondary' }} />
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={onClearFilters}>
          Clear Filters
        </Button>
        <Button variant="contained" onClick={onApplyFilters}>
          Apply Filters
        </Button>
      </Box>
    </Paper>
  )
}
