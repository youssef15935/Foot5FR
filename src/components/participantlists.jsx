import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";  // To get the match ID from URL
import Navbar from "./navbar";  // Import Navbar if needed
import Font from "react-font";

// Helper function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// Function to distribute participants into two balanced teams
const createFairTeams = (participants) => {
  const teamA = [];
  const teamB = [];
  
  // Shuffle participants to ensure randomness
  shuffleArray(participants);

  // Distribute players alternately between teamA and teamB
  participants.forEach((participant, index) => {
    if (index % 2 === 0) {
      teamA.push(participant);
    } else {
      teamB.push(participant);
    }
  });

  return { teamA, teamB };
};

const ParticipantsList = () => {
  const { matchId } = useParams();  // Get the matchId from the URL parameters
  const [participants, setParticipants] = useState([]);
  const [teamA, setTeamA] = useState([]);  // State for Team A
  const [teamB, setTeamB] = useState([]);  // State for Team B
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/matches/${matchId}/participants`);
        if (response.ok) {
          const data = await response.json();
          setParticipants(data);
          const { teamA, teamB } = createFairTeams(data);  // Generate initial fair teams
          setTeamA(teamA);
          setTeamB(teamB);
        } else {
          throw new Error("Failed to fetch participants");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [matchId]);

  const formatBirthdate = (birthdate) => {
    if (!birthdate) return 'Unknown';
    const date = new Date(birthdate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShuffleTeams = () => {
    const { teamA, teamB } = createFairTeams(participants);
    setTeamA(teamA);
    setTeamB(teamB);
  };

  if (loading) {
    return <p>Loading participants...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />  {/* Optional: Include the Navbar */}
      <div className="container mx-auto py-8">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">Participants</h2>

        {/* Shuffle Teams Button */}
        <div className="flex justify-center mb-6">
          <button 
            className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            onClick={handleShuffleTeams}
          >
            Shuffle Teams
          </button>
        </div>

        <div className="flex justify-center items-center space-x-8">
          {/* Team A */}
          <div className="w-1/3 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-center text-blue-900 mb-4">Team A</h3>
            {teamA.length > 0 ? (
              <ul className="space-y-4">
                {teamA.map((participant) => (
                  <li key={participant._id} className="bg-gray-100 p-3 rounded-lg shadow-sm">
                    <p className="text-lg font-semibold">{participant.fullname}</p>
                    <p className="text-sm text-gray-600">{participant.email}</p>
                    <p className="text-sm text-gray-600">Birthdate: {formatBirthdate(participant.birthdate)}</p>
                    <p className="text-sm text-gray-600">Level: {participant.level}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No players in Team A</p>
            )}
          </div>

          {/* VS Section */}
          <div className="text-center flex items-center justify-center">
            <Font family="Metal Mania">
              <div className="text-3xl font-bold text-blue-900">VS</div>
            </Font>
          </div>

          {/* Team B */}
          <div className="w-1/3 bg-white p-4 rounded-lg shadow-md ">
            <h3 className="text-2xl font-bold text-center text-red-600 mb-4">Team B</h3>
            {teamB.length > 0 ? (
              <ul className="space-y-4">
                {teamB.map((participant) => (
                  <li key={participant._id} className="bg-gray-100 p-3 rounded-lg shadow-sm">
                    <p className="text-lg font-semibold">{participant.fullname}</p>
                    <p className="text-sm text-gray-600">{participant.email}</p>
                    <p className="text-sm text-gray-600">Birthdate: {formatBirthdate(participant.birthdate)}</p>
                    <p className="text-sm text-gray-600">Level: {participant.level}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No players in Team B</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsList;
