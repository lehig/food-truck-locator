import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


function Map({ pins }) {
  // Default center: use first pin or fallback coords
  const center = pins.length > 0 ? [pins[0].lat, pins[0].lng] : [0, 0];
  
  return (
    <MapContainer center={center} zoom={4} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {pins.map(pin => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]}>
          <Popup>{pin.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Map;
