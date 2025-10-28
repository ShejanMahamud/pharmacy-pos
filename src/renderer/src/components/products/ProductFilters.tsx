import { Category } from '../../types/product'

interface ProductFiltersProps {
  searchTerm: string
  categoryFilter: string
  categories: Category[]
  onSearchChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
}

export default function ProductFilters({
  searchTerm,
  categoryFilter,
  categories,
  onSearchChange,
  onCategoryFilterChange
}: ProductFiltersProps): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-1">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search by name, SKU or barcode..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Category Filter */}
      <select
        value={categoryFilter}
        onChange={(e) => onCategoryFilterChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  )
}
