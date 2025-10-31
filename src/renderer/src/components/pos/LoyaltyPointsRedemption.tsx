import { Box, Button, TextField, Typography } from '@mui/material'
import { Customer } from '../../types/pos'

interface LoyaltyPointsRedemptionProps {
  customer: Customer | null
  pointsToRedeem: number
  maxRedeemablePoints: number
  pointValue: number
  currencySymbol: string
  onPointsChange: (points: number) => void
}

export default function LoyaltyPointsRedemption({
  customer,
  pointsToRedeem,
  maxRedeemablePoints,
  pointValue,
  currencySymbol,
  onPointsChange
}: LoyaltyPointsRedemptionProps): React.JSX.Element | null {
  if (!customer || customer.loyaltyPoints <= 0) {
    return null
  }

  return (
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
          Available: {customer.loyaltyPoints} pts ({currencySymbol}
          {(customer.loyaltyPoints * pointValue).toFixed(2)})
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
            onPointsChange(Math.min(Math.max(0, value), maxRedeemablePoints))
          }}
          placeholder="0"
          sx={{ bgcolor: 'white' }}
          inputProps={{ min: 0, max: maxRedeemablePoints }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => onPointsChange(maxRedeemablePoints)}
          sx={{ textTransform: 'none', minWidth: 60, fontSize: '0.7rem' }}
        >
          Max
        </Button>
      </Box>
      {pointsToRedeem > 0 && (
        <Typography variant="caption" sx={{ color: 'success.main', display: 'block', mt: 0.5 }}>
          Discount: {currencySymbol}
          {(pointsToRedeem * pointValue).toFixed(2)}
        </Typography>
      )}
    </Box>
  )
}
