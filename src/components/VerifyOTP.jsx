import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function VerifyOTP({ email: initialEmail }) {
  const navigate = useNavigate();
  const [otpData, setOtpData] = useState({ email: initialEmail || '', otp: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/verify-otp', otpData);
      setMessage(response.data.message);

      // ✅ Redirect to login after successful verification
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Delay for user to read the success message
    } catch (err) {
      console.error('OTP verification error:', err);
      setMessage(err.response?.data?.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/resend-otp', {
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
            disabled={!!initialEmail}
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
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
      <button
        onClick={handleResendOtp}
        disabled={loading}
        className="mt-4 w-full bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 disabled:bg-gray-300"
      >
        {loading ? 'Resending...' : 'Resend OTP'}
      </button>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
}

export default VerifyOTP;
