import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Navbar({ isAuthenticated, isAdmin, loginType, hasActiveSubscription, currentPlan, onLogout }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    console.log('Navbar props:', { isAuthenticated, isAdmin, loginType, hasActiveSubscription, currentPlan });

    if (isAuthenticated && !isAdmin && loginType !== 'admin') {
      const fetchNotifications = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found');
            return;
          }
          const response = await api.get('/api/notifications', {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Sort notifications by createdAt descending
          const sortedNotifications = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setNotifications(sortedNotifications);
          setShowNotifications(sortedNotifications.length > 0); // Show dropdown if notifications exist
          console.log('Fetched notifications:', sortedNotifications.length);
        } catch (error) {
          console.error('Error fetching notifications:', error.response?.data || error.message);
        }
      };
      fetchNotifications();
    }
  }, [isAuthenticated, isAdmin, loginType]);

  const handleNotificationClick = async (notificationId, jobId, jobTitle) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      await api.put(
        `/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifications.map(n => (n._id === notificationId ? { ...n, isRead: true } : n)));
      navigate(`/jobs?search=${encodeURIComponent(jobTitle)}&jobId=${jobId}`);
      console.log('Notification clicked, navigating to:', `/jobs?search=${encodeURIComponent(jobTitle)}&jobId=${jobId}`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = () => {
    console.log('isAdmin:', isAdmin, 'loginType:', loginType);
    const storedLoginType = localStorage.getItem('loginType');
    console.log('Stored loginType:', storedLoginType);
    const targetRoute = storedLoginType === 'admin' ? '/admin/login' : '/login';
    onLogout(storedLoginType);
    navigate(targetRoute);
    console.log('Navigating to:', targetRoute);
    setIsMenuOpen(false);
    setShowNotifications(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (showNotifications && !notifications.length) setShowNotifications(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
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
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 p-6 md:p-0">
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin && loginType === 'admin' ? '/admin/profile/preview' : '/profile/preview'}
                  className="text-white text-lg hover:underline my-2 py-3 md:py-0 md:text-base"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowNotifications(notifications.length > 0);
                  }}
                >
                  Profile
                </Link>
                {isAdmin && loginType === 'admin' && (
                  <>
                    <Link
                      to="/subscription"
                      className="text-white text-lg hover:underline my-2 py-3 md:py-0 md:text-base"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowNotifications(false);
                      }}
                    >
                      Subscription
                    </Link>
                    {(hasActiveSubscription || currentPlan === 'free') && (
                      <Link
                        to="/admin/job-posts"
                        className="text-white text-lg hover:underline my-2 py-3 md:py-0 md:text-base"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowNotifications(false);
                        }}
                      >
                        Manage Posts
                      </Link>
                    )}
                  </>
                )}
                {!isAdmin && (
                  <>
                    <Link
                      to="/jobs"
                      className="text-white text-lg hover:underline py-3 my-2 md:py-0 md:text-base"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowNotifications(notifications.length > 0);
                      }}
                    >
                      Jobs
                    </Link>
                    <div className="relative my-2 md:my-0">
                      <button
                        onClick={() => {
                          setShowNotifications(!showNotifications);
                          setIsMenuOpen(false);
                        }}
                        className="text-white hover:text-gray-200 focus:outline-none relative"
                        aria-label="Notifications"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        {unreadCount > 0 && (
                          <span className="absolute top-[-8px] right-[-8px] bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-4 z-50 border py-0 border-gray-200 max-h-96 overflow-y-auto ">
                          <div className="flex justify-between items-center mb-3 sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                            <button
                              onClick={() => setShowNotifications(false)}
                              className="text-gray-500 hover:text-gray-700 text-sm"
                            >
                              Close
                            </button>
                          </div>
                          {notifications.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center">No notifications</p>
                          ) : (
                            notifications.map((notification, index) => (
                              <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification._id, notification.jobId._id, notification.jobId.title)}
                                className={`p-3 border-b border-gray-100 cursor-pointer rounded-md ${
                                  index < 2 && !notification.isRead ? 'bg-blue-50' : notification.isRead ? 'bg-gray-50' : 'bg-white'
                                } hover:bg-blue-100 transition-colors duration-200`}
                              >
                                <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.jobId.companyName} | {notification.jobId.workType} | {notification.jobId.location}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))
                          )}
                          <div className="mt-3 text-center sticky bottom-0 bg-white z-10">
                            <Link
                              to="/jobs"
                              className="text-blue-600 text-sm hover:underline"
                              onClick={() => setShowNotifications(false)}
                            >
                              View All Jobs
                            </Link>
                          </div>
                        </div>
                      )}
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
