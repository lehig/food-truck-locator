import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import backgroundImage from './assets/background.jpeg';

const root = ReactDOM.createRoot(document.getElementById('root'));

// apply background to body
document.body.style.background = `url(${backgroundImage}) no-repeat`;
document.body.style.backgroundSize = 'cover';
document.body.style.backgroundPosition = 'center';

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
