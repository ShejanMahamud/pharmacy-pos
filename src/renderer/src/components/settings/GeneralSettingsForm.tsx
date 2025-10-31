import { Paper, Box, Typography, TextField, Button } from '@mui/material'

interface GeneralSettingsFormProps {
  storeName: string
  storePhone: string
  storeEmail: string
  storeAddress: string
  onStoreNameChange: (value: string) => void
  onStorePhoneChange: (value: string) => void
  onStoreEmailChange: (value: string) => void
  onStoreAddressChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export default function GeneralSettingsForm({
  storeName,
  storePhone,
  storeEmail,
  storeAddress,
  onStoreNameChange,
  onStorePhoneChange,
  onStoreEmailChange,
  onStoreAddressChange,
  onSubmit
}: GeneralSettingsFormProps): React.JSX.Element {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="semibold" gutterBottom>
          Store Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Basic information about your pharmacy store
        </Typography>
      </Box>

      <Box component="form" onSubmit={onSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3
          }}
        >
          <TextField
            label="Store Name"
            value={storeName}
            onChange={(e) => onStoreNameChange(e.target.value)}
            placeholder="Enter store name"
            required
            fullWidth
          />

          <TextField
            label="Phone Number"
            type="tel"
            value={storePhone}
            onChange={(e) => onStorePhoneChange(e.target.value)}
            placeholder="Enter phone number"
            fullWidth
          />

          <TextField
            label="Email Address"
            type="email"
            value={storeEmail}
            onChange={(e) => onStoreEmailChange(e.target.value)}
            placeholder="Enter email address"
            fullWidth
          />

          <TextField
            label="Store Address"
            value={storeAddress}
            onChange={(e) => onStoreAddressChange(e.target.value)}
            placeholder="Enter full store address"
            multiline
            rows={3}
            fullWidth
            sx={{ gridColumn: { md: 'span 2' } }}
          />
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" size="large">
            Save Changes
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}
