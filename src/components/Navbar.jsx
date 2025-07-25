import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar({ isAuthenticated, isAdmin, loginType, hasActiveSubscription, currentPlan, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isAdminRoute = ['/admin/login', '/admin/signup'].includes(location.pathname);
  const isUserRoute = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <header className="bg-gray-800 py-4">
      <div className="mx-auto px-4 flex items-center justify-between" style={{ marginLeft: '16px', marginRight: '16px' }}>
        <Link to="/" className="text-2xl font-bold text-white md:text-xl">
          Job Portal
        </Link>
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>
        <nav className={`md:flex md:items-center md:space-x-4 ${isMenuOpen ? 'block z-50 shadow-lg' : 'hidden'} md:block absolute md:static top-16 right-0 bg-gray-800 w-full md:w-auto`}>
          <div className="flex flex-col md:flex-row md:space-x-4 p-6 md:p-0">
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin && loginType === 'admin' ? '/admin/profile' : '/profile'}
                  className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {isAdmin && loginType === 'admin' ? 'Company Profile' : 'Profile'}
                </Link>
                <Link
                  to={isAdmin && loginType === 'admin' ? '/admin/profile/preview' : '/profile/preview'}
                  className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile Preview
                </Link>
                {isAdmin && loginType === 'admin' && (
                  <>
                    <Link
                      to="/subscription"
                      className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Subscription
                    </Link>
                    {(hasActiveSubscription || currentPlan === 'free') && (
                      <>
                        <Link
                          to="/admin/job-posts"
                          className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Manage Posts
                        </Link>
                      </>
                    )}
                  </>
                )}
                {!isAdmin && (
                  <Link
                    to="/jobs"
                    className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Jobs
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-500 transition-all duration-200 text-lg md:text-base md:px-4 md:py-2 text-left md:text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {isUserRoute && (
                  <>
                    <Link
                      to="/login"
                      className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Signup
                    </Link>
                  </>
                )}
                {isAdminRoute && (
                  <>
                    <Link
                      to="/admin/login"
                      className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Login
                    </Link>
                    <Link
                      to="/admin/signup"
                      className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Signup
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;