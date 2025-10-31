import { Search } from '@mui/icons-material'
import { Box, Card, Chip, InputAdornment, TextField, Typography } from '@mui/material'
import { InventoryItem, Product } from '../../types/pos'

interface ProductGridProps {
  products: Product[]
  inventory: InventoryItem[]
  loading: boolean
  searchTerm: string
  currencySymbol: string
  onSearchChange: (value: string) => void
  onProductClick: (product: Product) => void
  searchInputRef: React.RefObject<HTMLInputElement>
}

export default function ProductGrid({
  products,
  inventory,
  loading,
  searchTerm,
  currencySymbol,
  onSearchChange,
  onProductClick,
  searchInputRef
}: ProductGridProps): React.JSX.Element {
  return (
    <Card sx={{ flex: 1.2, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Search Bar */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <TextField
          fullWidth
          placeholder="Search products"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          inputRef={searchInputRef}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ bgcolor: 'white' }}
        />
      </Box>

      {/* Products Grid */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          minHeight: 0,
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: '10px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: '#555'
            }
          }
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <Typography>Loading...</Typography>
          </Box>
        ) : products.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <Typography color="text.secondary">No products found</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 2
            }}
          >
            {products.map((product) => {
              const inventoryItem = inventory.find((inv) => inv.productId === product.id)
              const stock = inventoryItem?.quantity || 0
              const isOutOfStock = stock === 0

              return (
                <Card
                  key={product.id}
                  onClick={() => !isOutOfStock && onProductClick(product)}
                  sx={{
                    p: 2,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    opacity: isOutOfStock ? 0.5 : 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: isOutOfStock ? 1 : 4,
                      transform: isOutOfStock ? 'none' : 'translateY(-2px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {product.name}
                    </Typography>
                    {product.sku && product.sku.startsWith('RX-') && (
                      <Chip
                        label="Rx"
                        size="small"
                        color="error"
                        sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>

                  {product.genericName && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {product.genericName}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 1
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#1976d2', fontSize: '1.1rem' }}
                    >
                      {currencySymbol}
                      {product.sellingPrice.toFixed(2)}
                    </Typography>
                    <Chip
                      label={`Stock: ${stock}`}
                      size="small"
                      color={isOutOfStock ? 'error' : stock < 50 ? 'warning' : 'success'}
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  </Box>
                </Card>
              )
            })}
          </Box>
        )}
      </Box>
    </Card>
  )
}
