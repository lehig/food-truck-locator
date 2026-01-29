import React from "react";
import './TestEntry.css';
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function TestEntry() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [accountType, setAccountType] = useState('customer'); // default
    const API_BASE_URL = process.env.REACT_APP_API_BASE;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!API_BASE_URL) {
            setError("Missing API base URL configuration.");
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/register`,
                {
                    username,
                    password, 
                    email,
                    accountType
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            
            console.log("Success:", response.data);
            navigate("/test");
            
            
        } catch (err) {
        console.error('Register error:', err);

        let message = 'Registration failed';

        // If backend sends something in response.data
        if (err.response && err.response.data) {
            const data = err.response.data;
            console.log("err.response.data: ", data)

            message = data.error
        } else if (err.message) {
            // Generic JS / Axios error message
            message = err.message;
        }

        setError(String(message)); // ALWAYS a string
    }
};

    return (
        <div className="wrapper">
            <h1>Testing Entry: </h1>

            <form onSubmit={handleSubmit}>
                <h1>Food Truck Locator</h1>
                <h2>Registration</h2>

                {/* email */}
                <div className="input-box">
                    <input 
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <FaEnvelope className="icon" />
                </div>

                {/* username */}
                <div className="input-box">
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <FaUser className="icon" />
                </div>

                {/* password */}
                <div className="input-box">
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <FaLock className="icon" />
                </div>

                {/* radio button account type */}
                <div className="account-type">
                    <p>What type of account are you registering?</p>
                    <label>
                        <input
                        type="radio"
                        name="accountType"
                        value="customer"
                        checked={accountType === 'customer'}
                        onChange={(e) => setAccountType(e.target.value)}
                        />
                        Customer
                    </label>

                    <label>
                        <input
                        type="radio"
                        name="accountType"
                        value="business"
                        checked={accountType === 'business'}
                        onChange={(e) => setAccountType(e.target.value)}
                        />
                        Business
                    </label>
                </div>

                {error && (
                    <p className="error">
                        {typeof error === 'string' ? error : JSON.stringify(error)}
                    </p>
                )}

                <button type="submit">Register</button>

                <div className="register-link">
                    <p>Already have an account? <a href="/">Login</a></p>
                </div>
            </form>
            <p><a href="/test">look at database</a></p>
        </div>
    )
}

export default TestEntry;
