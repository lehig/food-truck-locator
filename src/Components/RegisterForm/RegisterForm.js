import React from "react";
import './RegisterForm.css';
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function RegisterForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [accountType, setAccountType] = useState('customer'); // default
    const [acceptedLegal, setAcceptedLegal] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const API_BASE_URL = process.env.REACT_APP_API_BASE;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // clear any previous error

        if (!acceptedLegal) {
            setError("You must agree to the Terms of Service and acknowledge the Privacy Policy to register.");
            return;
        }

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
                    accountType,
                    acceptedLegal: true,
                    acceptedLegalAt: new Date().toISOString(),
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            
            console.log("Success:", response.data);

            navigate("/confirm-signup", {
                state: {
                    userId: response.data.user_id,
                    username, 
                    email,
                    password, 
                    accountType,
                },
            });
        
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

                <div className="legal-consent">
                    <label className="legal-row">
                        <input
                        type="checkbox"
                        checked={acceptedLegal}
                        onChange={(e) => setAcceptedLegal(e.target.checked)}
                        required
                        />
                        <span>
                        I agree to the{" "}
                        <Link to="/tos" target="_blank" rel="noreferrer">
                            Terms of Service
                        </Link>{" "}
                        and acknowledge the{" "}
                        <Link to="/privacy" target="_blank" rel="noreferrer">
                            Privacy Policy
                        </Link>
                        .
                        </span>
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
        </div>
    )
}

export default RegisterForm;
