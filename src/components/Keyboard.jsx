import React from "react";

const chars = {
    'eng': [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], ['z', 'x', 'c', 'v', 'b', 'n', 'm']],
    'heb': [['\'', '-', 'ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'], ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'], ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ']],
    'emj': [['😀', '😂', '😍', '😎', '😢', '😡', '🥳', '🤔'], ['😴', '🤯', '😭', '👍', '✌️', '💪', '🫶'], ['❤️', '💔', '❤️‍🔥', '🌸', '🌈', '🦄', '💩', '✨']],
    'sym': [['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], ['.', ',', '!', '?', '(', ')', '@', '#', '$', '%'], ['&', '*', '-', '+', '=', '/', '^', '[', ']']],
    'ctr': ['space ␣', 'enter ↵', 'backspace ⌫', 'del word', 'clear ✘', 'undo ↶']
}

function Keyboard({ language, style, currText, setText, history, setHistory }) {
    function handleKeyClick(e) {
        if (e.target.innerHTML == "undo ↶") {
            handleUndoClick();
            return;
        }

        setHistory(h => [...h, currText]);

        if (e.target.innerHTML == "space ␣") {
            setText(prevText => prevText + `<span>&nbsp;</span>`)
        }

        else if (e.target.innerHTML == "enter ↵") {
            setText(prevText => prevText + `<span><br /></span>`)
        }

        else if (e.target.innerHTML == "backspace ⌫") {
            setText(prevText => {
                return prevText.replace(/<span[^>]*>[^<]*<\/span>$|<span><br\s?\/?><\/span>$/, '');
            });
        }

        else if (e.target.innerHTML == "del word") {
            setText(prevText => {
                let lastIndex = Math.max(
                    prevText.lastIndexOf('<span>&nbsp;</span>'),
                    prevText.lastIndexOf('<span><br /></span>'));
                lastIndex = lastIndex == -1 ? 0 : lastIndex;
                return prevText.slice(0, lastIndex);
            });
        }

        else if (e.target.innerHTML == "clear ✘") {
            setText("");
        }

        else {
            setText(prevText => prevText + `<span style="font-size: ${style.fontSize};
                font-family: ${style.fontFamily};
                color: ${style.color};
                font-weight: ${style.fontWeight};
                font-style: ${style.fontStyle};
                text-decoration: ${style.textDecoration};">${e.target.innerHTML}</span>`)
        }
    }

    function handleUndoClick() {
        if (history.length > 0) {
            setText(history.pop());
            setHistory([...history]);
        }
    }

    return (
        <div className="keys">
            {chars[language].map((row, rowIdx) => (
                <React.Fragment key={rowIdx}>
                    {row.map((ch, chIdx) => (
                        <button key={`${rowIdx}-${chIdx}`} onClick={handleKeyClick}>
                            {ch}
                        </button>
                    ))}
                    <br />
                </React.Fragment>
            ))}
            {chars['ctr'].map((ch, idx) => (
                <button key={`ctr-${idx}`} onClick={handleKeyClick}>
                    {ch}
                </button>
            ))}
        </div>
    )
};

export default Keyboard;