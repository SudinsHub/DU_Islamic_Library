import { X, Check, User, MapPin, Info, Phone, Copy, Mail } from "lucide-react"; // Import Copy icon
import { buttonGreen } from "@/utils/colors";
import {toast} from "react-toastify"
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
  volunteers = [] // Default to empty array if not provided
}) => {
  if (!isOpen) return null;

  // Function to handle copying text to clipboard
  const handleCopyContact = async (contact) => {
    try {
      await navigator.clipboard.writeText(contact);
      toast.done("Contact number copied to clipboard!"); 
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.warning("Failed to copy number. Please try manually.");
    }
  };

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

          {/* Success icon */}
          {/* <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center relative">
              <div className="w-12 h-12 rounded-full bg-green-400 flex items-center justify-center">
                <Check size={32} className="text-white" />
              </div>
              <span className="absolute top-0 right-1 text-xl -rotate-12 transform">✨</span>
            </div>
          </div> */}

          {/* Success message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Congratulations!</h2>
            <p className="text-gray-600 leading-relaxed">
              {/* You have successfully requested{" "}
              <span className="font-semibold">{requestInfo?.bookTitle}</span>{" "}
              by {requestInfo?.bookAuthor}.
              <br /> */}
              Please collect the book from **one of** the volunteers below.
            </p>
          </div>

          {/* Volunteer list section */}
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Available Volunteers:</h3>
          {volunteers.length > 0 ? (
            <div className="space-y-0 mb-6 max-h-60 overflow-y-auto pr-2"> {/* ONLY this div is scrollable */}
              {volunteers.map((volunteer, index) => (
                <div key={index} className="py-3 px-0 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center mb-2 px-4">
                    <User size={18} className="text-gray-600 mr-3 flex-shrink-0" />
                    <p className="text-lg font-semibold text-gray-800">{volunteer.name}</p>
                  </div>
                  <div className="flex items-center mb-2 px-4">
                    <Phone size={18} className="text-gray-600 mr-3 flex-shrink-0" />
                    <p className="text-gray-700 text-base">
                      {volunteer.contact} {/* Display contact number directly, link to call is removed */}
                    </p>
                  </div>
                  {volunteer.email &&  <div className="flex items-center mb-2 px-4">
                    <Mail size={18} className="text-gray-600 mr-3 flex-shrink-0" />
                    <p className="text-gray-700 text-base">
                      {volunteer.email}
                    </p>
                  </div> }
                  <div className="flex items-start px-4">
                    <MapPin size={18} className="text-gray-600 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-gray-700 text-base">{(volunteer.room_no ? ("Room No: " + volunteer.room_no) : "") + volunteer.address}</p>
                  </div>
                  {/* Copy Contact Number button for each volunteer */}
                  <div className="mt-4 text-right px-4">
                    <button
                      onClick={() => handleCopyContact(volunteer.contact)} // Call the new handler
                      style={{ backgroundColor: buttonGreen }}
                      className="py-2 px-4 rounded-md text-white font-medium flex items-center justify-center gap-2 text-sm ml-auto"
                    >
                      <Copy size={16} /> {/* Changed icon to Copy */}
                      <span>Copy Contact Number</span> {/* Changed text */}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mb-6 py-4 border border-gray-200 rounded-lg bg-gray-50 mx-auto">
              No volunteers assigned for this hall yet.
            </div>
          )}

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
              className="flex-1 py-3 px-4 bg-gray-100 rounded-md text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <span className="text-lg">🏠</span>
              <span>Go to dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;