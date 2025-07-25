import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

function Signup({ setSignupEmail }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    else if (name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password))
      newErrors.password = 'Password must be 8+ characters with uppercase, lowercase, number, and special character';
    return newErrors;
  };

  const handleSignup = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/signup', { name, email, password });
      setSuccess('Account created! Redirecting to verify your email...');
      setErrors({});
      setApiError('');
      setSignupEmail(email);
      setTimeout(() => navigate('/verify-otp'), 1000);
    } catch (err) {
      setApiError(err.response?.data.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full min-w-[30vw] sm:max-w-md lg:max-w-[1000px] bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-8">
        <div className="max-w-md lg:max-w-lg mx-auto">
          <div className="flex flex-col items-center mb-6">
            <div className="w-full flex justify-center mb-3">
              <img
                src="\src\logo.webp"
                alt="Centennial Infotech Logo"
                className="h-14 sm:h-16 lg:h-20 w-auto max-w-[80%] object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Centennial Infotech</h1>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 mb-6 text-center">Signup</h2>
          {apiError && <p className="text-red-500 text-sm text-center mb-4">{apiError}</p>}
          {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <button
            onClick={handleSignup}
            className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <ClipLoader size={18} color="#fff" />
                <span className="ml-2">Signing up...</span>
              </div>
            ) : (
              'Signup'
            )}
          </button>
          <p className="text-center mt-4 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;