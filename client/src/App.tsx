import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import LandlordLayout from '@/layouts/LandlordLayout';
import TenantLayout from '@/layouts/TenantLayout';
import TenantDashboardPage from '@/pages/tenant/TenantDashboardPage';
import PropertiesPage from '@/pages/landlord/PropertiesPage';

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'landlord' ? '/landlord' : '/tenant'} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Landlord */}
      <Route element={<ProtectedRoute role="landlord" />}>
        <Route element={<LandlordLayout />}>
          <Route path="/landlord" element={<PropertiesPage />} />
        </Route>
      </Route>

      {/* Tenant */}
      <Route element={<ProtectedRoute role="tenant" />}>
        <Route element={<TenantLayout />}>
          <Route path="/tenant" element={<TenantDashboardPage />} />
        </Route>
      </Route>

      {/* Root */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
