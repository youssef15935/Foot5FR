import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import Navbar from "./navbar";  // Import the Navbar component
import Font from "react-font";

const CreateMatch = () => {
  const [form, setForm] = useState({
    date: "",
    location: "",
    time: "",
    playersNeeded: "",
  });

  const [stadiums, setStadiums] = useState([]); // State to store stadiums
  const [filteredStadiums, setFilteredStadiums] = useState([]); // State to store filtered stadiums
  const [userLocation, setUserLocation] = useState([46.603354, 1.888334]); // Default center for France
  const [message, setMessage] = useState(""); // State to store the message
  const [messageType, setMessageType] = useState(""); // State to store message type (success or error)
  const [loading, setLoading] = useState(false); // State for showing loading screen
  const [showSuggestions, setShowSuggestions] = useState(true); // State to control suggestion visibility
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  // Disable times between 00:00 and 06:00 AM
  const handleTimeChange = (e) => {
    const timeValue = e.target.value;
    const [hours, minutes] = timeValue.split(":").map(Number);
    if (hours >= 0 && hours < 6) {
      setMessage("Please select a time between 6 AM and midnight.");
      setMessageType("error");
      setForm({ ...form, time: "" });
    } else {
      setMessage("");
      setForm({ ...form, time: timeValue });
    }
  };

  // Get today's date in YYYY-MM-DD format
  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Use Geolocation to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  // Fetch nearby stadiums based on the user's location
  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        const response = await fetch(
          "https://equipements.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/records?limit=20&refine=equip_aps_nom%3A%22Football%20%2F%20Football%20en%20salle%20(Futsal)%22&refine=dep_code_filled%3A%2256%22"
        );
        const data = await response.json();
        const stadiumData = data.results
          .map((item) => {
            const { equip_nom, coordonnees, inst_adresse, inst_cp, arr_name } = item || {};
            return {
              name: equip_nom,
              latitude: coordonnees?.lat,
              longitude: coordonnees?.lon,
              address: inst_adresse || "Address not available",
              postalCode: inst_cp || "Postal code not available",
              area: arr_name || "Area not available", // Adding arr_name
            };
          })
          .filter(
            (stadium) =>
              stadium.latitude &&
              stadium.longitude &&
              stadium.latitude >= 41 &&
              stadium.latitude <= 51 &&
              stadium.longitude >= -5.5 &&
              stadium.longitude <= 10
          );

        setStadiums(stadiumData);
        setFilteredStadiums(stadiumData); // Initialize filteredStadiums with all stadiums
      } catch (error) {
        console.error("Error fetching stadium data:", error);
      }
    };

    fetchStadiums();
  }, [userLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "location") {
      setShowSuggestions(true); // Show suggestions when typing in the location field
      // Filter stadiums based on user input (matches name, address, or postal code)
      const searchTerm = value.toLowerCase();
      const filtered = stadiums.filter(
        (stadium) =>
          stadium.name.toLowerCase().includes(searchTerm) ||
          stadium.address.toLowerCase().includes(searchTerm) ||
          stadium.postalCode.toLowerCase().includes(searchTerm)
      );
      setFilteredStadiums(filtered); // Update the filtered stadium list
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const creatorId = localStorage.getItem("userId");
    const creatorName = localStorage.getItem("userFullName");
  
    const newMatch = {
      date: form.date,
      location: form.location,
      time: form.time,
      playersNeeded: form.playersNeeded,
      creatorId: creatorId,
      creatorName: creatorName,
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/matches/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMatch),
      });
  
      if (response.ok) {
        setForm({ date: "", location: "", time: "", playersNeeded: "" });
        setMessage("Match created successfully!");
        setMessageType("success");
        setLoading(true);
        setTimeout(() => {
          navigate("/available-matches");
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Error creating match. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.");
      setMessageType("error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-blue-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-gray-300">
      <Navbar /> 
      <Font family="Poppins">
        <div className="flex justify-center py-12 px-8">
          <div className="relative w-full max-w-lg bg-white p-8 rounded-lg shadow-lg z-10">
            <p className="text-red-500 flex text-center">Please count yourself in the needs , always players needed - 1 </p>
            <br />
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">
              Create a Match
            </h2>

            {message && (
              <p
                className={`text-center mb-4 ${
                  messageType === "success" ? "text-green-500" : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="date"
                type="date"
                min={todayDate} // Disable past dates
                placeholder="Date"
                onChange={handleChange}
                value={form.date}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />

              <div className="relative">
                <input
                  name="location"
                  type="text"
                  placeholder="Location"
                  onChange={handleChange}
                  value={form.location}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />

                {showSuggestions && filteredStadiums.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {filteredStadiums.map((stadium, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          setForm({
                            ...form,
                            location: `${stadium.name}, ${stadium.address}, ${stadium.postalCode}, ${stadium.area}`,
                          });
                          setShowSuggestions(false);
                        }}
                      >
                        <span className="font-semibold">{stadium.name}</span><br />
                        <span className="text-sm text-gray-600">{stadium.address}</span><br />
                        <span className="text-sm text-gray-600">{stadium.postalCode}</span><br />
                        <span className="text-sm text-gray-600">{stadium.area}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                name="time"
                type="time"
                placeholder="Time"
                onChange={handleTimeChange} // Use custom time validation handler
                value={form.time}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />

              <input
                name="playersNeeded"
                type="number"
                placeholder="Players Needed"
                onChange={handleChange}
                value={form.playersNeeded}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />

              <button
                type="submit"
                className="w-full bg-blue-900 text-white p-3 rounded-lg hover:bg-blue-800"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      </Font>
    </div>
  );
};

export default CreateMatch;
