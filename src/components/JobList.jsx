import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ClipLoader } from 'react-spinners';

function JobList() {
  const [jobPosts, setJobPosts] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          api.get('/api/jobs'),
          api.get('/api/user/applications'),
        ]);
        console.log('Fetched job posts:', JSON.stringify(jobsResponse.data, null, 2));
        setJobPosts(jobsResponse.data);
        setAppliedJobs(applicationsResponse.data.map(app => app.jobPostId));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data.message || 'Failed to fetch job posts.');
        setLoading(false);
        console.error('Fetch job posts error:', err.message);
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
      console.error('Apply error:', err.message);
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setError('');
    setSuccess('');
  };

  // Filter job posts based on search term, including skills
  const filteredJobs = jobPosts.filter((post) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (post.company?.name && post.company.name.toLowerCase().includes(searchLower)) ||
      post.title.toLowerCase().includes(searchLower) ||
      post.location.toLowerCase().includes(searchLower) ||
      (Array.isArray(post.skills) && post.skills.some(skill => skill.toLowerCase().includes(searchLower)))
    );
  });

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
        {/* Left Column: Job List (Broader) with Search */}
        <div className="lg:w-1/2 bg-white shadow-lg rounded-xl p-6 border border-gray-200 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-primary mb-4">Available Jobs</h2>
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company, title, location, or skill..."
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {filteredJobs.length === 0 ? (
            <p className="text-center text-gray-500 text-lg font-medium">
              No job posts available or matching your search.
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredJobs.map((post) => (
                <li
                  key={post._id}
                  onClick={() => handleSelectJob(post)}
                  className={`p-4 rounded-md cursor-pointer transition-colors duration-200 ${
                    selectedJob?._id === post._id
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  } border flex items-center justify-between`}
                >
                  <div className="flex items-center">
                    {post.company?.logo && typeof post.company.logo === 'string' ? (
                      <img
                        src={post.company.logo}
                        alt={`${post.company.name || 'company'} logo`}
                        className="w-10 h-10 object-contain rounded-full mr-3"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/40x40?text=No+Logo';
                          console.error(
                            `Failed to load logo for ${post.company?.name || 'unknown company'} at ${post.company?.logo || 'no URL'}`
                          );
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Logo</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                      <p className="text-gray-600 text-sm">{post.company?.name || 'Unknown Company'}</p>
                      {Array.isArray(post.skills) && post.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
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
                        <p className="text-gray-600 text-sm">No skills listed</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(post._id);
                    }}
                    disabled={appliedJobs.includes(post._id)}
                    className={`py-1 px-3 rounded-md text-sm transition-colors duration-200 ${
                      appliedJobs.includes(post._id)
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {appliedJobs.includes(post._id) ? 'Applied' : 'Apply'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Column: Job Details */}
        <div className="lg:w-1/2 bg-white shadow-lg rounded-xl p-6 border border-gray-200 flex-1 min-h-[calc(100vh-6rem)]">
          {success && (
            <p className="text-center text-green-600 font-semibold text-lg mb-6 py-2 px-4 rounded-lg bg-green-50">
              {success}
            </p>
          )}
          {selectedJob ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Job Details</h2>
              <div className="flex items-center mb-6">
                {selectedJob.company?.logo && typeof selectedJob.company.logo === 'string' ? (
                  <img
                    src={selectedJob.company.logo}
                    alt={`${selectedJob.company.name || 'company'} logo`}
                    className="w-20 h-20 object-contain rounded-full mr-6"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/80x80?text=No+Logo';
                      console.error(
                        `Failed to load logo for ${selectedJob.company?.name || 'unknown company'} at ${selectedJob.company?.logo || 'no URL'}`
                      );
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-full mr-6 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Logo</span>
                  </div>
                )}
                <div>
                  <p className="text-xl font-semibold text-gray-900">
                    <span className="font-bold">Title:</span> {selectedJob.title}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Company:</span> {selectedJob.company?.name || 'Unknown Company'}
                  </p>
                </div>
              </div>
              <p className="text-gray-700">
                <span className="font-bold">Location:</span> {selectedJob.location}
              </p>
              <div className="text-gray-700">
                <span className="font-bold">Skills:</span>
                {Array.isArray(selectedJob.skills) && selectedJob.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedJob.skills.map((skill, index) => (
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
                <span className="font-bold">Description:</span> {selectedJob.description}
              </p>
              <p className="text-gray-500 text-sm">
                <span className="font-bold">Posted on:</span>{' '}
                {new Date(selectedJob.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleApply(selectedJob._id)}
                disabled={appliedJobs.includes(selectedJob._id)}
                className={`w-full py-2 rounded-md transition-colors duration-200 ${
                  appliedJobs.includes(selectedJob._id)
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {appliedJobs.includes(selectedJob._id) ? 'Already Applied' : 'Quick Apply'}
              </button>
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg font-medium">
              Select a job from the list to view details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobList;