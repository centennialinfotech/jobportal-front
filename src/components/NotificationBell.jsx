import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

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

function NotificationPage({ isAuthenticated, isAdmin, loginType }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

export default NotificationPage;
