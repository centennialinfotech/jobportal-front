import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

const ProfilePreview = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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
  }, [navigate]);

  if (loading) {
    return (
      <div className="form-container text-center">
        <ClipLoader size={30} color="#4A90E2" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="form-container">
        <p className="error-message text-center">{error}</p>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="form-container">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Profile Preview</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="text-gray-900 input-field">{user.name}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="text-gray-900 input-field">{user.email}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <p className="text-gray-900 input-field">{user.phone}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">State</label>
          <p className="text-gray-900 input-field">{user.state}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">City</label>
          <p className="text-gray-900 input-field">{user.city}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">House Number and Street</label>
          <p className="text-gray-900 textarea-field">{user.houseNoStreet || 'Not provided'}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">CV</label>
          {user.cvFileId ? (
            <a
              href={`${import.meta.env.VITE_API_URL}/api/cv/${user.cvFileId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View/Download CV
            </a>
          ) : (
            <p className="text-gray-900 input-field">No CV uploaded</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email Verified</label>
          <p className="text-gray-900 input-field">{user.verified ? 'Yes' : 'No'}</p>
        </div>
        {user.isAdmin && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="text-gray-900 input-field">Admin</p>
          </div>
        )}
        <button
          onClick={() => navigate('/profile')}
          className="btn-primary w-full"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfilePreview;
