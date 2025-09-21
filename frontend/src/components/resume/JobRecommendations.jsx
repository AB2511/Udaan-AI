import { useState, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';

const JobRecommendations = ({ recommendations = [], isLoading = false, error = null }) => {
  const [expandedJob, setExpandedJob] = useState(null);
  const { addToast } = useToast();

  const showToast = useCallback((message, type) => {
    addToast(message, type);
  }, [addToast]);

  const toggleJobExpansion = useCallback((index) => {
    setExpandedJob(expandedJob === index ? null : index);
  }, [expandedJob]);

  const [selectedJob, setSelectedJob] = useState(null);

  const handleJobInterest = useCallback((job) => {
    // Coming Soon functionality
    showToast('Feature coming soon! We\'ll notify you when applications open.', 'info');
  }, [showToast]);

  const handleLearnMore = useCallback((job) => {
    setSelectedJob(job);
  }, []);

  const closeJobModal = useCallback(() => {
    setSelectedJob(null);
  }, []);

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return 'Competitive salary';
    
    // Convert USD to INR format if needed
    if (salaryRange.includes('$')) {
      // Extract numbers and convert to LPA format
      const numbers = salaryRange.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        const minLPA = Math.floor(parseInt(numbers[0]) * 0.08); // Rough USD to LPA conversion
        const maxLPA = Math.floor(parseInt(numbers[1]) * 0.08);
        return `₹${minLPA} LPA – ₹${maxLPA} LPA`;
      }
    }
    
    // If already in INR format, return as is
    if (salaryRange.includes('₹') || salaryRange.includes('LPA')) {
      return salaryRange;
    }
    
    // Default fallback
    return '₹8 LPA – ₹20 LPA';
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Job Recommendations Unavailable</h3>
            <p className="text-gray-600 text-sm">Unable to generate job recommendations at this time</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
          <p className="text-red-600 text-sm mt-2">
            Don't worry - your resume analysis is still complete. Job recommendations will be available once our AI service is restored.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Generating Job Recommendations</h3>
            <p className="text-gray-600 text-sm">AI is analyzing your profile to find the best matches...</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 002 2h2a2 2 0 002-2V6m0 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Job Recommendations</h3>
            <p className="text-gray-600 text-sm">No specific recommendations available</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            Based on your resume, consider exploring opportunities in your field of expertise. 
            Update your resume with more specific skills and experience to get personalized job recommendations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 002 2h2a2 2 0 002-2V6m0 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI-Generated Job Recommendations</h3>
          <p className="text-gray-600 text-sm">
            {recommendations.length} personalized {recommendations.length === 1 ? 'opportunity' : 'opportunities'} based on your resume
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.slice(0, 2).map((job, index) => (
          <div key={index} className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-blue-200 overflow-hidden">
            {/* Job Header */}
            <div className="p-4 border-b border-blue-200 bg-white bg-opacity-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg mb-1">{job.title}</h4>
                  {job.company && (
                    <p className="text-blue-600 font-medium text-sm mb-2">{job.company}</p>
                  )}
                  {job.location && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </div>
                  )}
                </div>
                {job.matchScore && (
                  <div className="text-center ml-4">
                    <div className="text-2xl font-bold text-green-600">{job.matchScore}%</div>
                    <div className="text-xs text-gray-600">Match</div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Content */}
            <div className="p-4">
              {job.description && (
                <div className="mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {expandedJob === index 
                      ? job.description 
                      : `${job.description.substring(0, 120)}${job.description.length > 120 ? '...' : ''}`
                    }
                  </p>
                  {job.description.length > 120 && (
                    <button
                      onClick={() => toggleJobExpansion(index)}
                      className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-700"
                    >
                      {expandedJob === index ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              )}

              {/* Match Reason - Key Feature */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 text-blue-600 mr-2 mt-0.5">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-600 text-sm font-medium mb-1">Why this matches your profile:</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{job.matchReason}</p>
                  </div>
                </div>
              </div>

              {/* Required Skills */}
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-900 text-sm font-medium mb-2">Key Skills Required:</p>
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 4).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{job.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Salary Range */}
              <div className="mb-4">
                <div className="flex items-center text-green-600 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="font-medium">{formatSalary(job.salaryRange || job.salary)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleJobInterest(job)}
                  className="flex-1 bg-gray-400 text-white text-sm font-medium py-2 px-3 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Coming Soon
                </button>
                <button
                  onClick={() => handleLearnMore(job)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Recommendations Notice */}
      {recommendations.length > 2 && (
        <div className="mt-6 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <span className="font-medium">Great news!</span> We found {recommendations.length - 2} additional job{recommendations.length - 2 === 1 ? '' : 's'} that match your profile.
              Complete your profile to unlock all recommendations.
            </p>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedJob.title}</h3>
                  {selectedJob.company && (
                    <p className="text-blue-600 font-medium">{selectedJob.company}</p>
                  )}
                </div>
                <button
                  onClick={closeJobModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {selectedJob.location && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                    <p className="text-gray-700">{selectedJob.location}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Salary</h4>
                  <p className="text-green-600 font-medium">{formatSalary(selectedJob.salaryRange || selectedJob.salary)}</p>
                </div>

                {selectedJob.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                    <p className="text-gray-700">{selectedJob.description}</p>
                  </div>
                )}

                {selectedJob.matchReason && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Skills Match</h4>
                    <p className="text-gray-700">{selectedJob.matchReason}</p>
                  </div>
                )}

                {selectedJob.requiredSkills && selectedJob.requiredSkills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requiredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={closeJobModal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;