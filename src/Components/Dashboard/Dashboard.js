import React from 'react';
import Map from '../Map/Map';
import './Dashboard.css'

// Example pin data: array of {id, latitude, longitude, label}
const pins = [
  { id: 1, lat: 40.7128, lng: -74.006, label: "New York" },
  { id: 2, lat: 34.0522, lng: -118.2437, label: "Los Angeles" },
  { id: 3, lat: 41.8781, lng: -87.6298, label: "Chicago" },
];

function Dashboard() {
  return (
    <div className='map-wrapper'>
        <Map pins={pins}/>
    </div>
  );
}

export default Dashboard;


