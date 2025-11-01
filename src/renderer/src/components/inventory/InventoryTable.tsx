import { Edit, Inventory } from '@mui/icons-material'
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
import { useState } from 'react'
import { Category, InventoryWithProduct } from '../../types/inventory'

interface InventoryTableProps {
  inventory: InventoryWithProduct[]
  categories: Category[]
  loading: boolean
  currencySymbol: string
  onEdit: (item: InventoryWithProduct) => void
}

export default function InventoryTable({
  inventory,
  categories,
  loading,
  currencySymbol,
  onEdit
}: InventoryTableProps) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

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

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (loading) {
    return (
      <Paper sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
        <CircularProgress />
      </Paper>
    )
  }

  if (inventory.length === 0) {
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
          No inventory items found
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Start by adding stock to your products.
        </Typography>
      </Paper>
    )
  }

  const paginatedInventory = inventory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box>
      <TableContainer component={Paper} sx={{ maxHeight: 540, bgcolor: 'white' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>Product</StyledTableCell>
              <StyledTableCell>SKU</StyledTableCell>
              <StyledTableCell>Category</StyledTableCell>
              <StyledTableCell>Current Stock</StyledTableCell>
              <StyledTableCell>Reorder Level</StyledTableCell>
              <StyledTableCell>Value</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedInventory.map((item) => {
              const product = item.product!
              const category = categories.find((c) => c.id === product.categoryId)
              const isLowStock = item.quantity > 0 && item.quantity <= product.reorderLevel
              const isOutOfStock = item.quantity === 0
              const stockValue = item.quantity * product.costPrice

              return (
                <TableRow key={item.id} hover>
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
                          color: 'white'
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
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                        {product.genericName && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {product.genericName}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.sku}</Typography>
                    {product.barcode && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {product.barcode}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={category?.name || 'Uncategorized'} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: isOutOfStock
                            ? 'error.main'
                            : isLowStock
                              ? 'warning.main'
                              : 'success.main'
                        }}
                      >
                        {item.quantity} {product.unit}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.reorderLevel}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {currencySymbol}
                      {stockValue.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      @{currencySymbol}
                      {product.costPrice.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {isOutOfStock ? (
                      <Chip label="Out of Stock" size="small" color="error" />
                    ) : isLowStock ? (
                      <Chip label="Low Stock" size="small" color="warning" />
                    ) : (
                      <Chip label="In Stock" size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Adjust Stock">
                      <IconButton size="small" color="primary" onClick={() => onEdit(item)}>
                        <Edit fontSize="small" />
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
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={inventory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  )
}
