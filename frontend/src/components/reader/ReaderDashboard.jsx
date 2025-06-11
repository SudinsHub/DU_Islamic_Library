// ReaderDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path if necessary
import { apiCall } from '@/utils/ApiCall'; // Adjust path if necessary
import { toast } from 'react-toastify';
import {
  BookOpen, // Icon for 'Books read'
  BookText, // Icon for 'Currently reading'
  Award,    // Icon for 'Rank position'
  Star,     // Icon for 'Achieved points'
  Clock,    // Icon for activity date
} from 'lucide-react'; // Make sure you have lucide-react installed

const ReaderDashboard = () => {
  // Destructure isLoading from useAuth() and rename it to authLoading
  const { isAuthenticated, user, token, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true); // State for dashboard data fetching
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Wait for AuthContext to finish its initial loading (authLoading becomes false)
      if (authLoading) {
        setLoading(true); // Keep dashboard in a loading state while auth is being checked
        return;
      }

      // 2. Once authLoading is false, check if user is authenticated and token exists
      if (!isAuthenticated || !token) {
        setLoading(false); // If not authenticated, no data to fetch for dashboard
        return;
      }

      // 3. If authenticated and token is available, proceed to fetch dashboard data
      setLoading(true); // Indicate that dashboard data itself is loading
      setError(null);

      try {
        const response = await apiCall('/api/reader/dashboard', {}, 'GET', token);
        if (response.success) {
          setDashboardData(response);
        } else {
          setError(response.message || 'Failed to fetch dashboard data.');
          toast.error(response.message || 'Failed to load dashboard.');
        }
      } catch (err) {
        setError('An error occurred while fetching data.');
        toast.error('Network error or server issue. Please try again.');
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false); // Dashboard data fetching complete
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, token, authLoading]); // Add authLoading to dependency array

  // Render logic based on states:

  // 1. Show global auth loading state first
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-100 p-4">
        <div className="text-xl text-gray-600">Checking authentication...</div>
      </div>
    );
  }

  // 2. If auth is not loading but user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to view your dashboard.</p>
          <a href="/login" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // 3. If authenticated but dashboard data is loading
  if (loading) { // This 'loading' state is specific to the dashboard's data
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-100 p-4">
        <div className="text-xl text-gray-600">Loading your dashboard data...</div>
      </div>
    );
  }

  // 4. If there's an error fetching dashboard data
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-100 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  // If we reach here, isAuthenticated is true, authLoading is false, and dashboardData is loaded
  const { retunedCount, pendingCount, achievedPoints, rankPosition, activities } = dashboardData;
  const userName = user?.name || 'Reader'; // Fallback if user is null or name is missing

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-[calc(100vh-80px)] max-w-7xl">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
        Welcome to your dashboard, {userName}!
      </h1>

      {/* Overview Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Books Read Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <BookOpen className="text-green-600 h-6 w-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">{retunedCount}</p>
            <p className="text-gray-600 text-sm">Books read</p>
          </div>
        </div>

        {/* Currently Reading Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <BookText className="text-blue-600 h-6 w-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">{pendingCount}</p>
            <p className="text-gray-600 text-sm">Currently reading</p>
          </div>
        </div>

        {/* Rank Position Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <Award className="text-purple-600 h-6 w-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">#{rankPosition}</p>
            <p className="text-gray-600 text-sm">Rank position</p>
          </div>
        </div>

        {/* Achieved Points Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Star className="text-yellow-600 h-6 w-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">{achievedPoints}</p>
            <p className="text-gray-600 text-sm">Achieved points</p>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Recent Activities</h2>
        {activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.point_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b last:border-b-0">
                <div className="flex-1 mb-2 sm:mb-0">
                  <p className="text-gray-800 font-medium">{activity.point_system?.description + (activity.book_id ? ": " + activity.book?.title : "")}</p>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(activity.earned_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className={`font-bold text-lg ${
                    activity.point_system?.points >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {activity.point_system?.points >= 0 ? '+' : ''}{activity.point_system?.points}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent activities to display.</p>
        )}
      </div>

      {/* Leaderboard and Graphs sections are intentionally omitted for now */}
    </div>
  );
};

export default ReaderDashboard;