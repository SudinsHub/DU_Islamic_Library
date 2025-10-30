import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; 
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * LoginForm component for user authentication.
 *
 * @param {object} { userType } - The type of user ('admin', 'reader', 'volunteer').
 */
function ResetPassword() {
  const { isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const baseURL = import.meta.env.VITE_API_URL;

    const [searchParams] = useSearchParams();
    const userType = searchParams.get('userType');
    const emailParam = searchParams.get('email');  
    if (emailParam && email === '') {
      setEmail(emailParam);
    }
    const token = searchParams.get('token');

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    try {
         e.preventDefault();
        if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
        }
        const response = await axios.post(`${baseURL}/api/confirm-password`, { email, userType, token, password });  
        toast.success(response.data.message || 'Password has been reset successfully.');
        navigate('/user/' + userType);
    } catch (error) {
        console.error('Error confirming password:', error);
        toast.error(error.response.data.message || 'Failed to reset password. Please try again.');

    }
  };

  return (
<>
<form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto my-10">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Enter New Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Confirm Password'}
      </button>


    </form>
    </>
  );
}

export default ResetPassword;
