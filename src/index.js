import React from 'react';
import ReactDOM from 'react-dom/client';


import App from './App';
import './auth/cognito';
import './styles/global.css';
import './styles/forms.css';
import './styles/layout.css';
import './styles/navbar.css';
import './styles/pages.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
