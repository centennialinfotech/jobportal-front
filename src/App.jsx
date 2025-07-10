import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import VerifyOtp from './components/VerifyOTP.jsx';
import Profile from './components/Profile.jsx';
import ProfilePreview from './components/ProfilePreview.jsx';
import NotFound from './components/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HiringPosts from './components/HiringPosts.jsx';
import JobList from './components/JobList.jsx';
import JobApplications from './components/JobApplications.jsx';
import Subscription from './components/Subscription.jsx';
import SubscriptionSuccess from './components/SubscriptionSuccess.jsx';
import SubscriptionCancel from './components/SubscriptionCancel.jsx';
import AdminUsers from './components/AdminUsers.jsx';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [signupEmail, setSignupEmail] = useState('');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    setToken('');
    setUserId('');
    setIsAdmin(false);
  };

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
                <Navigate to={isAdmin ? '/admin/job-posts' : '/profile'} />
              ) : (
                <Login setToken={handleSetToken} />
              )
            }
          />
          <Route
            path="/signup"
            element={token ? <Navigate to={isAdmin ? '/admin/job-posts' : '/profile'} /> : <Signup setSignupEmail={setSignupEmail} />}
          />
          <Route
            path="/verify-otp"
            element={token ? <Navigate to={isAdmin ? '/admin/job-posts' : '/profile'} /> : <VerifyOtp email={signupEmail} />}
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
            path="/profile/preview"
            element={
              <ProtectedRoute isAuthenticated={!!token}>
                <ProfilePreview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/job-posts"
            element={
              <ProtectedRoute isAuthenticated={!!token && isAdmin}>
                <HiringPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/job-posts/:id/applications"
            element={
              <ProtectedRoute isAuthenticated={!!token && isAdmin}>
                <JobApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute isAuthenticated={!!token && isAdmin}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute isAuthenticated={!!token}>
                <JobList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute isAuthenticated={!!token}>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription/success"
            element={
              <ProtectedRoute isAuthenticated={!!token}>
                <SubscriptionSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription/cancel"
            element={
              <ProtectedRoute isAuthenticated={!!token}>
                <SubscriptionCancel />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={token ? (isAdmin ? '/admin/job-posts' : '/profile') : '/login'} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;