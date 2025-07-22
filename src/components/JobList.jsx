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
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
  const fetchJobPosts = async () => {
    try {
      const [jobsResponse, applicationsResponse] = await Promise.all([
        api.get('/api/jobs'),
        api.get('/api/user/applications'),
      ]);
      console.log('Fetched job posts:', JSON.stringify(jobsResponse.data, null, 2));
      console.log('Fetched applications:', JSON.stringify(applicationsResponse.data, null, 2));
      setJobPosts(jobsResponse.data || []);
      // Filter out applications with invalid jobPostId
      setAppliedJobs(
        applicationsResponse.data
          .filter(app => app.jobPostId && app.jobPostId._id) // Ensure jobPostId exists and has _id
          .map(app => app.jobPostId._id) || []
      );
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job posts.');
      setLoading(false);
      console.error('Fetch job posts error:', err.message, err.response?.data);
    }
  };
  fetchJobPosts();
}, []);

const handleApply = async (jobPostId) => {
  try {
    setError('');
    setSuccess('');
    const job = jobPosts.find(post => post._id === jobPostId);
    if (!job) {
      setError('Selected job not found.');
      return;
    }

    if (job.screeningQuestions?.length > 0) {
      const unanswered = job.screeningQuestions.some((_, index) => !answers[index]?.trim());
      if (unanswered) {
        setError('Please answer all screening questions before applying.');
        return;
      }
      await api.post(`/api/jobs/apply/${jobPostId}`, { screeningAnswers: answers });
    } else {
      await api.post(`/api/jobs/apply/${jobPostId}`);
    }

    setSuccess('Application submitted successfully!');
    setAppliedJobs(prev => [...prev, jobPostId]);
    setAnswers([]);
    setSelectedJob(null);
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to apply. Please try again.';
    setError(errorMessage);
    console.error('Apply error:', err.response?.data || err.message);
  }
};

  const handleSelectJob = (job) => {
    console.log('Selected job screeningQuestions:', job.screeningQuestions);
    setSelectedJob(job);
    setError('');
    setSuccess('');
    setAnswers([]);
  };

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[index] = value;
      return newAnswers;
    });
  };

  const filteredJobs = jobPosts.filter((post) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (post.company?.name?.toLowerCase()?.includes(searchLower)) ||
      post.title.toLowerCase().includes(searchLower) ||
      post.location.toLowerCase().includes(searchLower) ||
      (Array.isArray(post.skills) && post.skills.some(skill => skill.toLowerCase().includes(searchLower)))
    );
  });

  const areAllQuestionsAnswered = selectedJob?.screeningQuestions?.every((_, index) => answers[index]?.trim()) || !selectedJob?.screeningQuestions?.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ClipLoader size={40} color="#4A90E2" />
      </div>
    );
  }

  if (error && !selectedJob) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="error-message text-center text-red-600 font-semibold text-base p-4 bg-white rounded-lg shadow-md">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Try Again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Left Column: Job List */}
        <div className="lg:w-3/4 bg-white shadow-md rounded-lg p-6 border border-gray-200 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-primary mb-4">Available Jobs</h2>
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company, title, location, or skill..."
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-base"
            />
          </div>
          {error && (
            <p className="text-center text-red-600 font-semibold text-base p-3 bg-red-50 rounded-md mb-4">
              {error}
            </p>
          )}
          {success && (
            <p className="text-center text-green-600 font-semibold text-base p-3 bg-green-50 rounded-md mb-4">
              {success}
            </p>
          )}
          {filteredJobs.length === 0 ? (
            <p className="text-center text-gray-500 text-base font-medium py-4">
              No job posts available or matching your search.
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredJobs.map((post) => (
                <li
                  key={post._id}
                  onClick={() => handleSelectJob(post)}
                  className={`p-6 rounded-md cursor-pointer transition-colors duration-200 min-h-[120px] ${
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
                        className="w-12 h-12 object-contain rounded-full mr-4"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/48x48?text=No+Logo';
                          console.error(
                            `Failed to load logo for ${post.company?.name || 'unknown company'} at ${post.company?.logo || 'no URL'}`
                          );
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Logo</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                      <p className="text-base text-gray-600 py-1">{post.company?.name || 'Unknown Company'}</p>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>
                          <span className="font-medium py-1">Location:</span> {post.location}
                        </p>
                        <p>
                          <span className="font-medium py-1">Work Type:</span> {post.workType || 'Remote'}
                        </p>
                      </div>
                      {Array.isArray(post.skills) && post.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2 py-1">
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
                        <p className="text-gray-600 text-sm mt-2">No skills listed</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(post._id);
                    }}
                    disabled={appliedJobs.includes(post._id) || (post.screeningQuestions?.length > 0 && !areAllQuestionsAnswered)}
                    className={`py-2 px-4 rounded-md text-base transition-colors duration-200 ${
                      appliedJobs.includes(post._id)
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : post.screeningQuestions?.length > 0 && !areAllQuestionsAnswered
                        ? 'bg-gray-400 text-white cursor-not-allowed'
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
        <div className="lg:w-2/4 bg-white shadow-md rounded-lg p-6 border border-gray-200 min-h-[calc(80vh-4rem)]">
          {success && (
            <p className="text-center text-green-600 font-semibold text-base mb-4 py-3 px-4 rounded-md bg-green-50">
              {success}
            </p>
          )}
          {error && (
            <p className="text-center text-red-600 font-semibold text-base mb-4 py-3 px-4 rounded-md bg-red-50">
              {error}
            </p>
          )}
          {selectedJob ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary mb-4">Job Details</h2>
              <div className="flex items-center mb-4">
                {selectedJob.company?.logo && typeof selectedJob.company.logo === 'string' ? (
                  <img
                    src={selectedJob.company.logo}
                    alt={`${selectedJob.company.name || 'company'} logo`}
                    className="w-16 h-16 object-contain rounded-full mr-4"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/64x64?text=No+Logo';
                      console.error(
                        `Failed to load logo for ${selectedJob.company?.name || 'unknown company'} at ${selectedJob.company?.logo || 'no URL'}`
                      );
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Logo</span>
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    <span className="font-bold">Title:</span> {selectedJob.title}
                  </p>
                  <p className="text-base text-gray-600">
                    <span className="font-bold">Company:</span> {selectedJob.company?.name || 'Unknown Company'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-bold">Location:</span> {selectedJob.location}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-bold">Work Type:</span> {selectedJob.workType || 'Remote'}
              </p>
              <div className="text-sm text-gray-700">
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
              <p className="text-sm text-gray-700">
                <span className="font-bold">Description:</span> {selectedJob.description}
              </p>
              <p className="text-gray-500 text-sm">
                <span className="font-bold">Posted on:</span>{' '}
                {new Date(selectedJob.createdAt).toLocaleDateString()}
              </p>
              {selectedJob.screeningQuestions && selectedJob.screeningQuestions.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Screening Questions</h3>
                  {selectedJob.screeningQuestions.map((question, index) => (
                    <div key={index} className="mb-3">
                      <label className="block text-gray-700 text-sm">{question}</label>
                      <input
                        type="text"
                        value={answers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                        placeholder={`Enter your answer for question ${index + 1}`}
                        required
                      />
                    </div>
                  ))}
                  <p className="text-sm text-gray-600">
                    * You must answer all questions to apply.
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No screening questions available for this job.</p>
              )}
              <button
                onClick={() => handleApply(selectedJob._id)}
                disabled={appliedJobs.includes(selectedJob._id) || !areAllQuestionsAnswered}
                className={`w-full py-2 rounded-md text-base transition-colors duration-200 ${
                  appliedJobs.includes(selectedJob._id)
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : !areAllQuestionsAnswered
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {appliedJobs.includes(selectedJob._id) ? 'Already Applied' : 'Quick Apply'}
              </button>
            </div>
          ) : (
            <p className="text-center text-gray-500 text-base font-medium py-4">
              Select a job from the list to view details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobList;