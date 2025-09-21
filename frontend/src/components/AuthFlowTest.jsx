import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthFlowTest = () => {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date() }]);
  };

  const runAuthFlowTests = async () => {
    setTesting(true);
    setTestResults([]);

    try {
      // Test 1: Registration
      addResult('Registration Test', false, 'Starting registration test...');
      const testEmail = `test${Date.now()}@example.com`;
      const registerResult = await register('Test User', testEmail, 'TestPassword123!');
      
      if (registerResult.success) {
        addResult('Registration Test', true, 'Registration successful');
        
        // Test 2: Logout after registration
        addResult('Logout Test', false, 'Testing logout...');
        await logout();
        addResult('Logout Test', true, 'Logout successful');
        
        // Test 3: Login with registered credentials
        addResult('Login Test', false, 'Testing login...');
        const loginResult = await login(testEmail, 'TestPassword123!');
        
        if (loginResult.success) {
          addResult('Login Test', true, 'Login successful');
          addResult('Authentication Flow', true, 'All authentication flow tests passed!');
        } else {
          addResult('Login Test', false, `Login failed: ${loginResult.message}`);
        }
      } else {
        addResult('Registration Test', false, `Registration failed: ${registerResult.message}`);
      }
    } catch (error) {
      addResult('Error', false, `Test error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Flow Integration Test</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Auth State:</h3>
        <div className="bg-gray-50 p-3 rounded">
          <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          <p><strong>User:</strong> {user ? `${user.name} (${user.email})` : 'None'}</p>
        </div>
      </div>

      <button
        onClick={runAuthFlowTests}
        disabled={testing}
        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {testing ? 'Running Tests...' : 'Run Authentication Flow Tests'}
      </button>

      {testResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Test Results:</h3>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center">
                <span className={`mr-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.success ? '✅' : '❌'}
                </span>
                <span className="font-medium">{result.test}:</span>
                <span className="ml-2">{result.message}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {result.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthFlowTest;