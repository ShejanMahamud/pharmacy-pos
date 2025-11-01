import { Inventory } from '@mui/icons-material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import BarcodeIcon from '@mui/icons-material/QrCode2'
import WarningIcon from '@mui/icons-material/Warning'
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Skeleton,
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
import medicinePlaceholder from '../../assets/medicine.png'
import { Category, Product } from '../../types/product'

interface ProductsTableProps {
  products: Product[]
  categories: Category[]
  inventory: Record<string, number>
  currencySymbol: string
  loading: boolean
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onViewBarcode: (product: Product) => void
}

export default function ProductsTable({
  products,
  categories,
  inventory,
  currencySymbol,
  loading,
  onEdit,
  onDelete,
  onViewBarcode
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
      letterSpacing: '0.5px',
      whiteSpace: 'nowrap'
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      whiteSpace: 'nowrap'
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
      <Box>
        <TableContainer
          component={Paper}
          sx={{ maxHeight: 540, minHeight: 400, bgcolor: 'white', overflowX: 'auto' }}
        >
          <Table stickyHeader aria-label="loading products table" sx={{ minWidth: 1200 }}>
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
              {[...Array(10)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Skeleton
                        variant="rectangular"
                        width={40}
                        height={40}
                        sx={{ borderRadius: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton variant="text" width="40%" height={16} />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rounded" width={80} height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="70%" height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="70%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rounded" width={50} height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rounded" width={70} height={24} />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Paper>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={0}
            rowsPerPage={rowsPerPage}
            page={0}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    )
  }

  if (products.length === 0) {
    return (
      <Paper
        sx={{
          p: 12,
          textAlign: 'center',
          bgcolor: 'background.paper',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box>
          <Box
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'grey.200',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}
          >
            <Inventory sx={{ fontSize: 32, color: 'text.secondary' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
            No products found
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Start by adding products to your inventory.
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Box>
      <TableContainer component={Paper} sx={{ maxHeight: 540, overflowX: 'auto' }}>
        <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 1200 }}>
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
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ border: 'none' }}>
                  <Box
                    sx={{
                      py: 12,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: 'grey.200',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3
                        }}
                      >
                        <Inventory sx={{ fontSize: 32, color: 'text.secondary' }} />
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}
                      >
                        No products found
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        No products match your current filters
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => {
                const category = categories.find((c) => c.id === product.categoryId)
                const stock = inventory[product.id] || 0
                const isLowStock = stock <= product.reorderLevel

                return (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          component="img"
                          src={product.imageUrl || medicinePlaceholder}
                          alt={product.name}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            objectFit: 'contain',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'grey.50',
                            p: 0.5
                          }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {product.name}{' '}
                            {product.strength && (
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{ ml: 0, color: 'primary.main', fontWeight: 600 }}
                              >
                                {product.strength}
                              </Typography>
                            )}
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
                      <Chip
                        label={product.shelf}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={product.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                        <Tooltip title="View Barcode">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => onViewBarcode(product)}
                          >
                            <BarcodeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => onEdit(product)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(product.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
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
