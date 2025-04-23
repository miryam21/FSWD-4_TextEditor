import React, { useState } from "react";

function FileManager({ text, setText }) {
    const [fileName, setFileName] = useState('');

    function handleFileName(e) {
        setFileName(e.target.value);
    }

    function saveFile() {
        if (!fileName.trim()) {
            alert('missing file name');
            return;
        }
        localStorage.setItem(fileName, JSON.stringify(text))
        alert('saved');

    };

    function saveFileAs() {
        if (!fileName.trim()) {
            alert('missing file name');
            return;
        }
        if (localStorage.getItem(fileName) !== null) {
            alert('file name already in use')
            return;
        }
        localStorage.setItem(fileName, JSON.stringify(text))
        alert('saved as ' + fileName);
    };

    function openFile() {
        if (!fileName.trim()){
            alert('missing file name');
            return;
        }
        if (localStorage.getItem(fileName) == null) {
            alert('no file with this name');
            return;
        }
        setText(JSON.parse(localStorage.getItem(fileName)||''));
    };

    return (
        <div className="file-manager">
            <button value="save" onClick={saveFile}>Save</button>
            <button value="save-as" onClick={saveFileAs}>Save as</button>
            <button value="open" onClick={openFile}>Open</button>
            <input type="text" name="file-name" placeholder="Unnamed File" onBlur={handleFileName} />
        </div>
    );
};

export default FileManager;