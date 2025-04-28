
// import React, { useState, useEffect } from "react";
// import Keyboard from "./Keyboard";
// import TextDisplay from "./TextDisplay";
// import LangSelector from "./LangSelector";
// import StyleSelector from "./StyleSelector";
// import FileManager from "./FileManager";

// function TextEditor() {
//     const [username, setUsername] = useState("");
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [documents, setDocuments] = useState([]);
//     const [activeId, setActiveId] = useState(null);
//     const [activeDocName, setActiveDocName] = useState("");
//     const [history, setHistory] = useState([]);
//     const [language, setLanguage] = useState('eng');
//     const [style, setStyle] = useState({
//         fontSize: '16px',
//         fontFamily: 'Arial',
//         color: '#000000',
//         fontWeight: 'normal',
//         fontStyle: 'normal',
//         textDecoration: 'none',
//     });

//     function storageKey() {
//         return `documents_${username}`;
//     }

//     function loadDocuments() {
//         const savedDocs = JSON.parse(localStorage.getItem(storageKey())) || [];
//         setDocuments(savedDocs);
//         if (savedDocs.length > 0) {
//             setActiveId(savedDocs[0].id);
//         } else {
//             setActiveId(null);
//             setActiveDocName("");
//         }
//     }

//     function handleLogin() {
//         if (username.trim() === "") {
//             alert("נא להזין שם משתמש");
//             return;
//         }
//         setIsLoggedIn(true);
//         loadDocuments();
//     }

//     function handleLogout() {
//         setUsername("");
//         setIsLoggedIn(false);
//         setDocuments([]);
//         setActiveId(null);
//         setActiveDocName("");
//     }

//     function addNewDocument() {
//         const savedDocs = JSON.parse(localStorage.getItem(storageKey())) || [];
//         const defaultName = "מסמך חדש";
//         let newName = defaultName;
//         let counter = 1;

//         while (savedDocs.some(doc => doc.name === newName)) {
//             newName = `${defaultName} ${counter++}`;
//         }

//         const newDoc = {
//             id: Date.now(),
//             name: newName,
//             content: ""
//         };

//         const updatedDocs = [...savedDocs, newDoc];
//         localStorage.setItem(storageKey(), JSON.stringify(updatedDocs));
//         setDocuments(updatedDocs);
//         setActiveId(newDoc.id);
//     }

//     function updateActiveDocument(newContent) {
//         if (!activeId) return;
        
//         const updatedDocs = documents.map(doc =>
//             doc.id === activeId ? { ...doc, content: newContent } : doc
//         );
        
//         setDocuments(updatedDocs);
//         localStorage.setItem(storageKey(), JSON.stringify(updatedDocs));
//     }

//     function closeDocument(id) {
//         if (activeId === id) {
//             setActiveId(null);  // אין קובץ פעיל
//         }
//     }
    
//     function updateActiveDocName(newName) {
//         if (!activeId) return;
        
//         const updatedDocs = documents.map(doc =>
//             doc.id === activeId ? { ...doc, name: newName } : doc
//         );
        
//         setDocuments(updatedDocs);
//         localStorage.setItem(storageKey(), JSON.stringify(updatedDocs));
//     }
    
//     useEffect(() => {
//         if (isLoggedIn) {
//             localStorage.setItem(storageKey(), JSON.stringify(documents));
//         }
//     }, [documents, isLoggedIn]);

//     useEffect(() => {
//         if (!activeId) {
//             setActiveDocName("");
//             return;
//         }
//         const currentDoc = documents.find(doc => doc.id === activeId);
//         if (currentDoc) {
//             setActiveDocName(currentDoc.name);
//         }
//     }, [activeId, documents]);

//     const activeDocument = documents.find(doc => doc.id === activeId);
//     const activeContent = activeDocument ? activeDocument.content : "";

//     return (
//         <div style={{ padding: "2em" }}>
//             {/* אם לא מחובר */}
//             {!isLoggedIn ? (
//                 <div style={{ textAlign: "center" }}>
//                     <h2>ברוך הבא! נא להתחבר</h2>
//                     <input
//                         type="text"
//                         placeholder="הכנס שם משתמש"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         style={{
//                             padding: "0.5em",
//                             fontSize: "1em",
//                             borderRadius: "8px",
//                             border: "2px solid #ccc",
//                             width: "250px",
//                             marginBottom: "1em"
//                         }}
//                     />
//                     <br />
//                     <button onClick={handleLogin} style={{
//                         padding: "0.5em 1em",
//                         fontSize: "1em",
//                         borderRadius: "8px",
//                         backgroundColor: "#4CAF50",
//                         color: "white",
//                         border: "none",
//                         cursor: "pointer"
//                     }}>
//                         התחבר
//                     </button>
//                 </div>
//             ) : (
//                 <>
//                     {/* מחובר */}
//                     <div style={{ marginBottom: "1em", textAlign: "center" }}>
//                         <h2>שלום, {username}!</h2>
//                         <button onClick={handleLogout} style={{
//                             padding: "0.5em 1em",
//                             fontSize: "1em",
//                             borderRadius: "8px",
//                             backgroundColor: "#f44336",
//                             color: "white",
//                             border: "none",
//                             cursor: "pointer"
//                         }}>
//                             התנתק
//                         </button>
//                     </div>

//                     {/* סרגל ניהול */}
//                     <div style={{ marginBottom: "1em", display: "flex", flexWrap: "wrap", gap: "0.5em", alignItems: "center", justifyContent: "center" }}>
//                         <button onClick={addNewDocument}>➕ מסמך חדש</button>
//                         {activeId && (
//                             <button onClick={() => closeDocument(activeId)}>❌ סגור מסמך</button>
//                         )}
//                     </div>

//                     {/* רשימת הקבצים */}
//                     <div style={{ marginBottom: "1em", display: "flex", flexWrap: "wrap", gap: "0.5em", justifyContent: "center" }}>
//                         {documents.map(doc => (
//                             <button
//                                 key={doc.id}
//                                 onClick={() => setActiveId(doc.id)}
//                                 style={{
//                                     padding: "0.5em",
//                                     minWidth: "120px",
//                                     backgroundColor: activeId === doc.id ? "#f0f8ff" : "white",
//                                     border: activeId === doc.id ? "2px solid blue" : "1px solid gray",
//                                     borderRadius: "8px",
//                                     textAlign: "center",
//                                     cursor: "pointer",
//                                     fontWeight: activeId === doc.id ? "bold" : "normal"
//                                 }}
//                             >
//                                 {doc.name}
//                             </button>
//                         ))}
//                     </div>

//                     {/* עורך הטקסט */}
//                     {activeId && (
//                         <>
//                             <FileManager
//                                 text={activeContent}
//                                 setText={updateActiveDocument}
//                                 activeDocName={activeDocName}
//                                 updateDocName={updateActiveDocName}
//                                 updateActiveDocument={updateActiveDocument}
//                                 storageKey={storageKey()}
//                             />

//                             <TextDisplay
//                                 text={activeContent}
//                             />

//                             <Keyboard
//                                 language={language}
//                                 style={style}
//                                 currText={activeContent}
//                                 setText={updateActiveDocument}
//                                 history={history}
//                                 setHistory={setHistory}
//                             />

//                             <LangSelector 
//                                 language={language}
//                                 setLanguage={setLanguage} 
//                             />
                            
//                             <StyleSelector 
//                                 setStyle={setStyle} 
//                                 setText={updateActiveDocument}
//                             />
//                         </>
//                     )}
//                 </>
//             )}
//         </div>
//     );
// }

// export default TextEditor;