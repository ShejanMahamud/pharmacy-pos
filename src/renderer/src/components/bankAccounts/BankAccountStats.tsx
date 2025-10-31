import { AccountBalance, AccountBalanceWallet, PhoneAndroid, Wallet } from '@mui/icons-material'
import { Avatar, Box, Paper, Typography } from '@mui/material'
import { BankAccount } from '../../types/bankAccount'

interface BankAccountStatsProps {
  accounts: BankAccount[]
}

export default function BankAccountStats({ accounts }: BankAccountStatsProps): React.JSX.Element {
  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0)
  const totalCash = accounts
    .filter((a) => a.accountType === 'cash')
    .reduce((sum, account) => sum + account.currentBalance, 0)
  const totalBank = accounts
    .filter((a) => a.accountType === 'bank')
    .reduce((sum, account) => sum + account.currentBalance, 0)
  const totalMobile = accounts
    .filter((a) => a.accountType === 'mobile_banking')
    .reduce((sum, account) => sum + account.currentBalance, 0)

  const stats = [
    {
      title: 'Total Balance',
      value: `$${totalBalance.toFixed(2)}`,
      subtitle: 'All accounts combined',
      icon: <Wallet sx={{ color: 'white' }} />,
      color: 'primary.main',
      bgColor: 'primary.main'
    },
    {
      title: 'Cash',
      value: `$${totalCash.toFixed(2)}`,
      subtitle: 'Cash in hand',
      icon: <AccountBalanceWallet sx={{ color: 'white' }} />,
      color: 'primary.light',
      bgColor: 'primary.light'
    },
    {
      title: 'Bank Accounts',
      value: `$${totalBank.toFixed(2)}`,
      subtitle: 'Bank account balance',
      icon: <AccountBalance sx={{ color: 'white' }} />,
      color: 'secondary.main',
      bgColor: 'secondary.light'
    },
    {
      title: 'Mobile Banking',
      value: `$${totalMobile.toFixed(2)}`,
      subtitle: 'Mobile banking balance',
      icon: <PhoneAndroid sx={{ color: 'white' }} />,
      color: 'warning.main',
      bgColor: 'warning.light'
    }
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3
      }}
    >
      {stats.map((stat, index) => (
        <Paper key={index} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                {stat.title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {stat.subtitle}
              </Typography>
            </Box>
            <Avatar sx={{ width: 48, height: 48, bgcolor: stat.bgColor, color: stat.color }}>
              {stat.icon}
            </Avatar>
          </Box>
        </Paper>
      ))}
    </Box>
  )
}
