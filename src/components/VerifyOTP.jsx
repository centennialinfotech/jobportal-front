import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

function VerifyOTP({ email: initialEmail }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [otpData, setOtpData] = useState({ email: initialEmail || location.state?.email || '', otp: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/api/verify-otp', otpData);
      setMessage(response.data.message);

      // Determine isAdmin status
      let isAdmin = location.state?.isAdmin || false;
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profileResponse = await api.get('/api/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          isAdmin = profileResponse.data.isAdmin || false;
          console.log('Profile fetched after OTP verification:', { isAdmin });
        } catch (profileErr) {
          console.error('Error fetching profile:', profileErr);
          // Fallback to location.state.isAdmin
          console.log('Falling back to location.state.isAdmin:', isAdmin);
        }
      } else {
        console.warn('No token found, using location.state.isAdmin:', isAdmin);
      }

      // Redirect based on isAdmin
      setTimeout(() => {
        const redirectPath = isAdmin ? '/admin/login' : '/login';
        console.log('Redirecting to:', redirectPath);
        navigate(redirectPath);
      }, 2000);
    } catch (err) {
      console.error('OTP verification error:', err);
      setMessage(err.response?.data?.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/api/resend-otp', {
        email: otpData.email,
      });
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resending OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={otpData.email}
            onChange={(e) => setOtpData({ ...otpData, email: e.target.value })}
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!!initialEmail || !!location.state?.email}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">OTP</label>
          <input
            type="text"
            value={otpData.otp}
            onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? <ClipLoader size={20} color="#fff" /> : 'Verify OTP'}
        </button>
      </form>
      <button
        onClick={handleResendOtp}
        disabled={loading}
        className="mt-4 w-full bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 disabled:bg-gray-300"
      >
        {loading ? <ClipLoader size={20} color="#fff" /> : 'Resend OTP'}
      </button>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
}

export default VerifyOTP;