import React, { useState } from 'react';
import './BusRegisterForm.css';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function BusRegisterForm() {
    const location = useLocation();
    const { userId, username, email } = location.state || {};
    const [BusName, setBusName] = useState('');
    const [CityName, setCityName] = useState('');
    const [StateName, setStateName] = useState('');
    const [Address, setAddress] = useState('');
    const [ZipCode, setZipCode] = useState('');
    const [menuItems, setMenuItems] = useState([{ name: '', price: '', description: ''}]);
    const [hours, setHours] = useState({
        Monday: "",
        Tuesday: "",
        Wednesday: "",
        Thursday: "",
        Friday: "",
        Saturday: "",
        Sunday: ""
    });

    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const payload = {
                user_id: userId,
                username, 
                email, 
                business_name: BusName,
                state: StateName,
                city: CityName,
                address: Address,
                zip_code: ZipCode,
                hours,
                menu_items: menuItems
            };

            console.log("sending payload:", payload);

            const response = await axios.post(
                "https://1pdtxa0shi.execute-api.us-east-1.amazonaws.com/dev/business-register",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("business registration saved:", response.data);
            alert("business info saved successfully!")

            navigate('/');
        } catch (err) {
            console.error("error saving business info:", err);

            let message = "failed to save business info";

            if (err.response && err.response.data) {
                message = err.response.data.error || message;
            } else if (err.message) {
                message = err.message;
            }

            setError(String(message));
        } finally {
            setSaving(false);
        }
    }

    /* Set Menu Items */
    const handleMenuChange = (index, field, value) => {
    const newMenu = [...menuItems];
    newMenu[index][field] = value;
    setMenuItems(newMenu);
    };

    const addMenuItem = () => {
    setMenuItems([...menuItems, { name: '', price: '', description: '' }]);
    };

    const removeMenuItem = (index) => {
    const newMenu = [...menuItems];
    newMenu.splice(index, 1);
    setMenuItems(newMenu);
    };

    /* Handle Hours */
    const handleHourChange = (day, value) => {
        setHours(prev => ({ ...prev, [day]: value }));
    };


    // use these to prefill or link to the base account
    return (
        <div className='wrapper-bus'>
            <form onSubmit={handleSubmit}>
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

                {/* city */}
                <div className='input-box'>
                    <input 
                        type='city-name'
                        placeholder='Name of City (ex. Rexburg)'
                        value={CityName}
                        onChange={(e) => setCityName(e.target.value)}
                        required
                    />
                </div>

                {/* address */}
                <div className='input-box'>
                    <input 
                        type='address'
                        placeholder='Street Address (approximate street address)'
                        value={Address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>

                {/* zipcode */}
                <div className='input-box'>
                    <input 
                        type='zipcode'
                        placeholder='Zipcode (ex. 83440)'
                        value={ZipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        required
                    />
                </div>

                {/* Hours of Operation */}
                <div className="hours-section">
                    <h3>Hours of Operation</h3>
                    {Object.keys(hours).map(day => (
                        <div key={day} className="menu-item">
                            <label>{day}:</label>
                            <input
                                type="text"
                                placeholder="e.g. 10am–8pm / Closed"
                                value={hours[day]}
                                onChange={(e) => handleHourChange(day, e.target.value)}
                            />
                        </div>
                    ))}
                </div>


                {/* menu items */}
                <div className="input-box">
                    <h3>Add Some Menu Items</h3>
                    {menuItems.map((item, index) => (
                        <div key={index} className="menu-item">
                            <input
                                type="text"
                                placeholder="Item name"
                                value={item.name}
                                onChange={(e) => handleMenuChange(index, 'name', e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => handleMenuChange(index, 'description', e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Price ($)"
                                value={item.price}
                                onChange={(e) => handleMenuChange(index, 'price', e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => removeMenuItem(index)}>
                                Remove
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addMenuItem}>
                        + Add Item
                    </button>
                </div>

                {/* error message */}
                {error && <p className='error'>{error}</p>}
                
                {/* submit button */}
                <button type='submit' disabled={saving}>
                    {saving ? "Saving..." : "Submit Business Info"}
                </button>
            </form>
        </div>
    );
}

export default BusRegisterForm;