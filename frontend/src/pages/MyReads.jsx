// src/pages/MyReadsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from "@/utils/ApiCall"; // Adjust path as necessary
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as necessary
import { Star } from 'lucide-react'; // Assuming you have lucide-react for icons

// Components for the review modal (you might need to create these or adapt existing ones)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; // For the 3-dot menu
import { toast } from 'react-toastify'; // For notifications

// Helper function to format dates
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Use a more mobile-friendly date format if needed, or keep consistent
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Invalid Date';
    }
};

const MyReadsPage = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth(); // Assuming user object is available from useAuth and contains reader_id
    const readerId = user?.reader_id; // Get reader_id from the authenticated user

    const [pendingRequests, setPendingRequests] = useState([]);
    const [currentReads, setCurrentReads] = useState([]);
    const [completedReads, setCompletedReads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Review Modal
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBookForReview, setSelectedBookForReview] = useState(null);
    const [bookRating, setBookRating] = useState(0);
    const [bookReviewText, setBookReviewText] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // State for Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0);

    const fetchMyReads = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall('/api/my-reads', {}, 'GET', token);
            setPendingRequests(response.pendingRequests);
            setCurrentReads(response.currentReads);
            setCompletedReads(response.completedReads);
            console.log("My Reads Data:", response);
        } catch (err) {
            console.error("Failed to fetch my reads:", err);
            setError("Failed to load your reads. Please try again.");
            toast.error("Failed to load your reads.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && readerId) { // Ensure token and readerId are available before fetching
            fetchMyReads();
        }
    }, [token, readerId]); // Re-fetch if token or readerId changes

    const handleCancelRequest = async (req_id) => {
        if (window.confirm("Are you sure you want to cancel this request?")) {
            try {
                await apiCall('/api/request', { req_id: req_id }, 'DELETE', token);
                toast.success("Request cancelled successfully!");
                fetchMyReads(); // Refresh the list
            } catch (err) {
                console.error("Failed to cancel request:", err);
                toast.error("Failed to cancel request. Please try again.");
            }
        }
    };

    const handleOpenReviewModal = (bookDetails, lendingId) => {
        setSelectedBookForReview({ ...bookDetails, lending_id: lendingId });
        setBookRating(0);
        setBookReviewText('');
        setShowReviewModal(true);
    };

    const handleSubmitReview = async () => {
        if (bookRating === 0) {
            toast.error("Please select a rating for the book.");
            return;
        }
        if (!selectedBookForReview || !readerId) {
            toast.error("Book or user information missing for review.");
            return;
        }

        setSubmittingReview(true);
        try {
            const reviewData = {
                reader_id: readerId,
                book_id: selectedBookForReview.book_id,
                rating: bookRating,
                comment: bookReviewText,
            };
            const response = await apiCall('/api/reviews', reviewData, 'POST', token);
            toast.success("Review submitted successfully!");
            setEarnedPoints(response.points_earned || 50); // Assuming 50 points if not specified by backend
            setShowReviewModal(false);
            setShowSuccessModal(true);

            fetchMyReads();
        } catch (err) {
            console.error("Failed to submit review:", err);
            toast.error("Failed to submit review. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const getStarColor = (starIndex) => {
        return starIndex <= bookRating ? '#34D399' : '#D1D5DB';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-gray-700">Loading your reads...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const hasPendingReviews = completedReads.some(read => !read.review_id);
    const pendingReviewCount = completedReads.filter(read => !read.review_id).length;

    // Common Card Component for reusability and consistent styling
    const BookCard = ({ book, type, onCancel, onReview }) => {
        const imageUrl = book.image_url || '/images/default_book_cover.jpg';
        const title = book.title || 'Unknown Title';
        const authorName = book.author?.name || 'Unknown Author';

        return (
            <div className="flex p-4 bg-gray-50 rounded-lg shadow-sm w-full">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-16 h-20 object-cover rounded mr-4 flex-shrink-0"
                />
                <div className="flex-grow flex flex-col justify-center">
                    <h3 className="font-medium text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600">{authorName}</p>
                    {type === 'requested' && (
                        <p className="text-xs text-gray-500 mt-1">Pickup date: {formatDate(book.request_date)}</p>
                    )}
                    {type === 'current' && (
                        <div className="flex flex-wrap text-xs text-gray-500 mt-1 gap-x-4">
                            <p>Pickup date: {formatDate(book.issue_date)}</p>
                            <p>Return date: {formatDate(book.return_date)}</p>
                        </div>
                    )}
                    {type === 'completed' && (
                        <div className="flex flex-wrap text-xs text-gray-500 mt-1 gap-x-4">
                            <p>Pickup date: {formatDate(book.issue_date)}</p>
                            <p>Return date: {formatDate(book.return_date)}</p>
                        </div>
                    )}
                </div>
                <div className="ml-auto flex items-center justify-end">
                    {type === 'requested' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onCancel} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                                    Cancel request
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {type === 'completed' && (
                        book.review_id ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-600 border-gray-300 hover:bg-gray-100"
                                onClick={() => toast.info("Viewing existing reviews is not implemented yet.")}
                            >
                                View Review
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={onReview}
                            >
                                Review
                            </Button>
                        )
                    )}
                </div>
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-gray-100 p-4 pb-10 sm:p-6 lg:p-8"> {/* Added pb-10 for bottom padding */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">My books</h1>
                </div>

                {/* Pending Reviews Banner */}
                {hasPendingReviews && (
                    <div className="bg-green-50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shadow-sm">
                        <div className="flex items-center mb-2 sm:mb-0">
                            <Star className="w-5 h-5 text-green-500 mr-2" />
                            <p className="text-green-800 text-sm">
                                You have {pendingReviewCount} pending review{pendingReviewCount > 1 ? 's' : ''} to earn points!
                            </p>
                        </div>
                        {/* Optional: Add a button to navigate to pending reviews or open the first one */}
                        {/* <Button variant="ghost" className="text-green-600 hover:text-green-700 sm:ml-4">Earn {pendingReviewCount * 25} points!</Button> */}
                    </div>
                )}


                {/* Requested Books Section */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    Requested book <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm">{pendingRequests.length}</span>
                </h2>
                <div className="space-y-4 mb-8">
                    {pendingRequests.length === 0 ? (
                        <p className="text-gray-600">No pending requests.</p>
                    ) : (
                        pendingRequests.map((request) => (
                            <BookCard
                                key={request.req_id}
                                book={request.book ? { ...request.book, request_date: request.request_date } : null}
                                type="requested"
                                onCancel={() => handleCancelRequest(request.req_id)}
                            />
                        ))
                    )}
                </div>

                {/* Currently Reading Section */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    Currently reading <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm">{currentReads.length}</span>
                </h2>
                <div className="space-y-4 mb-8">
                    {currentReads.length === 0 ? (
                        <p className="text-gray-600">No books currently reading.</p>
                    ) : (
                        currentReads.map((read) => (
                            <BookCard
                                key={read.lending_id}
                                book={read.request?.book ? { ...read.request.book, issue_date: read.issue_date, return_date: read.return_date } : null}
                                type="current"
                            />
                        ))
                    )}
                </div>

                {/* Completed Books Section */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    Completed <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm">{completedReads.length}</span>
                </h2>
                <div className="space-y-4">
                    {completedReads.length === 0 ? (
                        <p className="text-gray-600">No completed reads yet.</p>
                    ) : (
                        completedReads.map((read) => (
                            <BookCard
                                key={read.lending_id}
                                book={read.request?.book ? { ...read.request.book, issue_date: read.issue_date, return_date: read.return_date, review_id: read.review_id } : null}
                                type="completed"
                                onReview={() => handleOpenReviewModal(read.request?.book, read.lending_id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Review Book Modal */}
            <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                <DialogContent className="w-[95%] sm:max-w-[425px] p-6 rounded-lg"> {/* Added w-[95%] for better mobile fit */}
                    <DialogHeader>
                        <button
                            onClick={() => setShowReviewModal(false)}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <div className="flex items-center mb-4">
                            <img
                                src={selectedBookForReview?.image_url || '/images/default_book_cover.jpg'}
                                alt={selectedBookForReview?.title}
                                className="w-16 h-20 object-cover rounded mr-4"
                            />
                            <div>
                                <DialogTitle className="text-lg font-semibold">{selectedBookForReview?.title || 'Unknown Title'}</DialogTitle>
                                <DialogDescription className="text-sm text-gray-600">
                                    {selectedBookForReview?.author?.name || 'Unknown Author'}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col items-start gap-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                How was the book? <span className="text-gray-500 text-xs">5 points</span>
                            </label>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className="h-8 w-8 cursor-pointer transition-colors duration-200"
                                        fill={getStarColor(star)}
                                        stroke={getStarColor(star)}
                                        onClick={() => setBookRating(star)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col items-start gap-2">
                            <label htmlFor="review-text" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Write a review <span className="text-gray-500 text-xs">5 points</span>
                            </label>
                            <Textarea
                                id="review-text"
                                placeholder="Write your review here..."
                                value={bookReviewText}
                                onChange={(e) => setBookReviewText(e.target.value)}
                                className="w-full h-32"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowReviewModal(false)}
                            disabled={submittingReview}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Skip
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={submittingReview}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            {submittingReview ? 'Submitting...' : 'Submit'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Review Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="w-[95%] sm:max-w-[350px] p-6 text-center rounded-lg"> {/* Added w-[95%] */}
                    <button
                        onClick={handleCloseSuccessModal}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <div className="flex flex-col items-center justify-center pt-4">
                        <div className="bg-green-100 rounded-full p-3 mb-4">
                            <div className="bg-green-500 rounded-full p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <DialogTitle className="text-2xl font-bold mb-2">Congratulations!</DialogTitle>
                        <DialogDescription className="text-md text-gray-700">
                            You have earned {earnedPoints} Points!
                        </DialogDescription>
                    </div>
                    <DialogFooter className="flex justify-center mt-6">
                        <Button
                            onClick={handleCloseSuccessModal}
                            className="bg-green-600 text-white hover:bg-green-700 w-full"
                        >
                            Go to My Books
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MyReadsPage;