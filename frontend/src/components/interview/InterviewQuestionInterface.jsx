import React, { useState, useEffect, useRef } from 'react';
import { interviewService } from '../../services/interviewService';

const InterviewQuestionInterface = ({ sessionData, onInterviewComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState('text'); // text, audio
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes per question
  const [isPaused, setIsPaused] = useState(false);
  const [answers, setAnswers] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (sessionData) {
      loadFirstQuestion();
    }
  }, [sessionData]);

  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining, isPaused]);

  const loadFirstQuestion = async () => {
    try {
      setLoading(true);
      // Assuming the session data contains questions or we need to fetch them
      if (sessionData.questions && sessionData.questions.length > 0) {
        setCurrentQuestion(sessionData.questions[0]);
        setTotalQuestions(sessionData.questions.length);
        setQuestionIndex(1);
      } else {
        // Fetch first question from API
        const response = await interviewService.getNextQuestion(sessionData.sessionId);
        setCurrentQuestion(response.question);
        setTotalQuestions(response.totalQuestions || 10);
        setQuestionIndex(1);
      }
      setTimeRemaining(300); // Reset timer
    } catch (err) {
      console.error('Error loading first question:', err);
      setError('Failed to load interview questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() && recordingMode === 'text') {
      setError('Please provide an answer before continuing.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Save current answer
      const currentAnswerData = {
        questionId: currentQuestion.id || currentQuestion._id,
        question: currentQuestion.question,
        answer: userAnswer,
        timeSpent: 300 - timeRemaining,
        recordingMode
      };

      const updatedAnswers = [...answers, currentAnswerData];
      setAnswers(updatedAnswers);

      // Submit answer to backend
      const response = await interviewService.submitAnswer(
        sessionData.sessionId,
        currentAnswerData
      );

      // Check if there are more questions
      if (questionIndex < totalQuestions && response.hasMoreQuestions !== false) {
        // Load next question
        let nextQuestion;
        if (sessionData.questions && sessionData.questions[questionIndex]) {
          nextQuestion = sessionData.questions[questionIndex];
        } else {
          const nextQuestionResponse = await interviewService.getNextQuestion(
            sessionData.sessionId
          );
          nextQuestion = nextQuestionResponse.question;
        }

        setCurrentQuestion(nextQuestion);
        setQuestionIndex(prev => prev + 1);
        setUserAnswer('');
        setTimeRemaining(300); // Reset timer
      } else {
        // Interview complete, get results
        const resultsResponse = await interviewService.completeInterview(
          sessionData.sessionId
        );
        onInterviewComplete(resultsResponse);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    setError('Time is up for this question. Moving to next question...');
    setTimeout(() => {
      if (userAnswer.trim()) {
        submitAnswer();
      } else {
        setUserAnswer('No answer provided (time expired)');
        setTimeout(submitAnswer, 100);
      }
    }, 2000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // For now, just indicate audio was recorded
        // In a real implementation, you'd upload the audio or convert to text
        setUserAnswer(`Audio response recorded (${Math.round(audioBlob.size / 1024)}KB)`);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const skipQuestion = () => {
    setUserAnswer('Question skipped by user');
    setTimeout(submitAnswer, 100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColorClass = () => {
    if (timeRemaining < 60) return 'text-red-600';
    if (timeRemaining < 120) return 'text-yellow-600';
    return 'text-gray-900';
  };

  if (loading && !currentQuestion) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {interviewService.formatInterviewType(sessionData.sessionType)}
            </h2>
            <p className="text-sm text-gray-600">
              Question {questionIndex} of {totalQuestions}
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="flex-1 max-w-xs">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Timer and Controls */}
        <div className="text-right">
          <div className={`text-2xl font-mono font-bold ${getTimeColorClass()}`}>
            {formatTime(timeRemaining)}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <button
              onClick={togglePause}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button
              onClick={skipQuestion}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ⏭️ Skip
            </button>
          </div>
        </div>
      </div>

      {/* Question Display */}
      {currentQuestion && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Question:</h3>
            {currentQuestion.category && (
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                {currentQuestion.category}
              </span>
            )}
          </div>
          <p className="text-blue-800 text-lg leading-relaxed">{currentQuestion.question}</p>
          
          {/* Question Hints or Context */}
          {currentQuestion.context && (
            <div className="mt-4 p-3 bg-blue-100 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Context:</strong> {currentQuestion.context}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recording Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Response Mode:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setRecordingMode('text')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                recordingMode === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📝 Text
            </button>
            <button
              onClick={() => setRecordingMode('audio')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                recordingMode === 'audio'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎤 Audio
            </button>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="text-sm text-gray-600">
          {questionIndex > 1 && (
            <span>Previous answers saved • </span>
          )}
          <span>{totalQuestions - questionIndex} questions remaining</span>
        </div>
      </div>

      {/* Answer Input */}
      {recordingMode === 'text' ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer:
          </label>
          <textarea
            ref={textareaRef}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here... Be specific and provide examples where possible."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              {userAnswer.length} characters • Aim for detailed responses
            </p>
            <button
              onClick={() => textareaRef.current?.focus()}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Focus input
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio Response:
          </label>
          <div className="border border-gray-300 rounded-lg p-6 text-center">
            {!isRecording ? (
              <div>
                <button
                  onClick={startRecording}
                  className="flex items-center space-x-3 mx-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <span className="text-xl">🎤</span>
                  <span className="font-medium">Start Recording</span>
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Click to start recording your answer
                </p>
              </div>
            ) : (
              <div>
                <button
                  onClick={stopRecording}
                  className="flex items-center space-x-3 mx-auto px-6 py-3 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors animate-pulse"
                >
                  <span className="text-xl">⏹️</span>
                  <span className="font-medium">Stop Recording</span>
                </button>
                <p className="text-sm text-red-600 mt-2 font-medium">
                  🔴 Recording in progress...
                </p>
              </div>
            )}
            
            {userAnswer && recordingMode === 'audio' && (
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-700 flex items-center justify-center space-x-2">
                  <span>✓</span>
                  <span>{userAnswer}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Exit Interview
        </button>

        <div className="flex space-x-3">
          <button
            onClick={skipQuestion}
            className="px-6 py-3 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors"
          >
            Skip Question
          </button>
          
          <button
            onClick={submitAnswer}
            disabled={loading || (!userAnswer.trim() && recordingMode === 'text')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Answer</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interview Progress Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Progress: {questionIndex}/{totalQuestions} questions</span>
          <span>Answers saved: {answers.length}</span>
          <span>Time per question: ~{Math.round(300/60)} minutes</span>
        </div>
      </div>
    </div>
  );
};

export default InterviewQuestionInterface;