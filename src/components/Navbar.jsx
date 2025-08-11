import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import NotificationBell from './NotificationBell';

function Navbar({ isAuthenticated, isAdmin, loginType, hasActiveSubscription, currentPlan, onLogout }) {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-600">
          Centennial Infotech
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated ? (
            <>
              {isAdmin && loginType === 'admin' ? (
                <>
                  <NavLink
                    to="/admin/profile/preview"
                    className={({ isActive }) =>
                      `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                    }
                  >
                    Profile
                  </NavLink>
                  {(hasActiveSubscription || currentPlan === 'free') && (
                    <NavLink
                      to="/admin/job-posts"
                      className={({ isActive }) =>
                        `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                      }
                    >
                      Job Posts
                    </NavLink>
                  )}
                  <NavLink
                    to="/subscription"
                    className={({ isActive }) =>
                      `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                    }
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
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/jobs"
                    className={({ isActive }) =>
                      `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                    }
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
                onClick={() => onLogout(loginType)}
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
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                }
              >
                Signup
              </NavLink>
              <NavLink
                to="/admin/login"
                className={({ isActive }) =>
                  `text-sm sm:text-base ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`
                }
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
