import { TabType } from '../../types/return'

interface ReturnsTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export default function ReturnsTabs({
  activeTab,
  onTabChange
}: ReturnsTabsProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => onTabChange('sales-returns')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'sales-returns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sales Returns
          </button>
          <button
            onClick={() => onTabChange('purchase-returns')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'purchase-returns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Purchase Returns
          </button>
          <button
            onClick={() => onTabChange('damaged-expired')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'damaged-expired'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Damaged/Expired Items
          </button>
        </nav>
      </div>
    </div>
  )
}
