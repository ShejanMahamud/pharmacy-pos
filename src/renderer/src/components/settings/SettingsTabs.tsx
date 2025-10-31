import { Receipt, Settings, Storage, Store } from '@mui/icons-material'
import { Paper, Tab, Tabs } from '@mui/material'

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  canAccessBackup: boolean
}

export default function SettingsTabs({
  activeTab,
  onTabChange,
  canAccessBackup
}: SettingsTabsProps): React.JSX.Element {
  const handleChange = (_event: React.SyntheticEvent, newValue: string): void => {
    onTabChange(newValue)
  }

  return (
    <Paper sx={{ mb: 3 }}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Tab
          value="general"
          label="General"
          icon={<Store />}
          iconPosition="start"
          sx={{ minHeight: 64 }}
        />
        <Tab
          value="system"
          label="System"
          icon={<Settings />}
          iconPosition="start"
          sx={{ minHeight: 64 }}
        />
        <Tab
          value="receipt"
          label="Receipt"
          icon={<Receipt />}
          iconPosition="start"
          sx={{ minHeight: 64 }}
        />
        {canAccessBackup && (
          <Tab
            value="backup"
            label="Backup & Restore"
            icon={<Storage />}
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
        )}
      </Tabs>
    </Paper>
  )
}
