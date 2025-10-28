import { Supplier } from '../../types/supplier'

interface SupplierStatsProps {
  suppliers: Supplier[]
}

export default function SupplierStats({ suppliers }: SupplierStatsProps): React.JSX.Element {
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter((s) => s.isActive).length
  const withEmail = suppliers.filter((s) => s.email).length
  const withTaxId = suppliers.filter((s) => s.taxNumber).length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-sm text-gray-600">Total Suppliers</p>
        <p className="text-2xl font-bold text-blue-600">{totalSuppliers}</p>
      </div>
      <div className="bg-green-50 rounded-lg p-3">
        <p className="text-sm text-gray-600">Active Suppliers</p>
        <p className="text-2xl font-bold text-green-600">{activeSuppliers}</p>
      </div>
      <div className="bg-purple-50 rounded-lg p-3">
        <p className="text-sm text-gray-600">With Email</p>
        <p className="text-2xl font-bold text-purple-600">{withEmail}</p>
      </div>
      <div className="bg-orange-50 rounded-lg p-3">
        <p className="text-sm text-gray-600">With Tax ID</p>
        <p className="text-2xl font-bold text-orange-600">{withTaxId}</p>
      </div>
    </div>
  )
}
