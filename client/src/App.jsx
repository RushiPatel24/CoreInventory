import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'
import { useEffect } from 'react'
import Layout from './components/Layout'

// Auth pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

// App pages
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import StockPage from './pages/StockPage'
import CategoriesPage from './pages/CategoriesPage'
import ReorderRulesPage from './pages/ReorderRulesPage'
import ReceiptsPage from './pages/ReceiptsPage'
import DeliveriesPage from './pages/DeliveriesPage'
import TransfersPage from './pages/TransfersPage'
import AdjustmentsPage from './pages/AdjustmentsPage'
import HistoryPage from './pages/HistoryPage'
import WarehousesPage from './pages/WarehousesPage'
import LocationsPage from './pages/LocationsPage'
import ProfilePage from './pages/ProfilePage'

// Protected route guard
const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return children
}

// Manager-only route guard
const ManagerRoute = ({ children }) => {
  const { user } = useAuthStore()
  if (!user || user.role !== 'manager') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected app routes with sidebar layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Products/Stock */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/stock" element={<StockPage />} />
          <Route path="products/categories" element={<CategoriesPage />} />
          <Route path="products/reorder-rules" element={<ReorderRulesPage />} />

          {/* Operations */}
          <Route path="operations/receipts" element={<ReceiptsPage />} />
          <Route path="operations/deliveries" element={<DeliveriesPage />} />
          <Route path="operations/transfers" element={<TransfersPage />} />
          <Route path="operations/adjustments" element={<AdjustmentsPage />} />
          <Route path="operations/history" element={<HistoryPage />} />

          {/* Settings — Manager only */}
          <Route path="settings/warehouses" element={<ManagerRoute><WarehousesPage /></ManagerRoute>} />
          <Route path="settings/locations" element={<ManagerRoute><LocationsPage /></ManagerRoute>} />

          {/* Profile */}
          <Route path="profile" element={<ProfilePage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
