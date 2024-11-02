import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSearch } from '../context/SearchContext';
import Header from './forms/components/header';
import SearchBar from '../views/searchbar';

const MapView: React.FC = () => {
  const { allStores } = useSearch();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [uniqueLocations, setUniqueLocations] = useState<any[]>([]);

  // Custom hook to zoom the map to the selected location
  const ZoomToLocation = ({ location }) => {
    const map = useMap();
    if (location) {
      console.log('Zooming to location:', location); // Debug log for zoom location
      map.setView([location.latitude, location.longitude], 15, {
        animate: true,
      });
    }
    return null;
  };

  useEffect(() => {
    console.log('All Stores:', allStores); // Debug log to check data

    // Handle duplicate coordinates by offsetting slightly
    const coordinateMap = new Map();

    const adjustedStores = allStores.map((store) => {
      const lat = parseFloat(store.location.latitude);
      const lng = parseFloat(store.location.longitude);
      const coordKey = `${lat.toFixed(7)},${lng.toFixed(7)}`;

      if (coordinateMap.has(coordKey)) {
        // Slightly offset repeated coordinates
        const offset = 0.0001 * coordinateMap.get(coordKey);
        coordinateMap.set(coordKey, coordinateMap.get(coordKey) + 1);
        return {
          ...store,
          location: {
            ...store.location,
            latitude: lat + offset,
            longitude: lng + offset,
          },
        };
      } else {
        coordinateMap.set(coordKey, 1);
        return store;
      }
    });

    setUniqueLocations(adjustedStores);
  }, [allStores]);

  const handleLocationSelect = (location) => {
    console.log('Location selected from SearchBar:', location); // Debug log to check location selection from SearchBar
    setSelectedLocation(location);
  };

  return (
    <div>
      <Header onLocationSelect={handleLocationSelect} />
      <SearchBar onLocationSelect={(location) => {
        console.log('Suggestion clicked:', location); // Debug log to check if suggestion is clicked
        handleLocationSelect(location);
      }} />
      <MapContainer
        center={[12.8797, 121.7740]} // Center of the Philippines
        zoom={6} // Set zoom level appropriate for viewing the entire country
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Display all adjusted stores as markers */}
        {Array.isArray(uniqueLocations) && uniqueLocations.map((store) => {
          const latitude = parseFloat(store.location.latitude);
          const longitude = parseFloat(store.location.longitude);

          if (isNaN(latitude) || isNaN(longitude)) {
            console.warn('Invalid coordinates for store:', store);
            return null;
          }

          return (
            <Marker
              key={store.id}
              position={[latitude, longitude]}
              eventHandlers={{
                click: () => {
                  console.log('Marker clicked:', store.location); // Debug log for marker click
                  setSelectedLocation(store.location);
                },
              }}
            >
              <Popup>
                <strong>Store: {store.storename}</strong>
                <p>Description: {store.description}</p>
                <p>Location: {store.location.address}</p>
                <p>Owned by: {store.owner.firstname} {store.owner.lastname}</p>
              </Popup>
            </Marker>
          );
        })}

        {/* Zoom to the selected location if available */}
        {selectedLocation && <ZoomToLocation location={selectedLocation} />}
      </MapContainer>
    </div>
  );
};

export default MapView;


