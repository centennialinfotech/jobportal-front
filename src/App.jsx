
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import VerifyOtp from './components/VerifyOTP.jsx';
import Profile from './components/Profile.jsx';
import NotFound from './components/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import axios from 'axios';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [signupEmail, setSignupEmail] = useState(''); // Store email from signup

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken('');
    setUserId('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={!!token} onLogout={logout} />
      <main className="flex-grow flex items-center justify-center py-8">
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/profile" /> : <Login setToken={setToken} setUserId={setUserId} />}
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
            element={<ProtectedRoute isAuthenticated={!!token}><Profile /></ProtectedRoute>}
          />
          <Route path="/" element={<Navigate to={token ? '/profile' : '/login'} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
