import React, { useEffect, useState } from "react";
import './TestComms.css';

function TestComms() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("https://1pdtxa0shi.execute-api.us-east-1.amazonaws.com/dev/customerdb?username=JohnDoe33")
            .then(res => res.json())
            .then(parsedData => {
                console.log("Parsed JSON:", parsedData);
                setData(parsedData);
            })
            .catch(err => {
                console.error("fetch error:", err);
                setError("error fetching data");
            });
    }, []);

    const renderTable = () => {
        if (!data) return null;

        // if data is a single object, wrap in array
        const rows = Array.isArray(data) ? data : [data];
        const columns = Object.keys(rows[0]);

        return (
            <table className="customer-table">
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            {columns.map((col, j) => (
                                <td key={j}>{row[col]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="wrapper-db">
            <h1>Testing Lambda Communication...</h1>
            {error && <p style={{ color: "red"}}>{error}</p>}
            {data ? renderTable() : <p>Loading...</p>}
        </div>
    );
}

export default TestComms;
