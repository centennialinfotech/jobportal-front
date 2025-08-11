import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NotificationBell } from './NotificationBell';

function Navbar({ isAuthenticated, isAdmin, loginType, hasActiveSubscription, currentPlan, onLogout, notifications, unreadCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdminRoute = ['/admin/login', '/admin/signup'].includes(location.pathname);
  const isUserRoute = ['/', '/login', '/signup'].includes(location.pathname);

  const handleLogout = () => {
    const storedLoginType = localStorage.getItem('loginType');
    console.log('isAdmin:', isAdmin, 'loginType:', loginType, 'Stored loginType:', storedLoginType);
    onLogout(storedLoginType);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 p-6 md:p-0">
            {isAuthenticated ? (
              <>
                <NavLink
                  to={isAdmin && loginType === 'admin' ? '/admin/profile/preview' : '/profile/preview'}
                  className="text-white text-lg hover:underline my-2 py-3 md:py-0 md:text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </NavLink>
                {isAdmin && loginType === 'admin' && (
                  <>
                    <NavLink
                      to="/subscription"
                      className="text-white text-lg hover:underline my-2 py-3 md:py-0 md:text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Subscription
                    </NavLink>
                    {(hasActiveSubscription || currentPlan === 'free') && (
                      <NavLink
                        to="/admin/job-posts"
                        className="text-white text-lg hover:underline my-2 py-3 md:py-0 md:text-base"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Manage Posts
                      </NavLink>
                    )}
                  </>
                )}
                {!isAdmin && loginType !== 'admin' && (
                  <>
                    <NavLink
                      to="/jobs"
                      className="text-white text-lg hover:underline py-3 my-2 md:py-0 md:text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Jobs
                    </NavLink>
                    <div className="my-2 md:my-0">
                      <NotificationBell
                        isAuthenticated={isAuthenticated}
                        isAdmin={isAdmin}
                        loginType={loginType}
                        notifications={notifications}
                        unreadCount={unreadCount}
                      />
                    </div>
                  </>
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
                    <NavLink
                      to="/login"
                      className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/signup"
                      className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Signup
                    </NavLink>
                  </>
                )}
                {isAdminRoute && (
                  <>
                    <NavLink
                      to="/admin/login"
                      className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Login
                    </NavLink>
                    <NavLink
                      to="/admin/signup"
                      className="text-white text-lg hover:underline py-3 md:py-0 md:text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Signup
                    </NavLink>
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
