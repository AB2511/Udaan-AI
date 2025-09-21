import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/interviewService';

const SimplifiedInterviewInterface = ({ resumeContent, onComplete, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [resumeContent]);

  const generateQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the simplified API endpoint
      const response = await fetch('/api/interviews/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resumeContent: resumeContent || '',
          questionCount: 5
        })
      });

      const data = await response.json();

      if (data.success && data.data.questions) {
        setQuestions(data.data.questions);
      } else {
        throw new Error(data.error || 'Failed to generate questions');
      }
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Failed to generate interview questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare answers for evaluation
      const questionsAndAnswers = questions.map(q => ({
        question: q.question,
        answer: answers[q.id] || '',
        type: q.type
      }));

      // Call the completion callback with the results
      onComplete({
        questions: questionsAndAnswers,
        totalQuestions: questions.length,
        answeredQuestions: Object.keys(answers).length
      });
    } catch (err) {
      console.error('Error submitting interview:', err);
      setError('Failed to submit interview. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allQuestionsAnswered = questions.every(q => answers[q.id]?.trim());

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Interview Questions</h2>
          <p className="text-gray-600">Our AI is creating personalized questions based on your resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={generateQuestions}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="text-gray-400 text-5xl mb-4">❓</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Generated</h2>
          <p className="text-gray-600 mb-4">Unable to generate interview questions at this time.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Mock Interview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {currentQuestion.type}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </h3>
            
            {/* Tip */}
            {currentQuestion.tip && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-blue-400">💡</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Tip:</strong> {currentQuestion.tip}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Answer Textarea */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-2 text-sm text-gray-500">
              {answers[currentQuestion.id]?.length || 0} characters
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <div className="flex space-x-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium ${
                index === currentQuestionIndex
                  ? 'bg-blue-600 text-white'
                  : answers[questions[index].id]
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered || isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Complete Interview</span>
                <span>✓</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next →
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Questions Answered: {Object.keys(answers).length} / {questions.length}</span>
          <span>Estimated Time: {questions.length * 3} minutes</span>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedInterviewInterface;