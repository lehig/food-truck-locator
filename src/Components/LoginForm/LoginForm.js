import React, { useState } from "react";
import './LoginForm.css';
import { FaLock, FaUser } from "react-icons/fa";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";
import backgroundImage from '../../assets/background.jpeg';

// Then in your component's style or styled-components
const styles = {
  backgroundImage: `url(${backgroundImage})`,
  backgroundRepeat: 'no-repeat'
};

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });
            console.log(res.data);
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard'); // or wherever your protected route is
        } catch (err) {
            setError(err.response?.data?.message || 'login failed');
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

                <div className="remember-forgot">
                    <label><input type="checkbox" />Remember Me</label>
                    <a href="#">Forgot Password</a>
                </div>

                <button type="submit">Login</button>

                <div className="register-link">
                    <p>Don't have an account? <a href="/register">Register</a></p>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;