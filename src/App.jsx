import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar.jsx';
import Login from './components/Login.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import Signup from './components/Signup.jsx';
import AdminSignup from './components/AdminSignup.jsx';
import VerifyOtp from './components/VerifyOTP.jsx';
import Profile from './components/Profile.jsx';
import ProfilePreview from './components/ProfilePreview.jsx';
import AdminProfile from './components/AdminProfile.jsx';
import AdminProfilePreview from './components/AdminProfilePreview.jsx';
import NotFound from './components/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HiringPosts from './components/HiringPosts.jsx';
import JobList from './components/JobList.jsx';
import JobApplications from './components/JobApplications.jsx';
import Subscription from './components/Subscription.jsx';
import SubscriptionSuccess from './components/SubscriptionSuccess.jsx';
import SubscriptionCancel from './components/SubscriptionCancel.jsx';
import AdminResetPassword from './components/AdminResetPassword';
import ResetPassword from './components/ResetPassword.jsx';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [loginType, setLoginType] = useState(localStorage.getItem('loginType') || '');
  const [signupEmail, setSignupEmail] = useState('');
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(localStorage.getItem('currentPlan') || null);
  const [logoutRoute, setLogoutRoute] = useState(null);
  const location = useLocation();

  useEffect(() => {
    console.log('Navigation occurred to:', location.pathname, {
      isAuthenticated: !!token,
      isAdmin,
      loginType,
      isNewUser: localStorage.getItem('isNewUser'),
    });
  }, [location]);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (isAdmin && loginType === 'admin' && token) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/subscription/current`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setHasActiveSubscription(response.data.isActive);
          setCurrentPlan(response.data.plan || null);
          localStorage.setItem('currentPlan', response.data.plan || '');
          console.log('Subscription status fetched:', {
            isActive: response.data.isActive,
            plan: response.data.plan,
            isAdmin: response.data.isAdmin,
          });
        } catch (err) {
          console.error('Fetch subscription status error:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });
          setHasActiveSubscription(false);
          setCurrentPlan(null);
          localStorage.setItem('currentPlan', '');
        }
      }
    };
    fetchSubscriptionStatus();
  }, [isAdmin, loginType, token]);

  useEffect(() => {
    if (!token && logoutRoute) {
      console.log('Clearing logoutRoute after navigation to:', logoutRoute);
      setTimeout(() => setLogoutRoute(null), 300);
    }
  }, [token, logoutRoute]);

  const logout = (type) => {
    console.log('logout called with type:', type);
    setLogoutRoute(type === 'admin' ? '/admin/login' : '/login');
    setTimeout(() => {
      setToken('');
      setUserId('');
      setIsAdmin(false);
      setLoginType('');
      setHasActiveSubscription(false);
      setCurrentPlan(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('loginType');
      localStorage.removeItem('currentPlan');
      console.log('State and localStorage cleared');
    }, 300);
  };

  const handleSetToken = (newToken, newUserId, newIsAdmin, newLoginType) => {
    console.log('handleSetToken:', { newToken, newUserId, newIsAdmin, newLoginType });
    setToken(newToken);
    setUserId(newUserId);
    setIsAdmin(newIsAdmin);
    setLoginType(newLoginType);
    setCurrentPlan(null);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('isAdmin', newIsAdmin);
    localStorage.setItem('loginType', newLoginType);
    localStorage.setItem('currentPlan', '');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isAuthenticated={!!token}
        isAdmin={isAdmin}
        loginType={loginType}
        hasActiveSubscription={hasActiveSubscription}
        currentPlan={currentPlan}
        onLogout={logout}
      />
      <main className="flex-grow flex items-center justify-center py-8">
        <Routes>
          <Route
            path="/"
            element={
              token ? (
                <Navigate
                  to={
                    isAdmin && loginType === 'admin'
                      ? localStorage.getItem('isNewUser') === 'true'
                        ? '/admin/profile'
                        : '/admin/profile/preview'
                      : localStorage.getItem('isNewUser') === 'true'
                      ? '/profile'
                      : '/profile/preview'
                  }
                  replace
                />
              ) : (
                <Navigate to={logoutRoute || '/login'} replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              token ? (
                <Navigate
                  to={
                    isAdmin && loginType === 'admin'
                      ? localStorage.getItem('isNewUser') === 'true'
                        ? '/admin/profile'
                        : '/admin/profile/preview'
                      : localStorage.getItem('isNewUser') === 'true'
                      ? '/profile'
                      : '/profile/preview'
                  }
                  replace
                />
              ) : (
                <Login setToken={handleSetToken} />
              )
            }
          />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin/reset-password/:token" element={<AdminResetPassword />} />
          <Route
            path="/admin/login"
            element={
              token && logoutRoute !== '/admin/login' ? (
                <Navigate
                  to={
                    isAdmin && loginType === 'admin'
                      ? localStorage.getItem('isNewUser') === 'true'
                        ? '/admin/profile'
                        : '/admin/profile/preview'
                      : localStorage.getItem('isNewUser') === 'true'
                      ? '/profile'
                      : '/profile/preview'
                  }
                  replace
                />
              ) : (
                <AdminLogin setToken={handleSetToken} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              token ? (
                <Navigate
                  to={
                    isAdmin && loginType === 'admin'
                      ? localStorage.getItem('isNewUser') === 'true'
                        ? '/admin/profile'
                        : '/admin/profile/preview'
                      : localStorage.getItem('isNewUser') === 'true'
                      ? '/profile'
                      : '/profile/preview'
                  }
                  replace
                />
              ) : (
                <Signup setSignupEmail={setSignupEmail} />
              )
            }
          />
          <Route
            path="/admin/signup"
            element={
              token ? (
                <Navigate
                  to={
                    isAdmin && loginType === 'admin'
                      ? localStorage.getItem('isNewUser') === 'true'
                        ? '/admin/profile'
                        : '/admin/profile/preview'
                      : localStorage.getItem('isNewUser') === 'true'
                      ? '/profile'
                      : '/profile/preview'
                  }
                  replace
                />
              ) : (
                <AdminSignup setSignupEmail={setSignupEmail} />
              )
            }
          />
          <Route
            path="/verify-otp"
            element={
              token ? (
                <Navigate
                  to={
                    isAdmin && loginType === 'admin'
                      ? localStorage.getItem('isNewUser') === 'true'
                        ? '/admin/profile'
                        : '/admin/profile/preview'
                      : localStorage.getItem('isNewUser') === 'true'
                      ? '/profile'
                      : '/profile/preview'
                  }
                  replace
                />
              ) : (
                <VerifyOtp email={signupEmail} />
              )
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={!!token} isAdmin={isAdmin} loginType={loginType} logoutRoute={logoutRoute}>
                <Profile isAdmin={isAdmin} loginType={loginType} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/preview"
            element={
              <ProtectedRoute isAuthenticated={!!token} isAdmin={isAdmin} loginType={loginType} logoutRoute={logoutRoute}>
                <ProfilePreview isAdmin={isAdmin} loginType={loginType} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute isAuthenticated={!!token && isAdmin && loginType === 'admin'} isAdmin={isAdmin} loginType={loginType} logoutRoute={logoutRoute}>
                <AdminProfile isAdmin={isAdmin} loginType={loginType} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile/preview"
            element={
              <ProtectedRoute isAuthenticated={!!token && isAdmin && loginType === 'admin'} isAdmin={isAdmin} loginType={loginType} logoutRoute={logoutRoute}>
                <AdminProfilePreview isAdmin={isAdmin} loginType={loginType} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/job-posts"
            element={
              <ProtectedRoute isAuthenticated={!!token && isAdmin && (hasActiveSubscription || currentPlan === 'free')} isAdmin={isAdmin} loginType={loginType} logoutRoute={logoutRoute}>
                <HiringPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/job-posts/:id/applications"
            element={
              <ProtectedRoute isAuthenticated={!!token && isAdmin && (hasActiveSubscription || currentPlan === 'free')} isAdmin={isAdmin} loginType={loginType} logoutRoute={logoutRoute}>
                <JobApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute isAuthenticated={!!token} isAdmin={isAdmin} loginType={loginType} logoutRoute={logoutRoute}>
                <JobList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute isAuthenticated={!!token && isAdmin && loginType === 'admin'} isAdmin={isAdmin} loginType={loginType} logoutRoute={logoutRoute}>
                <Subscription setHasActiveSubscription={setHasActiveSubscription} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription/success"
            element={
              <ProtectedRoute isAuthenticated={!!token && isAdmin} isAdmin={isAdmin} loginType={loginType} logoutRoute={logoutRoute}>
                <SubscriptionSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription/cancel"
            element={
              <ProtectedRoute isAuthenticated={!!token && isAdmin} isAdmin={isAdmin} loginType={loginType} logoutRoute={logoutRoute}>
                <SubscriptionCancel />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;