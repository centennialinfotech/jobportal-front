import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar({ isAuthenticated, isAdmin, loginType, hasActiveSubscription, currentPlan, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Current path:', location.pathname);
    console.log('Navbar props:', { isAuthenticated, isAdmin, loginType, hasActiveSubscription, currentPlan });
  }, [location, isAuthenticated, isAdmin, loginType, hasActiveSubscription, currentPlan]);

  const handleLogout = () => {
    console.log('isAdmin:', isAdmin, 'loginType:', loginType);
    const storedLoginType = localStorage.getItem('loginType');
    console.log('Stored loginType:', storedLoginType);
    const targetRoute = storedLoginType === 'admin' ? '/admin/login' : '/login';
    onLogout(storedLoginType);
    navigate(targetRoute);
    console.log('Navigating to:', targetRoute);
  };

  const isAdminRoute = ['/admin/login', '/admin/signup'].includes(location.pathname);
  const isUserRoute = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <header className="bg-gray-800 py-4">
      <div className="mx-auto px-4 flex items-center justify-between" style={{ marginLeft: '20px', marginRight: '20px' }}>
        <Link to="/" className="text-xl font-bold text-white">
          Job Portal
        </Link>
        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link
                to={isAdmin && loginType === 'admin' ? '/admin/profile' : '/profile'}
                className="text-white hover:underline"
              >
                {isAdmin && loginType === 'admin' ? 'Company Profile' : 'Profile'}
              </Link>
              <Link
                to={isAdmin && loginType === 'admin' ? '/admin/profile/preview' : '/profile/preview'}
                className="text-white hover:underline"
              >
                Profile Preview
              </Link>
              {isAdmin && loginType === 'admin' && (
                <>
                  <Link to="/subscription" className="text-white hover:underline">
                    Subscription
                  </Link>
                  {(hasActiveSubscription || currentPlan === 'free') && (
                    <>
                      <Link to="/admin/job-posts" className="text-white hover:underline">
                        Manage Posts
                      </Link>
                    </>
                  )}
                </>
              )}
              {!isAdmin && (
                <Link to="/jobs" className="text-white hover:underline">
                  Jobs
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-500 transition-all duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {isUserRoute && (
                <>
                  <Link to="/login" className="text-white hover:underline">
                    Login
                  </Link>
                  <Link to="/signup" className="text-white hover:underline">
                    Signup
                  </Link>
                </>
              )}
              {isAdminRoute && (
                <>
                  <Link to="/admin/login" className="text-white hover:underline">
                    Admin Login
                  </Link>
                  <Link to="/admin/signup" className="text-white hover:underline">
                    Admin Signup
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;