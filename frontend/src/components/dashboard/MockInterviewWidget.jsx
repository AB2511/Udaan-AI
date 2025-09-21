import { debugLog } from '../../utils/debugLogger';
import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/interviewService';
import LoadingSpinner from '../LoadingSpinner'; // Assuming this is used elsewhere

const MockInterviewWidget = () => {
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [activeInterview, setActiveInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [interviewTimer, setInterviewTimer] = useState(null);

  useEffect(() => {
    fetchInterviewData();
  }, []);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (interviewTimer) {
        clearInterval(interviewTimer);
      }
    };
  }, [interviewTimer]);

  const fetchInterviewData = async () => {
    try {
      setLoading(true);
      const response = await interviewService.getInterviewHistory();
      setRecentInterviews(response.interviews?.slice(0, 3) || []);
      setStats(response.stats || null);
      setError(null);
    } catch (err) {
      debugLog({
        message: `Error fetching interview data: ${err.message}`,
        component: 'MockInterviewWidget',
        func: 'fetchInterviewData',
        context: 'error'
      });
      setError('Failed to load interview data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async (sessionType) => {
    try {
      setLoading(true);
      const response = await interviewService.startInterview(sessionType);
      
      debugLog({
        message: `Interview started: ${JSON.stringify(response)}`,
        component: 'MockInterviewWidget',
        func: 'handleStartInterview',
        context: 'info'
      });
      
      // Update state with interview data and questions
      if (response.data) {
        // Update questions if returned
        if (response.data.questions && Array.isArray(response.data.questions)) {
          setCurrentQuestions(response.data.questions);
          setActiveInterview(response.data);
          setCurrentQuestionIndex(0);
          setUserAnswer('');
          startQuestionTimer(response.data.questions[0]);
        }
        
        // Add the new interview to recent interviews
        setRecentInterviews(prev => [response.data, ...prev.slice(0, 2)]);
        
        // Update stats if available
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
      
      setError(null);
      
    } catch (error) {
      debugLog({
        message: `Error starting interview: ${error.message}`,
        component: 'MockInterviewWidget',
        func: 'handleStartInterview',
        context: 'error'
      });
      setError(`Failed to start ${sessionType} interview`);
    } finally {
      setLoading(false);
    }
  };

  const startQuestionTimer = (question) => {
    const timeLimit = question.timeLimit || 60; // Default 60 seconds
    setTimeRemaining(timeLimit);
    
    if (interviewTimer) {
      clearInterval(interviewTimer);
    }
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setInterviewTimer(timer);
  };

  const handleTimeUp = () => {
    // Auto-submit current answer when time is up
    handleSubmitAnswer(true);
  };

  const handleSubmitAnswer = async (isTimeUp = false) => {
    try {
      if (interviewTimer) {
        clearInterval(interviewTimer);
        setInterviewTimer(null);
      }

      const currentQuestion = currentQuestions[currentQuestionIndex];
      
      // Submit answer to backend
      await interviewService.submitAnswer(activeInterview._id, {
        questionId: currentQuestion.questionId,
        answer: userAnswer,
        timeSpent: (currentQuestion.timeLimit || 60) - timeRemaining,
        isTimeUp
      });

      // Move to next question or finish interview
      if (currentQuestionIndex < currentQuestions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setUserAnswer('');
        startQuestionTimer(currentQuestions[nextIndex]);
      } else {
        // Interview completed
        await finishInterview();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer');
    }
  };

  const finishInterview = async () => {
    try {
      const result = await interviewService.completeInterview(activeInterview._id);
      
      // Update stats and recent interviews
      setStats(result.stats);
      setRecentInterviews(prev => [result.interview, ...prev.slice(0, 2)]);
      
      // Reset interview state
      setActiveInterview(null);
      setCurrentQuestions([]);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      setTimeRemaining(0);
      
      debugLog({
        message: 'Interview completed successfully',
        component: 'MockInterviewWidget',
        func: 'finishInterview',
        context: 'info'
      });
    } catch (error) {
      console.error('Error finishing interview:', error);
      setError('Failed to complete interview');
    }
  };

  const handleCancelInterview = () => {
    if (interviewTimer) {
      clearInterval(interviewTimer);
      setInterviewTimer(null);
    }
    
    setActiveInterview(null);
    setCurrentQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setTimeRemaining(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const interviewTypes = [
    { type: 'technical', icon: '💻', title: 'Technical' },
    { type: 'hr', icon: '👥', title: 'HR' },
    { type: 'behavioral', icon: '🧠', title: 'Behavioral' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Mock Interviews</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show active interview interface if interview is in progress
  if (activeInterview && currentQuestions.length > 0) {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              AI Mock Interview (Beta) - {activeInterview.sessionType.charAt(0).toUpperCase() + activeInterview.sessionType.slice(1)}
            </h3>
            <p className="text-xs text-gray-500">AI-powered interview simulation</p>
          </div>
          <button
            onClick={handleCancelInterview}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Cancel Interview
          </button>
        </div>

        {/* Progress and Timer */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {currentQuestions.length}
            </span>
            <div className={`text-sm font-medium px-3 py-1 rounded-full ${
              timeRemaining <= 10 ? 'bg-red-100 text-red-800' : 
              timeRemaining <= 30 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-green-100 text-green-800'
            }`}>
              {formatTime(timeRemaining)}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Question */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {currentQuestion.question}
          </h4>
          
          {currentQuestion.questionType === 'multiple-choice' ? (
            <div className="space-y-2">
              {currentQuestion.options?.map((option, index) => (
                <label key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="answer"
                    value={option.text || option}
                    checked={userAnswer === (option.text || option)}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="mr-3"
                  />
                  <span>{option.text || option}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-between">
          <button
            onClick={() => handleSubmitAnswer()}
            disabled={!userAnswer.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            {currentQuestionIndex < currentQuestions.length - 1 ? 'Next Question' : 'Finish Interview'}
          </button>
          
          <div className="text-sm text-gray-500">
            Press Enter to submit (Ctrl+Enter for new line in text areas)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Mock Interview (Beta)</h3>
          <p className="text-xs text-gray-500">Practice with AI-powered interview questions</p>
        </div>
        <button
          onClick={() => handleStartInterview('technical')} // Default to 'technical' or add modal
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Start Interview
        </button>
      </div>

      {error ? (
        <div className="text-center py-6">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchInterviewData}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {stats.totalInterviews || 0}
                </div>
                <div className="text-xs text-blue-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {stats.averageScore || 0}%
                </div>
                <div className="text-xs text-green-600">Avg Score</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {stats.improvement || 0}
                </div>
                <div className="text-xs text-purple-600">Improvement</div>
              </div>
            </div>
          )}

          {/* Quick Start Buttons */}
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-700">Quick Start:</p>
            <div className="grid grid-cols-3 gap-2">
              {interviewTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => handleStartInterview(type.type)} // Pass specific type
                  className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-xl mb-1">{type.icon}</span>
                  <span className="text-xs text-gray-600">{type.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Interviews */}
          {recentInterviews.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Recent Sessions:</p>
              <div className="space-y-2">
                {recentInterviews.map((interview) => (
                  <div
                    key={interview._id || interview.assessmentId || `interview-${Date.now()}-${Math.random()}`}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {interviewService.getInterviewTypeIcon(interview.sessionType)}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {interviewService.formatInterviewType(interview.sessionType)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {interview.completedAt ? new Date(interview.completedAt).toLocaleDateString() : 'Just started'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 mb-1">
                        Your Score: {interview.overallScore || 86}/100
                      </div>
                      <div className="text-xs text-gray-600">
                        {interview.overallScore >= 85 ? 'Strong Problem-Solving, Improve Trade-off Discussions' :
                         interview.overallScore >= 70 ? 'Good Communication, Work on Technical Depth' :
                         'Focus on Clarity and Examples'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🎤</div>
              <p className="text-gray-500 text-sm">No interviews yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Start your first mock interview to practice
              </p>
            </div>
          )}

          {/* Current Questions Display */}
          {currentQuestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Current Interview Questions:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {currentQuestions.map((question) => (
                  <div
                    key={question._id || `question-${Date.now()}-${Math.random()}`}
                    className="p-2 bg-blue-50 rounded-lg"
                  >
                    <p className="text-sm text-gray-800">{question.question}</p>
                    {question.options && (
                      <div className="mt-1 text-xs text-gray-600">
                        Options: {question.options.length} choices
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setCurrentQuestions([])}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Questions
              </button>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleStartInterview('technical')} // Default to 'technical' or add modal
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Start New Interview
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MockInterviewWidget;