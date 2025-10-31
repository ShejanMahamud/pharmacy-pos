import { Box, Button, Typography } from '@mui/material'
import toast from 'react-hot-toast'
import CartList from '../components/pos/CartList'
import CustomerSearch from '../components/pos/CustomerSearch'
import PaymentPanel from '../components/pos/PaymentPanel'
import ProductGrid from '../components/pos/ProductGrid'
import SaleCompleteDialog from '../components/pos/SaleCompleteDialog'
import { usePOS } from '../hooks/usePOS'
import { printPDFReceipt } from '../utils/pdfPrint'
import { printThermalReceipt } from '../utils/thermalPrint'

export default function POS(): React.JSX.Element {
  const {
    // State
    searchTerm,
    products,
    inventory,
    accounts,
    customerSearch,
    customers,
    selectedCustomer,
    showCustomerDropdown,
    loading,
    cashReceived,
    selectedAccount,
    discountPercent,
    pointsToRedeem,
    searchInputRef,
    cart,
    taxRate,
    showSaleCompleteDialog,
    completedSaleDetails,
    storeName,
    storeAddress,
    storePhone,

    // Computed values
    currencySymbol,
    total,
    change,
    maxRedeemablePoints,
    pointValue,

    // Handlers
    setSearchTerm,
    setCustomerSearch,
    setCashReceived,
    setDiscountPercent,
    setPointsToRedeem,
    setShowCustomerDropdown,
    setShowSaleCompleteDialog,
    addToCart,
    selectCustomer,
    clearCustomer,
    handleCheckout,
    handleReset,
    handleAccountSelect
  } = usePOS()

  const handlePdfPrint = (): void => {
    if (!completedSaleDetails) {
      toast.error('No sale details available')
      return
    }

    try {
      const receiptData = {
        ...completedSaleDetails,
        storeName,
        storeAddress,
        storePhone
      }
      printPDFReceipt(receiptData, currencySymbol)
      toast.success('PDF receipt opened in new window')
    } catch (error) {
      console.error('PDF print error:', error)
      toast.error('Failed to generate PDF receipt')
    }
  }

  const handleThermalPrint = (): void => {
    if (!completedSaleDetails) {
      toast.error('No sale details available')
      return
    }

    try {
      const receiptData = {
        ...completedSaleDetails,
        storeName,
        storeAddress,
        storePhone
      }
      printThermalReceipt(receiptData, currencySymbol)
      toast.success('Thermal receipt sent to printer')
    } catch (error) {
      console.error('Thermal print error:', error)
      toast.error('Failed to print thermal receipt')
    }
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
      <CustomerSearch
        customerSearch={customerSearch}
        selectedCustomer={selectedCustomer}
        customers={customers}
        showDropdown={showCustomerDropdown}
        onSearchChange={setCustomerSearch}
        onCustomerSelect={selectCustomer}
        onCustomerClear={clearCustomer}
        onDropdownClose={() => setShowCustomerDropdown(false)}
        onFocus={() => {
          if (customers.length > 0) {
            setShowCustomerDropdown(true)
          }
        }}
      />

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
        {/* Left Side - Products */}
        <ProductGrid
          products={products}
          inventory={inventory}
          loading={loading}
          searchTerm={searchTerm}
          currencySymbol={currencySymbol}
          onSearchChange={setSearchTerm}
          onProductClick={addToCart}
          searchInputRef={searchInputRef}
        />

        {/* Middle - Cart Items */}
        <CartList
          items={cart.items}
          currencySymbol={currencySymbol}
          onQuantityUpdate={cart.updateQuantity}
          onItemRemove={cart.removeItem}
          onClearCart={cart.clearCart}
        />

        {/* Right Side - Payment & Summary */}
        <PaymentPanel
          accounts={accounts}
          selectedAccount={selectedAccount}
          cashReceived={cashReceived}
          discountPercent={discountPercent}
          pointsToRedeem={pointsToRedeem}
          selectedCustomer={selectedCustomer}
          subtotal={cart.getSubtotal()}
          taxRate={taxRate}
          total={total}
          change={change}
          maxRedeemablePoints={maxRedeemablePoints}
          pointValue={pointValue}
          currencySymbol={currencySymbol}
          cartItemsCount={cart.items.length}
          onAccountSelect={handleAccountSelect}
          onCashChange={setCashReceived}
          onDiscountChange={setDiscountPercent}
          onPointsChange={setPointsToRedeem}
          onCheckout={handleCheckout}
        />
      </Box>

      {/* Sale Complete Dialog */}
      <SaleCompleteDialog
        open={showSaleCompleteDialog}
        saleDetails={completedSaleDetails}
        currencySymbol={currencySymbol}
        onClose={() => setShowSaleCompleteDialog(false)}
        onPdfPrint={handlePdfPrint}
        onThermalPrint={handleThermalPrint}
      />
    </Box>
  )
}
