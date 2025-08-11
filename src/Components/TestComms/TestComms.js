import React, { useEffect } from "react";

function TestComms() {
    useEffect(() => {
        fetch("https://rybh70bm86.execute-api.us-east-1.amazonaws.com/dev/hello")
            .then(res => {
                console.log("Raw response:", res);
                return res.text();
            })
            .then(text => {
                console.log("Raw text body:", text);
                try {
                    const data = JSON.parse(text);
                    console.log("Parsed JSON message:", data.message);
                } catch (err) {
                    console.error("JSON parse error:", err);
                }
            }) 
            .catch(err => console.error("fetch error:",err));
    }, []);

    return (
        <div>
            <h1>Testing Lambda Communication...</h1>
            <p>Check your console for the response.</p>
        </div>
    );
}

export default TestComms;
