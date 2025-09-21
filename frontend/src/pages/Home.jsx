import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center animate-fade-in-up">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Powered by Google Vertex AI
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 text-balance">
            AI-Powered Career Intelligence with{' '}
            <span className="gradient-text">Udaan AI</span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed text-balance">
            Upload your resume and get instant AI-powered analysis, personalized job recommendations, 
            and career insights powered by Google's advanced Vertex AI technology
          </p>
          
          {/* Call-to-Action Buttons */}
          <div className="flex justify-center">
            {user ? (
              <Link
                to="/resume-analysis"
                className="btn-primary btn-lg group mobile-full"
              >
                <span className="mr-2">🚀</span>
                Analyze Your Resume Now
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="btn-primary btn-lg group mobile-full"
              >
                <span className="mr-2">🎯</span>
                Get Started - It's Free!
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free to use
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Instant results
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Privacy focused
            </div>
          </div>
        </div>
      </section>

      {/* Core AI Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 text-balance">
              Experience AI-Powered Career Intelligence
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto text-balance">
              See how our Vertex AI integration transforms your career planning in seconds
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Resume Analysis Feature */}
            <div className="card-interactive bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 group">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Smart Resume Analysis</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Upload your resume and get instant AI-powered feedback with detailed insights
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-60 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-semibold text-gray-900">Skills Analysis</span>
                  </div>
                  <p className="text-sm text-gray-600">Identify and categorize your technical and soft skills</p>
                </div>
                
                <div className="bg-white bg-opacity-60 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-semibold text-gray-900">Gap Detection</span>
                  </div>
                  <p className="text-sm text-gray-600">Discover missing skills for your target roles</p>
                </div>
                
                <div className="bg-white bg-opacity-60 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="font-semibold text-gray-900">ATS Optimization</span>
                  </div>
                  <p className="text-sm text-gray-600">Improve your resume for applicant tracking systems</p>
                </div>
                
                <div className="bg-white bg-opacity-60 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="font-semibold text-gray-900">Industry Insights</span>
                  </div>
                  <p className="text-sm text-gray-600">Get recommendations specific to your industry</p>
                </div>
              </div>
            </div>

            {/* Job Recommendations Feature */}
            <div className="card-interactive bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 group">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Personalized Job Matching</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Get AI-generated job recommendations tailored specifically to your profile
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-60 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-semibold text-gray-900">Smart Matching</span>
                  </div>
                  <p className="text-sm text-gray-600">Roles that align with your skills and experience</p>
                </div>
                
                <div className="bg-white bg-opacity-60 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-semibold text-gray-900">Match Reasoning</span>
                  </div>
                  <p className="text-sm text-gray-600">Clear explanations for each recommendation</p>
                </div>
                
                <div className="bg-white bg-opacity-60 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="font-semibold text-gray-900">Career Paths</span>
                  </div>
                  <p className="text-sm text-gray-600">Discover potential career progression routes</p>
                </div>
                
                <div className="bg-white bg-opacity-60 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="font-semibold text-gray-900">Market Trends</span>
                  </div>
                  <p className="text-sm text-gray-600">Industry insights and emerging opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Optional Mock Interview Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Bonus: AI Mock Interview Practice
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Once you've analyzed your resume, try our optional AI-powered mock interview feature. 
              Get personalized questions based on your profile and receive constructive feedback on your answers.
            </p>
            <div className="bg-white p-6 rounded-lg shadow-lg inline-block">
              <div className="flex items-center justify-center space-x-4 text-gray-600">
                <span className="flex items-center">
                  <span className="text-blue-500 mr-2">🤖</span>
                  AI-Generated Questions
                </span>
                <span className="flex items-center">
                  <span className="text-green-500 mr-2">💬</span>
                  Instant Feedback
                </span>
                <span className="flex items-center">
                  <span className="text-purple-500 mr-2">📈</span>
                  Performance Insights
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience AI-Powered Career Intelligence?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the future of career planning. Upload your resume and see the power of Vertex AI in action.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/auth"
                className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-4 px-10 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg text-lg"
              >
                🚀 Start Your AI Career Analysis
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Technology Showcase */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 mb-4">Powered by cutting-edge AI technology</p>
          <div className="flex justify-center items-center space-x-8">
            <div className="text-gray-400 font-semibold">Google Vertex AI</div>
            <div className="text-gray-300">•</div>
            <div className="text-gray-400 font-semibold">Advanced NLP</div>
            <div className="text-gray-300">•</div>
            <div className="text-gray-400 font-semibold">Machine Learning</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;