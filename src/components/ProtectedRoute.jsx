import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, isAuthenticated, isAdmin, loginType, logoutRoute }) {
  if (!isAuthenticated) {
    console.log('ProtectedRoute redirecting, isAdmin:', isAdmin, 'loginType:', loginType, 'logoutRoute:', logoutRoute);
    return <Navigate to={logoutRoute || (isAdmin && loginType === 'admin' ? '/admin/login' : '/login')} replace />;
  }
  return children;
}

export default ProtectedRoute;