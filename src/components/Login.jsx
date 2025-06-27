// src/components/Login.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api'; 
import FormField from './FormField';

function Login({ setToken, setUserId }) {
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
      const res = await api.post('/login', { email, password }); // 👈 API call
      setToken(res.data.token);
      setUserId(res.data.userId);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      setErrors({});
      setApiError('');
    } catch (err) {
      setApiError(err.response?.data.message || 'Login failed');
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
    </div>
  );
}

export default Login;