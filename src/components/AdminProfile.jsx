import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';
import { usStates, citiesByState } from '../utils/usData';

function AdminProfile({ isAdmin, loginType }) {
  const [formData, setFormData] = useState({
    companyName: '',
    state: '',
    city: '',
    companyPhone: '',
    companyLogo: null,
  });
  const [useCustomCity, setUseCustomCity] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin || loginType !== 'admin') {
      navigate('/profile');
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/profile');
        const { companyName, state, city, companyPhone } = response.data;
        setFormData({
          companyName: companyName || '',
          state: state || '',
          companyPhone: companyPhone || '',
          companyLogo: null,
        });
        if (state && citiesByState[usStates.find(s => s.name === state)?.abbreviation]?.includes(city)) {
          setFormData(prev => ({ ...prev, city: city || '' }));
          setUseCustomCity(false);
        } else {
          setCustomCity(city || '');
          setUseCustomCity(true);
        }
        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
        });
        setApiError(err.response?.data?.message || 'Failed to fetch profile.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isAdmin, loginType, navigate]);

  useEffect(() => {
    if (formData.state) {
      const stateObj = usStates.find(s => s.name.toLowerCase() === formData.state.toLowerCase());
      if (stateObj) {
        setAvailableCities(citiesByState[stateObj.abbreviation] || []);
      } else {
        setAvailableCities([]);
      }
      setFormData(prev => ({ ...prev, city: '' }));
      setCustomCity('');
      setUseCustomCity(false);
    }
  }, [formData.state]);

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName || formData.companyName.length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }
    if (!formData.state || !usStates.some(s => s.name === formData.state)) {
      newErrors.state = 'Please select a valid US state';
    }
    const selectedCity = useCustomCity ? customCity : formData.city;
    if (!selectedCity || selectedCity.length < 2) {
      newErrors.city = 'City must be at least 2 characters';
    }
    if (!formData.companyPhone || !/^\+?\d{10,15}$/.test(formData.companyPhone)) {
      newErrors.companyPhone = 'Company phone must be a 10-15 digit number, optionally starting with +';
    }
    if (formData.companyLogo) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(formData.companyLogo.type)) {
        newErrors.companyLogo = 'Company logo must be a JPEG, PNG, GIF, or WebP file';
      } else if (formData.companyLogo.size > 2 * 1024 * 1024) {
        newErrors.companyLogo = 'Company logo must be less than 2MB';
      } else if (formData.companyLogo.size === 0) {
        newErrors.companyLogo = 'Company logo file is empty';
      }
    }
    return newErrors;
  };

const handleChange = (e) => {
  const { name, value, files } = e.target;
  const newFile = files ? files[0] : value;
  console.log('File selected:', {
    name,
    file: newFile ? { name: newFile.name, type: newFile.type, size: newFile.size } : value,
  });
  setFormData((prev) => ({
    ...prev,
    [name]: files ? files[0] : value,
  }));
};

