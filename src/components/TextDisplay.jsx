import React from "react";

function TextDisplay({ text }) {
    return (
        <div className="text-display"
            dangerouslySetInnerHTML={{ __html: text }} />
    )
};

export default TextDisplay