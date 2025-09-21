import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/interviewService';

const InterviewResults = ({ results, sessionData, onRestart, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [detailedFeedback, setDetailedFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (results && results.sessionId) {
      fetchDetailedFeedback(results.sessionId);
    }
  }, [results]);

  const fetchDetailedFeedback = async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await interviewService.getInterviewFeedback(sessionId);
      if (response.success) {
        setDetailedFeedback(response.data);
      } else {
        setError(response.error || 'Failed to load detailed feedback');
      }
    } catch (error) {
      console.error('Error fetching detailed feedback:', error);
      setError('Failed to load detailed feedback');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    return '💪';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const formatSessionType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading detailed feedback...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Results</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => fetchDetailedFeedback(results?.sessionId)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const feedback = detailedFeedback || results;
  const overallScore = feedback?.overallScore || 0;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Interview Complete! {getScoreIcon(overallScore)}</h1>
            <p className="text-blue-100 text-lg">
              {feedback?.title || sessionData?.title || 'Mock Interview Session'}
            </p>
            <div className="flex items-center space-x-4 mt-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {formatSessionType(feedback?.sessionType || sessionData?.sessionType || 'interview')}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {feedback?.targetRole || sessionData?.role || 'General'}
              </span>
              {feedback?.sessionInfo?.duration && (
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  Duration: {formatDuration(feedback.sessionInfo.duration)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold px-6 py-3 rounded-lg ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
            <p className="text-blue-100 mt-2">Overall Score</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-8">
          {['overview', 'competencies', 'questions', 'recommendations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'competencies' ? 'Skills Assessment' : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Strengths</h3>
                <div className="space-y-2">
                  {feedback?.feedback?.strengths?.length > 0 ? (
                    feedback.feedback.strengths.slice(0, 3).map((strength, index) => (
                      <div key={index} className="flex items-center text-green-700">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-green-700 text-sm">Great job completing the interview!</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Questions Answered</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {feedback?.sessionInfo?.progress?.answeredQuestions || feedback?.questionFeedback?.length || 0}
                  <span className="text-lg text-blue-500">
                    /{feedback?.sessionInfo?.progress?.totalQuestions || sessionData?.questions?.length || 0}
                  </span>
                </div>
                <p className="text-blue-600 text-sm mt-2">
                  {feedback?.sessionInfo?.progress?.percentage || 0}% Complete
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Areas to Improve</h3>
                <div className="space-y-2">
                  {feedback?.feedback?.improvementAreas?.length > 0 ? (
                    feedback.feedback.improvementAreas.slice(0, 2).map((area, index) => (
                      <div key={index} className="flex items-center text-purple-700">
                        <span className="text-purple-500 mr-2">→</span>
                        <span className="text-sm">{area.area || area}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-purple-700 text-sm">Keep up the great work!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Overall Feedback */}
            {feedback?.feedback?.overall && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Overall Feedback</h3>
                <p className="text-gray-700 leading-relaxed">{feedback.feedback.overall}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'competencies' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Skills Assessment Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Communication */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-800 flex items-center">
                    <span className="text-2xl mr-3">💬</span>
                    Communication
                  </h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor((feedback?.feedback?.communication?.score || 0) * 10)}`}>
                    {(feedback?.feedback?.communication?.score || 0) * 10}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(feedback?.feedback?.communication?.score || 0) * 10}%` }}
                  ></div>
                </div>
                {feedback?.feedback?.communication?.feedback && (
                  <p className="text-gray-600 text-sm">{feedback.feedback.communication.feedback}</p>
                )}
              </div>

              {/* Technical Accuracy */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-800 flex items-center">
                    <span className="text-2xl mr-3">🔧</span>
                    Technical Skills
                  </h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor((feedback?.feedback?.technicalAccuracy?.score || 0) * 10)}`}>
                    {(feedback?.feedback?.technicalAccuracy?.score || 0) * 10}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(feedback?.feedback?.technicalAccuracy?.score || 0) * 10}%` }}
                  ></div>
                </div>
                {feedback?.feedback?.technicalAccuracy?.feedback && (
                  <p className="text-gray-600 text-sm">{feedback.feedback.technicalAccuracy.feedback}</p>
                )}
              </div>

              {/* Confidence */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-800 flex items-center">
                    <span className="text-2xl mr-3">💪</span>
                    Confidence
                  </h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor((feedback?.feedback?.confidence?.score || 0) * 10)}`}>
                    {(feedback?.feedback?.confidence?.score || 0) * 10}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(feedback?.feedback?.confidence?.score || 0) * 10}%` }}
                  ></div>
                </div>
                {feedback?.feedback?.confidence?.feedback && (
                  <p className="text-gray-600 text-sm">{feedback.feedback.confidence.feedback}</p>
                )}
              </div>

              {/* Problem Solving */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-800 flex items-center">
                    <span className="text-2xl mr-3">🧩</span>
                    Problem Solving
                  </h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor((feedback?.feedback?.problemSolving?.score || 0) * 10)}`}>
                    {(feedback?.feedback?.problemSolving?.score || 0) * 10}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(feedback?.feedback?.problemSolving?.score || 0) * 10}%` }}
                  ></div>
                </div>
                {feedback?.feedback?.problemSolving?.feedback && (
                  <p className="text-gray-600 text-sm">{feedback.feedback.problemSolving.feedback}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Question-by-Question Feedback</h3>
            
            {feedback?.questionFeedback?.length > 0 ? (
              <div className="space-y-6">
                {feedback.questionFeedback.map((question, index) => (
                  <div key={question.questionId || index} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                            Q{index + 1}
                          </span>
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {question.category}
                          </span>
                        </div>
                        <h4 className="text-lg font-medium text-gray-800 mb-3">{question.question}</h4>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor((question.feedback?.score || 0) * 10)}`}>
                        {(question.feedback?.score || 0) * 10}%
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* User Answer */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Your Answer:</h5>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {question.userAnswer || 'No answer provided'}
                          </p>
                          {question.timeSpent > 0 && (
                            <p className="text-gray-500 text-xs mt-2">
                              Time spent: {formatDuration(question.timeSpent)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Feedback */}
                      {question.feedback?.content && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Feedback:</h5>
                          <p className="text-gray-600 text-sm leading-relaxed">{question.feedback.content}</p>
                        </div>
                      )}

                      {/* Strengths and Improvements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.feedback?.strengths?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-green-700 mb-2">Strengths:</h5>
                            <ul className="space-y-1">
                              {question.feedback.strengths.map((strength, idx) => (
                                <li key={idx} className="text-green-600 text-sm flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {question.feedback?.improvements?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-orange-700 mb-2">Areas for Improvement:</h5>
                            <ul className="space-y-1">
                              {question.feedback.improvements.map((improvement, idx) => (
                                <li key={idx} className="text-orange-600 text-sm flex items-center">
                                  <span className="text-orange-500 mr-2">→</span>
                                  {improvement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Question Feedback Available</h3>
                <p className="text-gray-600">Detailed question feedback will appear here once available.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Personalized Recommendations</h3>

            {/* Next Steps */}
            {feedback?.feedback?.nextSteps?.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <span className="text-2xl mr-3">🎯</span>
                  Next Steps
                </h4>
                <ul className="space-y-3">
                  {feedback.feedback.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-blue-800">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvement Areas */}
            {feedback?.feedback?.improvementAreas?.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                  <span className="text-2xl mr-3">📈</span>
                  Focus Areas for Improvement
                </h4>
                <div className="space-y-4">
                  {feedback.feedback.improvementAreas.map((area, index) => (
                    <div key={index} className="border-l-4 border-orange-400 pl-4">
                      <h5 className="font-medium text-orange-800">{area.area || area}</h5>
                      {area.suggestion && (
                        <p className="text-orange-700 text-sm mt-1">{area.suggestion}</p>
                      )}
                      {area.priority && (
                        <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                          area.priority === 'high' ? 'bg-red-100 text-red-800' :
                          area.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {area.priority} priority
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Recommendations */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <span className="text-2xl mr-3">💡</span>
                General Tips for Future Interviews
              </h4>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Practice the STAR method (Situation, Task, Action, Result) for behavioral questions
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Research the company and role thoroughly before the interview
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Prepare specific examples that demonstrate your skills and achievements
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Practice active listening and ask thoughtful questions
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Take time to think before answering complex questions
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 px-8 py-6 rounded-b-lg border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {feedback?.sessionInfo?.completedAt && (
              <span>Completed on {new Date(feedback.sessionInfo.completedAt).toLocaleDateString()}</span>
            )}
          </div>
          <div className="space-x-4">
            <button
              onClick={onRestart}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Take Another Interview
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewResults;