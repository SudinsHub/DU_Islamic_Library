import React, { useState } from 'react';
import { Bell, Search, User, Menu, LogIn} from 'lucide-react';

const Navbar = ({ isLoggedIn = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="w-full bg-white">
      
        <div className="p-4 flex flex-col">
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-8 w-8 mr-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 84 84" fill="none">
                  <path d="M37.833 0.333328C37.833 4.9357 34.1021 8.66666 29.4997 8.66666C21.7337 8.66666 15.2083 13.9782 13.3581 21.1667H0.333008V29.5H21.1663V25.3333C21.1663 20.731 24.8973 17 29.4997 17C34.4776 17 38.9457 14.8177 41.9997 11.3576C45.0536 14.8177 49.5218 17 54.4997 17C59.1021 17 62.833 20.731 62.833 25.3333V29.5H75.333V50.3333H83.6664V21.1667H70.6413C68.7911 13.9782 62.2657 8.66666 54.4997 8.66666C49.8973 8.66666 46.1663 4.9357 46.1663 0.333328H37.833Z" fill="#008F5E"/>
                  <path d="M29.4997 75.3333C34.1021 75.3333 37.833 79.0643 37.833 83.6667H46.1663C46.1663 79.0643 49.8973 75.3333 54.4997 75.3333H83.6664V67H54.4997C49.5218 67 45.0536 69.1823 41.9997 72.6424C38.9457 69.1823 34.4776 67 29.4997 67L0.333008 67V75.3333H29.4997Z" fill="#008F5E"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.1663 33.6667H0.333008V62.8333H16.1663C18.9278 62.8333 21.1663 60.5948 21.1663 57.8333V38.6667C21.1663 35.9052 18.9278 33.6667 16.1663 33.6667ZM8.66634 54.5V42H12.833V54.5H8.66634Z" fill="#008F5E"/>
                  <path d="M33.6663 33.6667V54.5H37.833V33.6667H46.1663V57.8333C46.1663 60.5948 43.9278 62.8333 41.1663 62.8333H30.333C27.5716 62.8333 25.333 60.5948 25.333 57.8333V33.6667H33.6663Z" fill="#008F5E"/>
                  <path d="M58.6663 62.8333L58.6664 33.6667H50.333V62.8333H58.6663Z" fill="#008F5E"/>
                  <path d="M71.1663 33.6667V54.5H83.6664V62.8333H67.833C65.0716 62.8333 62.833 60.5948 62.833 57.8333V33.6667H71.1663Z" fill="#008F5E"/>
                </svg>
              </div>
              <span className="font-bold text-md text-[#008F5E]">DUIL</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              {isLoggedIn ? (
                <button className="p-2 text-gray-600">
                    <User className="h-6 w-6" />
                </button>
              ) : (
                <button className="p-2 text-gray-600">
                    <LogIn className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
          
          <div className="w-full relative mt-2">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search books by name, authors, genre..."
              className="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

    </div>
)}

export default Navbar;