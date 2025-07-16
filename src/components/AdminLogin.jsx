import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

function AdminLogin({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleLogin = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    try {
      console.log('Admin login request:', { email });
      const res = await api.post('/api/admin/login', { email: email.trim(), password: password.trim() });
      setToken(res.data.token, res.data.userId, res.data.isAdmin, res.data.loginType);
      setErrors({});
      setApiError('');
    } catch (err) {
      const errorMsg = err.response?.data.message || 'Login failed';
      console.error('Admin login error:', err.response?.status, errorMsg);
      setApiError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Admin Login</h2>
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
      <button onClick={handleLogin} className="btn-primary w-full mt-4" disabled={isLoading}>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <ClipLoader size={20} color="#fff" />
            <span className="ml-2">Logging in...</span>
          </div>
        ) : (
          'Login'
        )}
      </button>
      <p className="mt-4 text-center text-text">
        Don't have an account?{' '}
        <Link to="/admin/signup" className="text-accent font-semibold hover:underline">
          Admin Signup
        </Link>
      </p>
      {apiError === 'Email not verified' && (
        <p className="mt-2 text-center text-text">
          <Link to="/verify-otp" className="text-accent font-semibold hover:underline">
            Verify OTP
          </Link>
        </p>
      )}
    </div>
  );
}

export default AdminLogin;
