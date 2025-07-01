import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import FormField from './FormField';

function Login({ setToken }) {
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
      console.log('Login request:', { email, password }); // Debug log
      const res = await api.post('/api/login', { email: email.trim(), password: password.trim() });
      setToken(res.data.token, res.data.userId, res.data.isAdmin);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('isAdmin', res.data.isAdmin);
      setErrors({});
      setApiError('');
    } catch (err) {
      const errorMsg = err.response?.data.message || 'Login failed';
      console.error('Login error:', err.response?.status, errorMsg); // Debug log
      setApiError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Login</h2>
      {apiError && <p className="error-message mb-4 text-center">{apiError}</p>}
      <FormField
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <FormField
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <button onClick={handleLogin} className="btn-primary" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      <p className="mt-4 text-center text-text">
        Don't have an account?{' '}
        <Link to="/signup" className="text-accent font-semibold hover:underline">
          Signup
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

export default Login;