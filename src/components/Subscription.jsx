import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  const plans = [
    { name: 'Basic', applicants: 100, price: 10, planId: 'basic' },
    { name: 'Standard', applicants: 200, price: 20, planId: 'standard', isPopular: true },
    { name: 'Premium', applicants: 500, price: 50, planId: 'premium' },
    { name: 'Enterprise', applicants: 1000, price: 100, planId: 'enterprise' },
  ];

  useEffect(() => {
    setLoading(false);
    setError(null);
    setQrCode(null);
    setSelectedPlan(null);
    setPaymentId(null);

    if (!paypalClientId) {
      setError('PayPal configuration error: Missing client ID. Please contact support.');
    }
    console.log('PayPal Client ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID);
  }, [paypalClientId]);

  const handleCheckout = async (planId) => {
    if (!paypalClientId) {
      setError('PayPal configuration error: Missing client ID. Please contact support.');
      return;
    }
    if (!token) {
      setError('You must be logged in to subscribe.');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedPlan(planId);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/subscription/checkout`,
        { plan: planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { qrCode, paymentId, approvalUrl } = response.data;
      setQrCode(qrCode);
      setPaymentId(paymentId);
      window.open(approvalUrl, '_blank');
    } catch (err) {
      console.error('Checkout error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(
        err.response?.status === 500
          ? `Server error: ${err.response?.data?.message || 'Unable to process payment'}. Please try again later or contact support.`
          : err.response?.data?.message || 'Failed to initiate checkout'
      );
      setSelectedPlan(null);
      setQrCode(null);
      setPaymentId(null);
    } finally {
      setLoading(false);
    }
  };

  const dismissError = () => {
    setError(null);
  };

  if (error && !paypalClientId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-error mb-4">Configuration Error</h1>
          <p className="text-text text-lg mb-6">{error}</p>
          <button
            onClick={() => navigate('/profile')}
            className="py-3 px-6 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 transition-colors duration-300"
          >
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ 'client-id': paypalClientId }}>
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold text-center text-primary mb-2">Choose Your Subscription Plan</h1>
          <p className="text-text text-lg text-center mb-12">Unlock premium features to post jobs and manage applicants.</p>
          {error && (
            <div className="bg-error/10 border-l-4 border-error p-4 rounded-lg mb-8 max-w-2xl mx-auto flex items-center justify-between">
              <p className="text-error text-sm">{error}</p>
              <button
                onClick={dismissError}
                className="text-error hover:text-error/80 text-sm font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.planId}
                className={`relative bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl ${
                  selectedPlan === plan.planId && qrCode && paymentId
                    ? 'min-h-[480px] bg-accent/5 border-2 border-accent'
                    : 'min-h-[350px] border border-gray-200'
                } ${plan.isPopular && !(selectedPlan === plan.planId && qrCode && paymentId) ? 'border-2 border-accent' : ''}`}
              >
                {plan.isPopular && (
                  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h2 className="text-2xl font-bold text-primary mb-3">{plan.name}</h2>
                <p className="text-text text-sm mb-2">Up to {plan.applicants.toLocaleString()} applicants per job post</p>
                <div className="text-3xl font-extrabold text-text mb-4">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-500">/month</span>
                </div>
                <ul className="text-text text-sm mb-6 space-y-2">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {plan.applicants} applicants per post
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Full applicant management
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Priority support
                  </li>
                </ul>
                <button
                  onClick={() => handleCheckout(plan.planId)}
                  disabled={loading || !paypalClientId || !token}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center ${
                    loading || !paypalClientId || !token
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90'
                  }`}
                >
                  {loading && selectedPlan === plan.planId ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </button>
                {selectedPlan === plan.planId && qrCode && paymentId && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-text text-sm mb-3 font-medium">Scan to pay with PayPal or click below:</p>
                    <img src={qrCode} alt="PayPal QR Code" className="mx-auto w-40 h-40" />
                    <a
                      href={qrCode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-accent hover:underline font-medium"
                    >
                      Pay with PayPal
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default Subscription;