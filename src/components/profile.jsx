import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogOutButton from "./logout";
import Navbar from "./navbar";
import Font from "react-font";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `http://localhost:5000/api/users/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          data.birthdate = formatDate(data.birthdate);
          setUser(data);
        } else {
          throw new Error("Failed to fetch profile");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleDeleteAccount = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.clear();
        navigate("/");
      } else {
        throw new Error("Failed to delete account.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while trying to delete your account.");
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const placeholderImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLMI5YxZE03Vnj-s-sth2_JxlPd30Zy7yEGg&s";

  return (
    <div className="min-h-screen bg-cover bg-center bg-gray-300">
      <Navbar />
      <Font family="Poppins">
        <div className="flex items-center justify-center py-12">
          <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-md z-10">
            <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
              My Profile
            </h2>
            <div
              className="text-center mb-6 cursor-pointer"
              onClick={() => navigate("/modify-profile")}
            >
              <img
                src={
                  user.photo
                    ? `http://localhost:5000/uploads/${user.photo}`
                    : placeholderImage
                }
                alt="Profile"
                className="rounded-full w-32 h-32 object-cover mx-auto"
              />
            </div>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-700">Full Name:</p>
                <p className="text-lg text-gray-900">{user.fullname}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Email:</p>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Date of Birth:</p>
                <p className="text-lg text-gray-900">{user.birthdate}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Level:</p>
                <p className="text-lg text-gray-900">{user.level}</p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate("/modify-profile")}
                className="bg-blue-900 text-white  p-3 rounded-lg hover:bg-blue-600 focus:outline-none w-full"
              >
                Modify Profile
              </button>
            </div>
            <div className="mt-2 text-center">
              <LogOutButton />
            </div>
            <div className="mt-2 text-center">
              <button
                onClick={() => setShowModal(true)} // Open modal
                className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-500 focus:outline-none w-full"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </Font>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
              Confirm Account Deletion
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)} // Close modal
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount} // Confirm deletion
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
