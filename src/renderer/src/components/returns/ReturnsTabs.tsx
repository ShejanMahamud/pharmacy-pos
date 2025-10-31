import { Box, Paper, Tab, Tabs } from '@mui/material'
import { TabType } from '../../types/return'

interface ReturnsTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export default function ReturnsTabs({
  activeTab,
  onTabChange
}: ReturnsTabsProps): React.JSX.Element {
  const handleChange = (_event: React.SyntheticEvent, newValue: TabType): void => {
    onTabChange(newValue)
  }

  return (
    <Paper sx={{ mb: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleChange}>
          <Tab label="Sales Returns" value="sales-returns" />
          <Tab label="Purchase Returns" value="purchase-returns" />
          <Tab label="Damaged/Expired Items" value="damaged-expired" />
        </Tabs>
      </Box>
    </Paper>
  )
}
