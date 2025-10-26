import { usePermissions } from '../hooks/usePermissions'
import { Permission } from '../utils/permissions'

interface ProtectedRouteProps {
  children: React.ReactNode
  permission?: Permission
  fallback?: React.ReactNode
}

export default function ProtectedRoute({
  children,
  permission,
  fallback
}: ProtectedRouteProps): React.JSX.Element {
  const { hasPermission } = usePermissions()

  if (permission && !hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-red-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-sm text-gray-600 mb-4">
              You don&apos;t have permission to access this page.
            </p>
            <a
              href="#/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
