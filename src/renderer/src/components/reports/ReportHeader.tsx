interface ReportHeaderProps {
  title: string
  description: string
}

export default function ReportHeader({ title, description }: ReportHeaderProps): React.JSX.Element {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  )
}
