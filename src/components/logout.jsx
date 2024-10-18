import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LogOutButton = () => {
  const [loading, setLoading] = useState(false); // To show the loading screen
  const [loggedOut, setLoggedOut] = useState(false); // To show the message after logout
  const navigate = useNavigate(); // For navigation

  const handleLogout = () => {
    // Simulate loading
    setLoading(true);

    setTimeout(() => {
      // Clear localStorage (remove tokens and user information)
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("fullname");
      localStorage.removeItem("email");
      localStorage.removeItem("birthdate");

      // Stop the loading and show the logged-out message
      setLoading(false);
      setLoggedOut(true);

      // Redirect to login page after 1 second
      setTimeout(() => {
        navigate("/"); // Redirect to login page
      }, 1000); // Show the logged-out message for 2 seconds
    }, 1000); // Simulate 1-second loading
  };

  return (
    <div className="flex items-center justify-center">
      {loading ? (
        <div className="text-blue-500 text-lg">Logging out...</div>
      ) : loggedOut ? (
        <div className="text-green-500 text-lg">You have logged out successfully!</div>
      ) : (
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600"
        >
          Log Out
        </button>
      )}
    </div>
  );
};

export default LogOutButton;
