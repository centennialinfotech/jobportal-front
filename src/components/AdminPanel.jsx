import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('isAdmin');
          navigate('/login');
        }
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleDownload = (fileId, fileName) => {
    const link = document.createElement('a');
    link.href = `${import.meta.env.VITE_API_URL}/api/cv/${fileId}`;
    link.download = fileName || 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel - User Resumes</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {users.length === 0 ? (
            <p className="text-center col-span-full">No resumes found.</p>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-gray-600">{user.phone || 'N/A'}</p>
                <p className="text-gray-600">{user.address || 'N/A'}</p>
                <button
                  onClick={() => handleDownload(user.cvFileId, `${user.name}-resume.pdf`)}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-all"
                >
                  Download Resume
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;