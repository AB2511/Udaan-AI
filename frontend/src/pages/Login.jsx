import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validationRules, validateForm } from '../utils/validation';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    // Client-side validation using existing rules
    const validation = validateForm({ email, password }, validationRules.login);
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    try {
      // Important: send an object { email, password }
      const resp = await login({ email, password });
      // login() will set auth state via AuthContext
      if (resp && resp.success) {
        navigate('/dashboard');
      } else {
        setServerError(resp?.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      // Attempt to parse backend friendly message if available
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {serverError && <div className="mb-4 text-red-600">{serverError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <label className="block mb-2">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border p-2 rounded mb-2" />
        {errors.email && <div className="text-red-600 text-sm mb-2">{errors.email}</div>}

        <label className="block mb-2">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full border p-2 rounded mb-4" />
        {errors.password && <div className="text-red-600 text-sm mb-2">{errors.password}</div>}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default Login;