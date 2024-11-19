import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Font from "react-font";

const CreateMatch = () => {
  const [form, setForm] = useState({
    date: "",
    location: "",
    time: "",
    playersNeeded: "",
  });

  const [stadiums, setStadiums] = useState([]);
  const [filteredStadiums, setFilteredStadiums] = useState([]);
  const [userLocation, setUserLocation] = useState([46.603354, 1.888334]);
  const [validTimes, setValidTimes] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [reserving, setReserving] = useState(false);
  const navigate = useNavigate();

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Generate valid times in 45-minute intervals
  const generateValidTimes = () => {
    const times = [];
    for (let hour = 6; hour < 24; hour++) { // From 6 AM to 11 PM
      times.push(`${hour < 10 ? `0${hour}` : hour}:00`);
    }
    return times;
  };

  useEffect(() => {
    setValidTimes(generateValidTimes());
  }, []);

  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
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

  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        const response = await fetch(
          "https://equipements.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/records?limit=100&refine=dep_code_filled%3A%2256%22"
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
              area: arr_name || "Area not available",
            };
          })
          .filter(
            (stadium) =>
              stadium.latitude &&
              stadium.longitude &&
              calculateDistance(
                userLocation[0],
                userLocation[1],
                stadium.latitude,
                stadium.longitude
              ) <= 50
          );

        setStadiums(stadiumData);
        setFilteredStadiums(stadiumData);
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
      setShowSuggestions(true);
      const searchTerm = value.toLowerCase();
      const filtered = stadiums.filter(
        (stadium) =>
          stadium.name.toLowerCase().includes(searchTerm) ||
          stadium.address.toLowerCase().includes(searchTerm) ||
          stadium.postalCode.toLowerCase().includes(searchTerm)
      );
      setFilteredStadiums(filtered);
    }
  };

  const handleReserve = async () => {
    const creatorId = localStorage.getItem("userId");
    if (!creatorId) {
      setMessage("Creator ID is missing. Please log in again.");
      setMessageType("error");
      return false;
    }

    try {
      setReserving(true);
      const response = await fetch("http://localhost:5000/api/matches/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: form.location,
          date: form.date,
          time: form.time,
          creatorId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.error || "Error reserving location.");
        setMessageType("error");
        return false;
      }

      setMessage("Location reserved successfully.");
      setMessageType("success");
      return true;
    } catch (error) {
      setMessage("An error occurred while reserving the location.");
      setMessageType("error");
      return false;
    } finally {
      setReserving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const creatorId = localStorage.getItem("userId");
    const creatorName = localStorage.getItem("userFullName");

    const isReserved = await handleReserve();
    if (!isReserved) {
      return;
    }

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

  return (
    <div className="min-h-screen bg-cover bg-center bg-gray-300">
      <Navbar />
      <Font family="Poppins">
        <div className="flex justify-center py-20 mt-10">
          <div className="relative w-full max-w-lg bg-white p-8 rounded-lg shadow-lg z-10">
            <p className="text-red-500 flex text-center">
              Please count yourself in the needs, always players needed - 1.
            </p>
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
                min={todayDate}
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
                        <span className="font-semibold">{stadium.name}</span>
                        <br />
                        <span className="text-sm text-gray-600">{stadium.address}</span>
                        <br />
                        <span className="text-sm text-gray-600">{stadium.postalCode}</span>
                        <br />
                        <span className="text-sm text-gray-600">{stadium.area}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <select
                name="time"
                onChange={handleChange}
                value={form.time}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              >
                <option value="" disabled>
                  Select Time
                </option>
                {validTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              <input
                name="playersNeeded"
                type="number"
                min={1}
                placeholder="Players Needed"
                onChange={handleChange}
                value={form.playersNeeded}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />

              <button
                type="submit"
                className="w-full bg-blue-900 text-white p-3 rounded-lg hover:bg-blue-800"
                disabled={reserving}
              >
                {reserving ? "Reserving..." : "Create"}
              </button>
            </form>
          </div>
        </div>
      </Font>
    </div>
  );
};

export default CreateMatch;
