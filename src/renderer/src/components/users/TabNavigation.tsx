import {
  AttachMoney as AttachMoneyIcon,
  EventNote as EventNoteIcon,
  People as PeopleIcon,
  Shield as ShieldIcon
} from '@mui/icons-material'
import { Box, Tab, Tabs } from '@mui/material'

export type TabType = 'users' | 'attendance' | 'salary' | 'permissions'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export default function TabNavigation({
  activeTab,
  onTabChange
}: TabNavigationProps): React.JSX.Element {
  const handleChange = (_event: React.SyntheticEvent, newValue: TabType): void => {
    onTabChange(newValue)
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={activeTab} onChange={handleChange} aria-label="user management tabs">
        <Tab icon={<PeopleIcon />} iconPosition="start" label="Users" value="users" />
        <Tab
          icon={<ShieldIcon />}
          iconPosition="start"
          label="Permission Matrix"
          value="permissions"
        />
        <Tab icon={<EventNoteIcon />} iconPosition="start" label="Attendance" value="attendance" />
        <Tab icon={<AttachMoneyIcon />} iconPosition="start" label="Salary" value="salary" />
      </Tabs>
    </Box>
  )
}
