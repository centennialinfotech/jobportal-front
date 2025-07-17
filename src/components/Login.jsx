import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/login', { email, password });
      setToken(response.data.token, response.data.userId, response.data.isAdmin, '');
      setErrors({});
      setApiError('');
      navigate('/profile');
    } catch (err) {
      const errorMsg = err.response?.data.message || 'Login failed';
      console.error('Login error:', err.response?.status, errorMsg);
      setApiError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setForgotPasswordError('Please enter a valid email in the login form');
      setErrors({ ...errors, email: 'Please enter a valid email' });
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/forgot-password', { email });
      setForgotPasswordMessage('Password reset email sent. Please check your inbox.');
      setForgotPasswordError('');
    } catch (err) {
      const errorMsg = err.response?.data.message || 'Failed to send reset email';
      console.error('Forgot password error:', err.response?.status, errorMsg);
      setForgotPasswordError(errorMsg);
      setForgotPasswordMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">User Login</h2>
      {apiError && <p className="error-message mb-4 text-center">{apiError}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        {errors.email && <p className="error-message">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        {errors.password && <p className="error-message">{errors.password}</p>}
      </div>
      <button
        onClick={handleSubmit}
        className="btn-primary w-full mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <ClipLoader size={20} color="#fff" />
            <span className="ml-2">Logging in...</span>
          </div>
        ) : (
          'Login'
        )}
      </button>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Forgot your password?{' '}
          <button
            onClick={handleForgotPassword}
            className="text-blue-600 hover:underline"
            disabled={isLoading}
          >
            Reset Password
          </button>
        </p>
        
        {forgotPasswordMessage && (
          <p className="text-green-600 mt-2" style={{ marginTop: '5px' }}>{forgotPasswordMessage}</p>
        )}
        {forgotPasswordError && (
<p className="error-message mt-2" style={{ marginTop: '5px' }}>
    {forgotPasswordError}
  </p>        )}
      </div>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="/signup" className="text-blue-600 hover:underline">
          Sign Up
        </a>
      </p>
    </div>
  );
}

export default Login;
