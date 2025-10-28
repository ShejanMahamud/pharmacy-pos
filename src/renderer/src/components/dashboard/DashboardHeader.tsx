interface DashboardHeaderProps {
  userName: string
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-sm text-gray-600 mt-1">
        Welcome back, {userName}! Here&apos;s what&apos;s happening today.
      </p>
    </div>
  )
}
