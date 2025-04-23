import React, { useState } from "react";
import Keyboard from "./Keyboard";
import TextDisplay from "./TextDisplay";
import LangSelector from "./LangSelector";
import StyleSelector from "./StyleSelector";

function TextEditor() {
    const [text, setText] = useState("");
    const [history, setHistory] = useState([]);
    const [language, setLanguage] = useState('eng');
    const [style, setStyle] = useState(
        {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#000000',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'none',
        });

    return (
        <>
            <TextDisplay text={text} />
            <Keyboard language={language}
                style={style}
                currText={text}
                setText={setText} 
                history={history} 
                setHistory={setHistory} />
            <LangSelector setLanguage={setLanguage} />
            <StyleSelector setStyle={setStyle} />
        </>
    )
};

export default TextEditor;