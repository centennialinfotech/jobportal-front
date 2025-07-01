import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import VerifyOtp from './components/VerifyOTP.jsx';
import Profile from './components/Profile.jsx';
import AdminPanel from './components/AdminPanel.jsx'; // Import AdminPanel
import NotFound from './components/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import axios from 'axios';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true' || false); // Store isAdmin
  const [signupEmail, setSignupEmail] = useState('');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin'); // Clear isAdmin
    setToken('');
    setUserId('');
    setIsAdmin(false);
  };

  // Update setToken to also handle isAdmin
  const handleSetToken = (newToken, newUserId, newIsAdmin) => {
    setToken(newToken);
    setUserId(newUserId);
    setIsAdmin(newIsAdmin);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('isAdmin', newIsAdmin);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={!!token} isAdmin={isAdmin} onLogout={logout} />
      <main className="flex-grow flex items-center justify-center py-8">
        <Routes>
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/profile" />
              ) : (
                <Login setToken={handleSetToken} setUserId={setUserId} />
              )
            }
          />
          <Route
            path="/signup"
            element={token ? <Navigate to="/profile" /> : <Signup setSignupEmail={setSignupEmail} />}
          />
          <Route
            path="/verify-otp"
            element={token ? <Navigate to="/profile" /> : <VerifyOtp email={signupEmail} />}
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={!!token}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={!!token && isAdmin}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={token ? '/profile' : '/login'} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
