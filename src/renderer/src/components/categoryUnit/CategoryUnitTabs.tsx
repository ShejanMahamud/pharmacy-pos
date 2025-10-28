interface CategoryUnitTabsProps {
  activeTab: 'categories' | 'units'
  onTabChange: (tab: 'categories' | 'units') => void
}

export default function CategoryUnitTabs({ activeTab, onTabChange }: CategoryUnitTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => onTabChange('categories')}
          className={`${
            activeTab === 'categories'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Categories
        </button>
        <button
          onClick={() => onTabChange('units')}
          className={`${
            activeTab === 'units'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Units
        </button>
      </nav>
    </div>
  )
}