const handleSubmit = async () => {
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    setApiError('Please correct the errors below.');
    return;
  }
  setIsSubmitting(true);
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('companyName', formData.companyName.trim());
    formDataToSend.append('state', formData.state.trim());
    formDataToSend.append('city', useCustomCity ? customCity.trim() : formData.city.trim());
    formDataToSend.append('companyPhone', formData.companyPhone.trim());
    if (formData.companyLogo instanceof File) {
      console.log('Appending companyLogo:', {
        name: formData.companyLogo.name,
        type: formData.companyLogo.type,
        size: formData.companyLogo.size,
      });
      if (formData.companyLogo.size === 0) {
        setApiError('Company logo file is empty. Please select a valid image file.');
        setIsSubmitting(false);
        return;
      }
      formDataToSend.append('companyLogo', formData.companyLogo);
    } else if (formData.companyLogo) {
      console.warn('Invalid companyLogo:', formData.companyLogo);
      setApiError('Invalid company logo file selected. Please select a valid image file.');
      setIsSubmitting(false);
      return;
    }
    for (let [key, value] of formDataToSend.entries()) {
      console.log('FormData entry:', { key, value: value instanceof File ? value.name : value });
    }
    const response = await api.put('/api/profile', formDataToSend, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    console.log('Profile update response:', response.data);
    setSuccess('Profile updated successfully!');
    setErrors({});
    setApiError('');
    setTimeout(() => navigate('/admin/profile/preview'), 1000);
  } catch (err) {
    console.error('Profile update error:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });
    setApiError(
      err.response?.status === 400 && err.response.data.message.includes('Invalid company logo file')
        ? 'Invalid company logo file. Please select a JPEG, PNG, GIF, or WebP file under 2MB.'
        : err.response?.status === 400 && err.response.data.message.includes('File size')
        ? 'Company logo file is too large. Please select a file under 2MB.'
        : err.response?.status === 400 && err.response.data.message.includes('empty')
        ? 'Company logo file is empty or invalid. Please select a valid image file.'
        : err.response?.status === 401
        ? 'Authentication failed. Please log in again.'
        : err.response?.data?.message || 'Failed to update profile. Please try again.'
    );
    setSuccess('');
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="form-container text-center ">
        <ClipLoader size={30} color="#4A90E2" />
      </div>
    );
  }

  return (
    <div className="form-container min-w-[30vw]">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Company Profile</h2>
      {apiError && <p className="error-message mb-4 text-center">{apiError}</p>}
      {success && <p className="success-message mb-4 text-center">{success}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Company Name</label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          className="input-field"
          placeholder="Enter company name"
        />
        {errors.companyName && <p className="error-message">{errors.companyName}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">State</label>
        <select
          name="state"
          value={formData.state}
          onChange={handleChange}
          className="input-field"
          required
        >
          <option value="" disabled>Select a state</option>
          {usStates.map((state) => (
            <option key={state.abbreviation} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>
        {errors.state && <p className="error-message">{errors.state}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">City</label>
        <div className="flex items-center gap-2">
          <select
            name="city"
            value={useCustomCity ? 'Other' : formData.city}
            onChange={(e) => {
              if (e.target.value === 'Other') {
                setUseCustomCity(true);
                setFormData(prev => ({ ...prev, city: '' }));
              } else {
                setUseCustomCity(false);
                setFormData(prev => ({ ...prev, city: e.target.value }));
                setCustomCity('');
              }
            }}
            className="input-field flex-1"
            required
            disabled={!formData.state}
          >
            <option value="" disabled>Select a city</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
          {useCustomCity && (
            <input
              type="text"
              name="customCity"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              className="input-field flex-1"
              placeholder="Enter city"
            />
          )}
        </div>
        {errors.city && <p className="error-message">{errors.city}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Company Phone</label>
        <input
          type="text"
          name="companyPhone"
          value={formData.companyPhone}
          onChange={handleChange}
          className="input-field"
          placeholder="Enter company phone (e.g., +1234567890)"
        />
        {errors.companyPhone && <p className="error-message">{errors.companyPhone}</p>}
      </div>
      <div className="relative">
        <input
          type="file"
          name="companyLogo"
          onChange={handleChange}
          className="file-field opacity-0 absolute w-full h-full cursor-pointer"
          id="logo-upload"
          accept="image/*"
          aria-label="Upload company logo"
        />
        <label
          htmlFor="logo-upload"
          className="btn-primary flex items-center justify-center cursor-pointer"
          tabIndex="0"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              document.getElementById('logo-upload').click();
            }
          }}
        >
          {formData.companyLogo ? formData.companyLogo.name : 'Choose Company Logo'}
        </label>
        {errors.companyLogo && <p className="error-message">{errors.companyLogo}</p>}
      </div>
      <button
        onClick={handleSubmit}
        className="btn-primary w-full mt-4"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <ClipLoader size={20} color="#fff" />
            <span className="ml-2">Updating...</span>
          </div>
        ) : (
          'Update Profile'
        )}
      </button>
    </div>
  );
}

export default AdminProfile;
