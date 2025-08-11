import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import NotificationBell from './NotificationBell';

function Navbar({ isAuthenticated, isAdmin, loginType, hasActiveSubscription, currentPlan, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-600">
          Centennial Infotech
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="sm:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            isMobileMenuOpen ? 'flex' : 'hidden'
          } sm:flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 absolute sm:static top-16 left-0 right-0 bg-white sm:bg-transparent p-4 sm:p-0 shadow-md sm:shadow-none z-30`}
        >
          {isAuthenticated ? (
            <>
              {isAdmin && loginType === 'admin' ? (
                <>
                  <NavLink
                    to="/admin/profile/preview"
                    className={({ isActive }) =>
                      `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </NavLink>
                  {(hasActiveSubscription || currentPlan === 'free') && (
                    <NavLink
                      to="/admin/job-posts"
                      className={({ isActive }) =>
                        `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Job Posts
                    </NavLink>
                  )}
                  <NavLink
                    to="/subscription"
                    className={({ isActive }) =>
                      `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Subscription
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/profile/preview"
                    className={({ isActive }) =>
                      `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/jobs"
                    className={({ isActive }) =>
                      `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Jobs
                  </NavLink>
                </>
              )}
              <NotificationBell
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                loginType={loginType}
              />
              <button
                onClick={() => {
                  onLogout(loginType);
                  setIsMobileMenuOpen(false);
                }}
                className="text-sm sm:text-base text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Signup
              </NavLink>
              <NavLink
                to="/admin/login"
                className={({ isActive }) =>
                  `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Login
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
