import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './navbar';
import Font from 'react-font';
import io from 'socket.io-client'; // Import Socket.io client

const socket = io('http://localhost:5000'); // Connect to the server

const MyMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [chatOpen, setChatOpen] = useState(false); // State to toggle chat visibility
  const [newMessageNotification, setNewMessageNotification] = useState(''); // Notification state

  // Fetch joined matches
  useEffect(() => {
    const fetchJoinedMatches = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}/joined-matches`);
        if (response.ok) {
          const data = await response.json();
          setMatches(data);
        } else {
          throw new Error("Failed to fetch your matches");
        }
      } catch (error) {
        console.error("No matches found");
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedMatches();
  }, [userId]);

  // Handle joining a match chat room
  const handleJoinChat = async (matchId) => {
    setSelectedMatch(matchId);
    setChatOpen(true); // Open chat when a match is selected

    // Fetch previous messages for the selected match
    try {
      const response = await fetch(`http://localhost:5000/api/matches/${matchId}/messages`);
      const data = await response.json();
      setMessages(data.map(msg => ({
        username: msg.userId.fullname,
        message: msg.message,
        timestamp: new Date(msg.timestamp).toLocaleString(), // Format the timestamp
      })));
    } catch (error) {
      console.error('Error fetching previous messages:', error);
    }

    socket.emit('joinRoom', matchId); // Join the specific match room
  };

  // Handle receiving chat messages (real-time)
  useEffect(() => {
    socket.on('message', (message) => {
      const formattedMessage = {
        ...message,
        timestamp: new Date(message.timestamp).toLocaleString(), // Format the timestamp for real-time messages
      };
      setMessages((prevMessages) => [...prevMessages, formattedMessage]); // Add new message to chat
      setNewMessageNotification(`${message.username}: ${message.message}`);
      setTimeout(() => setNewMessageNotification(''), 3000); // Hide notification after 3 seconds
    });

    return () => {
      socket.off('message'); // Cleanup on unmount
    };
  }, []);

  // Handle sending a message
  const sendMessage = () => {
    if (currentMessage.trim() !== '') {
      socket.emit('chatMessage', { roomId: selectedMatch, userId, message: currentMessage });
      setCurrentMessage(''); // Clear input after sending
    }
  };

  if (loading) {
    return (
      <p className="text-center text-xl text-blue-500">
        Loading your matches...
      </p>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-300">
      <Navbar />
      <Font family="Poppins">
        <div className="flex justify-center space-x-8 py-12 px-8">
          <div className="w-2/3">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">
              My Matches
            </h2>

            <div className="space-y-6">
              {matches.length > 0 ? (
                matches.map((match, index) => (
                  <div
                    key={match._id}
                    className="relative bg-cover bg-center text-white rounded-lg shadow-md overflow-hidden"
                    style={{
                      backgroundImage: `url('https://www.sallertaine.fr/wp-content/uploads/2024/02/Le-Five.jpg')`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black opacity-55"></div>
                    <div className="relative p-6">
                      <h3 className="text-lg font-bold">Match {index + 1}</h3>
                      <p>
                        <strong>Location:</strong> {match.location}
                      </p>
                      <p>
                        <strong>Time:</strong> {match.time}
                      </p>
                      <p>
                        <strong>Players Joined:</strong>{" "}
                        {10 - match.playersNeeded} / 10
                      </p>
                      <p>
                        <strong>Players Needed:</strong> {match.playersNeeded}
                      </p>
                    </div>
                    <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-2">
                      <button
                        className="px-4 py-2 w-full text-white bg-blue-900 hover:bg-blue-700 rounded-lg"
                        onClick={() => handleJoinChat(match._id)} // Join the chat room
                      >
                        Join Chat
                      </button>
                      <Link
                        to={`/match/${match._id}/participants`}
                        className="px-4 py-2 w-full text-white bg-gray-600 hover:bg-gray-500 rounded-lg"
                      >
                        Who's playing?
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center mt-6">
                  <p className="text-2xl font-semibold text-gray-700">
                    You haven't joined any matches yet.
                  </p>
                  <p className="text-lg text-gray-500 mt-2">
                    Start by exploring and joining{" "}
                    <a href="/available-matches" className="text-blue-900">
                      available matches
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Chat Section (Toggled) */}
            {chatOpen && (
              <div className="fixed bottom-4 right-4 bg-gray-100 p-6 rounded-lg shadow-md w-80 max-h-96 flex flex-col justify-between">
                <h3 className="text-xl ml-10 mb-4 ">Chat for the Match</h3>
                <div className="chat-box overflow-y-scroll p-2 rounded-lg flex-grow ">
                  {messages.map((msg, index) => (
                    <div key={index} className="bg-gray-200 rounded-md p-2 mb-1">
                      <strong className='text-blue-500 text-xl font-thin'>{msg.username}</strong>
                      <p className="text-sm text-gray-700">{msg.message}</p>
                      <span className="text-xs text-gray-400">{msg.timestamp}</span>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  placeholder="Type a message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                />
                <div className="flex justify-between mt-2">
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => setChatOpen(false)} // Close chat
                    className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification Popup */}
        {newMessageNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-md">
            <strong>New Message:</strong> {newMessageNotification}
          </div>
        )}
      </Font>
    </div>
  );
};

export default MyMatches;
