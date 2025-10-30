import { Routes, Route } from 'react-router';
import HomeLayout from '../layouts/HomeLayout';
import Home from '../pages/Home';
import Leaderboard from '../pages/Leaderboard'
import Wishlist from '../pages/Wishlist'
import MyReads from '../pages/MyReads';
import BrowseBooksPage from '../pages/BrowseBook';
import BookDetails from '../pages/BookDetails';
import AuthPage from '@/components/auth/AuthPage';
import ReaderDashboard from '@/components/reader/ReaderDashboard';
import ResetPassword from '@/components/auth/ResetPassword';
import ConfirmPassword from '@/pages/ConfirmPassword';

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
        <Route path="book-details" element={<BookDetails />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="confirm-password" element={<ConfirmPassword />} />

        <Route path="user/:userType" element={<AuthPage />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;
