import React from "react";

function StyleSelector({ setStyle }) {

    function handleFontFamily(e) {
        setStyle(prev => ({ ...prev, fontFamily: e.target.value }));
    };

    function handleFontSize(e) {
        setStyle(prev => ({ ...prev, fontSize: e.target.value }));
    };

    function handleColorChange(e) {
        setStyle(prev => ({ ...prev, color: e.target.value }));
    };

    function handleBoldChange(e) {
        setStyle(prev => ({
            ...prev,
            fontWeight: prev.fontWeight === "bold" ? "normal" : "bold"
        }));
    };

    function handleItalicChange(e) {
        setStyle(prev => ({
            ...prev,
            fontStyle: prev.fontStyle === "italic" ? "normal" : "italic"
        }));
    };

    function handleUnderlineChange(e) {
        setStyle(prev => ({
            ...prev,
            textDecoration: prev.textDecoration === "underline" ? "none" : "underline"
        }));
    };



    return (
        <div className="style-select">
            {/* font */}
            <select className="font-family-select" onChange={handleFontFamily}>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
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
            <button className="bold-selector" onClick={handleBoldChange}><b>B</b></button>

            {/*italic*/}
            <button className="italic-selector" onClick={handleItalicChange}><i>I</i></button>

            {/*underline*/}
            <button className="underline-selector" onClick={handleUnderlineChange}><u>U</u></button>

        </div>
    );
}

export default StyleSelector;