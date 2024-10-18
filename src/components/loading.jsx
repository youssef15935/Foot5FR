import React from 'react';
import '../index.css'; // Custom CSS for the spinner
import { IoFootballOutline } from "react-icons/io5";

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <IoFootballOutline className="football-icon" />
    </div>
  );
};

export default LoadingSpinner;
