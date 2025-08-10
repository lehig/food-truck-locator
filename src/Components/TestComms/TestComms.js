import React, { useEffect } from "react";

function TestComms() {
    useEffect(() => {
        fetch("https://rybh70bm86.execute-api.us-east-1.amazonaws.com/dev/hello")
            .then(res => res.json())
            .then(data => console.log(data.message)) // Should log "Hello World!"
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h1>Testing Lambda Communication...</h1>
            <p>Check your console for the response.</p>
        </div>
    );
}

export default TestComms;
