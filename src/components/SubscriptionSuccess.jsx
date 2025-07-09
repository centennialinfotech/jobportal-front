import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('You must be logged in to verify a payment.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const paymentId = searchParams.get('paymentId');
    const payerId = searchParams.get('PayerID');

    if (!paymentId || !payerId) {
      setError('Missing payment details. Please try again.');
      setLoading(false);
      setTimeout(() => navigate('/subscription'), 3000);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/subscription/verify`,
          { paymentId, payerId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        localStorage.setItem('isAdmin', 'true');
        setLoading(false);
        alert(response.data.message);
        navigate('/profile');
      } catch (err) {
        console.error('Verify error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(
          err.response?.status === 500
            ? 'Server error: Unable to verify payment. Please try again later or contact support.'
            : `Failed to verify subscription: ${err.response?.data?.message || err.message}`
        );
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, token]);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        {loading && (
          <>
            <h1 className="text-2xl font-bold text-text">Processing Payment...</h1>
            <p className="text-text mt-4">Please wait while we verify your subscription.</p>
          </>
        )}
        {error && (
          <>
            <h1 className="text-2xl font-bold text-error">Payment Error</h1>
            <p className="text-error mt-4">{error}</p>
            <button
              onClick={() => navigate('/subscription')}
              className="mt-6 py-2 px-4 rounded-lg bg-accent text-white font-semibold hover:bg-accent/80 transition-colors duration-300"
            >
              Try Again
            </button>
          </>
        )}
        {!loading && !error && (
          <>
            <h1 className="text-2xl font-bold text-success">Subscription Successful</h1>
            <p className="text-text mt-4">Redirecting to your profile...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccess;