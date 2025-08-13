import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

function AdminVerifyOTP({ email: initialEmail, setToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [otpData, setOtpData] = useState({ email: initialEmail || location.state?.email || '', otp: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    let isMounted = true;
    try {
      const response = await api.post('/api/verify-otp', otpData);
      console.log('OTP verification response:', response.data);
      setMessage(response.data.message);

      if (response.data.message === 'Email verified successfully') {
        // Update global state for admin status
        const isAdmin = location.state?.isAdmin || true;
        setToken(null, '', isAdmin, 'admin'); // No token, set isAdmin and loginType
        console.log('Redirecting to: /admin/login');
        if (isMounted) {
          navigate('/admin/login', { state: { fromOtp: true } });
        }
      }
    } catch (err) {
      console.error('OTP verification error:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
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
      {message && (
        <p className={`mt-4 text-center ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
   
    </div>
  );
}

export default AdminVerifyOTP;