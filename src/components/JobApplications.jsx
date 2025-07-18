import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

function JobApplications() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [jobPost, setJobPost] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get(`/api/admin/job-posts/${id}/applications`);
        console.log('Applications:', JSON.stringify(response.data, null, 2));
        const validApplications = response.data.filter(app => app.userId && app.appliedAt);
        setApplications(validApplications);
        if (validApplications.length < response.data.length) {
          setError('Some applications have invalid user data or missing timestamps. Contact support.');
        }
        // Enhanced logging for skills
        response.data.forEach(app => {
          if (!app.userId) {
            console.warn('Application with missing userId:', {
              applicationId: app._id,
              jobPostId: app.jobPostId,
            });
          } else if (!Array.isArray(app.userId.skills) || app.userId.skills.length === 0) {
            console.warn('Application with missing or invalid skills:', {
              applicationId: app._id,
              userId: app.userId._id,
              userEmail: app.userId.email,
              skills: app.userId.skills,
            });
          } else {
            console.log('Application with skills:', {
              applicationId: app._id,
              userId: app.userId._id,
              userEmail: app.userId.email,
              skills: app.userId.skills,
            });
          }
        });
        const jobResponse = await api.get(`/api/admin/job-posts/${id}`);
        console.log('Job Post:', JSON.stringify(jobResponse.data, null, 2));
        setJobPost(jobResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data.message || 'Failed to fetch applications or job post.');
        setLoading(false);
        console.error('Fetch error:', err);
      }
    };
    fetchApplications();
  }, [id]);

  const handleSelectApplication = (app) => {
    setSelectedApplication(app);
    setError('');
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-6rem)]">
        {/* Left Column: Applicant List */}
        <div className="lg:w-1/2 bg-white shadow-lg rounded-xl p-6 border border-gray-200 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">
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
            <p className="text-center text-gray-500 text-lg font-medium py-6">
              No applications for this job post.
            </p>
          ) : (
            <ul className="space-y-4">
              {applications.map((app) => (
                <li
                  key={app._id}
                  onClick={() => handleSelectApplication(app)}
                  className={`p-4 rounded-md cursor-pointer transition-colors duration-200 ${
                    selectedApplication?._id === app._id
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  } border flex items-center justify-between`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{app.userId?.name || 'Unknown'}</h3>
                    {app.userId && Array.isArray(app.userId.skills) && app.userId.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {app.userId.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">No skills listed</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Column: Applicant Details */}
        <div className="lg:w-1/2 bg-white shadow-lg rounded-xl p-6 border border-gray-200 flex-1 min-h-[calc(100vh-6rem)]">
          {selectedApplication ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Applicant Details</h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  <span className="font-bold">Name:</span> {selectedApplication.userId?.name || 'Unknown'}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Email:</span> {selectedApplication.userId?.email || 'Unknown'}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Phone:</span> {selectedApplication.userId?.phone || 'Not provided'}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">State:</span> {selectedApplication.userId?.state || 'Unknown'}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">City:</span> {selectedApplication.userId?.city || 'Unknown'}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Address:</span> {selectedApplication.userId?.houseNoStreet || 'Not provided'}
                </p>
                <div className="text-gray-700">
                  <span className="font-bold">Skills:</span>
                  {selectedApplication.userId && Array.isArray(selectedApplication.userId.skills) && selectedApplication.userId.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedApplication.userId.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-600"> No skills listed</span>
                  )}
                </div>
                <p className="text-gray-700">
                  <span className="font-bold">CV:</span>{' '}
                  {selectedApplication.userId?.cvFileId ? (
                    <a
                      href={`${import.meta.env.VITE_API_URL}/api/cv/${selectedApplication.userId.cvFileId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md font-medium"
                    >
                      View CV
                    </a>
                  ) : (
                    'No CV'
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg font-medium">
              Select an applicant from the list to view details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobApplications;