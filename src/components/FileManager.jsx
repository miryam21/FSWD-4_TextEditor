import React, { useState, useEffect } from "react";

function FileManager({ text, setText, activeDocName, updateDocName, updateActiveDocument, storageKey, setActiveId, documents }) {
    const [fileName, setFileName] = useState(activeDocName || '');

    function handleFileName(e) {
        setFileName(e.target.value);
    }

    function saveFile() {
        if (!fileName.trim()) {
            alert('missing file name');
            return;
        }
        
        // אם מדובר באותו שם מסמך שכבר פתוח, פשוט נשמור את התוכן
        if (fileName === activeDocName) {
            updateActiveDocument(text);
            alert('saved successfully');
            return;
        }
        
        // בדיקה אם השם החדש כבר קיים במסמך אחר
        const savedDocs = JSON.parse(localStorage.getItem(storageKey)) || [];
        const existingDoc = savedDocs.find(doc => doc.name === fileName);
        
        if (existingDoc) {
            alert('file name already exists - please choose a different name');
            return;
        }
        
        // עדכון שם המסמך והתוכן
        const updateSuccessful = updateDocName(fileName);
        if (updateSuccessful) {
            updateActiveDocument(text);
            alert('saved successfully');
        }
    }
    
    function saveFileAs() {
        if (!fileName.trim()) {
            alert('missing file name');
            return;
        }
        
        // Get current documents array for this user
        const savedDocs = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        // Check if filename already exists
        if (savedDocs.some(doc => doc.name === fileName && (!activeDocName || doc.name !== activeDocName))) {
            alert('file name already exists');
            return;
        }
        
        // יצירת מסמך חדש
        const newDoc = {
            id: Date.now(),
            name: fileName,
            content: text
        };
        
        // הוספה למערך המסמכים ושמירה ב-localStorage
        const updatedDocs = [...savedDocs.filter(doc => doc.name !== fileName), newDoc];
        localStorage.setItem(storageKey, JSON.stringify(updatedDocs));
        
        // עדכון המסמך הפעיל
        setActiveId(newDoc.id);
        updateDocName(fileName);
        
        alert('saved as ' + fileName);
    }

    function openFile() {
        if (!fileName.trim()){
            alert('missing file name');
            return;
        }
        
        // Get saved documents
        const savedDocs = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        // Find document with matching name
        const foundDoc = savedDocs.find(doc => doc.name === fileName);
        
        if (!foundDoc) {
            alert('no file with this name');
            return;
        }
        
        // מונע פתיחה של מסמך שכבר פתוח באפליקציה
        // בדוק בכל המסמכים אם יש מסמך עם אותו שם שכבר פתוח
        const allDocs = JSON.parse(localStorage.getItem(storageKey)) || [];
        const isDocumentOpen = allDocs.some(doc => 
            doc.name === fileName && doc.isOpen === true
        );
        
        if (isDocumentOpen) {
            alert('File is already open in another tab');
            return;
        }
        
        // סמן את המסמך כפתוח
        const updatedDocs = allDocs.map(doc => 
            doc.id === foundDoc.id 
                ? { ...doc, isOpen: true } 
                : doc
        );
        localStorage.setItem(storageKey, JSON.stringify(updatedDocs));
        
        // Load document content
        setActiveId(foundDoc.id);
        setText(foundDoc.content);
        updateDocName(foundDoc.name);
        alert('opened ' + fileName);
    }

    // Update fileName when activeDocName changes
    useEffect(() => {
        setFileName(activeDocName || '');
    }, [activeDocName]);

    return (
        <div className="file-manager" style={{ 
            display: "flex", 
            gap: "0.5em", 
            marginBottom: "1em", 
            justifyContent: "center",
            flexWrap: "wrap"
        }}>
            <button 
                value="save" 
                onClick={saveFile}
                style={{
                    padding: "0.5em 1em",
                    borderRadius: "8px",
                    backgroundColor: "#e0e0e0",
                    border: "1px solid #ccc",
                    cursor: "pointer"
                }}
            >
                Save
            </button>
            <button 
                value="save-as" 
                onClick={saveFileAs}
                style={{
                    padding: "0.5em 1em",
                    borderRadius: "8px",
                    backgroundColor: "#e0e0e0",
                    border: "1px solid #ccc",
                    cursor: "pointer"
                }}
            >
                Save as
            </button>
            <button 
                value="open" 
                onClick={openFile}
                style={{
                    padding: "0.5em 1em",
                    borderRadius: "8px",
                    backgroundColor: "#e0e0e0",
                    border: "1px solid #ccc",
                    cursor: "pointer"
                }}
            >
                Open
            </button>
            <input 
                type="text" 
                name="file-name"
                placeholder="Unnamed File"
                value={fileName}
                onChange={handleFileName}
                style={{
                    padding: "0.5em",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "200px"
                }}
            />
        </div>
    );
}

export default FileManager;