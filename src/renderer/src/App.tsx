import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useBranchStore } from './store/branchStore'
import { useSettingsStore } from './store/settingsStore'

// Pages
import Layout from './components/Layout'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Login from './pages/Login'
import POS from './pages/POS'
import Products from './pages/Products'
import Purchases from './pages/Purchases'
import Reports from './pages/Reports'
import Sales from './pages/Sales'
import Settings from './pages/Settings'

function ProtectedRoute({ children }: { children: React.ReactNode }): React.JSX.Element {
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
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales" element={<Sales />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
