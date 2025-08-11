import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://jobportal-back-1jtg.onrender.com',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function NotificationBell({ isAuthenticated, isAdmin, loginType }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Fetch notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/notifications');
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.isRead).length);
        console.log('Notifications fetched:', response.data);
      } catch (error) {
        console.error('Error fetching notifications:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Navigate to notifications page
  const handleBellClick = () => {
    if (isAuthenticated) {
      navigate('/notifications');
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => prev - 1);
      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Icon (SVG) */}
      <button
        onClick={handleBellClick}
        className="relative flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 focus:outline-none"
        aria-label={`Notifications, ${unreadCount} unread`}
        disabled={!isAuthenticated}
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-3.5-6.2l-2.8 3.4h2.8V15h-5v-1.8l2.8-3.4H9.5V8h5v1.8z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

// Separate component for the Notifications page
function NotificationsPage({ isAuthenticated, notifications, unreadCount, markAsRead }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Notifications {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 ml-2 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 text-sm sm:text-base"
              aria-label="Back to main page"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Notification Content */}
        {!isAuthenticated ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500 text-base">
            Please log in to view notifications
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500 text-base">
            No notifications
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    notification.isRead ? 'bg-gray-100' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-lg sm:text-xl font-medium text-gray-800">
                        {notification.message}
                      </p>
                      {notification.jobId && (
                        <div className="mt-3 text-sm sm:text-base text-gray-500">
                          <p><strong>Job:</strong> {notification.jobId.title}</p>
                          <p><strong>Company:</strong> {notification.jobId.companyName}</p>
                          <p><strong>Location:</strong> {notification.jobId.location}</p>
                          <p><strong>Type:</strong> {notification.jobId.workType}</p>
                          <p><strong>Skills:</strong> {notification.jobId.skills.join(', ')}</p>
                          {notification.jobId._id && (
                            <Link
                              to={`/jobs/${notification.jobId._id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm sm:text-base mt-3 inline-block"
                            >
                              View Job
                            </Link>
                          )}
                        </div>
                      )}
                      <p className="mt-3 text-sm text-gray-400">
                        {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-sm sm:text-base text-blue-600 hover:text-blue-800 whitespace-nowrap"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Export both components
export { NotificationBell, NotificationsPage };
