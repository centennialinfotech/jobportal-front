import { useState } from 'react';
import axios from 'axios';
import api from '../utils/api'; 
import { ClipLoader } from "react-spinners";
import FormField from './FormField';

function Profile() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cv, setCv] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    else if (name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!address) newErrors.address = 'Address is required';
    else if (address.length < 5) newErrors.address = 'Address must be at least 5 characters';
    if (!cv) newErrors.cv = 'CV is required';
    else if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(cv.type))
      newErrors.cv = 'CV must be a PDF, DOC, or DOCX file';
    else if (cv.size > 2 * 1024 * 1024) newErrors.cv = 'CV must be less than 2MB';
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('cv', cv);

    setIsLoading(true);
    try {
await api.post('/api/profile', formData, {
          headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Profile updated successfully!');
      setName('');
      setPhone('');
      setAddress('');
      setCv(null);
      setErrors({});
      setApiError('');
    } catch (err) {
      setApiError(err.response?.data.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Update Profile</h2>
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
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
      />
      <div>
        <textarea
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="textarea-field"
          rows="4"
        ></textarea>
        {errors.address && <p className="error-message">{errors.address}</p>}
      </div>
      <div className="relative">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setCv(e.target.files[0])}
          className="file-field opacity-0 absolute w-full h-full cursor-pointer"
          id="cv-upload"
          aria-label="Upload CV file"
        />
        <label
          htmlFor="cv-upload"
          className="btn-primary flex items-center justify-center cursor-pointer"
          tabIndex="0"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              document.getElementById('cv-upload').click();
            }
          }}
        >
          {cv ? cv.name : 'Choose CV File'}
        </label>
        {errors.cv && <p className="error-message">{errors.cv}</p>}
      </div>
      
      <br></br>
      <button onClick={handleSubmit} className="btn-primary" disabled={isLoading}>
        {isLoading ? <ClipLoader size={20} color="#fff" /> : 'Submit'}
      </button>
    </div>
  );
}

export default Profile;