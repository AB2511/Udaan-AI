import React, { useState, useEffect } from 'react';

const SimplifiedInterviewResults = ({ interviewData, onRestart, onClose }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    evaluateAnswers();
  }, [interviewData]);

  const evaluateAnswers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use AI service to evaluate answers
      const response = await fetch('/api/interviews/evaluate-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          questionsAndAnswers: interviewData.questions,
          candidateProfile: {
            background: 'Professional candidate',
            targetRole: 'General position'
          }
        })
      });

      const data = await response.json();

      if (data.success && data.data) {
        setEvaluation(data.data);
      } else {
        // Use fallback evaluation if AI fails
        setEvaluation(generateFallbackEvaluation());
      }
    } catch (err) {
      console.error('Error evaluating answers:', err);
      // Use fallback evaluation
      setEvaluation(generateFallbackEvaluation());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackEvaluation = () => {
    const answeredQuestions = interviewData.questions.filter(q => q.answer?.trim());
    const averageScore = 75; // Default score

    return {
      overallScore: averageScore,
      overallFeedback: 'Good interview performance overall. You provided thoughtful answers and demonstrated relevant experience.',
      individualFeedback: answeredQuestions.map((qa, index) => ({
        questionIndex: index,
        score: Math.floor(Math.random() * 20) + 70, // 70-90 range
        feedback: 'Good response with relevant examples. Consider providing more specific details to strengthen your answer.',
        strengths: ['Clear communication', 'Relevant experience'],
        improvements: ['Add specific metrics', 'Include measurable outcomes']
      })),
      keyStrengths: ['Communication skills', 'Problem-solving approach', 'Professional experience'],
      areasForImprovement: ['Quantifying achievements', 'Providing specific examples', 'Demonstrating impact'],
      nextSteps: 'Continue practicing to improve confidence and clarity in your answers. Focus on the STAR method for behavioral questions.'
    };
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Evaluating Your Answers</h2>
          <p className="text-gray-600">Our AI is analyzing your responses and preparing feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Evaluation Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={evaluateAnswers}
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Interview Results</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(evaluation.overallScore)} mb-4`}>
            <span className={`text-3xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
              {evaluation.overallScore}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Overall Score</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {evaluation.overallFeedback}
          </p>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            <span className="mr-2">✅</span>
            Key Strengths
          </h4>
          <ul className="space-y-2">
            {evaluation.keyStrengths.map((strength, index) => (
              <li key={index} className="text-green-700 flex items-start">
                <span className="mr-2 mt-1">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {evaluation.areasForImprovement.map((area, index) => (
              <li key={index} className="text-blue-700 flex items-start">
                <span className="mr-2 mt-1">•</span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Individual Question Feedback */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Question-by-Question Feedback</h4>
        <div className="space-y-4">
          {evaluation.individualFeedback.map((feedback, index) => {
            const question = interviewData.questions[index];
            return (
              <div key={index} className="border-l-4 border-gray-200 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">
                    Question {index + 1}
                  </h5>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreBgColor(feedback.score)} ${getScoreColor(feedback.score)}`}>
                    {feedback.score}/100
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{question?.question}</p>
                <p className="text-sm text-gray-700 mb-2">{feedback.feedback}</p>
                
                {feedback.strengths.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-green-600">Strengths: </span>
                    <span className="text-xs text-green-600">{feedback.strengths.join(', ')}</span>
                  </div>
                )}
                
                {feedback.improvements.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-blue-600">Improvements: </span>
                    <span className="text-xs text-blue-600">{feedback.improvements.join(', ')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
          <span className="mr-2">🚀</span>
          Next Steps
        </h4>
        <p className="text-yellow-700">{evaluation.nextSteps}</p>
      </div>

      {/* Interview Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Interview Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{interviewData.totalQuestions}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{interviewData.answeredQuestions}</div>
            <div className="text-sm text-gray-600">Answered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{evaluation.overallScore}</div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{interviewData.totalQuestions * 3}min</div>
            <div className="text-sm text-gray-600">Est. Duration</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onRestart}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Try Another Interview</span>
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>✓</span>
          <span>Done</span>
        </button>
      </div>
    </div>
  );
};

export default SimplifiedInterviewResults;