import { CurrencyExchange, MobileFriendly } from '@mui/icons-material'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import { Box, Button, Typography } from '@mui/material'
import { BankAccount } from '../../types/pos'

interface PaymentAccountSelectorProps {
  accounts: BankAccount[]
  selectedAccount: string
  onAccountSelect: (accountId: string, accountType: string) => void
}

export default function PaymentAccountSelector({
  accounts,
  selectedAccount,
  onAccountSelect
}: PaymentAccountSelectorProps): React.JSX.Element {
  const getIcon = (type: string): React.JSX.Element | null => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('cash')) return <CurrencyExchange sx={{ fontSize: '1rem' }} />
    if (lowerType.includes('bank')) return <AccountBalanceIcon sx={{ fontSize: '1rem' }} />
    if (lowerType.includes('mobile_banking')) return <MobileFriendly sx={{ fontSize: '1rem' }} />
    return null
  }

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8rem' }}>
        Payment Account
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: 0.5
        }}
      >
        {accounts.map((account) => (
          <Button
            key={account.id}
            fullWidth
            variant={selectedAccount === account.id ? 'contained' : 'outlined'}
            size="small"
            onClick={() => onAccountSelect(account.id, account.accountType)}
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
        ))}
      </Box>
    </Box>
  )
}
