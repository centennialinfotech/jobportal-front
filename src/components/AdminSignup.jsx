import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

function AdminSignup({ setSignupEmail }) {
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
      const response = await api.post('/api/admin/signup', { name, email, password });
      console.log('Admin signup response:', response.data);
      localStorage.setItem('token', response.data.token); // Store token
      setSuccess('Account created! Redirecting to verify your email...');
      setErrors({});
      setApiError('');
      setSignupEmail(email);
      navigate('/verify-otp', { state: { email, isAdmin: true } }); // Pass isAdmin
    } catch (err) {
      console.error('Admin signup error:', err);
      setApiError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Admin Signup</h2>
      {apiError && <p className="error-message mb-4 text-center">{apiError}</p>}
      {success && <p className="success-message mb-4 text-center">{success}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>
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
      <button onClick={handleSignup} className="btn-primary w-full mt-4" disabled={isLoading}>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <ClipLoader size={20} color="#fff" />
            <span className="ml-2">Signing up...</span>
          </div>
        ) : (
          'Signup'
        )}
      </button>
      <p className="mt-2 text-center text-text">
        Already have an account?{' '}
        <Link to="/admin/login" className="text-accent font-semibold hover:underline">
          Admin Login
        </Link>
      </p>
    </div>
  );
}

export default AdminSignup;