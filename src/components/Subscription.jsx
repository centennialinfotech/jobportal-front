import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useNavigate, useLocation } from 'react-router-dom';

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  const plans = [
    { name: 'Free', applicants: 1, price: 0, planId: 'free' },
    { name: 'Basic', applicants: 100, price: 10, planId: 'basic' },
    { name: 'Standard', applicants: 200, price: 20, planId: 'standard', isPopular: true },
    { name: 'Premium', applicants: 500, price: 50, planId: 'premium' },
    { name: 'Enterprise', applicants: 1000, price: 100, planId: 'enterprise' },
  ];

  useEffect(() => {
    setLoading(false);
    setError(null);
    setSuccess(null);
    setQrCode(null);
    setSelectedPlan(null);
    setPaymentId(null);

    if (!paypalClientId && !isAdmin) {
      setError('PayPal configuration error: Missing client ID. Please contact support.');
    }
    console.log('PayPal Client ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID);

    // Fetch current subscription with retry
    const fetchCurrentSubscription = async (retries = 3, delay = 1000) => {
      if (!token) return;
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/subscription/current`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCurrentPlan(response.data.plan);
          return;
        } catch (err) {
          console.error('Fetch current subscription error:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            attempt: i + 1,
          });
          if (err.response?.status === 404) {
            setCurrentPlan('free'); // Assume free plan if no subscription exists
            return;
          }
          if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      setError('Failed to fetch current subscription after retries. Please try again later.');
    };

    fetchCurrentSubscription();
  }, [paypalClientId, isAdmin, token]);

  const handleCheckout = async (planId) => {
    if (!token) {
      setError('You must be logged in to subscribe.');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setSelectedPlan(planId);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/subscription/checkout`,
        { plan: planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (planId === 'free') {
        setSuccess('Free plan activated successfully!');
        localStorage.setItem('isAdmin', 'false'); // Free plan sets isAdmin to false
        setCurrentPlan('free');
        setTimeout(() => {
          navigate('/profile');
          setSuccess(null);
        }, 2000);
      } else {
        const { qrCode, paymentId, approvalUrl } = response.data;
        setQrCode(qrCode);
        setPaymentId(paymentId);
        window.open(approvalUrl, '_blank');
        localStorage.setItem('isAdmin', 'true'); // Paid plans set isAdmin to true
      }
    } catch (err) {
      console.error('Checkout error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(
        err.response?.status === 500
          ? `Server error: ${err.response?.data?.message || 'Unable to process subscription'}. Please try again later or contact support.`
          : err.response?.data?.message || 'Failed to initiate subscription'
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

  // Common rendering for both admin and non-admin views
  const renderSubscriptionContent = (title) => (
    <PayPalScriptProvider options={{ 'client-id': paypalClientId }}>
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold text-center text-primary mb-2">{title}</h1>
          <p className="text-text text-lg text-center mb-12">
            Choose a plan to manage your job posts and applicants.
          </p>
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
          {success && (
            <div className="bg-success/10 border-l-4 border-success p-4 rounded-lg mb-8 max-w-2xl mx-auto">
              <p className="text-success text-sm">{success}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.planId}
                className={`relative bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl ${
                  selectedPlan === plan.planId && qrCode && paymentId
                    ? 'min-h-[480px] bg-accent/10 border-2 border-accent'
                    : currentPlan === plan.planId && currentPlan
                    ? 'min-h-[350px] border-4 border-success bg-success/20'
                    : 'min-h-[350px] border border-gray-200'
                } ${plan.isPopular && !(selectedPlan === plan.planId && qrCode && paymentId) && currentPlan !== plan.planId ? 'border-2 border-accent' : ''}`}
              >
                {plan.isPopular && !(selectedPlan === plan.planId && qrCode && paymentId) && currentPlan !== plan.planId && (
                  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                {currentPlan === plan.planId && currentPlan && (
                  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-success text-white text-sm font-bold px-4 py-1 rounded-full">
                    Current Plan
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
                    {plan.planId === 'free' ? 'Basic support' : 'Priority support'}
                  </li>
                </ul>
                <button
                  onClick={() => handleCheckout(plan.planId)}
                  disabled={loading || (!paypalClientId && plan.planId !== 'free') || !token || currentPlan === plan.planId}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center ${
                    loading || (!paypalClientId && plan.planId !== 'free') || !token || currentPlan === plan.planId
                      ? 'bg-gray-500 cursor-not-allowed opacity-60'
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
                  ) : currentPlan === plan.planId ? (
                    'Current Plan'
                  ) : (
                    plan.planId === 'free' ? 'Switch to Free Plan' : 'Pay Now'
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
          {isAdmin && (
            <button
              onClick={() => navigate('/admin/job-posts')}
              className="mt-6 py-3 px-6 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 transition-colors duration-300 mx-auto block"
            >
              Go to Manage Posts
            </button>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );

  // Non-admin view for /subscription or admin view for /admin/subscription/switch
  if (!paypalClientId && !isAdmin) {
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

  return renderSubscriptionContent('Choose Your Subscription Plan');
};

export default Subscription;
