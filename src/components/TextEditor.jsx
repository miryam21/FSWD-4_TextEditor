import React, { useEffect, useState } from "react";
import Keyboard from "./Keyboard";
import TextDisplay from "./TextDisplay";
import LangSelector from "./LangSelector";
import StyleSelector from "./StyleSelector";
import FileManager from "./FileManager";

function TextEditor() {
   // const [text, setText] = useState("");
    const [documents, setDocuments] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [activeDocName, setActiveDocName] = useState("");
    const [history, setHistory] = useState([]);
    const [language, setLanguage] = useState('eng');
    const [style, setStyle] = useState(
        {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#000000',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'none',
        });
        // add new doc
        function addNewDocument() {
            const newDoc = {
                id: Date.now(),      
                name: "מסמך חדש",   
                content: ""          
            };
            setDocuments(prevDocs => [...prevDocs, newDoc]); 
            setActiveId(newDoc.id); 
        }     
        // update text in active doc
        function updateActiveDocument(newContent) {
            setDocuments(prevDocs =>
                prevDocs.map(doc => 
                    doc.id === activeId ? { ...doc, content: newContent } : doc
                )
            );
        }

        // close doc from screen
        function closeDocument(id) {
            const newDocs = documents.filter(doc => doc.id !== id); 
            setDocuments(newDocs); 
        
            if (activeId === id) { 
                setActiveId(newDocs.length > 0 ? newDocs[0].id : null); // בחר עורך אחר אם יש
            }
        }
        // save to local storage every change in docs
        useEffect(() => {
            localStorage.setItem('documents', JSON.stringify(documents));
          }, [documents]);
         
        // load from local storage in start
        useEffect(()=> {
            const savedDocs = JSON.parse(localStorage.getItem('documents')) || []; 
            setDocuments(savedDocs);
            if(savedDocs.length>0){
                setActiveId(savedDocs[0].id);
            }
        },[]);  
        // set filename
        useEffect(() => {
            if (!activeId) {
              setActiveDocName("");  // אם אין קובץ פתוח – תנקה את השם
              return;
            }
            const currentDoc = documents.find(doc => doc.id === activeId);
            if (currentDoc) {
              setActiveDocName(currentDoc.name); // אם יש קובץ – תעדכן את השם לשם הנכון שלו
            }
          }, [activeId, documents]);
          
        
        

    return (
 <>
            {/* כפתורים לניווט בין מסמכים */}
            <div style={{ marginBottom: "1em" }}>
                {documents.map(doc => (
                    <button 
                        key={doc.id} 
                        onClick={() => setActiveId(doc.id)}
                        style={{ margin: "0.25em", backgroundColor: activeId === doc.id ? "#ccc" : "white" }}
                    >
                        {doc.name}
                    </button>
                ))}
                <button onClick={addNewDocument}>➕ הוסף מסמך</button>
                {activeId && (
                    <button onClick={() => closeDocument(activeId)}>❌ סגור מסמך</button>
                )}
            </div>

            {/* מנהל קבצים */}
            <FileManager
                text={documents.find(doc => doc.id === activeId)?.content || ""}
                setText={updateActiveDocument}
            />

            {/* תצוגת הטקסט */}
            <TextDisplay
                text={documents.find(doc => doc.id === activeId)?.content || ""}
            />

            {/* מקלדת להזנת טקסט */}
            <Keyboard
                language={language}
                style={style}
                currText={documents.find(doc => doc.id === activeId)?.content || ""}
                setText={(newText)=> updateActiveDocument(newText)}
                history={history}
                setHistory={setHistory}
            />

            {/* בחירת שפה */}
            <LangSelector setLanguage={setLanguage} />

            {/* בחירת סגנון טקסט */}
            <StyleSelector setStyle={setStyle} />
        </>
    )
};

export default TextEditor;