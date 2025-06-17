import { useState, useEffect } from "react";
import { Heart, ChevronLeft, Share2, MoreVertical, Star } from "lucide-react";
import { useLocation } from "react-router-dom";
import BookRequestModal from "@/components/BookRequestModal";
import SuccessModal from "@/components/SuccessModal";
import { apiCall } from '../utils/ApiCall';
import { toast } from 'react-toastify';
import { useAuth } from "@/contexts/AuthContext";

// Shadcn UI components for the new confirmation modal
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Adjust path as needed

const BookDetails = () => {
    const baseURL = import.meta.env.VITE_API_URL;
    const { isAuthenticated, token } = useAuth();
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const id = params.get("id");
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoved, setIsLoved] = useState(false);

    // Modals states
    const [isRequestModalOpen, setRequestModalOpen] = useState(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
    const [isConfirmRequestOpen, setConfirmRequestOpen] = useState(false); // New state for confirmation modal
    const [selectedCollectionPoint, setSelectedCollectionPoint] = useState(null); // To store selected hall ID for confirmation

    const [volunteersList, setVolunteersList] = useState([]);

    // Handle request confirmation from the BookRequestModal
    const handleInitiateRequest = (collectionPointId) => {
        setSelectedCollectionPoint(collectionPointId);
        setConfirmRequestOpen(true); // Open the new confirmation modal
        setRequestModalOpen(false); // Close the first modal
    };

    // Handle final confirmation from the AlertDialog
    const handleConfirmRequest = async () => {
        if (!selectedCollectionPoint) return;

        try {
            await apiCall(`/api/request`, { book_id: book.id, hall_id: selectedCollectionPoint }, 'POST', token);
            const availableVols = await apiCall(`/api/vol/get-available-vols?hall_id=${selectedCollectionPoint}`, {}, 'GET', token);
            toast.success("Request confirmed successfully!");
            setVolunteersList(availableVols);
            setConfirmRequestOpen(false); // Close confirmation modal
            setSuccessModalOpen(true); // Open success modal
        } catch (error) {
            console.error("Error confirming request:", error);
            toast.error(error.message || "Failed to confirm request");
        } finally {
            setSelectedCollectionPoint(null); // Clear selected point
        }
    };

    // Go to dashboard action
    const handleGoToDashboard = () => {
        console.log("Navigating to dashboard");
        setSuccessModalOpen(false);
    };

    const handleLoved = async () => {
        // Optimistically update UI
        const previousLovedState = isLoved;
        setIsLoved(!isLoved);

        const action = previousLovedState ? 'remove' : 'add';
        const method = previousLovedState ? 'DELETE' : 'POST';
        const endpoint = previousLovedState ? `/api/wish/${book.id}` : '/api/wish';

        try {
            if (method === 'POST') {
                await apiCall(endpoint, { book_id: book.id }, method, token);
            } else { // DELETE method
                await apiCall(endpoint, {}, method, token); // DELETE usually doesn't have a body for resource deletion
            }
            toast.success(`Book ${action}ed successfully!`);
        } catch (err) {
            // Revert UI state if API call fails
            setIsLoved(previousLovedState);
            toast.error(`Failed to ${action} book: ${err.message || 'Please try again.'}`);
        }
    };

    // Fetch book data from API
    useEffect(() => {
        const fetchBook = async () => {
            if (!id) {
                setError("No book ID provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await apiCall(`/api/books/${id}`, {}, 'GET', token);
                setBook(response);
                setIsLoved(response.isLoved || false); // Assuming the API response includes `isLoved`
            } catch (err) {
                console.error("Error fetching book:", err);
                setError(err.message || "Failed to load book details");
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id, token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-red-600">{error}</div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Book not found</div>
            </div>
        );
    }

    return (
        <>
            {/* Book Request Modal (First step: select collection point) */}
            <BookRequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setRequestModalOpen(false)}
                onConfirm={handleInitiateRequest} // Call the new handler here
                book={{
                    title: book.title,
                    author: book.author,
                    coverImage: book.imageURL
                }}
                collectionPoints={book.halls.map(hall => ({
                    id: hall.hall_id,
                    name: hall.hall_name,
                    available: hall.available_copies_in_hall
                })) || []}
            />

            {/* New Confirmation Modal (Second step: confirm request) */}
            <AlertDialog open={isConfirmRequestOpen} onOpenChange={setConfirmRequestOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Book Request</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to request **{book.title}** by {book.author}.
                            The book will be picked up from **{book.halls.find(h => h.hall_id === selectedCollectionPoint)?.hall_name || 'the selected hall'}**.
                            Are you sure you want to proceed with this request?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmRequest}>
                            Confirm Request
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Success Modal (Third step: show success and volunteer info) */}
            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                onGoToDashboard={handleGoToDashboard}
                onCallVolunteer={(contact) => { console.log("Calling:", contact); }}
                requestInfo={{ bookTitle: book.title, bookAuthor: book.author }}
                volunteers={volunteersList}
            />

            <div className="bg-gray-50 min-h-screen pb-8">
                {/* Header */}
                <div className="bg-white p-4 flex items-center justify-between shadow-sm">
                    <button className="flex items-center text-gray-800" onClick={() => window.history.back()}>
                        <ChevronLeft size={20} />
                        <span className="ml-2 font-medium text-lg">Book details</span>
                    </button>
                    <div className="flex gap-4">
                        <Share2 size={20} className="text-gray-600" />
                        <MoreVertical size={20} className="text-gray-600" />
                    </div>
                </div>

                {/* Book Information */}
                <div className="p-4 md:p-6 md:flex md:gap-8 max-w-7xl mx-auto">
                    {/* Book Cover and Basic Info */}
                    <div className="md:w-1/3">
                        <div className="relative">
                            <div className="bg-white rounded-lg overflow-hidden shadow-md">
                                <img
                                    src={baseURL + book.imageURL || "/api/placeholder/280/380"}
                                    alt={book.title}
                                    className="w-full object-cover aspect-[3/4]"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h1 className="text-2xl font-bold text-gray-800">{book.title}</h1>
                            <p className="text-gray-500 mt-1">{book.author}</p>
                        </div>
                        <div className={`mt-6 flex gap-4 `}>
                            <button
                                onClick={() => setRequestModalOpen(true)}
                                className={`bg-[#0CCE6B] text-white py-3 px-4 rounded-md flex-1 font-medium ${(!book.availability || !isAuthenticated) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!book.availability || !isAuthenticated}
                            >
                                {!isAuthenticated ? "Login First" : (book.availability ? 'Request Book' : 'Not Available')}
                            </button>
                            <button onClick={handleLoved} className={`border border-gray-300 p-3 rounded-md ${isLoved ? 'bg-red-50' : ''}`}>
                                <Heart size={20} className={isLoved ? "text-red-500 fill-red-500" : "text-gray-500"} />
                            </button>
                        </div>
                    </div>

                    {/* Book Details */}
                    <div className="mt-8 md:mt-0 md:w-2/3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Rating */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Star size={16} className="text-gray-400" />
                                    <span className="ml-2 text-gray-500">Rating</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">{book.average_rating} ({book.rating_count})</div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        <div className={`w-3 h-3 rounded-full ${book.availability ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                    </div>
                                    <span className="ml-2 text-gray-500">Status</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">{book.availability ? 'Available now' : 'Not available'}</div>
                                </div>
                            </div>

                            {/* Publisher */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-4 h-4">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" className="text-gray-400" />
                                        </svg>
                                    </div>
                                    <span className="ml-2 text-gray-500">Publisher</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">{book.publisher}</div>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-4 h-4">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" className="text-gray-400" />
                                        </svg>
                                    </div>
                                    <span className="ml-2 text-gray-500">Category</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">{book.category}</div>
                                </div>
                            </div>
                        </div>

                        {/* Halls */}
                        {book.halls && book.halls.length > 0 && (
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 mb-4">
                                <div className="w-full md:w-auto flex items-center mb-2 md:mb-0">
                                    <span className="font-semibold text-lg">Available in Halls</span>
                                </div>
                                <div className="flex flex-wrap gap-2 md:justify-end">
                                    {book.halls.map((hall) => (
                                        <div key={hall.hall_id} className="text-right bg-gray-200 rounded-xl px-3 py-1">
                                            <div className="font-semibold">{hall.hall_name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="mt-4">
                            <h2 className="font-semibold text-lg mb-2">Description</h2>
                            <p className="text-gray-700">{book.description} <span className="text-blue-600 font-medium">see more</span></p>
                        </div>


                        {/* Reviews */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-lg">Reviews & ratings</h2>
                                <div className="flex items-center">
                                    <Star size={16} className="text-green-500 fill-green-500" />
                                    <span className="ml-1 font-semibold">{book.average_rating} ({book.rating_count})</span>
                                </div>
                            </div>

                            {/* Review List */}
                            <div className="space-y-6">
                                {book.reviews && book.reviews.length > 0 ? (
                                    book.reviews.map((review, index) => (
                                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" className="text-gray-400" />
                                                            <circle cx="12" cy="7" r="4" className="text-gray-400" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="font-medium">{review.name}</div>
                                                        <div className="text-xs text-gray-500">{review.date}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right font-semibold">{review.rating}</div>
                                            </div>
                                            <p className="mt-3 text-gray-700">{review.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 text-center py-4">No reviews yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BookDetails;