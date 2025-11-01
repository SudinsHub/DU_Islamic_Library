import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; 
import { apiCall } from '@/utils/ApiCall';

/**
 * RegistrationForm component for user registration.
 * Dynamically renders fields based on user type.
 *
 * @param {object} { userType } - The type of user ('admin', 'reader', 'volunteer').
 */
function RegistrationForm({ userType }) {
  const { register, isLoading, error } = useAuth();

  // Common fields for all user types
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [contact, setContact] = useState('');

  // Reader/Volunteer specific fields
  const [registrationNo, setRegistrationNo] = useState('');
  const [session, setSession] = useState('');
  const [hallId, setHallId] = useState('');
  const [deptId, setDeptId] = useState('');
  const [gender, setGender] = useState(''); // For Reader
  const [address, setAddress] = useState(''); // For Volunteer
  const [roomNo, setRoomNo] = useState(''); // For Volunteer
  const [halls, setHalls] = useState([]);
  const [departments, setDepartments] = useState([]);
  // Multi-step form state for Reader/Volunteer
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2; // For Reader and Volunteer

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch halls and departments if needed
        const res1 = await apiCall("/api/halls", {}, 'GET');
        const res2 = await apiCall("/api/departments", {}, 'GET');
        setHalls(res1);
        setDepartments(res2);
      } catch (error) {
        console.error("Error fetching halls and depts.:", error);
      }
    }
    fetchData();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    let userData = {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      contact,
    };

    if (userType === 'reader') {
      userData = {
        ...userData,
        registration_no: registrationNo,
        session,
        hall_id: hallId,
        dept_id: deptId,
        gender,
      };
    } else if (userType === 'volunteer') {
      userData = {
        ...userData,
        registration_no: registrationNo,
        session,
        address,
        hall_id: hallId,
        dept_id: deptId,
        room_no: roomNo,
      };
    }
    console.log('Submitting registration data:', userData);
    console.log('User type:', userType);
    
    
    await register(userType, userData);
  };

  const renderAdminForm = () => (

    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
          required
        />
      </div>
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
      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
          Contact (Optional)
        </label>
        <input
          type="text"
          id="contact"
          placeholder="Enter contact number"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
          required
        />
      </div>
      <div>
        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="password_confirmation"
          placeholder="Confirm new password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
          required
        />
        <button
            type="submit"
            className="flex-1 w-full mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
        </button>  

      </div>
    </div>
  );

  const renderReaderVolunteerForm = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">
          {currentStep === 1 ? 'Personal Info' : 'Academic Info'}
        </h3>
        <div className="text-gray-500">
          {currentStep}/{totalSteps}
        </div>
      </div>

      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
              required
            />
          </div>
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
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              id="contact"
              placeholder="Enter phone number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
            />
          </div>
          <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800"
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Create password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="password_confirmation"
              placeholder="Confirm new password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
              required
            />
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <label htmlFor="dept_id" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="dept_id"
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800"
              required
            >
              <option value="">Select area of study</option>
              {departments.map((dept) => (
                <option key={dept.dept_id} value={dept.dept_id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="registration_no" className="block text-sm font-medium text-gray-700 mb-1">
              DU registration no.
            </label>
            <input
              type="text"
              id="registration_no"
              placeholder="Enter registration number"
              value={registrationNo}
              onChange={(e) => setRegistrationNo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">
              Session
            </label>
            <select
              type="text"
              id="session"
              placeholder="Select session"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
              required
            >
              <option value="">Select session</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (<option key={year} value={`${year}-${year + 1}`}>{year}-{year + 1}</option>);
              })}
            </select>
          </div>
          <div>
            <label htmlFor="hall_id" className="block text-sm font-medium text-gray-700 mb-1">
              Hall
            </label>
            <select
              id="hall_id"
              value={hallId}
              onChange={(e) => setHallId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800"
              required
            >
              <option value="">Select attached hall</option>
              {halls.filter(hall => hall.gender === gender).map((hall) => (
                <option key={hall.hall_id} value={hall.hall_id}>
                  {hall.name}
                </option>
              ))}
            </select>
          </div>
          {userType === 'volunteer' && (
            <>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  id="address"
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
                />
              </div>
              <div>
                <label htmlFor="room_no" className="block text-sm font-medium text-gray-700 mb-1">
                  Room no (Optional)
                </label>
                <input
                  type="number"
                  id="room_no"
                  placeholder="Enter room number"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
                />
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-center mt-6">{error}</p>}

      <div className="flex justify-between mt-8 space-x-4">
        {currentStep > 1 && userType !== 'admin' && (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        {userType !== 'admin' && currentStep < totalSteps ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {userType === 'admin' ? renderAdminForm() : renderReaderVolunteerForm()}
    </form>
  );
}

export default RegistrationForm;
