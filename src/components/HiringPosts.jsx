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

  const validateForm = () => {
    const errors = {};
    if (!formData.title || formData.title.length < 3) errors.title = 'Title must be at least 3 characters';
    if (!formData.description || formData.description.length < 10) errors.description = 'Description must be at least 10 characters';
    if (!formData.location || formData.location.length < 2) errors.location = 'Location must be at least 2 characters';
    return errors;
  };

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        const response = await api.get('/api/admin/job-posts');
        console.log('Job posts response:', response.data);
        setJobPosts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch job posts error:', err.response?.data);
        setError(err.response?.data.message || 'Failed to fetch job posts.');
        setLoading(false);
      }
    };
    fetchJobPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/api/admin/job-posts', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
      });
      setJobPosts([...jobPosts, response.data.jobPost]);
      setFormData({ title: '', description: '', location: '' });
      setFormErrors({});
    } catch (err) {
      console.error('Form submission error:', err.response?.data);
      setError(err.response?.data.message || 'Failed to create job post.');
    } finally {
      setLoading(false);
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
        <p className="text-center text-red-600 font-semibold text-lg p-4 bg-white rounded-lg shadow-md">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-0 sm:px-4 lg:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-primary text-center mb-8">Manage Job Posts</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="mb-4">
            <label className="block text-gray-700">Job Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
            {formErrors.title && <p className="text-red-600 text-sm">{formErrors.title}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
            {formErrors.description && <p className="text-red-600 text-sm">{formErrors.description}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
            {formErrors.location && <p className="text-red-600 text-sm">{formErrors.location}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Job Post'}
          </button>
        </form>

        {jobPosts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg font-medium bg-white py-6 px-4 rounded-lg shadow-sm">
            No job posts found for your company. Create a new job post to get started.
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
    <tr key={post._id} className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-3 px-4 text-left">{post.title || 'N/A'}</td>
      <td className="py-3 px-4 text-left">{post.location || 'N/A'}</td>
      <td className="py-3 px-4 text-left">
        {post.postedBy ? post.postedBy.companyName || 'Unknown Company' : 'Invalid User'}
      </td>
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