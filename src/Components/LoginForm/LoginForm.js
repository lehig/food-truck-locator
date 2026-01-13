import React from "react";
import './LoginForm.css';
import { FaLock, FaUser } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, fetchAuthSession } from '../../auth/cognito';

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signIn({ username, password });
            const session = await fetchAuthSession();
            const idPayload = session.tokens?.idToken?.payload || {};
            const userID = idPayload.sub;
            if (!userID) throw new Error("Missing sub claim");
            const groups = idPayload["cognito:groups"];
            const role = Array.isArray(groups) ? groups[0] :
                        typeof groups === "string" ? groups :
                        "";

            sessionStorage.setItem('ftlUser', JSON.stringify({
            userID,
            username,
            email: idPayload.email,
            role,
            }));

            navigate('/dashboard', { state: { userID, username, email: idPayload.email, role } });
        } catch (err) {
            setError('login failed');
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
