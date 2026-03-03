import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './components/LoginPage'
import IntakeForm from './components/IntakeForm'
import InventoryList from './components/InventoryList'
import ProtectedRoute from './components/ProtectedRoute'

function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Inventory Waste Predictor</h1>
            <p className="text-xs text-slate-500">Powered by AI</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">👤 {user.username}</p>
              <p className="text-xs text-blue-600 font-medium">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              🔓 Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}

function ManagerRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'Manager') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout><InventoryList /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/intake"
            element={
              <ManagerRoute>
                <Layout><IntakeForm /></Layout>
              </ManagerRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
