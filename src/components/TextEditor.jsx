import React, { useState } from "react";
import Keyboard from "./Keyboard";
import TextDisplay from "./TextDisplay";
import LangSelector from "./LangSelector";
import StyleSelector from "./StyleSelector";
import FileManager from "./FileManager";

function TextEditor() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [activeId, setActiveIdState] = useState(null);
    const [activeDocName, setActiveDocName] = useState("");
    const [text, setText] = useState("");
    const [history, setHistory] = useState([]);
    const [language, setLanguage] = useState('eng');
    const [visibleDocuments, setVisibleDocuments] = useState([]);
    const [openFileName, setOpenFileName] = useState("");
    const [style, setStyle] = useState({
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
    });

    function storageKey() {
        return `documents_${username}`;
    }
    
    function usersStorageKey() {
        return 'text_editor_users';
    }
    
    // Helper function to update localStorage
    function updateLocalStorage(docs) {
        if (isLoggedIn) {
            localStorage.setItem(storageKey(), JSON.stringify(docs));
        }
    }

    function loadDocuments() {
        const savedDocs = JSON.parse(localStorage.getItem(storageKey())) || [];
        setDocuments(savedDocs);
        setVisibleDocuments(savedDocs.map(doc => doc.id)); // All documents visible initially
        if (savedDocs.length > 0) {
            setActiveIdState(savedDocs[0].id);
            setActiveDocName(savedDocs[0].name);
            setText(savedDocs[0].content);
        } else {
            setActiveIdState(null);
            setActiveDocName("");
            setText("");
        }
    }

    function handleLogin() {
        if (username.trim() === "") {
            alert("נא להזין שם משתמש");
            return;
        }
        
        if (password.trim() === "") {
            alert("נא להזין סיסמה");
            return;
        }
        
        // Check if user exists
        const users = JSON.parse(localStorage.getItem(usersStorageKey())) || {};
        
        if (!users[username]) {
            alert("שם משתמש לא קיים. אנא הירשם תחילה.");
            setIsRegistering(true);
            return;
        }
        
        // Check password
        if (users[username] !== password) {
            alert("סיסמה שגויה. נסה שנית.");
            return;
        }
        
        setIsLoggedIn(true);
        loadDocuments();
    }
    
    function handleRegister() {
        if (username.trim() === "") {
            alert("נא להזין שם משתמש");
            return;
        }
        
        if (password.trim() === "") {
            alert("נא להזין סיסמה");
            return;
        }
        
        if (password !== confirmPassword) {
            alert("הסיסמאות אינן תואמות");
            return;
        }
        
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem(usersStorageKey())) || {};
        
        if (users[username]) {
            alert("שם משתמש כבר קיים. נסה שם אחר או התחבר.");
            return;
        }
        
        // Save new user
        users[username] = password;
        localStorage.setItem(usersStorageKey(), JSON.stringify(users));
        
        alert("ההרשמה הושלמה בהצלחה! כעת אתה יכול להתחבר.");
        setIsRegistering(false);
        setPassword("");
        setConfirmPassword("");
    }

    function handleLogout() {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setIsLoggedIn(false);
        setDocuments([]);
        setVisibleDocuments([]);
        setActiveIdState(null);
        setActiveDocName("");
        setText("");
    }

    function addNewDocument() {
        const savedDocs = JSON.parse(localStorage.getItem(storageKey())) || [];
        const defaultName = "מסמך חדש";
        let newName = defaultName;
        let counter = 1;

        while (savedDocs.some(doc => doc.name === newName)) {
            newName = `${defaultName} ${counter++}`;
        }

        const newDoc = {
            id: Date.now(),
            name: newName,
            content: ""
        };

        const updatedDocs = [...savedDocs, newDoc];
        updateLocalStorage(updatedDocs);
        setDocuments(updatedDocs);
        setVisibleDocuments(prev => [...prev, newDoc.id]); // Add new document to visible documents
        setActiveIdState(newDoc.id);
        setActiveDocName(newDoc.name);
        setText("");
    }

    // Only updates local state, doesn't save to localStorage
    function updateActiveDocument(newContent) {
        setText(newContent);
    }

    // Check for unsaved changes
    function hasUnsavedChanges(id) {
        const currentDoc = documents.find(doc => doc.id === id);
        if (!currentDoc) return false;
        
        return currentDoc.content !== text;
    }

    // Save current document
    function saveCurrentDocument() {
        if (!activeId) return false;
        
        // Create updated document list with new content and current name
        const updatedDocs = documents.map(doc =>
            doc.id === activeId ? { ...doc, name: activeDocName, content: text } : doc
        );
        
        // Update local state
        setDocuments(updatedDocs);
        updateLocalStorage(updatedDocs);
        
        return true;
    }

    // Remove document from view
    function removeDocumentFromView(id) {
        // Check for unsaved changes
        if (activeId === id && hasUnsavedChanges(id)) {
            const confirmSave = window.confirm(`יש שינויים שלא נשמרו במסמך "${activeDocName}". האם לשמור לפני הסגירה?`);
            
            if (confirmSave) {
                // Save changes
                saveCurrentDocument();
            }
        }
        
        // Close editor if this is the active document
        if (activeId === id) {
            setActiveIdState(null);
            setText("");
            setActiveDocName("");
        }
        
        // Remove document from visible documents list
        setVisibleDocuments(prev => prev.filter(docId => docId !== id));
    }

    // Return document to view
    function showDocument(id) {
        if (!visibleDocuments.includes(id)) {
            setVisibleDocuments(prev => [...prev, id]);
        }
    }
    
    // Global function to open a file
    function openFile() {
        if (!openFileName.trim()){
            alert('missing file name');
            return;
        }
        
        // Read all documents from localStorage (including hidden ones)
        const savedDocs = JSON.parse(localStorage.getItem(storageKey())) || [];
        
        // Find document with matching name
        const foundDoc = savedDocs.find(doc => doc.name === openFileName);
        
        if (!foundDoc) {
            alert('no file with this name');
            return;
        }
        
        // Check if document is already open
        if (activeDocName === openFileName) {
            alert('File is already open');
            return;
        }
        
        // Check for unsaved changes in current document before switching
        if (activeId && hasUnsavedChanges(activeId)) {
            const confirmSave = window.confirm(`יש שינויים שלא נשמרו במסמך "${activeDocName}". האם לשמור לפני המעבר למסמך חדש?`);
            
            if (confirmSave) {
                // Save changes
                saveCurrentDocument();
            }
        }
        
        // Return to view if hidden
        showDocument(foundDoc.id);
        
        // Set new document as active
        setActiveDocName(foundDoc.name);
        setText(foundDoc.content);
        setActiveIdState(foundDoc.id);
        
        // Clear input field
        setOpenFileName("");
        
        alert('opened ' + openFileName);
    }
    
    // Update active document name
    function updateActiveDocName(newName) {
        if (!activeId) return false;
        
        // If name hasn't changed, no need for additional checks
        if (newName === activeDocName) {
            return true;
        }
        
        // Check if new name already exists in another document
        const existingDoc = documents.find(doc => doc.name === newName && doc.id !== activeId);
        if (existingDoc) {
            alert('File name already exists - please choose a different name');
            return false;
        }
        
        // Update document name in local state
        setActiveDocName(newName);
        
        // Update name in documents array
        const updatedDocs = documents.map(doc =>
            doc.id === activeId ? { ...doc, name: newName } : doc
        );
        
        setDocuments(updatedDocs);
        updateLocalStorage(updatedDocs);
        
        return true;
    }
    
    // Check if document is already open
    function isDocumentOpen(docName) {
        return activeDocName === docName;
    }
    
    // Delete document from localStorage
    function deleteDocument(id) {
        // Ask user for confirmation before deletion
        const docToDelete = documents.find(doc => doc.id === id);
        if (!docToDelete) return;
        
        const confirmDelete = window.confirm(`האם למחוק את המסמך "${docToDelete.name}"?`);
        if (!confirmDelete) return;
        
        // Close document if currently open
        if (activeId === id) {
            setActiveIdState(null);
            setText("");
            setActiveDocName("");
        }
        
        // Delete document from array
        const updatedDocs = documents.filter(doc => doc.id !== id);
        setDocuments(updatedDocs);
        setVisibleDocuments(prev => prev.filter(docId => docId !== id)); // Remove from visible documents too
        updateLocalStorage(updatedDocs);
        
        alert(`המסמך "${docToDelete.name}" נמחק בהצלחה`);
    }
    
    // Set active document
    function setActiveId(id) {
        // Don't allow opening the same document twice
        const selectedDoc = documents.find(doc => doc.id === id);
        if (!selectedDoc) return;
        
        if (isDocumentOpen(selectedDoc.name)) {
            alert(`המסמך "${selectedDoc.name}" כבר פתוח`);
            return;
        }
        
        // Check for unsaved changes in current document before switching
        if (activeId && hasUnsavedChanges(activeId)) {
            const confirmSave = window.confirm(`There are unsaved changes in "${activeDocName}". Save before opening new document?`);
            
            if (confirmSave) {
                // Save changes
                saveCurrentDocument();
            }
        }
        
        // Set new document as active
        setActiveDocName(selectedDoc.name);
        setText(selectedDoc.content);
        setActiveIdState(id);

        // Ensure document is visible (in case it was hidden)
        showDocument(id);
    }
    
    // Focus typing on open field when Enter is pressed
    function handleOpenFileKeyPress(e) {
        if (e.key === 'Enter') {
            openFile();
        }
    }
    
    // Toggle between registration and login screens
    function toggleRegistration() {
        setIsRegistering(!isRegistering);
        setPassword("");
        setConfirmPassword("");
    }
    
    // Focus on Enter in password field
    function handleLoginKeyPress(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    }
    
    // Focus on Enter in confirm password field
    function handleRegisterKeyPress(e) {
        if (e.key === 'Enter') {
            handleRegister();
        }
    }

    return (
        <div style={{ padding: "2em" }}>
            {/* Not logged in */}
            {!isLoggedIn ? (
                <div style={{ textAlign: "center" }}>
                    <h2>{isRegistering ? "הרשמה למערכת" : "ברוך הבא! נא להתחבר"}</h2>
                    
                    <div style={{ marginBottom: "1em" }}>
                        <input
                            type="text"
                            placeholder="הכנס שם משתמש"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                padding: "0.5em",
                                fontSize: "1em",
                                borderRadius: "8px",
                                border: "2px solid #ccc",
                                width: "250px",
                                marginBottom: "1em"
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: "1em" }}>
                        <input
                            type="password"
                            placeholder="הכנס סיסמה"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={isRegistering ? null : handleLoginKeyPress}
                            style={{
                                padding: "0.5em",
                                fontSize: "1em",
                                borderRadius: "8px",
                                border: "2px solid #ccc",
                                width: "250px",
                                marginBottom: isRegistering ? "1em" : "0"
                            }}
                        />
                    </div>
                    
                    {isRegistering && (
                        <div style={{ marginBottom: "1em" }}>
                            <input
                                type="password"
                                placeholder="אימות סיסמה"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyPress={handleRegisterKeyPress}
                                style={{
                                    padding: "0.5em",
                                    fontSize: "1em",
                                    borderRadius: "8px",
                                    border: "2px solid #ccc",
                                    width: "250px"
                                }}
                            />
                        </div>
                    )}
                    
                    <div style={{ marginBottom: "1em" }}>
                        <button 
                            onClick={isRegistering ? handleRegister : handleLogin} 
                            style={{
                                padding: "0.5em 1em",
                                fontSize: "1em",
                                borderRadius: "8px",
                                backgroundColor: isRegistering ? "#2196F3" : "#4CAF50",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                marginRight: "1em"
                            }}
                        >
                            {isRegistering ? "הרשם" : "התחבר"}
                        </button>
                        
                        <button 
                            onClick={toggleRegistration} 
                            style={{
                                padding: "0.5em 1em",
                                fontSize: "1em",
                                borderRadius: "8px",
                                backgroundColor: "#f0f0f0",
                                color: "#333",
                                border: "1px solid #ccc",
                                cursor: "pointer"
                            }}
                        >
                            {isRegistering ? "חזרה להתחברות" : "הרשמה"}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Logged in */}
                    <div style={{ marginBottom: "1em", textAlign: "center" }}>
                        <h2>שלום, {username}!</h2>
                        <button onClick={handleLogout} style={{
                            padding: "0.5em 1em",
                            fontSize: "1em",
                            borderRadius: "8px",
                            backgroundColor: "#f44336",
                            color: "white",
                            border: "none",
                            cursor: "pointer"
                        }}>
                            התנתק
                        </button>
                    </div>

                    {/* Management toolbar */}
                    <div style={{ marginBottom: "1em", display: "flex", flexWrap: "wrap", gap: "0.5em", alignItems: "center", justifyContent: "center" }}>
                        <button onClick={addNewDocument} style={{
                            padding: "0.5em 1em",
                            fontSize: "1em",
                            borderRadius: "8px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            cursor: "pointer"
                        }}>➕ מסמך חדש</button>
                        
                        {/* Global open file button */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
                            <button 
                                onClick={openFile}
                                style={{
                                    padding: "0.5em 1em",
                                    fontSize: "1em",
                                    borderRadius: "8px",
                                    backgroundColor: "#2196F3",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer"
                                }}
                            >
                                Open
                            </button>
                            <input 
                                type="text" 
                                placeholder="שם הקובץ לפתיחה"
                                value={openFileName}
                                onChange={(e) => setOpenFileName(e.target.value)}
                                onKeyPress={handleOpenFileKeyPress}
                                style={{
                                    padding: "0.5em",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                    width: "200px"
                                }}
                            />
                        </div>
                    </div>

                    {/* File list */}
                    <div style={{ marginBottom: "1em", display: "flex", flexWrap: "wrap", gap: "0.5em", justifyContent: "center" }}>
                        {documents
                            .filter(doc => visibleDocuments.includes(doc.id)) // Show only visible documents
                            .map(doc => {
                                const isOpen = activeDocName === doc.name;
                                return (
                                    <div key={doc.id} style={{ display: "flex", alignItems: "center", marginBottom: "0.5em" }}>
                                        <button
                                            onClick={() => setActiveId(doc.id)}
                                            disabled={isOpen}
                                            style={{
                                                padding: "0.5em",
                                                minWidth: "120px",
                                                backgroundColor: isOpen ? "#d0e8ff" : "white",
                                                border: isOpen ? "2px solid blue" : "1px solid gray",
                                                borderRadius: "8px",
                                                textAlign: "center",
                                                cursor: isOpen ? "default" : "pointer",
                                                fontWeight: isOpen ? "bold" : "normal",
                                                opacity: isOpen ? 0.7 : 1
                                            }}
                                        >
                                            {doc.name}
                                            {isOpen && " (פתוח)"}
                                        </button>
                                        {/* Remove from view button */}
                                        <button
                                            onClick={() => removeDocumentFromView(doc.id)}
                                            style={{
                                                marginRight: "0.3em",
                                                marginLeft: "0.3em",
                                                padding: "0.3em 0.5em",
                                                backgroundColor: "#FFC107",
                                                color: "black",
                                                borderRadius: "8px",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "0.9em"
                                            }}
                                            title="הסר מהתצוגה"
                                        >
                                            👁️
                                        </button>
                                        <button
                                            onClick={() => deleteDocument(doc.id)}
                                            style={{
                                                marginRight: "0.3em",
                                                marginLeft: "0.3em",
                                                padding: "0.3em 0.5em",
                                                color: "white",
                                                borderRadius: "8px",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "0.9em",
                                                backgroundColor: "#f44336"
                                            }}
                                            title="מחק מסמך"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                    
                    {/* Text editor - only shown when there's an active document */}
                    {activeId ? (
                        <>
                            <FileManager
                                text={text}
                                setText={setText}
                                activeDocName={activeDocName}
                                updateDocName={updateActiveDocName}
                                updateActiveDocument={saveCurrentDocument}
                                storageKey={storageKey()}
                                setActiveId={setActiveIdState}
                                documents={documents}
                                excludeOpenButton={true} // New parameter to remove Open button
                            />

                            <TextDisplay
                                text={text}
                            />

                            <Keyboard
                                language={language}
                                style={style}
                                currText={text}
                                setText={updateActiveDocument}
                                history={history}
                                setHistory={setHistory}
                            />

                            <LangSelector 
                                language={language}
                                setLanguage={setLanguage} 
                            />
                            
                            <StyleSelector 
                                setStyle={setStyle} 
                                setText={updateActiveDocument}
                            />
                        </>
                    ) : (
                        // Message when no active document
                        <div style={{ 
                            textAlign: "center", 
                            padding: "2em", 
                            backgroundColor: "#f9f9f9",
                            borderRadius: "8px",
                            margin: "1em auto",
                            maxWidth: "500px"
                        }}>
                            <h3>אין מסמך פעיל</h3>
                            <p>נא לבחור מסמך קיים מהרשימה למעלה או ליצור מסמך חדש</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default TextEditor;