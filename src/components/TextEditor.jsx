import React, { useState, useRef, useEffect } from "react";
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
    
    function usersStorageKey() {
        return 'text_editor_users';
    }
    
    // פונקציית עזר לעדכון ה-localStorage
    function updateLocalStorage(docs) {
        if (isLoggedIn) {
            localStorage.setItem(storageKey(), JSON.stringify(docs));
        }
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
        
        if (password.trim() === "") {
            alert("נא להזין סיסמה");
            return;
        }
        
        // בדיקה אם המשתמש קיים
        const users = JSON.parse(localStorage.getItem(usersStorageKey())) || {};
        
        if (!users[username]) {
            alert("שם משתמש לא קיים. אנא הירשם תחילה.");
            setIsRegistering(true);
            return;
        }
        
        // בדיקת סיסמה
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
        
        // בדיקה אם המשתמש כבר קיים
        const users = JSON.parse(localStorage.getItem(usersStorageKey())) || {};
        
        if (users[username]) {
            alert("שם משתמש כבר קיים. נסה שם אחר או התחבר.");
            return;
        }
        
        // שמירת המשתמש החדש
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
        updateLocalStorage(updatedDocs); // עדכון ה-localStorage
        setDocuments(updatedDocs);
        setVisibleDocuments(prev => [...prev, newDoc.id]); // הוספת המסמך החדש למסמכים הגלויים
        setActiveIdState(newDoc.id);
        setActiveDocName(newDoc.name);
        setText("");
    }

    // שינוי: הפונקציה הזו רק מעדכנת את המצב המקומי, בלי לשמור ב-localStorage
    function updateActiveDocument(newContent) {
        setText(newContent);
    }

    // פונקציה לבדיקה אם יש שינויים שלא נשמרו
    function hasUnsavedChanges(id) {
        const currentDoc = documents.find(doc => doc.id === id);
        if (!currentDoc) return false;
        
        return currentDoc.content !== text;
    }

    // פונקציה לשמירת המסמך הנוכחי
    function saveCurrentDocument() {
        if (!activeId) return;
        
        const updatedDocs = documents.map(doc =>
            doc.id === activeId ? { ...doc, content: text } : doc
        );
        setDocuments(updatedDocs);
        updateLocalStorage(updatedDocs); // עדכון ה-localStorage
        
        return true;
    }

    // פונקציה להסרת המסמך מהתצוגה
    function removeDocumentFromView(id) {
        // בדיקה אם יש שינויים שלא נשמרו
        if (activeId === id && hasUnsavedChanges(id)) {
            const confirmSave = window.confirm(`יש שינויים שלא נשמרו במסמך "${activeDocName}". האם לשמור לפני הסגירה?`);
            
            if (confirmSave) {
                // שמירת השינויים
                saveCurrentDocument();
            }
        }
        
        // סגירת העורך אם זה המסמך הפעיל
        if (activeId === id) {
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
        
        // חיפוש מסמך עם שם מתאים
        const foundDoc = savedDocs.find(doc => doc.name === openFileName);
        
        if (!foundDoc) {
            alert('no file with this name');
            return;
        }
        
        // בדיקה אם המסמך כבר פתוח
        if (activeDocName === openFileName) {
            alert('File is already open');
            return;
        }
        
        // בדיקה אם יש שינויים שלא נשמרו במסמך הנוכחי לפני המעבר למסמך חדש
        if (activeId && hasUnsavedChanges(activeId)) {
            const confirmSave = window.confirm(`יש שינויים שלא נשמרו במסמך "${activeDocName}". האם לשמור לפני המעבר למסמך חדש?`);
            
            if (confirmSave) {
                // שמירת השינויים
                saveCurrentDocument();
            }
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
        updateLocalStorage(updatedDocs); // עדכון ה-localStorage
        
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
        
        // בדיקה אם יש שינויים שלא נשמרו במסמך הנוכחי לפני המעבר למסמך חדש
        if (activeId && hasUnsavedChanges(activeId)) {
            const confirmSave = window.confirm(`יש שינויים שלא נשמרו במסמך "${activeDocName}". האם לשמור לפני המעבר למסמך חדש?`);
            
            if (confirmSave) {
                // שמירת השינויים
                saveCurrentDocument();
            }
        }
        
        // מגדיר את המסמך החדש כפעיל
        setActiveDocName(selectedDoc.name);
        setText(selectedDoc.content);
        setActiveIdState(id);

        // וודא שהמסמך נראה (במקרה שהיה מוסתר)
        showDocument(id);
    }
    
    // מיקוד ההקלדה על שדה הפתיחה בלחיצה על Enter
    function handleOpenFileKeyPress(e) {
        if (e.key === 'Enter') {
            openFile();
        }
    }
    
    // מעבר בין מסכי הרשמה והתחברות
    function toggleRegistration() {
        setIsRegistering(!isRegistering);
        setPassword("");
        setConfirmPassword("");
    }
    
    // מיקוד על Enter בשדה הסיסמה
    function handleLoginKeyPress(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    }
    
    // מיקוד על Enter בשדה אישור הסיסמה
    function handleRegisterKeyPress(e) {
        if (e.key === 'Enter') {
            handleRegister();
        }
    }

    return (
        <div style={{ padding: "2em" }}>
            {/* אם לא מחובר */}
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
                    {/* מחובר */}
                    <div style={{ marginBottom: "1em", textAlign: "center" }}>
                        <h2>שלום, {username}</h2>
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
                                setText={setText}
                                activeDocName={activeDocName}
                                updateDocName={updateActiveDocName}
                                updateActiveDocument={saveCurrentDocument}
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