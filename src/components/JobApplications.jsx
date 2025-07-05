import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

function JobApplications() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [jobPost, setJobPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

useEffect(() => {
  const fetchApplications = async () => {
    try {
      const response = await api.get(`/api/admin/job-posts/${id}/applications`);
      console.log('Applications:', response.data);
      setApplications(response.data);
      if (response.data.some(app => !app.userId)) {
        setError('Some applications have invalid user data. Contact support.');
      }
      const jobResponse = await api.get(`/api/admin/job-posts/${id}`);
      setJobPost(jobResponse.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data.message || 'Failed to fetch applications or job post.');
      setLoading(false);
    }
  };
  fetchApplications();
}, [id]);

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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-primary text-center">
            Applications for {jobPost?.title || 'Job Post'}
          </h2>
          <button
            onClick={() => navigate('/admin/job-posts')}
            className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md font-medium"
          >
            Back to Job Posts
          </button>
        </div>

        {applications.length === 0 ? (
          <p className="text-center text-gray-500 text-lg font-medium bg-white py-6 px-4 rounded-lg shadow-sm">
            No applications for this job post.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Phone</th>
                  <th className="py-3 px-4 text-left">State</th>
                  <th className="py-3 px-4 text-left">City</th>
                  <th className="py-3 px-4 text-left">Address</th>
                  <th className="py-3 px-4 text-left">CV</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {applications.map((app) => (
                  <tr
                    key={app._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-left">{app.userId?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-left">{app.userId?.email || 'Unknown'}</td>
                    <td className="py-3 px-4 text-left">{app.userId?.phone || 'Not provided'}</td>
                    <td className="py-3 px-4 text-left">{app.userId?.state || 'Unknown'}</td>
                    <td className="py-3 px-4 text-left">{app.userId?.city || 'Unknown'}</td>
                    <td className="py-3 px-4 text-left">{app.userId?.houseNoStreet || 'Not provided'}</td>
                    <td className="py-3 px-4 text-left">
                      {app.userId?.cvFileId ? (
                        <a
                          href={`${import.meta.env.VITE_API_URL}/api/cv/${app.userId.cvFileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md font-medium"
                        >
                          View CV
                        </a>
                      ) : (
                        'No CV'
                      )}
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

export default JobApplications;