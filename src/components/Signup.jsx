import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import FormField from './FormField';

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
await api.post('/signup', { name, email, password });
      setSuccess('Account created! Redirecting to verify your email...');
      setErrors({});
      setApiError('');
      setSignupEmail(email); // Pass email to App.jsx
      setTimeout(() => navigate('/verify-otp'), 1000); // Redirect after 1 second
    } catch (err) {
      setApiError(err.response?.data.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Signup</h2>
      {apiError && <p className="error-message mb-4 text-center">{apiError}</p>}
      {success && <p className="success-message mb-4 text-center">{success}</p>}
      <FormField
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
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
      <button onClick={handleSignup} className="btn-primary" disabled={isLoading}>
        {isLoading ? 'Signing up...' : 'Signup'}
      </button>
      <p className="mt-4 text-center text-text">
        Already have an account?{' '}
        <Link to="/login" className="text-accent font-semibold hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

export default Signup;