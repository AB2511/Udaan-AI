import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
    const activeClass = "bg-blue-700 text-white";
    const inactiveClass = "text-blue-100 hover:bg-blue-700 hover:text-white";
    
    return `${baseClass} ${isActiveRoute(path) ? activeClass : inactiveClass}`;
  };

  const mobileNavLinkClass = (path) => {
    const baseClass = "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200";
    const activeClass = "bg-blue-700 text-white";
    const inactiveClass = "text-blue-100 hover:bg-blue-700 hover:text-white";
    
    return `${baseClass} ${isActiveRoute(path) ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex-shrink-0 flex items-center group"
              onClick={closeMenu}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-white text-xl font-bold">
                  Udaan AI
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Authentication links */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/" className={navLinkClass('/')}>
                  Home
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-100 text-sm">
                    Welcome, {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/auth" 
                  className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Sign In / Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
          {/* Mobile authentication links */}
          {isAuthenticated ? (
            <>
              <Link 
                to="/" 
                className={mobileNavLinkClass('/')}
                onClick={closeMenu}
              >
                Home
              </Link>
              <div className="px-3 py-2">
                <div className="text-blue-100 text-sm mb-2">
                  Welcome, {user?.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left bg-blue-800 hover:bg-blue-900 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/auth" 
                className={mobileNavLinkClass('/auth')}
                onClick={closeMenu}
              >
                Sign In / Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;