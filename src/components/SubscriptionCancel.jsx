import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-error">Payment Cancelled</h1>
        <p className="text-text mt-4">Your subscription payment was cancelled.</p>
        <button
          onClick={() => navigate('/subscription')}
          className="mt-6 py-2 px-4 rounded-lg bg-accent text-white font-semibold hover:bg-accent/80 transition-colors duration-300"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCancel;