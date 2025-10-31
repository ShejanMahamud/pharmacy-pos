import { Box, Button, Card, TextField, Typography } from '@mui/material'
import { BankAccount, Customer } from '../../types/pos'
import CashInput from './CashInput'
import LoyaltyPointsRedemption from './LoyaltyPointsRedemption'
import PaymentAccountSelector from './PaymentAccountSelector'
import PaymentSummary from './PaymentSummary'

interface PaymentPanelProps {
  accounts: BankAccount[]
  selectedAccount: string
  cashReceived: string
  discountPercent: string
  pointsToRedeem: number
  selectedCustomer: Customer | null
  subtotal: number
  taxRate: number
  total: number
  change: number
  maxRedeemablePoints: number
  pointValue: number
  currencySymbol: string
  cartItemsCount: number
  onAccountSelect: (accountId: string, accountType: string) => void
  onCashChange: (value: string) => void
  onDiscountChange: (value: string) => void
  onPointsChange: (points: number) => void
  onCheckout: () => void
}

export default function PaymentPanel({
  accounts,
  selectedAccount,
  cashReceived,
  discountPercent,
  pointsToRedeem,
  selectedCustomer,
  subtotal,
  taxRate,
  total,
  change,
  maxRedeemablePoints,
  pointValue,
  currencySymbol,
  cartItemsCount,
  onAccountSelect,
  onCashChange,
  onDiscountChange,
  onPointsChange,
  onCheckout
}: PaymentPanelProps): React.JSX.Element {
  return (
    <Card sx={{ width: 380, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Scrollable Content Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 1.5,
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
        {/* Payment Account Selection */}
        <PaymentAccountSelector
          accounts={accounts}
          selectedAccount={selectedAccount}
          onAccountSelect={onAccountSelect}
        />

        {/* Cash Amount Input */}
        <CashInput
          cashReceived={cashReceived}
          total={total}
          currencySymbol={currencySymbol}
          onCashChange={onCashChange}
        />

        {/* Discount Input */}
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8rem' }}>
          Discount (%)
        </Typography>
        <TextField
          fullWidth
          size="small"
          type="number"
          value={discountPercent}
          onChange={(e) => onDiscountChange(e.target.value)}
          placeholder="0"
          sx={{ bgcolor: 'white', mb: 1 }}
          inputProps={{ min: 0, max: 100, step: '0.01' }}
        />

        {/* Loyalty Points Redemption */}
        <LoyaltyPointsRedemption
          customer={selectedCustomer}
          pointsToRedeem={pointsToRedeem}
          maxRedeemablePoints={maxRedeemablePoints}
          pointValue={pointValue}
          currencySymbol={currencySymbol}
          onPointsChange={onPointsChange}
        />

        {/* Summary Section */}
        <PaymentSummary
          subtotal={subtotal}
          discountPercent={discountPercent}
          pointsToRedeem={pointsToRedeem}
          pointValue={pointValue}
          taxRate={taxRate}
          total={total}
          change={change}
          currencySymbol={currencySymbol}
        />
      </Box>

      {/* Fixed Button at Bottom */}
      <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
        <Button
          fullWidth
          variant="contained"
          size="medium"
          onClick={onCheckout}
          disabled={cartItemsCount === 0}
          sx={{ textTransform: 'none', py: 1.2, fontWeight: 600, fontSize: '0.95rem' }}
        >
          Complete Sale
        </Button>
      </Box>
    </Card>
  )
}
