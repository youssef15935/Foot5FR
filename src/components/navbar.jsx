import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoFootballOutline, IoHomeOutline } from "react-icons/io5";
import { TbSoccerField } from "react-icons/tb";
import Font from "react-font";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai"; // Importing hamburger icons

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // State for toggling menu
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

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen); // Toggle menu state
  };

  const handleNavigate = (path) => {
    setMenuOpen(false); // Close the menu when a link is clicked
    navigate(path);
  };

  return (
    <nav className="bg-blue-900 p-3 w-full shadow-md">
      <Font family="Poppins">
        <div className="container mx-auto flex justify-between items-center px-4 lg:px-10">
          {/* Logo */}
          <div className="flex items-center text-white text-xl font-bold">
            <IoFootballOutline className="text-4xl mr-2" />
            <Link to="/available-matches" onClick={() => handleNavigate("/available-matches")}>
              FOOT5FR
            </Link>
          </div>

          {/* Hamburger Menu Button for Small Screens */}
          <div className="lg:hidden ml-10 pl-10">
            <button
              onClick={handleMenuToggle}
              className="text-white focus:outline-none"
            >
              {menuOpen ? (
                <AiOutlineClose className="text-lg ml-10 " />
              ) : (
                <AiOutlineMenu className="text-2xl" />
              )}
            </button>
          </div>

          {/* Navigation Links with Icons (Moved to the right) */}
          <div
            className={`${
              menuOpen ? "block" : "hidden"
            } lg:flex space-x-6 items-center lg:justify-end flex-col lg:flex-row lg:mr-10 mt-4 lg:mt-0`}
          >
            {/* Home Icon */}
            <Link
              to="/available-matches"
              className="text-white hover:text-gray-400 flex items-center space-x-1 lg:space-x-3"
              onClick={() => handleNavigate("/available-matches")}
            >
              <IoHomeOutline className="text-3xl ml-6" title="Home" />
              
            </Link>

            {/* My Matches Icon */}
            <Link
              to="/my-matches"
              className="text-white hover:text-gray-400 flex items-center space-x-1 lg:space-x-2"
              onClick={() => handleNavigate("/my-matches")}
            >
              <IoFootballOutline className="text-3xl" title="My Matches" />
             
            </Link>

            {/* Create Match Icon */}
            <Link
              to="/create-match"
              className="text-white hover:text-gray-400 flex items-center space-x-1 lg:space-x-2"
              onClick={() => handleNavigate("/create-match")}
            >
              <TbSoccerField className="text-3xl" title="Create Match" />
              
            </Link>

            {/* Profile Icon or Profile Photo */}
            <div
              className="flex items-center cursor-pointer "
              onClick={() => handleNavigate("/profile")}
            >
              <img
                src={
                  user && user.photo
                    ? `http://localhost:5000/uploads/${user.photo}`
                    : placeholderImage
                }
                alt="Profile"
                className="rounded-full w-8 h-8 object-cover border-2 border-white"
                title="Profile"
              />
             
            </div>
          </div>
        </div>
      </Font>
    </nav>
  );
};

export default Navbar;
