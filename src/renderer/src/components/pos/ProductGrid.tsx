import { Search } from '@mui/icons-material'
import { Box, Card, Chip, InputAdornment, Skeleton, TextField, Typography } from '@mui/material'
import medicinePlaceholder from '../../assets/medicine.png'
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
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 2
            }}
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <Card
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  boxShadow: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                {/* Top row: Name + Image skeleton */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1
                  }}
                >
                  <Box sx={{ flex: 1, pr: 1 }}>
                    <Skeleton variant="text" width="80%" height={28} />
                    <Skeleton
                      variant="rectangular"
                      width={40}
                      height={20}
                      sx={{ mt: 0.5, borderRadius: 1 }}
                    />
                  </Box>
                  <Skeleton variant="rectangular" width={55} height={55} sx={{ borderRadius: 2 }} />
                </Box>

                {/* Generic name skeleton */}
                <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />

                {/* Bottom row: Price + Stock skeleton */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1
                  }}
                >
                  <Skeleton variant="text" width={80} height={32} />
                  <Skeleton variant="rectangular" width={70} height={22} sx={{ borderRadius: 1 }} />
                </Box>
              </Card>
            ))}
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
                    position: 'relative',
                    p: 2,
                    borderRadius: 3,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    opacity: isOutOfStock ? 0.6 : 1,
                    transition: 'all 0.25s ease',
                    boxShadow: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      transform: isOutOfStock ? 'none' : 'translateY(-3px)',
                      boxShadow: isOutOfStock ? 2 : 5
                    }
                  }}
                >
                  {/* Top row: Name + small image */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1
                    }}
                  >
                    {/* Product Name + Rx */}
                    <Box sx={{ flex: 1, pr: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {product.name}
                      </Typography>

                      {product.strength && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            color: 'primary.main',
                            fontWeight: 600,
                            mt: 0.25
                          }}
                        >
                          {product.strength}
                        </Typography>
                      )}

                      {product.sku?.startsWith('RX-') && (
                        <Chip
                          label="Rx"
                          size="small"
                          color="error"
                          sx={{
                            mt: 0.5,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            height: 20,
                            borderRadius: 1
                          }}
                        />
                      )}
                    </Box>

                    {/* Small Product Image */}
                    <Box
                      component="img"
                      src={product.imageUrl || medicinePlaceholder}
                      alt={product.name}
                      sx={{
                        width: 55,
                        height: 55,
                        objectFit: 'contain',
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'grey.100'
                      }}
                    />
                  </Box>

                  {/* Generic Name */}
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

                  {/* Bottom Section: Price + Stock */}
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
                      sx={{
                        fontWeight: 700,
                        color: isOutOfStock ? 'error.main' : 'primary.main',
                        fontSize: '1.1rem'
                      }}
                    >
                      {currencySymbol}
                      {product.sellingPrice.toFixed(2)}
                    </Typography>

                    <Chip
                      label={isOutOfStock ? 'Out of Stock' : `Stock: ${stock}`}
                      size="small"
                      color={isOutOfStock ? 'error' : stock < 50 ? 'warning' : 'success'}
                      sx={{
                        fontSize: '0.7rem',
                        height: 22,
                        fontWeight: 500
                      }}
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
