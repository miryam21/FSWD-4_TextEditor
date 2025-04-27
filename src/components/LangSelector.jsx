import React from "react";

function LangSelector({ language, setLanguage }) {
    function selectLanguage(e) {
        console.log(e);
        setLanguage(e.target.value);
    }

    return (
        <div className="languages-select">
            <button className={`${language == 'eng'? 'active' : ''}`} value="eng" onClick={selectLanguage}>English</button>
            <button className={`${language == 'heb'? 'active' : ''}`} value="heb" onClick={selectLanguage}>עברית</button>
            <button className={`${language == 'emj'? 'active' : ''}`} value="emj" onClick={selectLanguage}>😊</button>
            <button className={`${language == 'sym'? 'active' : ''}`} value="sym" onClick={selectLanguage}>123@#</button>
        </div>
    )
}

export default LangSelector;