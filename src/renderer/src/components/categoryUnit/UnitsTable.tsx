import { Add, Delete, Edit, Search } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { useState } from 'react'
import { Unit } from '../../types/categoryUnit'

interface UnitsTableProps {
  units: Unit[]
  searchTerm: string
  onSearchChange: (value: string) => void
  onAddClick: () => void
  onEditClick: (unit: Unit) => void
  onDeleteClick: (id: number) => void
}

export default function UnitsTable({
  units,
  searchTerm,
  onSearchChange,
  onAddClick,
  onEditClick,
  onDeleteClick
}: UnitsTableProps) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<number | null>(null)

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.grey[300],
      color: theme.palette.text.secondary,
      fontWeight: 600,
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      letterSpacing: '0.5px'
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14
    }
  }))

  const StyledTableRow = styled(TableRow)(() => ({
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0
    }
  }))

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDeleteClick = (id: number) => {
    setUnitToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (unitToDelete !== null) {
      onDeleteClick(unitToDelete)
    }
    setDeleteDialogOpen(false)
    setUnitToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setUnitToDelete(null)
  }

  const filteredUnits = units.filter((unit) =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedUnits = filteredUnits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}
        >
          <TextField
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value)
              setPage(0)
            }}
            size="small"
            sx={{ flex: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={onAddClick}>
            Add Unit
          </Button>
        </Box>
      </Paper>
      <TableContainer component={Paper} sx={{ maxHeight: 540 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <StyledTableCell sx={{ textTransform: 'uppercase' }}>Name</StyledTableCell>
              <StyledTableCell sx={{ textTransform: 'uppercase' }}>Abbreviation</StyledTableCell>
              <StyledTableCell sx={{ textTransform: 'uppercase' }}>Type</StyledTableCell>
              <StyledTableCell sx={{ textTransform: 'uppercase' }}>Description</StyledTableCell>
              <StyledTableCell align="right" sx={{ textTransform: 'uppercase' }}>
                Actions
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUnits.length > 0 ? (
              paginatedUnits.map((unit) => (
                <StyledTableRow key={unit.id} hover>
                  <StyledTableCell>{unit.name}</StyledTableCell>
                  <StyledTableCell>{unit.abbreviation}</StyledTableCell>
                  <StyledTableCell>
                    <Chip
                      label={unit.type === 'base' ? 'Base Unit' : 'Package Unit'}
                      color={unit.type === 'base' ? 'success' : 'primary'}
                      size="small"
                    />
                  </StyledTableCell>
                  <TableCell>{unit.description}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => onEditClick(unit)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(unit.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box sx={{ color: 'text.secondary' }}>
                    {searchTerm ? (
                      <>
                        <Search sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          No units found
                        </Typography>
                        <Typography variant="body2">
                          No units match your search "{searchTerm}"
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          No units available
                        </Typography>
                        <Typography variant="body2">
                          Start by adding units using the "Add Unit" button above
                        </Typography>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Paper>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredUnits.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this unit? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
