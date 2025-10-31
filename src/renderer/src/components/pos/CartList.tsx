import { Add, Delete, Remove } from '@mui/icons-material'
import { Box, Button, Card, IconButton, TextField, Typography } from '@mui/material'
import { CartItem } from '../../types/pos'

interface CartListProps {
  items: CartItem[]
  currencySymbol: string
  onQuantityUpdate: (itemId: string, quantity: number) => void
  onItemRemove: (itemId: string) => void
  onClearCart: () => void
}

export default function CartList({
  items,
  currencySymbol,
  onQuantityUpdate,
  onItemRemove,
  onClearCart
}: CartListProps): React.JSX.Element {
  return (
    <Card sx={{ width: 360, display: 'flex', flexDirection: 'column' }}>
      {/* Cart Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Cart Items ({items.length})
        </Typography>
        <Button
          size="small"
          onClick={onClearCart}
          disabled={items.length === 0}
          sx={{ textTransform: 'none' }}
        >
          Clear All
        </Button>
      </Box>

      {/* Cart Items Scrollable Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          minHeight: 0,
          '&::-webkit-scrollbar': {
            width: '8px'
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
        {items.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#999'
            }}
          >
            <Typography>No items in cart</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {items.map((item) => (
              <Card
                key={item.id}
                variant="outlined"
                sx={{ p: 1.5, bgcolor: '#fafafa', border: '1px solid #e0e0e0' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.productId.substring(0, 8)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                    {currencySymbol}
                    {item.price.toFixed(2)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => onQuantityUpdate(item.id, item.quantity - 1)}
                      sx={{ bgcolor: 'white', border: '1px solid #e0e0e0', p: 0.5 }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <TextField
                      size="small"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0
                        if (value >= 0) {
                          onQuantityUpdate(item.id, value)
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      type="number"
                      sx={{
                        width: 60,
                        '& input': {
                          textAlign: 'center',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          py: 0.5
                        },
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white'
                        }
                      }}
                      inputProps={{
                        min: 0,
                        style: { textAlign: 'center' }
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => onQuantityUpdate(item.id, item.quantity + 1)}
                      sx={{ bgcolor: 'white', border: '1px solid #e0e0e0', p: 0.5 }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {currencySymbol}
                      {(item.price * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => onItemRemove(item.id)}
                      sx={{ color: '#d32f2f', p: 0.5 }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Card>
  )
}
