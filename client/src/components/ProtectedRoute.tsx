import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

interface Props {
  role?: 'landlord' | 'tenant' | 'agent';
}

export default function ProtectedRoute({ role }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'landlord' ? '/landlord' : '/tenant'} replace />;
  }

  return <Outlet />;
}
