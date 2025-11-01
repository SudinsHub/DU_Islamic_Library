import { useState } from "react";
import { X } from "lucide-react";
import { buttonGreen } from "@/utils/colors";
import { useAuth } from "@/contexts/AuthContext";
/**
 * Modal for requesting a book with collection point selection
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onConfirm - Function to call when request is confirmed with selected point
 * @param {Object} props.book - Book information object
 * @param {string} props.book.title - Book title
 * @param {string} props.book.author - Book author
 * @param {string} props.book.coverImage - Book cover image URL
 * @param {Array} props.collectionPoints - Array of available collection points
 */
const BookRequestModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  book, 
  collectionPoints 
}) => {
  const [selectedPoint, setSelectedPoint] = useState(collectionPoints?.[0]?.id || null);
  const {user} = useAuth();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedPoint);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg">
        <div className="p-6">
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold">Request book</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Book info */}
          {book && (
            <div className="flex items-center mb-6">
              <img 
                src={book.coverImage || "/api/placeholder/60/80"} 
                alt={book.title} 
                className="w-12 h-16 object-cover rounded-md"
              />
              <div className="ml-3">
                <h3 className="font-medium">{book.title}</h3>
                <p className="text-gray-500 text-sm">{book.author}</p>
              </div>
            </div>
          )}

          {/* Collection point selection */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Select a Collection Point</h3>
            <div className="space-y-2">
              {collectionPoints?.map((point) => (
                <label 
                  key={point.id}
                  className={`flex items-center p-3 rounded-md cursor-pointer ${
                    selectedPoint === point.id ? 'bg-green-50' : 'hover:bg-gray-50'
                  } ${(point.gender === user.gender) ? '' : 'opacity-50 cursor-not-allowed disabled'}`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name="collection-point"
                      value={point.id}
                      checked={selectedPoint === point.id}
                      onChange={() => setSelectedPoint(point.id)}
                      className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span>{point.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-200 rounded-md text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              style={{ backgroundColor: buttonGreen }}
              className="flex-1 py-3 px-4 rounded-md text-white font-medium"
              disabled={!selectedPoint}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRequestModal;