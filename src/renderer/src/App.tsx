import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useBranchStore } from './store/branchStore'
import { useSettingsStore } from './store/settingsStore'

// Pages
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import SessionChecker from './components/SessionChecker'
import BankAccounts from './pages/BankAccounts'
import CategoryUnit from './pages/CategoryUnit'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Login from './pages/Login'
import POS from './pages/POS'
import Products from './pages/Products'
import Purchases from './pages/Purchases'
import Reports from './pages/Reports'
import RoleManagement from './pages/RoleManagement'
import Sales from './pages/Sales'
import Settings from './pages/Settings'
import SupplierLedger from './pages/SupplierLedger'
import Suppliers from './pages/Suppliers'
import Users from './pages/Users'

function AuthRoute({ children }: { children: React.ReactNode }): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App(): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const loadBranches = useBranchStore((state) => state.loadBranches)
  const loadSettings = useSettingsStore((state) => state.loadSettings)

  useEffect(() => {
    if (isAuthenticated) {
      loadBranches()
      loadSettings()
    }
  }, [isAuthenticated, loadBranches, loadSettings])

  return (
    <HashRouter>
      <Toaster position="top-right" />
      <SessionChecker />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthRoute>
              <Layout />
            </AuthRoute>
          }
        >
          <Route
            index
            element={
              <ProtectedRoute permission="view_dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="pos"
            element={
              <ProtectedRoute permission="create_sale">
                <POS />
              </ProtectedRoute>
            }
          />
          <Route
            path="products"
            element={
              <ProtectedRoute permission="view_products">
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="categories-units"
            element={
              <ProtectedRoute permission="view_products">
                <CategoryUnit />
              </ProtectedRoute>
            }
          />
          <Route
            path="suppliers"
            element={
              <ProtectedRoute permission="view_products">
                <Suppliers />
              </ProtectedRoute>
            }
          />
          <Route
            path="supplier-ledger"
            element={
              <ProtectedRoute permission="view_products">
                <SupplierLedger />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedRoute permission="view_inventory">
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="sales"
            element={
              <ProtectedRoute permission="view_sales">
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="purchases"
            element={
              <ProtectedRoute permission="view_purchases">
                <Purchases />
              </ProtectedRoute>
            }
          />
          <Route
            path="customers"
            element={
              <ProtectedRoute permission="view_customers">
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="bank-accounts"
            element={
              <ProtectedRoute permission="view_reports">
                <BankAccounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute permission="view_reports">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="roles"
            element={
              <ProtectedRoute permission="manage_roles">
                <RoleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute permission="view_users">
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute permission="view_settings">
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
