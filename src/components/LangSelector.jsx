import React from "react";

function LangSelector({ setLanguage }) {
    function selectLanguage(e) {
        console.log(e);
        setLanguage(e.target.value);
    }

    return (
        <div className="languages-select">
            <button value="eng" onClick={selectLanguage}>English</button>
            <button value="heb" onClick={selectLanguage}>עברית</button>
            <button value="emj" onClick={selectLanguage}>😊</button>
            <button value="sym" onClick={selectLanguage}>123@#</button>
        </div>
    )
}

export default LangSelector;