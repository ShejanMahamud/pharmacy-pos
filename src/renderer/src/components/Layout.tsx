import { Link, Outlet, useLocation } from 'react-router-dom'
import { usePermissions } from '../hooks/usePermissions'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { Permission } from '../utils/permissions'

export default function Layout(): React.JSX.Element {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const storeName = useSettingsStore((state) => state.storeName)
  const { hasPermission } = usePermissions()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/',
      permission: 'view_dashboard' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      )
    },
    {
      name: 'POS',
      path: '/pos',
      permission: 'create_sale' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      )
    },
    {
      name: 'Products',
      path: '/products',
      permission: 'view_products' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      )
    },
    {
      name: 'Inventory',
      path: '/inventory',
      permission: 'view_inventory' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      )
    },
    {
      name: 'Sales',
      path: '/sales',
      permission: 'view_sales' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    },
    {
      name: 'Purchases',
      path: '/purchases',
      permission: 'view_purchases' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      )
    },
    {
      name: 'Returns',
      path: '/returns',
      permission: 'view_purchases' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
          />
        </svg>
      )
    },
    {
      name: 'Suppliers',
      path: '/suppliers',
      permission: 'view_products' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      )
    },
    {
      name: 'Customers',
      path: '/customers',
      permission: 'view_customers' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      )
    },
    {
      name: 'Accounts',
      path: '/bank-accounts',
      permission: 'view_reports' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      )
    },
    {
      name: 'Reports',
      path: '/reports',
      permission: 'view_reports' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      )
    },
    {
      name: 'Users',
      path: '/users',
      permission: 'view_users' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      )
    },
    {
      name: 'Audit Logs',
      path: '/audit-logs',
      permission: 'view_users' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )
    },
    {
      name: 'Settings',
      path: '/settings',
      permission: 'view_settings' as Permission,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )
    }
  ]

  // Filter navigation based on permissions
  const navigation = navigationItems.filter((item) => hasPermission(item.permission))

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 shadow-2xl flex flex-col">
        {/* Logo Section */}
        <div className="p-5 border-b border-blue-800/50">
          <div className="flex items-center space-x-3 px-1">
            <div className="h-11 w-11 bg-gradient-to-br from-white to-blue-50 rounded-xl flex items-center justify-center shadow-lg shrink-0 ring-2 ring-blue-700/30">
              <span className="text-xl font-extrabold bg-gradient-to-br from-blue-900 to-blue-700 bg-clip-text text-transparent">
                {(storeName || 'POS').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
                {storeName || 'Pharmacy POS'}
              </h1>
              <p className="text-xs text-blue-300/80 font-medium">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-white text-blue-900 shadow-lg shadow-blue-900/20 scale-[1.02]'
                  : 'text-blue-100 hover:bg-blue-800/50 hover:text-white hover:translate-x-0.5 hover:shadow-md'
              }`}
            >
              <span
                className={`mr-3 transition-transform duration-200 ${
                  isActive(item.path)
                    ? 'scale-110 text-blue-600'
                    : 'group-hover:scale-110 text-blue-300'
                }`}
              >
                {item.icon}
              </span>
              <span className="font-semibold text-sm tracking-wide">{item.name}</span>
              {isActive(item.path) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-blue-800/50 bg-blue-950/30">
          <div className="flex items-center mb-3 px-2 py-2 rounded-xl bg-blue-900/30 backdrop-blur-sm">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-blue-400/30 shrink-0">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{user?.fullName}</p>
              <p className="text-xs text-blue-300 capitalize font-medium">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-100 scrollbar-hide">
        <Outlet />
      </main>
    </div>
  )
}
