import React, { useState, useEffect } from "react";
import Keyboard from "./Keyboard";
import TextDisplay from "./TextDisplay";
import LangSelector from "./LangSelector";
import StyleSelector from "./StyleSelector";
import FileManager from "./FileManager";

function TextEditor() {
    const [username, setUsername] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [activeId, setActiveIdState] = useState(null);
    const [activeDocName, setActiveDocName] = useState("");
    const [text, setText] = useState("");
    const [history, setHistory] = useState([]);
    const [language, setLanguage] = useState('eng');
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

    function loadDocuments() {
        const savedDocs = JSON.parse(localStorage.getItem(storageKey())) || [];
        setDocuments(savedDocs);
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
        setIsLoggedIn(true);
        loadDocuments();
    }

    function handleLogout() {
        setUsername("");
        setIsLoggedIn(false);
        setDocuments([]);
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
        localStorage.setItem(storageKey(), JSON.stringify(updatedDocs));
        setDocuments(updatedDocs);
        setActiveIdState(newDoc.id);
        setActiveDocName(newDoc.name);
        setText("");
    }

    function updateActiveDocument(newContent) {
        if (!activeId) return;
        
        setText(newContent);
        
        const updatedDocs = documents.map(doc =>
            doc.id === activeId ? { ...doc, content: newContent } : doc
        );
        
        setDocuments(updatedDocs);
        localStorage.setItem(storageKey(), JSON.stringify(updatedDocs));
    }

    function closeDocument(id) {
        if (activeId === id) {
            // שומר את המסמך לפני סגירתו
            const currentDoc = documents.find(doc => doc.id === id);
            if (currentDoc && currentDoc.content !== text) {
                // שומר את התוכן העדכני לפני הסגירה
                const updatedDocs = documents.map(doc =>
                    doc.id === id ? { ...doc, content: text } : doc
                );
                setDocuments(updatedDocs);
                localStorage.setItem(storageKey(), JSON.stringify(updatedDocs));
            }
            
            // מבטל את המסמך הפעיל אך לא מוחק אותו
            setActiveIdState(null);
            setText("");
            setActiveDocName("");
        }
    }
    
    function updateActiveDocName(newName) {
        if (!activeId) return false;
        
        // אם השם לא השתנה, אין צורך בבדיקות נוספות
        if (newName === activeDocName) {
            return true;
        }
        
        // בדיקה אם השם החדש כבר קיים במסמך אחר
        const existingDoc = documents.find(doc => doc.name === newName && doc.id !== activeId);
        if (existingDoc) {
            alert('file name already exists - please choose a different name');
            return false;
        }
        
        setActiveDocName(newName);
        
        const updatedDocs = documents.map(doc =>
            doc.id === activeId ? { ...doc, name: newName } : doc
        );
        
        setDocuments(updatedDocs);
        localStorage.setItem(storageKey(), JSON.stringify(updatedDocs));
        return true;
    }
    
    // פונקציה לבדיקה אם מסמך כבר פתוח
    function isDocumentOpen(docName) {
        return activeDocName === docName;
    }
    
    // פונקציה למחיקת מסמך מה-localStorage
    function deleteDocument(id) {
        // שואל את המשתמש לאישור לפני המחיקה
        const docToDelete = documents.find(doc => doc.id === id);
        if (!docToDelete) return;
        
        const confirmDelete = window.confirm(`האם למחוק את המסמך "${docToDelete.name}"?`);
        if (!confirmDelete) return;
        
        // סוגר את המסמך אם הוא פתוח כעת
        if (activeId === id) {
            setActiveIdState(null);
            setText("");
            setActiveDocName("");
        }
        
        // מחיקת המסמך ממערך המסמכים
        const updatedDocs = documents.filter(doc => doc.id !== id);
        setDocuments(updatedDocs);
        localStorage.setItem(storageKey(), JSON.stringify(updatedDocs));
        
        alert(`המסמך "${docToDelete.name}" נמחק בהצלחה`);
    }
    
    // פונקציה להגדרת מסמך פעיל
    function setActiveId(id) {
        // אין לאפשר פתיחת אותו מסמך פעמיים
        const selectedDoc = documents.find(doc => doc.id === id);
        if (!selectedDoc) return;
        
        if (isDocumentOpen(selectedDoc.name)) {
            alert(`המסמך "${selectedDoc.name}" כבר פתוח`);
            return;
        }
        
        // מעדכן את המסמך הקודם לפני המעבר למסמך חדש
        if (activeId) {
            const updatedDocs = documents.map(doc =>
                doc.id === activeId ? { ...doc, content: text } : doc
            );
            setDocuments(updatedDocs);
            localStorage.setItem(storageKey(), JSON.stringify(updatedDocs));
        }
        
        // מגדיר את המסמך החדש כפעיל
        setActiveDocName(selectedDoc.name);
        setText(selectedDoc.content);
        setActiveIdState(id);
    }
    
    useEffect(() => {
        if (isLoggedIn) {
            localStorage.setItem(storageKey(), JSON.stringify(documents));
        }
    }, [documents, isLoggedIn]);

    return (
        <div style={{ padding: "2em" }}>
            {/* אם לא מחובר */}
            {!isLoggedIn ? (
                <div style={{ textAlign: "center" }}>
                    <h2>ברוך הבא! נא להתחבר</h2>
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
                    <br />
                    <button onClick={handleLogin} style={{
                        padding: "0.5em 1em",
                        fontSize: "1em",
                        borderRadius: "8px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        cursor: "pointer"
                    }}>
                        התחבר
                    </button>
                </div>
            ) : (
                <>
                    {/* מחובר */}
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

                    {/* סרגל ניהול */}
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
                        {activeId && (
                            <button onClick={() => closeDocument(activeId)} style={{
                                padding: "0.5em 1em",
                                fontSize: "1em",
                                borderRadius: "8px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                cursor: "pointer"
                            }}>❌ סגור מסמך</button>
                        )}
                    </div>

                    {/* רשימת הקבצים */}
                    <div style={{ marginBottom: "1em", display: "flex", flexWrap: "wrap", gap: "0.5em", justifyContent: "center" }}>
                        {documents.map(doc => {
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
                                            fontSize: "0.9em"
                                        }}
                                        title="מחק מסמך"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* עורך הטקסט - מוצג רק כאשר יש מסמך פעיל */}
                    {activeId ? (
                        <>
                            <FileManager
                                text={text}
                                setText={updateActiveDocument}
                                activeDocName={activeDocName}
                                updateDocName={updateActiveDocName}
                                updateActiveDocument={updateActiveDocument}
                                storageKey={storageKey()}
                                setActiveId={setActiveIdState}
                                documents={documents}
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
                        // הודעה כאשר אין מסמך פעיל
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