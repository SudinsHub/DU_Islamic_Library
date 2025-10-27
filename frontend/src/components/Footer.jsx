"use client"
import { ArrowUp, ArrowUpRight } from "lucide-react"
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Use react-router-dom for navigate
export default function Footer() {
  const navigate = useNavigate(); // Initialize the navigate function
  return (
    <footer className="bg-[#e8f7f1] py-12 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Library Name */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 84 84" fill="none">
              <path d="M37.833 0.333328C37.833 4.9357 34.1021 8.66666 29.4997 8.66666C21.7337 8.66666 15.2083 13.9782 13.3581 21.1667H0.333008V29.5H21.1663V25.3333C21.1663 20.731 24.8973 17 29.4997 17C34.4776 17 38.9457 14.8177 41.9997 11.3576C45.0536 14.8177 49.5218 17 54.4997 17C59.1021 17 62.833 20.731 62.833 25.3333V29.5H75.333V50.3333H83.6664V21.1667H70.6413C68.7911 13.9782 62.2657 8.66666 54.4997 8.66666C49.8973 8.66666 46.1663 4.9357 46.1663 0.333328H37.833Z" fill="#008F5E"/>
              <path d="M29.4997 75.3333C34.1021 75.3333 37.833 79.0643 37.833 83.6667H46.1663C46.1663 79.0643 49.8973 75.3333 54.4997 75.3333H83.6664V67H54.4997C49.5218 67 45.0536 69.1823 41.9997 72.6424C38.9457 69.1823 34.4776 67 29.4997 67L0.333008 67V75.3333H29.4997Z" fill="#008F5E"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M16.1663 33.6667H0.333008V62.8333H16.1663C18.9278 62.8333 21.1663 60.5948 21.1663 57.8333V38.6667C21.1663 35.9052 18.9278 33.6667 16.1663 33.6667ZM8.66634 54.5V42H12.833V54.5H8.66634Z" fill="#008F5E"/>
              <path d="M33.6663 33.6667V54.5H37.833V33.6667H46.1663V57.8333C46.1663 60.5948 43.9278 62.8333 41.1663 62.8333H30.333C27.5716 62.8333 25.333 60.5948 25.333 57.8333V33.6667H33.6663Z" fill="#008F5E"/>
              <path d="M58.6663 62.8333L58.6664 33.6667H50.333V62.8333H58.6663Z" fill="#008F5E"/>
              <path d="M71.1663 33.6667V54.5H83.6664V62.8333H67.833C65.0716 62.8333 62.833 60.5948 62.833 57.8333V33.6667H71.1663Z" fill="#008F5E"/>
            </svg>
              <div>
                <div className="text-green-600 text-xl font-medium font-onest">
                  <p>Dhaka University</p>
                  <p>Islamic Library</p>
                </div>
              </div>
            </div>
          </div>

          {/* Get In Touch */}
          <div className="flex flex-col gap-4">
            <h3 className="text-green-500 font-medium font-onest">Get In Touch</h3>
            <p className="text-xl text-gray-700 font-bangla">ঢাকা বিশ্ববিদ্যালয় ইসলামিক লাইব্রেরি</p>

            <div className="flex items-center gap-3 mt-2">

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="10" r="3" />
                    <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z" />
                  </svg>
                </div>
                <span className="text-sm font-onest">University of Dhaka</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <span className="text-sm font-onest">duislamiclibrary@gmail.com</span>
            </div>
          </div>

          {/* Our Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-green-500 font-medium font-onest">Our Links</h3>
            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="flex items-center justify-between text-sm hover:text-green-600 transition-colors font-onest"
              >
                <span>Qazre Hasana</span>
                <ArrowUpRight size={16} />
              </a>
              <a
                href="#"
                className="flex items-center justify-between text-sm hover:text-green-600 transition-colors font-onest"
              >
                <span>DU Islamic Library</span>
                <ArrowUpRight size={16} />
              </a>
              <a
                href="#"
                className="flex items-center justify-between text-sm hover:text-green-600 transition-colors font-onest"
              >
                <span>Practicing Bibaho</span>
                <ArrowUpRight size={16} />
              </a>
              <a
                onClick={() => navigate("/user/volunteer")}
                className="flex items-center justify-between text-sm hover:text-green-600 transition-colors font-onest"
              >
                <span>Volunteer Login</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright and Credits */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>©</span>
            <span className="font-bangla">ঢাকা বিশ্ববিদ্যালয় ইসলামিক লাইব্রেরি</span>
            <span className="font-onest">All Right Reserved</span>
          </div>
          {/* <div className="flex items-center gap-2 mt-4 md:mt-0 font-onest">
            <span>Designed with care by</span>
            <span className="font-bold">Arkbase</span>
          </div> */}
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-3 rounded transition-colors"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  )
}
