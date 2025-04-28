import React, { useState, useEffect } from "react";

function FileManager({ text, setText, activeDocName, updateDocName, updateActiveDocument, storageKey, setActiveId, documents, excludeOpenButton = false }) {
    const [fileName, setFileName] = useState(activeDocName || '');

    function handleFileName(e) {
        setFileName(e.target.value);
    }

    function saveFile() {
        if (!fileName.trim()) {
            alert('missing file name');
            return;
        }
        
        // If it's the same document name that's already open, just save the content
        if (fileName === activeDocName) {
            updateActiveDocument(text);
            alert('saved successfully');
            return;
        }
        
        // Check if the new name already exists in another document
        const savedDocs = JSON.parse(localStorage.getItem(storageKey)) || [];
        const existingDoc = savedDocs.find(doc => doc.name === fileName);
        
        if (existingDoc) {
            alert('file name already exists - please choose a different name');
            return;
        }
        
        // Update document name and content
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
        
        // Create new document
        const newDoc = {
            id: Date.now(),
            name: fileName,
            content: text
        };
        
        // Add to documents array and save to localStorage
        const updatedDocs = [...savedDocs.filter(doc => doc.name !== fileName), newDoc];
        localStorage.setItem(storageKey, JSON.stringify(updatedDocs));
        
        // Update active document
        setActiveId(newDoc.id);
        updateDocName(fileName);
        
        alert('saved as ' + fileName);
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
            
            {/* Only show Open button if not requested to hide it */}
            {!excludeOpenButton && (
                <button 
                    value="open" 
                    onClick={() => {}} // Inactive button as Open function moved to main screen
                    style={{
                        padding: "0.5em 1em",
                        borderRadius: "8px",
                        backgroundColor: "#e0e0e0",
                        border: "1px solid #ccc",
                        cursor: "pointer",
                        opacity: 0.6 // Shown as inactive
                    }}
                >
                    Open
                </button>
            )}
            
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