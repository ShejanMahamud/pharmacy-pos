import { Link } from 'react-router-dom'

export default function CategoryUnitHeader() {
  return (
    <div className="mb-6">
      <Link
        to="/products"
        className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Products
      </Link>
      <h2 className="text-2xl font-bold text-gray-900">Categories & Units Management</h2>
      <p className="mt-1 text-sm text-gray-600">Manage product categories and unit types</p>
    </div>
  )
}
