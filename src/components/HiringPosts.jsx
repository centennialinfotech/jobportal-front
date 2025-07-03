import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

function HiringPosts() {
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ title: '', description: '', location: '' });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        const response = await api.get('/api/admin/job-posts');
        setJobPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data.message || 'Failed to fetch job posts.');
        setLoading(false);
      }
    };
    fetchJobPosts();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.title || formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    if (!formData.description || formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    if (!formData.location || formData.location.length < 2) {
      errors.location = 'Location must be at least 2 characters';
    }
    return errors;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      setError('');
      const response = await api.post('/api/admin/job-posts', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
      });
      setJobPosts([...jobPosts, response.data.jobPost]);
      setFormData({ title: '', description: '', location: '' });
    } catch (err) {
      console.error('Form submission error:', err.response?.data);
      setError(err.response?.data.message || 'Failed to create job post.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ClipLoader size={40} color="#4A90E2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="error-message text-center text-red-600 font-semibold text-lg p-4 bg-white rounded-lg shadow-md">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-0 sm:px-4 lg:px-6">
      <div className="max-w-full mx-auto">
        <h2 className="text-3xl font-bold text-primary text-center mb-8">
          Manage Job Posts
        </h2>

        {/* Create Job Post Form */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Job Post</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full p-2 border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {formErrors.title && (
                <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-600 font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full p-2 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                rows="4"
                required
              />
              {formErrors.description && (
                <p className="text-red-600 text-sm mt-1">{formErrors.description}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-600 font-medium">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full p-2 border ${formErrors.location ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {formErrors.location && (
                <p className="text-red-600 text-sm mt-1">{formErrors.location}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Create Job Post
            </button>
          </form>
        </div>

        {/* Job Posts Table */}
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Posts</h3>
        {jobPosts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg font-medium bg-white py-6 px-4 rounded-lg shadow-sm">
            No job posts found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Location</th>
                  <th className="py-3 px-4 text-left">Posted By</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {jobPosts.map((post) => (
                  <tr
                    key={post._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-left">{post.title}</td>
                    <td className="py-3 px-4 text-left">{post.location}</td>
                    <td className="py-3 px-4 text-left">{post.postedBy.name}</td>
                    <td className="py-3 px-4 text-left">
                      <Link
                        to={`/admin/job-posts/${post._id}/applications`}
                        className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md font-medium"
                      >
                        View Applications
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HiringPosts;
