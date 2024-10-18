import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from './loading'; // Import the loading spinner

const TransitionWrapper = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    // Show loader on route change start
    handleStart();

    // Hide loader after a delay (simulate load time)
    const timeout = setTimeout(handleComplete, 400);

    return () => clearTimeout(timeout);
  }, [location]);

  return (
    <>
      {loading && <LoadingSpinner />} {/* Show loading spinner if loading is true */}
      <div className={`transition-wrapper ${loading ? 'hidden' : 'visible'}`}>
        {children}
      </div>
    </>
  );
};

export default TransitionWrapper;
