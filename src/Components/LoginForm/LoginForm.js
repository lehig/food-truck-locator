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
            const res = await signIn({ username, password });

            // If Cognito requires another step (MFA, new password, etc.)
            const step = res?.nextStep?.signInStep;
            if (step && step !== 'DONE') {
            throw new Error(`Sign-in requires additional step: ${step}`);
            }

            const session = await fetchAuthSession();

            const idPayload = session.tokens?.idToken?.payload ?? {};
            const accessPayload = session.tokens?.accessToken?.payload ?? {};

            const userID = idPayload.sub || accessPayload.sub;
            if (!userID) throw new Error('Missing sub claim');

            // Groups are often on the access token
            const groupsClaim = accessPayload['cognito:groups'] ?? idPayload['cognito:groups'];
            const groups = Array.isArray(groupsClaim)
            ? groupsClaim
            : typeof groupsClaim === 'string' && groupsClaim.length
            ? groupsClaim.split(',').map(s => s.trim())
            : [];

            const role = groups[0] || '';
            const email = idPayload.email || accessPayload.email || '';

            sessionStorage.setItem(
            'ftlUser',
            JSON.stringify({ userID, username, email, role })
            );

            navigate('/dashboard', { state: { userID, username, email, role } });
        } catch (err) {
            console.error('Login error:', err);
            setError(err?.message || 'login failed');
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
