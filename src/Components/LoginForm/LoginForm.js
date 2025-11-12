import React from "react";
import './LoginForm.css';
import { FaLock, FaUser } from "react-icons/fa";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://1pdtxa0shi.execute-api.us-east-1.amazonaws.com/dev/login", {
                username,
                password
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            console.log("response received");
            console.log("success");
            console.log(response.data)
            navigate("/dashboard");
        } catch (err) {
            console.log("failed")
            setError("login failed")
        }
    };

    return (
        <div className='wrapper'>
            <form onSubmit={handleSubmit}>
                <h1>Food Truck Locator</h1>
                <h2>Login</h2>
                <div className="input-box">
                    <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required/>
                    <FaUser className="icon"/>
                </div>
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

                <button type="submit">Login</button>

                <div className="register-link">
                    <p>Don't have an account yet? <a href="/register">Register</a></p>
                    
                </div>
            </form>
        </div>
    );
}

export default LoginForm;