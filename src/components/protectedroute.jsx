import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Check for auth token in localStorage

  // If the token does not exist, redirect to the login page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If the token exists, render the protected page
  return children;
};

export default ProtectedRoute;
