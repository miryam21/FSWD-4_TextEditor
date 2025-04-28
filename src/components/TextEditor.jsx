import React, { useState, useEffect, useRef } from "react";
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
    const [visibleDocuments, setVisibleDocuments] = useState([]); // מערך חדש של מסמכים גלויים
    const [openFileName, setOpenFileName] = useState(""); // שם הקובץ לפתיחה
    const openFileInputRef = useRef(null);
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
        setVisibleDocuments(savedDocs.map(doc => doc.id)); // כל המסמכים גלויים בהתחלה
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
        localStorage.setItem(storageKey(), JSON.stringify(updatedDocs));
        setDocuments(updatedDocs);
        setVisibleDocuments(prev => [...prev, newDoc.id]); // הוספת המסמך החדש למסמכים הגלויים
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

    // פונקציה להסרת המסמך מהתצוגה
    function removeDocumentFromView(id) {
        if (activeId === id) {
            // שומר את המסמך לפני הסרתו מהתצוגה
            const currentDoc = documents.find(doc => doc.id === id);
            if (currentDoc && currentDoc.content !== text) {
                // שומר את התוכן העדכני
                const updatedDocs = documents.map(doc =>
                    doc.id === id ? { ...doc, content: text } : doc
                );
                setDocuments(updatedDocs);
                localStorage.setItem(storageKey(), JSON.stringify(updatedDocs));
            }
            
            // מסיר את המסמך מהתצוגה
            setActiveIdState(null);
            setText("");
            setActiveDocName("");
        }
        
        // מסיר את המסמך מרשימת המסמכים הגלויים
        setVisibleDocuments(prev => prev.filter(docId => docId !== id));
    }

    // פונקציה להחזרת מסמך לתצוגה
    function showDocument(id) {
        if (!visibleDocuments.includes(id)) {
            setVisibleDocuments(prev => [...prev, id]);
        }
    }
    
    // פונקציה גלובלית לפתיחת קובץ
    function openFile() {
        if (!openFileName.trim()){
            alert('missing file name');
            return;
        }
        
        // קריאת כל המסמכים מה-localStorage (כולל המוסתרים!)
        const savedDocs = JSON.parse(localStorage.getItem(storageKey())) || [];
        console.log("מסמכים בזיכרון:", savedDocs);
        // חיפוש מסמך עם שם מתאים
      
        const foundDoc = savedDocs.find(doc => doc.name === openFileName);
        console.log("מסמך שמחפשים:", openFileName);
        console.log("מסמך שנמצתא:", foundDoc);
        
        if (!foundDoc) {
            alert('no file with this name');
            return;
        }
        
        // בדיקה אם המסמך כבר פתוח
        if (activeDocName === openFileName) {
            alert('File is already open');
            return;
        }
        
        // מחזיר לתצוגה אם היה מוסתר
        showDocument(foundDoc.id);
        
        // מגדיר את המסמך החדש כפעיל
        setActiveDocName(foundDoc.name);
        setText(foundDoc.content);
        setActiveIdState(foundDoc.id);
        
        // ניקוי שדה הקלט
        setOpenFileName("");
        
        alert('opened ' + openFileName);
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
        setVisibleDocuments(prev => prev.filter(docId => docId !== id)); // מסיר גם מהמסמכים הגלויים
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

        // וודא שהמסמך נראה (במקרה שהיה מוסתר)
        showDocument(id);
    }
    
    // האזנה לאירועים מהמערכת
    useEffect(() => {
        if (isLoggedIn) {
            localStorage.setItem(storageKey(), JSON.stringify(documents));
        }
    }, [documents, isLoggedIn]);

    // מיקוד ההקלדה על שדה הפתיחה בלחיצה על Enter
    function handleOpenFileKeyPress(e) {
        if (e.key === 'Enter') {
            openFile();
        }
    }

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
                        
                        {/* כפתור פתיחת קובץ גלובלי */}
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
                                ref={openFileInputRef}
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

                    {/* רשימת הקבצים */}
                    <div style={{ marginBottom: "1em", display: "flex", flexWrap: "wrap", gap: "0.5em", justifyContent: "center" }}>
                        {documents
                            .filter(doc => visibleDocuments.includes(doc.id)) // מציג רק מסמכים גלויים
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
                                        {/* כפתור הסרה מהתצוגה */}
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
                                excludeOpenButton={true} // פרמטר חדש להסרת כפתור Open
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