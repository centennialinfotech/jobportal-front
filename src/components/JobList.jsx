import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

function JobList() {
  const [jobPosts, setJobPosts] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          api.get('/api/jobs'),
          api.get('/api/user/applications')
        ]);
        setJobPosts(jobsResponse.data);
        setAppliedJobs(applicationsResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data.message || 'Failed to fetch job posts.');
        setLoading(false);
      }
    };
    fetchJobPosts();
  }, []);

  const handleApply = async (jobPostId) => {
    try {
      setError('');
      setSuccess('');
      await api.post(`/api/jobs/apply/${jobPostId}`);
      setSuccess('Application submitted successfully!');
      setAppliedJobs([...appliedJobs, jobPostId]);
    } catch (err) {
      setError(err.response?.data.message || 'Failed to apply.');
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
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-primary text-center mb-8">Available Jobs</h2>
        {success && (
          <p className="text-center text-green-600 font-semibold text-lg mb-6 bg-white py-2 px-4 rounded-lg shadow-md">
            {success}
          </p>
        )}
        {jobPosts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg font-medium bg-white py-6 px-4 rounded-lg shadow-sm">
            No job posts available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                <p className="text-gray-700">
                  <span className="font-medium">Location:</span> {post.location}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Description:</span> {post.description}
                </p>
                <p className="text-gray-500 text-sm">
                  Posted on: {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleApply(post._id)}
                  disabled={appliedJobs.includes(post._id)}
                  className={`w-full py-2 rounded-md transition-colors duration-200 ${
                    appliedJobs.includes(post._id)
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {appliedJobs.includes(post._id) ? 'Already Applied' : 'Quick Apply'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobList;
