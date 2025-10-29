import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; 
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import {AlertDialog, AlertDialogAction, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogContent
} from '@/components/ui/alert-dialog'
/**
 * LoginForm component for user authentication.
 *
 * @param {object} { userType } - The type of user ('admin', 'reader', 'volunteer').
 */
function ResetPassword() {
  const { isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL;
    const location = useLocation();
    const userType = location.state?.userType;  
    const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${baseURL}/api/reset-password`, { email, userType });
    setOpen(true);
  };

  const handleDialogueClose = () => {
    setOpen(false);
    navigate('/user/' + userType); 
}

  return (
<>
<form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto my-8">
      <div className="text-center text-gray-700 mb-4">
        Enter your email address to receive a password reset link.
      </div>
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

      <button
        type="submit"
        className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Send Reset Link'}
      </button>


    </form>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Please check your email for the password reset link.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDialogueClose}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ResetPassword;
