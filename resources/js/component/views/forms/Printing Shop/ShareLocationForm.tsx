import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../components/header';

const ShareLocation = () => {
  const { createStore, loading } = useStore();
  const [storename, setStorename] = useState('');
  const [description, setDescription] = useState('');
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [showMap, setShowMap] = useState(false);

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setLatitude(latitude);
              setLongitude(longitude);
              setAddress(''); 
              setShowMap(true);
              console.log('Latitude:', latitude, 'Longitude:', longitude); // Debugging
            },
            (error) => {
              // Fallback to Lapu-Lapu, Philippines location
              alert('Unable to retrieve your location. Defaulting to Lapu-Lapu City, Cebu, Philippines.');
              setLatitude(10.3103); // Lapu-Lapu City latitude
              setLongitude(123.9494); // Lapu-Lapu City longitude
              setAddress('Lapu-Lapu City, Cebu, Philippines');
              setShowMap(true);
              console.error('Geolocation error:', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            }
          );
        } else if (result.state === 'denied') {
          // Permission denied, fallback to Lapu-Lapu City, Cebu, Philippines location
          alert('Location access denied. Defaulting to Lapu-Lapu City, Cebu, Philippines.');
          setLatitude(10.3103); // Lapu-Lapu City latitude
          setLongitude(123.9494); // Lapu-Lapu City longitude
          setAddress('Lapu-Lapu City, Cebu, Philippines');
          setShowMap(true);
        }
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleRemoveMap = () => {
    setShowMap(false);
    setLatitude(null);
    setLongitude(null);
    setAddress('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      alert('Please allow location access or enter your location manually.');
      return;
    }

    const location = { longitude, latitude, address };
    const storeData = { storename, description, location };

    const success = await createStore(storeData);

    if (success) {
      alert('Store created successfully!');
      setStorename('');
      setDescription('');
      setAddress('');
      setShowMap(false);
    } else {
      alert('Failed to create store.');
    }
  };

  return (
    <div className="flex h-screen bg-white">
  
      <div className="flex-1 flex flex-col bg-white">
        <Header />

        <div className="flex flex-col items-center justify-center flex-1 p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-gray-600 text-white py-2 px-4 mb-4 text-center">
            <button 
              type="button" 
              onClick={handleShareLocation} 
              className="w-full"
            >
              Share Location
            </button>
          </div>

          {showMap && latitude !== null && longitude !== null && (
            <div className="relative w-full bg-gray-200 p-4 mb-4 max-w-md">
              <button 
                type="button" 
                onClick={handleRemoveMap} 
                className="absolute top-0 right-0 m-2 text-red-500 text-xl"
              >
                &times;
              </button>
              <MapContainer
                center={[latitude, longitude] as [number, number]}
                zoom={13}
                style={{ height: '300px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[latitude, longitude]} />
              </MapContainer>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-md bg-white">
            <input
              type="text"
              placeholder="Store Name"
              value={storename}
              onChange={(e) => setStorename(e.target.value)}
              required
              className="w-full bg-blue-500 text-white py-2 px-4 mb-4"
            />
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-blue-500 text-white py-2 px-4 mb-4"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-blue-500 text-white py-2 px-4 mb-4"
            />

            <button 
              type="submit" 
              disabled={loading} 
              className="bg-gray-500 text-white py-2 px-4 w-full"
            >
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareLocation;
