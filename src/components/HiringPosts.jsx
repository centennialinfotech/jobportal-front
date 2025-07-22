import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

function HiringPosts() {
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    skills: '',
    workType: '',
    screeningQuestions: [], // Now a string array
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const navigate = useNavigate();

  const availableQuestions = [
    'Can you start immediately?',
    'Are you willing to relocate?',
  ];

  const validateForm = () => {
    const errors = {};
    if (!formData.title || formData.title.length < 3) errors.title = 'Title must be at least 3 characters';
    if (!formData.description || formData.description.length < 10) errors.description = 'Description must be at least 10 characters';
    if (!formData.location || formData.location.length < 2) errors.location = 'Location must be at least 2 characters';
    if (!formData.skills || formData.skills.trim().split(',').filter(skill => skill.trim()).length === 0) {
      errors.skills = 'At least one skill is required';
    }
    if (!formData.workType) errors.workType = 'Please select a work type';
    if (formData.screeningQuestions.length > 5) errors.screeningQuestions = 'Maximum 5 screening questions allowed';
    if (formData.screeningQuestions.some(q => !q || q.trim().length < 1)) {
      errors.screeningQuestions = 'Each screening question must be a non-empty string';
    }
    return errors;
  };

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        const response = await api.get('/api/admin/job-posts');
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
      const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        skills: JSON.stringify(skillsArray),
        workType: formData.workType,
        screeningQuestions: JSON.stringify(formData.screeningQuestions), // String array
      };

      console.log('Submitting job post payload:', payload); // Debug log

      if (editingPost) {
        const response = await api.put(`/api/admin/job-posts/${editingPost._id}`, payload);
        setJobPosts(jobPosts.map(post =>
          post._id === editingPost._id ? response.data.jobPost : post
        ));
        setEditingPost(null);
      } else {
        const response = await api.post('/api/admin/job-posts', payload); // Line ~87
        setJobPosts([...jobPosts, response.data.jobPost]);
      }

      setFormData({
        title: '',
        description: '',
        location: '',
        skills: '',
        workType: '',
        screeningQuestions: [],
      });
      setFormErrors({});
      setCustomQuestion('');
    } catch (err) {
      console.error('Form submission error:', err.response?.data); // Line ~102
      setError(err.response?.data?.message || `Failed to ${editingPost ? 'update' : 'create'} job post.`);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      description: post.description || '',
      location: post.location || '',
      skills: Array.isArray(post.skills) ? post.skills.join(', ') : '',
      workType: post.workType || '',
      screeningQuestions: Array.isArray(post.screeningQuestions) ? post.screeningQuestions : [], // Expect string array
    });
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      skills: '',
      workType: '',
      screeningQuestions: [],
    });
    setFormErrors({});
    setCustomQuestion('');
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this job post? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      setError('');
      await api.delete(`/api/admin/job-posts/${postId}`);
      setJobPosts(jobPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Delete job post error:', err.response?.data);
      setError(err.response?.data.message || 'Failed to delete job post.');
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

  if (error && !jobPosts.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-center text-red-600 font-semibold text-lg p-4 bg-white rounded-lg shadow-md">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-primary text-center mb-8">
          {editingPost ? 'Edit Job Post' : 'Manage Job Posts'}
        </h2>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md mb-8">
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
          <div className="mb-4">
            <label className="block text-gray-700">Skills (comma-separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="JavaScript, Python, React"
            />
            {formErrors.skills && <p className="text-red-600 text-sm">{formErrors.skills}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Work Type</label>
            <select
              value={formData.workType}
              onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Work Type</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
            {formErrors.workType && <p className="text-red-600 text-sm">{formErrors.workType}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Screening Questions</label>
            <p className="text-sm text-gray-500 mb-2">Select or add questions to filter candidates (max 5). Use these to assess availability or suitability.</p>
            {availableQuestions.map((question, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`question-${index}`}
                  checked={formData.screeningQuestions.includes(question)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...formData.screeningQuestions, question]
                      : formData.screeningQuestions.filter(q => q !== question);
                    setFormData({ ...formData, screeningQuestions: updated });
                  }}
                  className="mr-2"
                />
                <label htmlFor={`question-${index}`} className="text-gray-700">{question}</label>
              </div>
            ))}
            <div className="flex mt-4">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Add a custom question (e.g., 'What is your notice period?')"
                className="flex-1 p-2 border rounded-md mr-2"
              />
              <button
                type="button"
                onClick={() => {
                  if (customQuestion.trim() && formData.screeningQuestions.length < 5) {
                    setFormData({
                      ...formData,
                      screeningQuestions: [...formData.screeningQuestions, customQuestion.trim()]
                    });
                    setCustomQuestion('');
                  } else if (formData.screeningQuestions.length >= 5) {
                    setFormErrors({ ...formErrors, screeningQuestions: 'Maximum 5 screening questions allowed' });
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {formData.screeningQuestions.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Selected Questions:</p>
                <ul className="list-disc list-inside mt-1">
                  {formData.screeningQuestions.map((question, index) => (
                    <li key={index} className="text-gray-700">
                      {question}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.screeningQuestions.filter(q => q !== question);
                          setFormData({ ...formData, screeningQuestions: updated });
                        }}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {formErrors.screeningQuestions && <p className="text-red-600 text-sm mt-1">{formErrors.screeningQuestions}</p>}
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (editingPost ? 'Updating...' : 'Creating...') : (editingPost ? 'Update Job Post' : 'Create Job Post')}
            </button>
            {editingPost && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {jobPosts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg font-medium bg-white py-6 px-4 rounded-lg shadow-sm">
            No job posts found. Create one to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Title</th>
                  <th className="py-3 px-6 text-left">Location</th>
                  <th className="py-3 px-6 text-left">Skills</th>
                  <th className="py-3 px-6 text-left">Work Type</th>
                  <th className="py-3 px-6 text-left">Screening Questions</th>
                  <th className="py-3 px-6 text-left">Posted By</th>
                  <th className="py-3 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {jobPosts.map((post) => (
                  <tr key={post._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6 text-left">{post.title || 'N/A'}</td>
                    <td className="py-4 px-6 text-left">{post.location || 'N/A'}</td>
                    <td className="py-4 px-6 text-left">
                      {Array.isArray(post.skills) && post.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {post.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'No skills listed'
                      )}
                    </td>
                    <td className="py-4 px-6 text-left">{post.workType || 'N/A'}</td>
                    <td className="py-4 px-6 text-left">
                      {Array.isArray(post.screeningQuestions) && post.screeningQuestions.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {post.screeningQuestions.map((question, index) => (
                            <span key={index} className="text-gray-700">
                              {index + 1}. {question}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'No questions'
                      )}
                    </td>
                    <td className="py-4 px-6 text-left">
                      {post.postedBy ? post.postedBy.companyName || 'Unknown Company' : 'Invalid User'}
                    </td>
                    <td className="py-4 px-6 text-left flex gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md font-medium"
                      >
                        Delete
                      </button>
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