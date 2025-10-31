import { Box, Typography } from '@mui/material'

interface PaymentSummaryProps {
  subtotal: number
  discountPercent: string
  pointsToRedeem: number
  pointValue: number
  taxRate: number
  total: number
  change: number
  currencySymbol: string
}

export default function PaymentSummary({
  subtotal,
  discountPercent,
  pointsToRedeem,
  pointValue,
  taxRate,
  total,
  change,
  currencySymbol
}: PaymentSummaryProps): React.JSX.Element {
  const discountPercentValue = parseFloat(discountPercent) || 0
  const percentDiscountAmount = (subtotal * discountPercentValue) / 100
  const pointsDiscountAmount = pointsToRedeem * pointValue
  const totalDiscountAmount = percentDiscountAmount + pointsDiscountAmount
  const taxableAmount = subtotal - totalDiscountAmount
  const taxAmount = (taxableAmount * taxRate) / 100

  return (
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
          {currencySymbol}
          {subtotal.toFixed(2)}
        </Typography>
      </Box>

      {/* Percent Discount */}
      {discountPercentValue > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
            Discount ({discountPercent}%)
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#f44336' }}
          >
            -{currencySymbol}
            {percentDiscountAmount.toFixed(2)}
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
            -{currencySymbol}
            {pointsDiscountAmount.toFixed(2)}
          </Typography>
        </Box>
      )}

      {/* Tax */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
          Tax ({taxRate}%)
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
          {currencySymbol}
          {taxAmount.toFixed(2)}
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
            {currencySymbol}
            {total.toFixed(2)}
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
            {currencySymbol}
            {change.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
