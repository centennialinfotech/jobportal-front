import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

const AdminProfilePreview = ({ isAdmin, loginType }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin || loginType !== 'admin') {
      navigate('/profile/preview');
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/profile');
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data.message || 'Failed to fetch profile. Please try again.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isAdmin, loginType, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <ClipLoader size={30} color="#4F46E5" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-red-500 text-center font-medium text-lg">{error}</p>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 flex flex-col sm:flex-row items-center gap-4">
          {user.companyLogo ? (
            <div className="relative w-24 h-24 bg-white rounded-lg border-2 border-white shadow-md">
              <img
                src={`${import.meta.env.VITE_API_URL}/api/company-logo/${user.companyLogo}`}
                alt="Company Logo"
                className="w-full h-full object-cover rounded-lg"
                onError={() => setLogoError('Failed to load company logo.')}
              />
              {logoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg border-2 border-white shadow-md">
                  <span className="text-red-500 text-xs text-center">{logoError}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-24 h-24 flex items-center justify-center bg-white rounded-lg border-2 border-white shadow-md">
              <span className="text-gray-500 text-sm">No Logo</span>
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white">{user.companyName || 'Not provided'}</h2>
            <p className="text-indigo-200 text-sm">Admin Account</p>
          </div>
        </div>
        {/* Profile Details */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Email</label>
            <p className="mt-1 text-gray-900 font-semibold bg-gray-100 p-3 rounded-md">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <p className="mt-1 text-gray-900 font-semibold bg-gray-100 p-3 rounded-md">{user.companyName || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Location</label>
            <p className="mt-1 text-gray-900 font-semibold bg-gray-100 p-3 rounded-md">
              {user.city && user.state ? `${user.city}, ${user.state}` : 'Not provided'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Phone</label>
            <p className="mt-1 text-gray-900 font-semibold bg-gray-100 p-3 rounded-md">{user.companyPhone || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-gray-900 font-semibold bg-gray-100 p-3 rounded-md">Admin</p>
          </div>
        </div>
        {/* Action Button */}
        <div className="p-6">
          <button
            onClick={() => navigate('/admin/profile')}
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-transform duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePreview;