import { Routes, Route } from 'react-router'
import { ToastProvider } from '@/context/ToastContext'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppShell from '@/components/AppShell'
import LandingPage from '@/pages/LandingPage'
import Dashboard from '@/pages/Dashboard'
import Nodes from '@/pages/Nodes'
import NetworkAnomalies from '@/pages/NetworkAnomalies'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>
          } />
          <Route path="/nodes" element={
            <ProtectedRoute><AppShell><Nodes /></AppShell></ProtectedRoute>
          } />
          <Route path="/anomalies" element={
            <ProtectedRoute><AppShell><NetworkAnomalies /></AppShell></ProtectedRoute>
          } />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
