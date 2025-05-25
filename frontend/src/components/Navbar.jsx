import React, { useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import {buttonGreen} from '../utils/colors' 

const Navbar = ({ isLoggedIn = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div >
      {!isLoggedIn ? (
        // Logged out navbar
        <div className="w-full mx-auto bg-white rounded-lg p-4 flex items-center justify-between text-nowrap">
          <div className="h-8 w-8 mr-2 flex items-center justify-center rounded-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 84 84" fill="none">
              <path d="M37.833 0.333328C37.833 4.9357 34.1021 8.66666 29.4997 8.66666C21.7337 8.66666 15.2083 13.9782 13.3581 21.1667H0.333008V29.5H21.1663V25.3333C21.1663 20.731 24.8973 17 29.4997 17C34.4776 17 38.9457 14.8177 41.9997 11.3576C45.0536 14.8177 49.5218 17 54.4997 17C59.1021 17 62.833 20.731 62.833 25.3333V29.5H75.333V50.3333H83.6664V21.1667H70.6413C68.7911 13.9782 62.2657 8.66666 54.4997 8.66666C49.8973 8.66666 46.1663 4.9357 46.1663 0.333328H37.833Z" fill="#008F5E"/>
              <path d="M29.4997 75.3333C34.1021 75.3333 37.833 79.0643 37.833 83.6667H46.1663C46.1663 79.0643 49.8973 75.3333 54.4997 75.3333H83.6664V67H54.4997C49.5218 67 45.0536 69.1823 41.9997 72.6424C38.9457 69.1823 34.4776 67 29.4997 67L0.333008 67V75.3333H29.4997Z" fill="#008F5E"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M16.1663 33.6667H0.333008V62.8333H16.1663C18.9278 62.8333 21.1663 60.5948 21.1663 57.8333V38.6667C21.1663 35.9052 18.9278 33.6667 16.1663 33.6667ZM8.66634 54.5V42H12.833V54.5H8.66634Z" fill="#008F5E"/>
              <path d="M33.6663 33.6667V54.5H37.833V33.6667H46.1663V57.8333C46.1663 60.5948 43.9278 62.8333 41.1663 62.8333H30.333C27.5716 62.8333 25.333 60.5948 25.333 57.8333V33.6667H33.6663Z" fill="#008F5E"/>
              <path d="M58.6663 62.8333L58.6664 33.6667H50.333V62.8333H58.6663Z" fill="#008F5E"/>
              <path d="M71.1663 33.6667V54.5H83.6664V62.8333H67.833C65.0716 62.8333 62.833 60.5948 62.833 57.8333V33.6667H71.1663Z" fill="#008F5E"/>
            </svg>
          </div>
          <span className="font-bold text-xl mr-4 text-[#008F5E]">Dhaka University Islamic Library</span>
          <div className="relative flex-grow max-w-2xl">
            <div className="absolute inset-y-0 left-3 flex items-center">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search books by name, authors, genre or halls"
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-6 ml-4">
            
            <a href="#" className= {`text-gray-800 font-medium hover:text-[${buttonGreen}]`} >Home</a>
            <a href="/browse-books" className={`text-gray-800 font-medium hover:text-[${buttonGreen}]`}>Browse books</a>
            <div className="relative group">
              <button className={`text-gray-800 font-medium hover:text-[${buttonGreen}] flex items-center`}>
                More
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <a href="/login" className={`px-4 py-2 text-gray-800 font-medium hover:text-[${buttonGreen}]`}>Log In</a>
              <a href="/signup" className={`px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-[${buttonGreen}]`}>Sign Up</a>
            </div>
          </div>
        </div>
      ) : (
        // Logged in navbar
      <div className="w-full mx-auto bg-white rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between text-nowrap">
        {/* Left Section */}
        <div className="flex justify-start">
          <div className="h-8 w-8 mr-2 flex items-center rounded-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 84 84" fill="none">
              <path d="M37.833 0.333328C37.833 4.9357 34.1021 8.66666 29.4997 8.66666C21.7337 8.66666 15.2083 13.9782 13.3581 21.1667H0.333008V29.5H21.1663V25.3333C21.1663 20.731 24.8973 17 29.4997 17C34.4776 17 38.9457 14.8177 41.9997 11.3576C45.0536 14.8177 49.5218 17 54.4997 17C59.1021 17 62.833 20.731 62.833 25.3333V29.5H75.333V50.3333H83.6664V21.1667H70.6413C68.7911 13.9782 62.2657 8.66666 54.4997 8.66666C49.8973 8.66666 46.1663 4.9357 46.1663 0.333328H37.833Z" fill="#008F5E"/>
              <path d="M29.4997 75.3333C34.1021 75.3333 37.833 79.0643 37.833 83.6667H46.1663C46.1663 79.0643 49.8973 75.3333 54.4997 75.3333H83.6664V67H54.4997C49.5218 67 45.0536 69.1823 41.9997 72.6424C38.9457 69.1823 34.4776 67 29.4997 67L0.333008 67V75.3333H29.4997Z" fill="#008F5E"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M16.1663 33.6667H0.333008V62.8333H16.1663C18.9278 62.8333 21.1663 60.5948 21.1663 57.8333V38.6667C21.1663 35.9052 18.9278 33.6667 16.1663 33.6667ZM8.66634 54.5V42H12.833V54.5H8.66634Z" fill="#008F5E"/>
              <path d="M33.6663 33.6667V54.5H37.833V33.6667H46.1663V57.8333C46.1663 60.5948 43.9278 62.8333 41.1663 62.8333H30.333C27.5716 62.8333 25.333 60.5948 25.333 57.8333V33.6667H33.6663Z" fill="#008F5E"/>
              <path d="M58.6663 62.8333L58.6664 33.6667H50.333V62.8333H58.6663Z" fill="#008F5E"/>
              <path d="M71.1663 33.6667V54.5H83.6664V62.8333H67.833C65.0716 62.8333 62.833 60.5948 62.833 57.8333V33.6667H71.1663Z" fill="#008F5E"/>
            </svg>
          </div>
          <span className="font-bold text-xl mr-4 text-[#008F5E] hidden md:block">
            Dhaka University Islamic Library
          </span>
        </div>

        {/* Search Bar (Placed in Middle for Large Screens, Next Row for Mobile) */}
        <div className="flex justify-center max-w-xl flex-grow">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search books by name, authors, genre or halls"
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex justify-end md:order-3 items-center gap-4">
          <button className={`px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-[${buttonGreen}]`}>
            Request a book
          </button>
          <button className={`p-2 text-gray-600 hover:text-[${buttonGreen}] relative`}>
            <Bell className="h-6 w-6" />
          </button>
          <button className={`p-2 text-gray-600 hover:text-[${buttonGreen}]`}>
            <User className="h-6 w-6" />
          </button>
        </div>
      </div>

      )}
    </div>
  );
};

export default Navbar;

