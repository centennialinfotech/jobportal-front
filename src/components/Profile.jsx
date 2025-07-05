import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';
import { usStates, citiesByState } from '../utils/usData';

function Profile() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [useCustomCity, setUseCustomCity] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [houseNoStreet, setHouseNoStreet] = useState('');
  const [cv, setCv] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/profile');
        const { name, phone, state, city, houseNoStreet } = response.data;
        setName(name || '');
        setPhone(phone || '');
        setState(state || '');
        if (state && citiesByState[usStates.find(s => s.name === state)?.abbreviation]?.includes(city)) {
          setCity(city || '');
          setUseCustomCity(false);
        } else {
          setCustomCity(city || '');
          setUseCustomCity(true);
        }
        setHouseNoStreet(houseNoStreet || '');
      } catch (err) {
        console.error('Profile fetch error:', err);
        setApiError(err.response?.data.message || 'Failed to load profile data.');
      }
    };
    fetchProfile();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (state) {
      const stateObj = usStates.find(s => s.name.toLowerCase() === state.toLowerCase());
      if (stateObj) {
        setAvailableCities(citiesByState[stateObj.abbreviation] || []);
      } else {
        setAvailableCities([]);
      }
      setCity('');
      setCustomCity('');
      setUseCustomCity(false);
    }
  }, [state]);

  // Client-side validation
  const validate = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    else if (name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!state) newErrors.state = 'State is required';
    else if (!usStates.some(s => s.name.toLowerCase() === state.toLowerCase())) newErrors.state = 'Invalid US state';
    const selectedCity = useCustomCity ? customCity : city;
    if (!selectedCity) newErrors.city = 'City is required';
    else if (selectedCity.length < 2) newErrors.city = 'City must be at least 2 characters';
    if (houseNoStreet && houseNoStreet.length < 5) newErrors.houseNoStreet = 'House number and street must be at least 5 characters if provided';
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
    formData.append('name', name.trim());
    formData.append('phone', phone.trim());
    formData.append('state', state.trim());
    formData.append('city', useCustomCity ? customCity.trim() : city.trim());
    formData.append('houseNoStreet', houseNoStreet.trim() || '');
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
      setState('');
      setCity('');
      setCustomCity('');
      setUseCustomCity(false);
      setHouseNoStreet('');
      setCv(null);
      setErrors({});
      setApiError('');
    } catch (err) {
      console.error('Profile update error:', err.response?.status, err.response?.data);
      if (err.response?.status === 400 && err.response.data.errors) {
        setErrors(err.response.data.errors);
        setApiError('Please correct the errors below.');
      } else {
        setApiError(err.response?.data.message || 'Update failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Update Profile</h2>
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
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-field"
        />
        {errors.phone && <p className="error-message">{errors.phone}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">State</label>
        <select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setCity('');
            setCustomCity('');
            setUseCustomCity(false);
          }}
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
            value={useCustomCity ? 'Other' : city}
            onChange={(e) => {
              if (e.target.value === 'Other') {
                setUseCustomCity(true);
                setCity('');
              } else {
                setUseCustomCity(false);
                setCity(e.target.value);
                setCustomCity('');
              }
            }}
            className="input-field flex-1"
            required
            disabled={!state}
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
              placeholder="Enter city"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              className="input-field flex-1"
            />
          )}
        </div>
        {errors.city && <p className="error-message">{errors.city}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">House Number and Street (optional)</label>
        <textarea
          placeholder="House Number and Street (optional)"
          value={houseNoStreet}
          onChange={(e) => setHouseNoStreet(e.target.value)}
          className="textarea-field"
          rows="4"
        ></textarea>
        {errors.houseNoStreet && <p className="error-message">{errors.houseNoStreet}</p>}
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
      <button onClick={handleSubmit} className="btn-primary w-full mt-4" disabled={isLoading}>
        {isLoading ? <ClipLoader size={20} color="#fff" /> : 'Submit'}
      </button>
    </div>
  );
}

export default Profile;