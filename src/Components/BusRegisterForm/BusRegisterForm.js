import React, { useState } from 'react';
import './BusRegisterForm.css';
import { useLocation } from "react-router-dom";

function BusRegisterForm() {
    const location = useLocation();
    const { userId, username, email } = location.state || {};
    const [BusName, setBusName] = useState('');
    const [CityName, setCityName] = useState('');
    const [StateName, setStateName] = useState('');
    const [Address, setAddress] = useState('');
    const [ZipCode, setZipCode] = useState('');
    const [MenuString, setMenuString] = useState('');
    const [Hours, setHours] = useState('');

    // use these to prefill or link to the base account
    return (
        <div className='wrapper-bus'>
            <form>
                <h1>Business Registration</h1>
                <p>Base account: {username} ({email})</p>
                {/* extra business fields here */}

                {/* business name */}
                <div className="input-box">
                    <input 
                        type="business-name"
                        placeholder="Enter name of business"
                        value={BusName}
                        onChange={(e) => setBusName(e.target.value)}
                        required
                    />
                </div>

                {/* state */}
                <div className="input-box">
                    <select
                        value={StateName}
                        onChange={(e) => setStateName(e.target.value)}
                        required
                    >
                        <option value="">Select a State</option>
                        <option value="ID">Idaho</option>
                        <option value="UT">Utah</option>
                    </select>
                </div>
            </form>
        </div>
    );
}

export default BusRegisterForm;