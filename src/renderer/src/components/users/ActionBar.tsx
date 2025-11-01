import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material'
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { Role, roleMetadata } from '../../utils/permissions'

interface ActionBarProps {
  searchTerm: string
  selectedRole: Role | 'all'
  filteredCount: number
  hasCreatePermission: boolean
  hasAvailableRoles: boolean
  onSearchChange: (value: string) => void
  onRoleFilterChange: (role: Role | 'all') => void
  onCreateClick: () => void
}

export default function ActionBar({
  searchTerm,
  selectedRole,
  filteredCount,
  hasCreatePermission,
  hasAvailableRoles,
  onSearchChange,
  onRoleFilterChange,
  onCreateClick
}: ActionBarProps): React.JSX.Element {
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            flex: 1
          }}
        >
          {/* Search */}
          <TextField
            placeholder="Search users by name, username, or role..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            sx={{ flex: 1, maxWidth: { sm: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          {/* Role Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              label="Role"
              onChange={(e) => onRoleFilterChange(e.target.value as Role | 'all')}
            >
              <MenuItem value="all">All Roles</MenuItem>
              {(Object.keys(roleMetadata) as Role[]).map((role) => (
                <MenuItem key={role} value={role}>
                  {roleMetadata[role].name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredCount} user{filteredCount !== 1 ? 's' : ''} found
          </Typography>
          {hasCreatePermission && hasAvailableRoles && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateClick}>
              Create User
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  )
}
