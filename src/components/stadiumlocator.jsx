import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom bigger red marker icon
const bigRedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  iconSize: [40, 65], // Bigger icon size
  iconAnchor: [20, 65], // Adjust anchor point to the middle of the larger icon
  popupAnchor: [0, -60], // Adjust popup position relative to the new icon size
  shadowSize: [65, 65] // Adjust shadow size to match the icon
});

// Component to center map around the user's location
const SetMapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13); // Set the map view to user's location with zoom 13
    }
  }, [center, map]);
  return null;
};

const StadiumLocator = ({ onSelectLocation = () => {} }) => { // Default to empty function if not passed
  const [stadiums, setStadiums] = useState([]);
  const [userLocation, setUserLocation] = useState([46.603354, 1.888334]); // Default center for France
  const [loading, setLoading] = useState(true);

  // Fetch user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setLoading(false);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  }, []);

  // Fetch stadiums data (including address and arrondissement name)
  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        const response = await fetch(
          'https://equipements.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/records?limit=100&refine=equip_aps_nom%3A%22Football%20%2F%20Football%20en%20salle%20(Futsal)%22&refine=dep_code_filled%3A%2256%22'
        );
        const data = await response.json();
        const stadiumData = data.results
          .map((item) => {
            const { equip_nom, coordonnees, inst_adresse, inst_cp, arr_name } = item || {};
            return {
              name: equip_nom,
              latitude: coordonnees?.lat,
              longitude: coordonnees?.lon,
              address: inst_adresse || 'Address not available',
              postalCode: inst_cp || 'Postal code not available',
              area: arr_name || 'Area not available', // Adding arr_name
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
      } catch (error) {
        console.error('Error fetching stadium data:', error);
      }
    };

    fetchStadiums();
  }, []);

  if (loading) {
    return <p>Loading map and locating user...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="map-container shadow-lg rounded-lg overflow-hidden" style={{ maxWidth: '100%', height: '600px' }}>
        <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <SetMapCenter center={userLocation} /> {/* Center map on user */}
          
          {/* Display stadium markers */}
          {stadiums.map((stadium, index) => (
            <Marker
              key={index}
              position={[stadium.latitude, stadium.longitude]}
              icon={bigRedIcon}
              eventHandlers={{
                click: () => {
                  // Call onSelectLocation when a stadium is clicked
                  onSelectLocation(`${stadium.name}, ${stadium.address}, ${stadium.postalCode}, ${stadium.area}`);
                }
              }}
            >
              <Popup>
                <strong>{stadium.name}</strong><br />
                <span>{stadium.address}</span><br /> {/* Display stadium address */}
                <span>{stadium.postalCode}</span><br />
                <span>{stadium.area}</span> {/* Display arrondissement name */}
              </Popup>
            </Marker>
          ))}

          {/* Marker for user's location */}
          <Marker position={userLocation} icon={bigRedIcon}>
            <Popup>You are here</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default StadiumLocator;
