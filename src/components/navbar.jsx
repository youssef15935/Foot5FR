import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoFootballOutline, IoHomeOutline } from "react-icons/io5";
import { TbSoccerField } from "react-icons/tb";
import Font from "react-font";

const Navbar = () => {
  const [user, setUser] = useState(null);
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
          setUser(data); // Set user data including profile photo
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchProfile();
  }, []);

  const placeholderImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLMI5YxZE03Vnj-s-sth2_JxlPd30Zy7yEGg&s";

  return (
    <nav className="bg-blue-900 p-3 w-full overflow-hidden ">
      <Font family="Poppins">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center text-white text-lg font-bold ml-10">
            <IoFootballOutline className="text-4xl mr-2" />
            <a href="/available-matches"><h3>FOOT5FR</h3></a>
          </div>

          {/* Navigation Links with Icons */}
          <div className="space-x-6 flex mr-10">
            {/* Home Icon */}
            <div className="relative group flex items-center cursor-pointer">
              <Link to="/available-matches" className="text-white hover:text-gray-400">
                <IoHomeOutline className="text-3xl" title="Home"/>
              </Link>
              
            </div>

            {/* My Matches Icon */}
            <div className="relative group flex items-center cursor-pointer">
              <Link to="/my-matches" className="text-white hover:text-gray-400">
                <IoFootballOutline className="text-3xl" title="My matches"/>
              </Link>
              
            </div>

            {/* Create Match Icon */}
            <div className="relative group flex items-center cursor-pointer">
              <Link to="/create-match" className="text-white hover:text-gray-400">
                <TbSoccerField className="text-3xl" title="Create match" />
              </Link>
              
            </div>

            {/* Profile Icon or Profile Photo */}
            <div
              className="relative group flex items-center cursor-pointer"
              onClick={() => navigate("/profile")} // Navigate to profile on click
            >
              <img
                src={
                  user && user.photo
                    ? `http://localhost:5000/uploads/${user.photo}`
                    : placeholderImage
                } // Display user's profile picture or placeholder
                alt="Profile"
                className="rounded-full w-8 h-8 object-cover border-2 border-white"
                title="Profil"
              />
              <div className="absolute opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity duration-300 top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Profile
              </div>
            </div>
          </div>
        </div>
      </Font>
    </nav>
  );
};

export default Navbar;
