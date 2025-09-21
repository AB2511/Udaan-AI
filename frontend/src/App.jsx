import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary, Navbar, ProtectedRoute } from './components';
import NetworkStatus from './components/common/NetworkStatus';

// Lazy load non-critical pages
const Home = React.lazy(() => import('./pages/Home'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const ResumeAnalysisPage = React.lazy(() => import('./pages/ResumeAnalysisPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <NetworkStatus />
          <Navbar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/resume-analysis" element={
                <ProtectedRoute>
                  <ResumeAnalysisPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="*" element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">Page not found</p>
                    <button
                      onClick={() => window.location.href = '/'}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                    >
                      Go to Home
                    </button>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;