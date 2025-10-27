import React from 'react';
import BookDetails from '@/pages/BookDetails.jsx'
import { useNavigate } from "react-router-dom";

const LibraryBookCard = ({
  id,
  imageUrl,
  title,
  author,
  isLoved = false,
  availableStatus = true,
  rating = 0,
  ratingCount = 0,
  tags = [],
}) => {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_API_URL ;
  const handleClick = () => {
    navigate(`/book-details?id=${id}`);
  };
  return (
    <div onClick={handleClick} className="max-w-sm rounded-xl bg-white p-4 shadow-lg  cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        {tags.length > 0 && (
          <div className={`bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium`}>
            {tags[0]}
          </div>
        )}
        <button className="text-2xl">
          {isLoved ? (
            <span className="text-green-400">♥</span>
          ) : (
            <span className="text-green-400">♡</span>
          )}
        </button>
      </div>

      <div className="flex justify-center mb-4">
        <img 
          src={baseURL + imageUrl || "/api/placeholder/220/300"} 
          alt={title}
          className="h-64 object-contain rounded-lg"
        />
      </div>

      <div className="flex items-center mb-2">
        <span className="text-green-500 mr-2">★</span>
        <span className="text-gray-700 font-medium">{rating.toFixed(1)}</span>
        {ratingCount > 0 && (
          <span className="text-gray-500 text-sm ml-1">({ratingCount})</span>
        )}
        
        {availableStatus && (
          <div className="ml-auto flex items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Available now</span>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-1">{title}</h2>
      <p className="text-gray-600">{author}</p>
    </div>
  );
};

export default LibraryBookCard;