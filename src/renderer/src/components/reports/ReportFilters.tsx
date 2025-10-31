import { Download, Print } from '@mui/icons-material'
import { Box, Button, FormControl, MenuItem, Paper, Select } from '@mui/material'

interface ReportFiltersProps {
  reportType: string
  dateRange: string
  onReportTypeChange: (type: string) => void
  onDateRangeChange: (range: string) => void
  onPrint: () => void
  onExport: () => void
}

export default function ReportFilters({
  reportType,
  dateRange,
  onReportTypeChange,
  onDateRangeChange,
  onPrint,
  onExport
}: ReportFiltersProps): React.JSX.Element {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          {/* Report Type */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select value={reportType} onChange={(e) => onReportTypeChange(e.target.value)}>
              <MenuItem value="overview">Overview</MenuItem>
              <MenuItem value="sales">Sales Report</MenuItem>
              <MenuItem value="inventory">Inventory Report</MenuItem>
              <MenuItem value="customer">Customer Report</MenuItem>
            </Select>
          </FormControl>

          {/* Date Range */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select value={dateRange} onChange={(e) => onDateRangeChange(e.target.value)}>
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Print />} onClick={onPrint}>
            Print
          </Button>
          <Button variant="contained" startIcon={<Download />} onClick={onExport}>
            Export
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}
