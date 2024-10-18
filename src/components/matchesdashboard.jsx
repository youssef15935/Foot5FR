import React, { useState, useEffect } from 'react';
import AvailableMatches from './AvailableMatches';
import CreateMatch from './creatematch';

const MatchesDashboard = () => {
  const [matches, setMatches] = useState([]);

  // Fetch matches from the backend
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/matches/available', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          setMatches(data);
        } else {
          console.error('Failed to fetch matches');
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchMatches();
  }, []);

  // Function to add a new match to the existing matches
  const addMatch = (newMatch) => {
    setMatches((prevMatches) => [...prevMatches, newMatch]);
  };

  return (
    <div>
      <CreateMatch addMatch={addMatch} />
      <AvailableMatches matches={matches} />
    </div>
  );
};

export default MatchesDashboard;
