import React, { useState } from "react";

function StyleSelector({ setStyle, setText }) {
    const [isBold, setBold] = useState(false);
    const [isItalic, setItalic] = useState(false);
    const [isUnderline, setUnderline] = useState(false);
    const [isAlltext, setAlltext] = useState(false);
    const [fontFamily, setFontFamily] = useState('Arial');

    function handleFontFamily(e) {
        setFontFamily(e.target.value);
        setStyle(prev => {
            if (isAlltext) 
                styleAllText(/font-family:\s*[^;]*;/g, `font-family: ${e.target.value};`);
            return { ...prev, fontFamily: e.target.value };
        });
    };

    function handleFontSize(e) {
        setStyle(prev => {
            if (isAlltext) 
                styleAllText(/font-size:\s*[^;]*;/g, `font-size: ${e.target.value};`);
            return { ...prev, fontSize: e.target.value };
        });
    };

    function handleColorChange(e) {
        setStyle(prev => {
            if (isAlltext) 
                styleAllText(/color:\s*[^;]*;/g, `color: ${e.target.value};`);
            return { ...prev, color: e.target.value };
        });
    };

    function handleBoldChange(e) {
        setBold(!isBold);
        setStyle(prev => {
            const val = prev.fontWeight === "bold" ? "normal" : "bold";
            if (isAlltext) 
                styleAllText(/font-weight:\s*(normal|bold);/g, `font-weight: ${val};`);
            return { ...prev, fontWeight: val };
        });
    }

    function handleItalicChange(e) {
        setItalic(!isItalic);
        setStyle(prev => {
            const val = prev.fontStyle === "italic" ? "normal" : "italic";
            if (isAlltext) styleAllText(/font-style:\s*(normal|italic);/g, `font-style: ${val};`);
            return { ...prev, fontStyle: val };
        });
    };

    function handleUnderlineChange(e) {
        setUnderline(!isUnderline);
        setStyle(prev => {
            const val = prev.textDecoration === "underline" ? "none" : "underline";
            if (isAlltext) styleAllText(/text-decoration:\s*(none|underline);/g, `text-decoration: ${val};`);
            return { ...prev, textDecoration: val };
        });
    };

    function handleAllTextChange(e) {
        setAlltext(!isAlltext);
    }

    function styleAllText(regEx, replaceEx) {
        setText(prev => prev.replace(regEx, replaceEx));
    };



    return (
        <div className="style-select">
            {/* font */}
            <select className="font-family-select" onChange={handleFontFamily} style={{ fontFamily: fontFamily }}>
                <option value="Arial" style={{ fontFamily: 'Arial' }}>Arial</option>
                <option value="Times New Roman" style={{ fontFamily: 'imes New Roman' }}>Times New Roman</option>
                <option value="Courier New" style={{ fontFamily: 'Courier New' }}>Courier New</option>
            </select>

            {/*size*/}
            <select className="font-size-select" onChange={handleFontSize}>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="22px">22px</option>
                <option value="24px">24px</option>
            </select>

            {/*color*/}
            <input type="color" className="font-color-select" onBlur={handleColorChange} />

            {/*bold*/}
            <button className={`bold-selector ${isBold? 'active' : ''}`} onClick={handleBoldChange}><b>B</b></button>

            {/*italic*/}
            <button className={`italic-selector ${isItalic? 'active' : ''}`} onClick={handleItalicChange}><i>I</i></button>

            {/*underline*/}
            <button className={`underline-selector ${isUnderline? 'active' : ''}`} onClick={handleUnderlineChange}><u>U</u></button>

            {/*all text*/}
            <button className={`all-text-selector ${isAlltext? 'active' : ''}`} onClick={handleAllTextChange}>All Text</button>

        </div>
    );
}

export default StyleSelector;