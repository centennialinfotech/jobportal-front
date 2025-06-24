import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;