import React from 'react';

const LoadingSpinner = ({ message = 'Processing...' }) => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    {message && <p className="ml-3 text-gray-600">{message}</p>}
  </div>
);

export default LoadingSpinner;
