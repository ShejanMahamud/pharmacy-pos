import { ChevronRight, Error, Warning } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { Link } from 'react-router-dom'
import { InventoryProduct } from '../../types/report'

interface InventoryAlertsProps {
  lowStockCount: number
  outOfStockCount: number
  lowStockProducts: InventoryProduct[]
  outOfStockProducts: InventoryProduct[]
}

export default function InventoryAlerts({
  lowStockCount,
  outOfStockCount,
  lowStockProducts,
  outOfStockProducts
}: InventoryAlertsProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3
      }}
    >
      {/* Low Stock Alert */}
      <Paper>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6" fontWeight="semibold">
            Low Stock Alert
          </Typography>
          <Chip
            label={`${lowStockCount} items`}
            color="warning"
            size="small"
            sx={{ fontWeight: 'medium' }}
          />
        </Box>
        <Box sx={{ p: 3 }}>
          {lowStockProducts.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
              }}
            >
              <Warning sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" fontWeight="semibold" gutterBottom>
                No Low Stock Items
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mb: 3, maxWidth: 300 }}
              >
                All products are well stocked
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontWeight="semibold">
                          Product
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="semibold">
                          Quantity
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="semibold">
                          Reorder Level
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Typography variant="body2">{product.name}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={product.quantity} size="small" color="warning" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {product.reorderLevel}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  component={Link}
                  to="/inventory"
                  variant="contained"
                  color="warning"
                  size="small"
                  endIcon={<ChevronRight />}
                >
                  View Inventory
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* Out of Stock Alert */}
      <Paper>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6" fontWeight="semibold">
            Out of Stock
          </Typography>
          <Chip
            label={`${outOfStockCount} items`}
            color="error"
            size="small"
            sx={{ fontWeight: 'medium' }}
          />
        </Box>
        <Box sx={{ p: 3 }}>
          {outOfStockProducts.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
              }}
            >
              <Error sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" fontWeight="semibold" gutterBottom>
                No Out of Stock Items
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mb: 3, maxWidth: 300 }}
              >
                All products are in stock
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontWeight="semibold">
                          Product
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="semibold">
                          Quantity
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="semibold">
                          Reorder Level
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {outOfStockProducts.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Typography variant="body2">{product.name}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={product.quantity} size="small" color="error" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {product.reorderLevel}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  component={Link}
                  to="/purchases"
                  variant="contained"
                  color="error"
                  size="small"
                  endIcon={<ChevronRight />}
                >
                  Create Purchase Order
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
