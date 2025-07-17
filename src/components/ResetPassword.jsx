import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)
    ) {
      newErrors.newPassword =
        'Password must be 8+ characters with uppercase, lowercase, number, and special character';
    }
    return newErrors;
  };

  const handleResetPassword = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/reset-password', { token, newPassword });
      setSuccessMessage('Password reset successfully. You can now log in with your new password.');
      setErrors({});
      setApiError('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errorMsg = err.response?.data.message || 'Failed to reset password';
      console.error('Reset password error:', err.response?.status, errorMsg);
      setApiError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Reset Password</h2>
      {apiError && <p className="error-message mb-4 text-center">{apiError}</p>}
      {successMessage && <p className="text-green-600 mb-4 text-center">{successMessage}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700">New Password</label>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input-field"
        />
        {errors.newPassword && <p className="error-message">{errors.newPassword}</p>}
      </div>
      <button
        onClick={handleResetPassword}
        className="btn-primary w-full mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <ClipLoader size={20} color="#fff" />
            <span className="ml-2">Resetting...</span>
          </div>
        ) : (
          'Reset Password'
        )}
      </button>
      <p className="mt-4 text-center text-sm text-gray-600">
        Remembered your password?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Login
        </a>
      </p>
    </div>
  );
}

export default ResetPassword;