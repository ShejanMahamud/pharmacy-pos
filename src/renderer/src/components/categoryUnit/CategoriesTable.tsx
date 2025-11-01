import { Add, Delete, Edit, Search } from '@mui/icons-material'
import {
  Box,
  Button,
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
import { Category } from '../../types/categoryUnit'

interface CategoriesTableProps {
  categories: Category[]
  searchTerm: string
  onSearchChange: (value: string) => void
  onAddClick: () => void
  onEditClick: (category: Category) => void
  onDeleteClick: (id: number) => void
}

export default function CategoriesTable({
  categories,
  searchTerm,
  onSearchChange,
  onAddClick,
  onEditClick,
  onDeleteClick
}: CategoriesTableProps) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)

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
    setCategoryToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (categoryToDelete !== null) {
      onDeleteClick(categoryToDelete)
    }
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}
        >
          <TextField
            placeholder="Search categories..."
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
            Add Category
          </Button>
        </Box>
      </Paper>
      <TableContainer component={Paper} sx={{ maxHeight: 540 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <StyledTableCell sx={{ textTransform: 'uppercase' }}>Name</StyledTableCell>
              <StyledTableCell sx={{ textTransform: 'uppercase' }}>Description</StyledTableCell>
              <StyledTableCell align="right" sx={{ textTransform: 'uppercase' }}>
                Actions
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((category) => (
                <StyledTableRow key={category.id} hover>
                  <StyledTableCell>{category.name}</StyledTableCell>
                  <StyledTableCell>{category.description}</StyledTableCell>
                  <StyledTableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEditClick(category)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(category.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                  <Box sx={{ color: 'text.secondary' }}>
                    {searchTerm ? (
                      <>
                        <Search sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          No categories found
                        </Typography>
                        <Typography variant="body2">
                          No categories match your search &quot;{searchTerm}&quot;
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          No categories available
                        </Typography>
                        <Typography variant="body2">
                          Start by adding categories using the &quot;Add Category&quot; button above
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
          component="div"
          count={filteredCategories.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
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
            Are you sure you want to delete this category? This action cannot be undone.
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
