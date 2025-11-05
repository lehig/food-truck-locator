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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post(
                "https://1pdtxa0shi.execute-api.us-east-1.amazonaws.com/dev/register",
                {
                    username,
                    password, 
                    email
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
            console.error(err);
            setError(err);
        }
    };

    return (
        <div className="wrapper">
            <h1>Testing Entry: </h1>

            <form onSubmit={handleSubmit}>
                {/* email */}
                <div className="input-box">
                    <input 
                    type="text"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required/>
                    <FaEnvelope className="icon"/>
                </div>

                {/* username */}
                <div className="input-box">
                    <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required/>
                    <FaUser className="icon"/>
                </div>

                {/* password */}
                <div className="input-box">
                    <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required/>
                    <FaLock className="icon"/>
                </div>
                {error && <p className="error">{error}</p>}

                <button type="submit">Register</button>
            </form>
            <p><a href="/test">look at database</a></p>
        </div>
    )
}

export default TestEntry;