import { Inventory } from '@mui/icons-material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import WarningIcon from '@mui/icons-material/Warning'
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
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
  Tooltip,
  Typography
} from '@mui/material'
import React from 'react'
import { Category, Product } from '../../types/product'

interface ProductsTableProps {
  products: Product[]
  categories: Category[]
  inventory: Record<string, number>
  currencySymbol: string
  loading: boolean
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export default function ProductsTable({
  products,
  categories,
  inventory,
  currencySymbol,
  loading,
  onEdit,
  onDelete
}: ProductsTableProps): React.JSX.Element {
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(25)

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

  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedProducts = products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  if (loading) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    )
  }

  if (products.length === 0) {
    return (
      <Paper sx={{ p: 12, textAlign: 'center' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'grey.200',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}
        >
          <Typography variant="h5" sx={{ color: 'text.secondary' }}>
            <Inventory />
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          No products found
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Start by adding products to your inventory.
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <TableContainer component={Paper} sx={{ maxHeight: 540 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Product</StyledTableCell>
              <StyledTableCell>SKU / Barcode</StyledTableCell>
              <StyledTableCell>Category</StyledTableCell>
              <StyledTableCell>Manufacturer</StyledTableCell>
              <StyledTableCell>Price</StyledTableCell>
              <StyledTableCell>Stock</StyledTableCell>
              <StyledTableCell>Shelf</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((product) => {
              const category = categories.find((c) => c.id === product.categoryId)
              const stock = inventory[product.id] || 0
              const isLowStock = stock <= product.reorderLevel

              return (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main'
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {product.name}
                        </Typography>
                        {product.genericName && (
                          <Typography variant="caption" color="text.secondary">
                            {product.genericName}
                          </Typography>
                        )}
                        {product.prescriptionRequired && (
                          <Chip
                            label="Rx Required"
                            size="small"
                            color="error"
                            sx={{ mt: 0.5, height: 20 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.sku}</Typography>
                    {product.barcode && (
                      <Typography variant="caption" color="text.secondary">
                        {product.barcode}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={category?.name || 'Uncategorized'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.manufacturer || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {currencySymbol}
                      {product.sellingPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cost: {currencySymbol}
                      {product.costPrice.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={isLowStock ? 'error.main' : 'success.main'}
                      >
                        {stock} {product.unit}
                      </Typography>
                      {isLowStock && (
                        <Tooltip title="Low stock alert">
                          <WarningIcon fontSize="small" color="error" />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Reorder at: {product.reorderLevel}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={product.shelf} size="small" color="secondary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={product.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => onEdit(product)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => onDelete(product.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Paper>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  )
}
