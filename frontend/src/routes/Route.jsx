import { Routes, Route } from 'react-router';
import HomeLayout from '../layouts/HomeLayout';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard'
import Leaderboard from '../pages/Leaderboard'
import Wishlist from '../pages/Wishlist'
import Login from '../pages/Login'
import SignUp from '../pages/SignUp'
import AdminLogin from '../pages/AdminLogin'
import AdminSignUp from '../pages/AdminSignUp'
import MyReads from '../pages/MyReads';
import BrowseBooksPage from '../pages/BrowseBook';
import BookDetails from '../pages/BookDetails';
import AuthPage from '@/components/auth/AuthPage';
import ReaderDashboard from '@/components/reader/ReaderDashboard';
const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<HomeLayout />}>
        <Route index element={<Home />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="dashboard" element={<ReaderDashboard />} />
        <Route path="my-reads" element={<MyReads />} />
        <Route path="browse-books" element={<BrowseBooksPage />} />
        <Route path="/book-details" element={<BookDetails />} />

        <Route path="login" element={<AuthPage />} />
        <Route path="signup" element={<SignUp />} />
      </Route>


    </Routes>
  );
};

export default AppRoutes;
