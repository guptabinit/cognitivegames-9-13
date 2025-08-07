import React from 'react';

const Arrow = ({ direction, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8 md:w-12 md:h-12',
    lg: 'w-16 h-16 md:w-20 md:h-20'
  };

  const rotations = {
    up: 'rotate(0deg)',
    down: 'rotate(180deg)',
    left: 'rotate(-90deg)',
    right: 'rotate(90deg)'
  };

  return (
    <svg 
      className={`${sizeClasses[size]} text-blue-600 inline-block`} 
      style={{ transform: rotations[direction] || '' }} 
      fill="currentColor" 
      viewBox="0 0 20 20"
    >
      <path 
        fillRule="evenodd" 
        d="M10 18a.75.75 0 01-.75-.75V4.66L5.28 8.47a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l5.25 5.25a.75.75 0 11-1.06 1.06L10.75 4.66v12.59a.75.75 0 01-.75.75z" 
        clipRule="evenodd" 
      />
    </svg>
  );
};

export default Arrow;
