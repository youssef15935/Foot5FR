import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import StadiumLocator from "./stadiumlocator";
import Font from "react-font";
import ConfirmationModal from "./confirmation";
import { FaMapMarkerAlt } from "react-icons/fa";

const AvailableMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quitSuccess, setQuitSuccess] = useState(""); // State for success message
  const [showSuccess, setShowSuccess] = useState(false); // State for showing success message
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [selectedMatch, setSelectedMatch] = useState(null); // State to track the selected match
  const navigate = useNavigate();

  // Retrieve the userId from localStorage
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/matches/available"
        );
        if (response.ok) {
          const data = await response.json();
          setMatches(data);
        } else {
          throw new Error("Failed to fetch matches");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleJoin = (matchId) => {
    navigate(`/join-match/${matchId}`);
  };

  const handleQuitClick = (matchId) => {
    setSelectedMatch(matchId); // Store the selected match ID
    setShowModal(true); // Show the confirmation modal
  };

  const handleQuit = async () => {
    const userId = localStorage.getItem("userId"); // Get the userId from localStorage

    try {
      const response = await fetch(
        `http://localhost:5000/api/quit/${selectedMatch}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }), // Send the userId to the server
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Successfully quit the match:", data);

        // Show success message for quitting
        setQuitSuccess("You have successfully quit the match.");
        setShowSuccess(true);

        // Update UI after quitting
        setMatches((prevMatches) =>
          prevMatches.map((match) =>
            match._id === selectedMatch
              ? {
                  ...match,
                  participants: match.participants.filter(
                    (id) => id !== userId
                  ),
                  playersNeeded: match.playersNeeded + 1,
                }
              : match
          )
        );

        // Hide success message after a few seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000); // Smooth hide after 2 seconds

        setShowModal(false); // Hide the confirmation modal
      } else {
        const errorData = await response.json();
        console.error("Error quitting match:", errorData.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Invalid time";
    const timeParts = timeString.split(":");
    if (timeParts.length >= 2) {
      const hours = timeParts[0];
      const minutes = timeParts[1];
      return `${hours}:${minutes}`;
    }
    return timeString;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Generate a Google Maps link for the match location
  const getGoogleMapsLink = (location) => {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  };

  if (loading) {
    return <p>Loading matches...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <Font family="Poppins">
      <div className="min-h-screen bg-gray-300">
        <Navbar />

        {/* Display success message with smooth transition */}
        <div
          className={`fixed top-0 left-0 w-full bg-green-500 text-white text-center py-2 z-50 transition-opacity duration-500 ease-in-out ${
            showSuccess ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          {quitSuccess}
        </div>

        {/* Page Layout */}
        <div className="flex flex-col md:flex-row justify-center space-y-8 md:space-y-0 md:space-x-8 py-12 px-8">
          {/* Map Section */}
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
              Localisation
            </h2>
            <div className="px-10 mb-10 rounded-lg">
              <StadiumLocator />
            </div>
          </div>

          {/* Available Matches Section */}
          <div className="w-full md:w-1/2 p-10 mt-1">
            <div className="space-y-6 ">
              {matches.length > 0 ? (
                matches.map((match, index) => (
                  <div
                    key={match._id}
                    className="relative bg-cover bg-center text-white rounded-lg shadow-md overflow-hidden min-h-80 sm:min-h-64 flex items-center justify-between p-4"
                    style={{
                      backgroundImage: `url('https://www.sallertaine.fr/wp-content/uploads/2024/02/Le-Five.jpg')`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black opacity-65"></div>
                    <div className="relative z-10 flex-grow text-lg">
                      <h3 className="text-3xl text-white font-bold">
                        Match {index + 1}
                      </h3>
                      <p>
                        <strong className="text-xl">Location:</strong> {match.location}
                      </p>
                      <p>
                        <strong className="text-xl">Time:</strong> {formatTime(match.time)}
                      </p>
                      <p>
                        <strong className="text-xl">Date:</strong> {formatDate(match.date)}
                      </p>
                      <p>
                        <strong className="text-xl">Creator:</strong> {match.creatorId.fullname}
                      </p>
                      <p>
                        <strong className="text-xl">Players Needed:</strong> {match.playersNeeded}
                      </p>
                      <p>
                        <strong className="text-xl">Players Joined:</strong>{" "}
                        {10 - match.playersNeeded} / 10
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-col items-center space-y-2">
                      {match.participants.includes(userId) && (
                        <>
                          <button className="w-full ml-auto px-4 py-2 text-white bg-gray-400 rounded-lg cursor-not-allowed text-lg">
                            Already Joined
                          </button>
                          <button
                            className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-500 rounded-lg"
                            onClick={() => handleQuitClick(match._id)}
                          >
                            Quit
                          </button>
                        </>
                      )}

                      {!match.participants.includes(userId) &&
                        match.creatorId !== userId && (
                          <button
                            className={`ml-auto px-4 py-2 text-white rounded-lg text-lg ${
                              match.playersNeeded === 0
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-900 hover:bg-blue-700"
                            }`}
                            onClick={() => handleJoin(match._id)}
                            disabled={match.playersNeeded === 0}
                          >
                            {match.playersNeeded > 0
                              ? "Join the match"
                              : "Match Complet"}
                          </button>
                        )}

                      <a
                        href={getGoogleMapsLink(match.location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-center items-center"
                      >
                        <FaMapMarkerAlt
                          size={35}
                          color="red"
                          title="Locate My Match"
                        />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-3xl text-blue-900 font-bold">
                  No matches available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)} // Close the modal
        onConfirm={handleQuit} // Confirm and quit match
        message="Are you sure you want to quit this match?"
      />
    </Font>
  );
};

export default AvailableMatches;
