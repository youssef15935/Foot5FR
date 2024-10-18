import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import LogOutButton from "./logout";
import Navbar from "./navbar"; // Import the Navbar component
import Font from "react-font";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Add 1 because months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoFile, setPhotoFile] = useState(null); // State to store uploaded photo
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

  const handlePhotoUpload = async () => {
    const userId = localStorage.getItem("userId");
    const formData = new FormData();
    formData.append("photo", photoFile);

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/upload-photo`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser((prevUser) => ({ ...prevUser, photo: data.photo })); // Update user's photo in state
      } else {
        throw new Error("Failed to upload photo");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Placeholder image URL
  const placeholderImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLMI5YxZE03Vnj-s-sth2_JxlPd30Zy7yEGg&s";

  return (
    <div className="min-h-screen bg-cover bg-center bg-gray-300">
      <Navbar /> {/* Add the Navbar component here */}
      <Font family="Poppins">
        <div className="flex items-center justify-center py-12">
          <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-md z-10">
            <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
              My Profile
            </h2>

            {/* Display User Photo or Placeholder */}
            <div
              className="text-center mb-6 cursor-pointer" // Make it clickable
              onClick={() => navigate("/modify-profile")} // Redirect to Modify Profile
            >
              <img
                src={
                  user.photo
                    ? `http://localhost:5000/uploads/${user.photo}` // Display uploaded photo if available
                    : placeholderImage // Display placeholder if no photo
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
                <p className="text-lg text-gray-900">{user.birthdate}</p>{" "}
                {/* Display formatted birthdate */}
              </div>
              <div>
                <p className="font-semibold text-gray-700">Level:</p>
                <p className="text-lg text-gray-900">{user.level}</p>{" "}
                {/* Display formatted birthdate */}
              </div>
            </div>

            {/* Modify Profile Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate("/modify-profile")}
                className="bg-blue-900 text-white  p-3 rounded-lg hover:bg-blue-600 focus:outline-none w-full"
              >
                Modify Profile
              </button>
            </div>

            {/* Add Log Out Button */}
            <div className="mt-2 text-center">
              <LogOutButton />
              {/* Log out button should be styled in the LogOutButton component */}
            </div>
          </div>
        </div>
      </Font>
    </div>
  );
};

export default Profile;
