import { Tab, Tabs } from '@mui/material'

interface CategoryUnitTabsProps {
  activeTab: 'categories' | 'units'
  onTabChange: (tab: 'categories' | 'units') => void
}

export default function CategoryUnitTabs({ activeTab, onTabChange }: CategoryUnitTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onChange={(_, newValue) => onTabChange(newValue)}
      sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
    >
      <Tab label="Categories" value="categories" />
      <Tab label="Units" value="units" />
    </Tabs>
  )
}
