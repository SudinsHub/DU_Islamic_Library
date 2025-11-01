import { X, Check, User, MapPin, Info, Phone, Copy, Mail } from "lucide-react"; // Import Copy icon
import { buttonGreen } from "@/utils/colors";
/**
 * Modal to display success message after book request
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onGoToDashboard - Function to call when user clicks 'Go to dashboard'
 * @param {Object} props.requestInfo - Information about the successful request (book details, return info)
 * @param {string} props.requestInfo.bookTitle - Title of the requested book
 * @param {string} props.requestInfo.bookAuthor - Author of the requested book
 * @param {Array<Object>} props.volunteers - List of volunteers for pickup
 * @param {string} props.volunteers[].name - Volunteer's name
 * @param {string} props.volunteers[].contact - Volunteer's contact number
 * @param {string} props.volunteers[].address - Volunteer's pickup location
 * @param {string} props.volunteers[].room_no - Volunteer's pickup location
 */
const SuccessModal = ({
  isOpen,
  onClose,
  onGoToDashboard,
  requestInfo
}) => {
  if (!isOpen) return null;

  return (
    // Outer overlay and centering container
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Modal content container - REMOVED max-h and overflow-y-auto here */}
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg max-h-[90vh] overflow-hidden">
        <div className="p-7">
          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X size={24} />
            </button>
          </div>

          {/* Success message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Congratulations!</h2>
            <p className="text-gray-600 leading-relaxed">
              You have successfully requested{" "}
              <span className="font-semibold">{requestInfo?.bookTitle}</span>{" "}
              by {requestInfo?.bookAuthor}.
              <br />
              We will reach you very soon!
            </p>
          </div>


          {/* Return info */}
          <div className="bg-gray-50 rounded-lg p-4 flex items-start mb-6">
            <div className="text-gray-500 mr-3 mt-0.5 flex-shrink-0">
              <Info size={18} />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
            Notice the return date while collecting the book, it is usually 7 days from the day you collect it
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onGoToDashboard}
              className={`flex-1 py-3 px-4 bg-${buttonGreen} rounded-md text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors`}
            >
              <span>OK</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;