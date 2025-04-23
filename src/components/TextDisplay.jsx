import React from "react";
import classes from './TextDisplay.module.css';

function TextDisplay({ text }) {
    return (
        <div className={classes.displayText}
            dangerouslySetInnerHTML={{ __html: text }} />
    )
};

export default TextDisplay