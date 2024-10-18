import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './navbar';  // Assuming you want to keep the navbar consistent across pages

const JoinMatch = () => {
  const { matchId } = useParams(); // Get matchId from the URL
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(''); // State to show success message
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/matches/${matchId}`);
        if (response.ok) {
          const data = await response.json();
          setMatch(data);
        } 
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  const handleConfirm = async () => {
    try {
      const userId = localStorage.getItem('userId'); // Get userId from localStorage
      const response = await fetch(`http://localhost:5000/api/matches/join/${matchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }) // Pass userId in the request body
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage('You have successfully joined the match! Redirecting...');
        setTimeout(() => {
          navigate('/my-matches'); // Redirect to the user's joined matches after 2 seconds
        }, 2000);
      } else {
        const errorData = await response.json();
        if (errorData.error === 'You have already joined this match') {
          setError('You have already joined this match!');
        } else if (errorData.error === 'Match is full, no more players can join') {
          setError('This match is full!');
        } else {
          setError(errorData.error || 'Failed to join match'); // Show the backend error message
        }
      }
    } catch (error) {
      console.error('Error joining match:', error);
      setError('Error joining match');
    }
  };

  if (loading) {
    return <p className="text-center text-xl mt-6">Loading match details...</p>;
  }

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col bg-gray-300">
      <Navbar /> {/* Navbar component to keep it consistent */}
      <div className="flex items-center justify-center flex-1 p-8">
        <div className="relative w-full max-w-lg bg-white p-8 rounded-lg shadow-lg z-10">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">Join Match</h2>
          
          {/* Match Details */}
          <div className="text-center mb-6 space-y-4">
            <p className="text-lg"><strong>Location:</strong> {match.location}</p>
            <p className="text-lg"><strong>Time:</strong> {match.time}</p>
            <p className="text-lg"><strong>Players Needed:</strong> {match.playersNeeded} / 10</p>
            <p className="text-lg"><strong>Created by:</strong> {match.creatorId.fullname}</p> {/* Show creator's name */}
          </div>

          {/* Success message */}
          {successMessage && (
            <p className="text-green-500 text-center mb-4">{successMessage}</p>
          )}

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-center mb-4 font-semibold bg-red-100 p-3 rounded-lg">
              {error}
            </p>
          )}

          {/* Confirm Button */}
          <button 
            className={`w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300 ${successMessage ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={handleConfirm}
            disabled={successMessage} // Disable button after success
          >
            Confirm Joining
          </button>

          {/* Back to Available Matches Button */}
          <button 
            className="mt-4 w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition duration-300"
            onClick={() => navigate('/available-matches')}
          >
            Back to Available Matches
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinMatch;
