import { Add, CurrencyExchange, Delete, MobileFriendly, Remove, Search } from '@mui/icons-material'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import {
  Box,
  Button,
  Card,
  Chip,
  ClickAwayListener,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography
} from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useSettingsStore } from '../store/settingsStore'
import { BankAccount, Customer, InventoryItem, Product } from '../types/pos'

export default function POS(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [barcodeBuffer, setBarcodeBuffer] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const barcodeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [cashReceived, setCashReceived] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [pointsToRedeem, setPointsToRedeem] = useState(0)

  const cart = useCartStore()
  const user = useAuthStore((state) => state.user)
  const currency = useSettingsStore((state) => state.currency)
  const taxRate = useSettingsStore((state) => state.taxRate)

  // Loyalty points conversion: 1 point = $0.10 discount
  const POINT_VALUE = 0.1

  // Get currency symbol
  const getCurrencySymbol = (): string => {
    switch (currency) {
      case 'USD':
        return '$'
      case 'EUR':
        return '€'
      case 'GBP':
        return '£'
      case 'BDT':
        return '৳'
      case 'INR':
        return '₹'
      default:
        return '$'
    }
  }

  const loadProducts = async (): Promise<void> => {
    try {
      setLoading(true)
      const allProducts = await window.api.products.getAll()
      setProducts(allProducts)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = async (): Promise<void> => {
    if (!searchTerm.trim()) {
      await loadProducts()
      return
    }

    try {
      const results = await window.api.products.getAll(searchTerm)
      setProducts(results)
    } catch {
      toast.error('Search failed')
    }
  }

  const loadInventory = async (): Promise<void> => {
    try {
      const inv = await window.api.inventory.getAll()
      setInventory(inv)
    } catch {
      console.error('Failed to load inventory')
    }
  }

  const loadAccounts = async (): Promise<void> => {
    try {
      const allAccounts = await window.api.bankAccounts.getAll()
      setAccounts(allAccounts.filter((acc) => acc.isActive))
    } catch {
      console.error('Failed to load accounts')
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void searchProducts()
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  useEffect(() => {
    void loadProducts()
    void loadInventory()
    void loadAccounts()
    searchInputRef.current?.focus()
  }, [])

  const addToCart = useCallback(
    (product: Product): void => {
      const inventoryItem = inventory.find((inv) => inv.productId === product.id)
      if (inventoryItem && inventoryItem.quantity <= 0) {
        toast.error('Product out of stock')
        return
      }

      cart.addItem({
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        quantity: 1,
        discount: product.discountPercent || 0,
        taxRate: product.taxRate || 0
      })
      toast.success(`${product.name} added to cart`)
      searchInputRef.current?.focus()
    },
    [cart, inventory]
  )

  const handleBarcodeSearch = useCallback(
    async (barcode: string): Promise<void> => {
      if (!barcode.trim()) return

      try {
        const product = await window.api.products.getByBarcode(barcode)
        if (product) {
          addToCart(product)
          setSearchTerm('')
        } else {
          toast.error('Product not found')
        }
      } catch {
        console.error('Barcode search error')
      }
    },
    [addToCart]
  )

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      if (e.key === 'Enter' && barcodeBuffer) {
        void handleBarcodeSearch(barcodeBuffer)
        setBarcodeBuffer('')
        return
      }

      if (e.key.length === 1) {
        setBarcodeBuffer((prev) => prev + e.key)

        if (barcodeTimerRef.current) {
          clearTimeout(barcodeTimerRef.current)
        }
        barcodeTimerRef.current = setTimeout(() => {
          setBarcodeBuffer('')
        }, 100)
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => {
      window.removeEventListener('keypress', handleKeyPress)
      if (barcodeTimerRef.current) {
        clearTimeout(barcodeTimerRef.current)
      }
    }
  }, [barcodeBuffer, handleBarcodeSearch])

  const searchCustomers = async (): Promise<void> => {
    try {
      const results = await window.api.customers.getAll(customerSearch)
      setCustomers(results)
    } catch {
      toast.error('Failed to search customers')
    }
  }

  const selectCustomer = (customer: Customer): void => {
    cart.setCustomer(customer.id)
    setSelectedCustomer(customer)
    setCustomerSearch(customer.name)
    setShowCustomerDropdown(false)
    toast.success(`Customer ${customer.name} selected`)
  }

  const clearCustomer = (): void => {
    cart.setCustomer(undefined)
    setSelectedCustomer(null)
    setCustomerSearch('')
    setCustomers([])
  }

  useEffect(() => {
    if (customerSearch && !selectedCustomer) {
      const timer = setTimeout(() => {
        void searchCustomers()
        setShowCustomerDropdown(true)
      }, 300)
      return () => clearTimeout(timer)
    } else if (!customerSearch) {
      setCustomers([])
      setShowCustomerDropdown(false)
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerSearch])

  const handleCheckout = async (): Promise<void> => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty')
      return
    }

    const cash = parseFloat(cashReceived) || 0
    const discountPercentValue = parseFloat(discountPercent) || 0
    const subtotal = cart.getSubtotal()
    const percentDiscountAmount = (subtotal * discountPercentValue) / 100

    // Calculate loyalty points discount
    const pointsDiscountAmount = pointsToRedeem * POINT_VALUE
    const totalDiscountAmount = percentDiscountAmount + pointsDiscountAmount

    const taxableAmount = subtotal - totalDiscountAmount
    const taxAmount = (taxableAmount * taxRate) / 100
    const finalTotal = subtotal - totalDiscountAmount + taxAmount

    if (cash < finalTotal) {
      toast.error('Insufficient payment amount')
      return
    }

    if (!user) return

    try {
      const invoiceNumber = `INV-${Date.now()}`

      const sale = {
        invoiceNumber,
        userId: user.id,
        customerId: selectedCustomer?.id || null,
        accountId: selectedAccount || null,
        subtotal: subtotal,
        taxAmount: taxAmount,
        discountAmount: totalDiscountAmount,
        totalAmount: finalTotal,
        paidAmount: cash,
        changeAmount: cash - finalTotal,
        paymentMethod,
        status: 'completed',
        pointsRedeemed: pointsToRedeem // Track points used
      }

      console.log('Sale Data:', sale)
      console.log('Customer ID:', selectedCustomer?.id)

      const items = cart.items.map((item) => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        discountPercent: item.discount,
        taxRate: item.taxRate,
        subtotal: item.price * item.quantity
      }))

      await window.api.sales.create(sale, items)

      toast.success(`Sale completed! Invoice: ${invoiceNumber}`)
      cart.clearCart()
      setSelectedCustomer(null)
      setCustomerSearch('')
      setCashReceived('')
      setDiscountPercent('')
      setPointsToRedeem(0)
      setPaymentMethod('cash')
      setSelectedAccount('')
      await loadProducts()
    } catch {
      toast.error('Failed to complete sale')
    }
  }

  const calculateTotal = (): number => {
    const subtotal = cart.getSubtotal()
    const discountPercentValue = parseFloat(discountPercent) || 0
    const percentDiscountAmount = (subtotal * discountPercentValue) / 100
    const pointsDiscountAmount = pointsToRedeem * POINT_VALUE
    const totalDiscountAmount = percentDiscountAmount + pointsDiscountAmount
    const taxableAmount = subtotal - totalDiscountAmount
    const taxAmount = (taxableAmount * taxRate) / 100
    return subtotal - totalDiscountAmount + taxAmount
  }

  const getMaxRedeemablePoints = (): number => {
    if (!selectedCustomer) return 0
    const availablePoints = selectedCustomer.loyaltyPoints || 0
    const subtotal = cart.getSubtotal()
    // Maximum points that can be redeemed is limited by:
    // 1. Available points
    // 2. Subtotal (can't redeem more than purchase value)
    const maxBySubtotal = Math.floor(subtotal / POINT_VALUE)
    return Math.min(availablePoints, maxBySubtotal)
  }

  const calculateChange = (): number => {
    const cash = parseFloat(cashReceived) || 0
    const total = calculateTotal()
    return Math.max(0, cash - total)
  }

  const handleReset = (): void => {
    cart.clearCart()
    setSelectedCustomer(null)
    setCustomerSearch('')
    setCashReceived('')
    setDiscountPercent('')
    setPointsToRedeem(0)
    setPaymentMethod('cash')
    setSelectedAccount('')
    toast.success('POS reset successfully')
  }

  return (
    <Box
      sx={{ p: 3, height: '100vh', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}
    >
      {/* Page Header */}
      <Box
        sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Point of Sale
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Process sales transactions and manage customer purchases
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          onClick={handleReset}
          sx={{ textTransform: 'none', mt: 0.5 }}
        >
          Reset All
        </Button>
      </Box>

      {/* Customer Search Field */}
      <Box sx={{ position: 'relative', mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search customer..."
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          onFocus={() => {
            if (customers.length > 0) {
              setShowCustomerDropdown(true)
            }
          }}
          size="small"
          sx={{
            bgcolor: 'white',
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: selectedCustomer ? '#4caf50' : '#e0e0e0' }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: selectedCustomer ? (
              <Chip
                label={selectedCustomer.name}
                size="small"
                color="success"
                onDelete={clearCustomer}
                sx={{ height: 24 }}
              />
            ) : null
          }}
        />
        {/* Customer Dropdown */}
        {showCustomerDropdown && customers.length > 0 && (
          <ClickAwayListener onClickAway={() => setShowCustomerDropdown(false)}>
            <Paper
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: 200,
                overflow: 'auto',
                zIndex: 1000,
                mt: 0.5,
                boxShadow: 3
              }}
            >
              <List dense>
                {customers.map((customer) => (
                  <ListItem
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: '#f5f5f5'
                      }
                    }}
                  >
                    <ListItemText
                      primary={customer.name}
                      secondary={customer.phone || customer.email}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </ClickAwayListener>
        )}
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
        {/* Left Side - Products */}
        <Card sx={{ flex: 1.2, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Search Bar */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <TextField
              fullWidth
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, minHeight: 0 }}>
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
                      onClick={() => !isOutOfStock && addToCart(product)}
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
                          {getCurrencySymbol()}
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

        {/* Middle - Cart Items (Full Height) */}
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
              Cart Items ({cart.items.length})
            </Typography>
            <Button
              size="small"
              onClick={cart.clearCart}
              disabled={cart.items.length === 0}
              sx={{ textTransform: 'none' }}
            >
              Clear All
            </Button>
          </Box>

          {/* Cart Items Scrollable Area - Now takes full height */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, minHeight: 0 }}>
            {cart.items.length === 0 ? (
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
                {cart.items.map((item) => (
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
                        {getCurrencySymbol()}
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
                          onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
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
                              cart.updateQuantity(item.id, value)
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
                          onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                          sx={{ bgcolor: 'white', border: '1px solid #e0e0e0', p: 0.5 }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                          {getCurrencySymbol()}
                          {(item.price * item.quantity).toFixed(2)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => cart.removeItem(item.id)}
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

        {/* Right Side - Payment & Summary */}
        <Card sx={{ width: 380, display: 'flex', flexDirection: 'column' }}>
          {/* Payment Section */}
          <Box sx={{ p: 1.5 }}>
            {/* Payment Account Selection */}
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8rem' }}>
              Payment Account
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: 0.5,
                mb: 1
              }}
            >
              {accounts.map((account) => {
                const getIcon = (type: string): React.JSX.Element | null => {
                  const lowerType = type.toLowerCase()
                  if (lowerType.includes('cash'))
                    return <CurrencyExchange sx={{ fontSize: '1rem' }} />
                  if (lowerType.includes('bank'))
                    return <AccountBalanceIcon sx={{ fontSize: '1rem' }} />
                  if (lowerType.includes('mobile_banking'))
                    return <MobileFriendly sx={{ fontSize: '1rem' }} />
                  return null
                }

                return (
                  <Button
                    key={account.id}
                    fullWidth
                    variant={selectedAccount === account.id ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => {
                      setSelectedAccount(account.id)
                      setPaymentMethod(account.accountType)
                    }}
                    sx={{
                      textTransform: 'none',
                      py: 0.5,
                      fontSize: '0.7rem',
                      flexDirection: 'row',
                      gap: 0.05,
                      minHeight: '30px'
                    }}
                    startIcon={getIcon(account.accountType)}
                  >
                    <Box sx={{ textAlign: 'center', lineHeight: 1.2 }}>
                      <span>{account.name}</span>
                    </Box>
                  </Button>
                )
              })}
            </Box>

            {/* Cash Amount Input */}
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8rem' }}>
              Cash Received
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              placeholder="0.00"
              sx={{ mb: 0.5, bgcolor: 'white' }}
            />

            {/* Quick Amounts */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
              {[50, 100, 200, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => setCashReceived(amount.toString())}
                  sx={{ textTransform: 'none', minWidth: 0, fontSize: '0.7rem', py: 0.25 }}
                >
                  {amount}
                </Button>
              ))}
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => setCashReceived(calculateTotal().toFixed(2))}
                sx={{ textTransform: 'none', minWidth: 0, fontSize: '0.7rem', py: 0.25 }}
              >
                Exact
              </Button>
            </Box>

            {/* Discount Input */}
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8rem' }}>
              Discount (%)
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="0"
              sx={{ bgcolor: 'white', mb: 1 }}
              inputProps={{ min: 0, max: 100, step: '0.01' }}
            />

            {/* Loyalty Points Redemption */}
            {selectedCustomer && selectedCustomer.loyaltyPoints > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    Redeem Points
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Available: {selectedCustomer.loyaltyPoints} pts ({getCurrencySymbol()}
                    {(selectedCustomer.loyaltyPoints * POINT_VALUE).toFixed(2)})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={pointsToRedeem}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0
                      const maxPoints = getMaxRedeemablePoints()
                      setPointsToRedeem(Math.min(Math.max(0, value), maxPoints))
                    }}
                    placeholder="0"
                    sx={{ bgcolor: 'white' }}
                    inputProps={{ min: 0, max: getMaxRedeemablePoints() }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setPointsToRedeem(getMaxRedeemablePoints())}
                    sx={{ textTransform: 'none', minWidth: 60, fontSize: '0.7rem' }}
                  >
                    Max
                  </Button>
                </Box>
                {pointsToRedeem > 0 && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'success.main', display: 'block', mt: 0.5 }}
                  >
                    Discount: {getCurrencySymbol()}
                    {(pointsToRedeem * POINT_VALUE).toFixed(2)}
                  </Typography>
                )}
              </Box>
            )}

            {/* Summary Section */}
            <Box
              sx={{
                bgcolor: '#f8f9fa',
                borderRadius: 1,
                p: 1.5,
                mb: 1.5,
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: '#666', mb: 1, display: 'block' }}
              >
                SUMMARY
              </Typography>

              {/* Subtotal */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
                  Subtotal
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {getCurrencySymbol()}
                  {cart.getSubtotal().toFixed(2)}
                </Typography>
              </Box>

              {/* Percent Discount */}
              {parseFloat(discountPercent) > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
                    Discount ({discountPercent}%)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#f44336' }}
                  >
                    -{getCurrencySymbol()}
                    {((cart.getSubtotal() * parseFloat(discountPercent)) / 100).toFixed(2)}
                  </Typography>
                </Box>
              )}

              {/* Points Discount */}
              {pointsToRedeem > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
                    Points Discount ({pointsToRedeem} pts)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#4caf50' }}
                  >
                    -{getCurrencySymbol()}
                    {(pointsToRedeem * POINT_VALUE).toFixed(2)}
                  </Typography>
                </Box>
              )}

              {/* Tax */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
                  Tax ({taxRate}%)
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {getCurrencySymbol()}
                  {(
                    ((cart.getSubtotal() -
                      (cart.getSubtotal() * parseFloat(discountPercent || '0')) / 100) *
                      taxRate) /
                    100
                  ).toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ borderTop: '1px solid #dee2e6', mt: 1, pt: 1 }}>
                {/* Total */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    Total
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, color: '#1976d2', fontSize: '1.1rem' }}
                  >
                    {getCurrencySymbol()}
                    {calculateTotal().toFixed(2)}
                  </Typography>
                </Box>

                {/* Change */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
                    Change
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#4caf50', fontSize: '0.9rem' }}
                  >
                    {getCurrencySymbol()}
                    {calculateChange().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Complete Sale Button */}
            <Button
              fullWidth
              variant="contained"
              size="medium"
              onClick={handleCheckout}
              disabled={cart.items.length === 0}
              sx={{ textTransform: 'none', py: 1.2, fontWeight: 600, fontSize: '0.95rem' }}
            >
              Complete Sale
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
