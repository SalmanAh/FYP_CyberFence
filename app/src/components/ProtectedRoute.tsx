import { type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#000', flexDirection: 'column', gap: '16px',
      }}>
        <div style={{
          width: '32px', height: '32px',
          border: '2px solid rgba(0,144,255,0.2)',
          borderTop: '2px solid #0090ff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#3a3a3a', letterSpacing: '0.1em' }}>
          INITIALIZING...
        </span>
      </div>
    );
  }

  if (!session) return <Navigate to="/" replace />;

  return <>{children}</>;
}
