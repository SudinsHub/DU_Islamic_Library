import { X, Check, User, MapPin, Info, Phone } from "lucide-react";
import { buttonGreen } from "@/utils/colors";

/**
 * Modal to display success message after book request
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onGoToDashboard - Function to call when user clicks 'Go to dashboard'
 * @param {Function} props.onCallVolunteer - Function to call when user clicks 'Call Volunteer'
 * @param {Object} props.requestInfo - Information about the successful request
 * @param {string} props.requestInfo.bookTitle - Title of the requested book
 * @param {string} props.requestInfo.bookAuthor - Author of the requested book
 * @param {string} props.requestInfo.volunteerName - Name of the volunteer
 * @param {string} props.requestInfo.pickupLocation - Location to pick up the book
 * @param {string} props.requestInfo.returnInfo - Information about when to return the book
 */
const SuccessModal = ({
  isOpen,
  onClose,
  onGoToDashboard,
  onCallVolunteer,
  requestInfo
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg">
        <div className="p-6">
          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Success icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center relative">
              <div className="w-12 h-12 rounded-full bg-green-400 flex items-center justify-center">
                <Check size={32} className="text-white" />
              </div>
              {/* Sparkles */}
              <span className="absolute top-0 right-2 text-xl">✨</span>
            </div>
          </div>

          {/* Success message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-gray-600">
              You have successfully requested{" "}
              <span className="font-semibold">{requestInfo?.bookTitle}</span>{" "}
              by {requestInfo?.bookAuthor}.
              <br />
              Please collect the book from the volunteer below.
            </p>
          </div>

          {/* Volunteer info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center text-gray-600">
                <User size={18} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Volunteer name</p>
                <p className="font-medium">{requestInfo?.volunteerName}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center text-gray-600">
                <MapPin size={18} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Pickup location</p>
                <p className="font-medium">{requestInfo?.pickupLocation}</p>
              </div>
            </div>

            {/* Return info */}
            <div className="bg-gray-50 rounded-lg p-4 flex">
              <div className="text-gray-500 mr-3 mt-0.5">
                <Info size={18} />
              </div>
              <p className="text-gray-600 text-sm">
                {requestInfo?.returnInfo}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onGoToDashboard}
              className="flex-1 py-3 px-4 bg-gray-100 rounded-md text-gray-700 font-medium flex items-center justify-center gap-2"
            >
              <span className="text-lg">🏠</span>
              <span>Go to dashboard</span>
            </button>
            <button
              onClick={onCallVolunteer}
              style={{ backgroundColor: buttonGreen }}
              className="flex-1 py-3 px-4 rounded-md text-white font-medium flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              <span>Call Volunteer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;