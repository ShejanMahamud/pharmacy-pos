import { Box, Button, Paper, TextField, Typography } from '@mui/material'

interface ReceiptSettingsFormProps {
  receiptFooter: string
  onReceiptFooterChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export default function ReceiptSettingsForm({
  receiptFooter,
  onReceiptFooterChange,
  onSubmit
}: ReceiptSettingsFormProps): React.JSX.Element {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="semibold" gutterBottom>
          Receipt Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Customize your receipt and invoice format
        </Typography>
      </Box>

      <Box component="form" onSubmit={onSubmit}>
        <TextField
          label="Receipt Footer Text"
          value={receiptFooter}
          onChange={(e) => onReceiptFooterChange(e.target.value)}
          placeholder="Enter text to appear at the bottom of receipts"
          multiline
          rows={4}
          fullWidth
          helperText="This text will appear at the bottom of all printed receipts"
        />

        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Button type="submit" variant="contained" size="large">
            Save Changes
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}
