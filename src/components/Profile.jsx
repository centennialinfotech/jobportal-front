import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';
import { usStates, citiesByState } from '../utils/usData';

function Profile({ isAdmin, loginType }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [useCustomCity, setUseCustomCity] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [houseNoStreet, setHouseNoStreet] = useState('');
  const [cv, setCv] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin && loginType === 'admin') {
      navigate('/admin/profile');
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/profile');
        const { name, phone, state, city, houseNoStreet, skills } = response.data;
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
        setSkills(skills || []);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setApiError(err.response?.data.message || 'Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [isAdmin, loginType, navigate]);

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
    if (cv && !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(cv.type))
      newErrors.cv = 'CV must be a PDF, DOC, or DOCX file';
    else if (cv && cv.size > 2 * 1024 * 1024) newErrors.cv = 'CV must be less than 2MB';
    if (skills.some(skill => skill.length < 2)) newErrors.skills = 'All skills must be at least 2 characters';
    return newErrors;
  };

  const addSkill = () => {
    if (newSkill.trim() && newSkill.trim().length >= 2 && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
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
    if (cv) formData.append('cv', cv);
    formData.append('skills', JSON.stringify(skills));

    setIsLoading(true);
    try {
      await api.put('/api/profile', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Profile updated successfully!');
      setErrors({});
      setApiError('');
      setTimeout(() => navigate('/profile/preview'), 2000);
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
      <div className="form-container min-w-[30vw] max-w-md mx-4 sm:mx-6 lg:mx-8 p-4">   
      {apiError && <p className="error-message mb-4 text-center text-red-600">{apiError}</p>}
      {success && <p className="success-message mb-4 text-center text-green-600">{success}</p>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field w-full"
          />
          {errors.name && <p className="error-message text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field w-full"
          />
          {errors.phone && <p className="error-message text-red-600">{errors.phone}</p>}
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
            className="input-field w-full"
            required
          >
            <option value="" disabled>Select a state</option>
            {usStates.map((state) => (
              <option key={state.abbreviation} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
          {errors.state && <p className="error-message text-red-600">{errors.state}</p>}
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
              className="input-field w-full"
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
                className="input-field w-full mt-2"
              />
            )}
          </div>
          {errors.city && <p className="error-message text-red-600">{errors.city}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">House Number and Street (optional)</label>
          <textarea
            placeholder="House Number and Street (optional)"
            value={houseNoStreet}
            onChange={(e) => setHouseNoStreet(e.target.value)}
            className="textarea-field w-full"
            rows="3"
          ></textarea>
          {errors.houseNoStreet && <p className="error-message text-red-600">{errors.houseNoStreet}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Skills</label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Add a skill (e.g., JavaScript, Python)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="input-field w-3/4 p-2"
            />
            <button
              onClick={addSkill}
              className="btn-primary py-1 px-3 rounded-md"
              disabled={!newSkill.trim() || newSkill.trim().length < 2}
            >
              Add
            </button>
          </div>
          {errors.skills && <p className="error-message text-red-600">{errors.skills}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CV</label>
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
              className="btn-primary w-full flex items-center justify-center py-2"
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  document.getElementById('cv-upload').click();
                }
              }}
            >
              {cv ? cv.name : 'Choose CV File'}
            </label>
          </div>
          {errors.cv && <p className="error-message text-red-600">{errors.cv}</p>}
        </div>
        <button onClick={handleSubmit} className="btn-primary w-full py-2 mt-4" disabled={isLoading}>
          {isLoading ? <ClipLoader size={20} color="#fff" /> : 'Submit'}
        </button>
      </div>
    </div>
  );
}

export default Profile;
