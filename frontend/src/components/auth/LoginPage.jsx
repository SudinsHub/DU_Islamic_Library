import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed

/**
 * LoginForm component for user authentication.
 *
 * @param {object} { userType } - The type of user ('admin', 'reader', 'volunteer').
 */
function LoginForm({ userType }) {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(userType, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Logging In...' : 'Login'}
      </button>

      <div className="text-center text-sm">
        <a href="#" className="text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>
    </form>
  );
}

export default LoginForm;
