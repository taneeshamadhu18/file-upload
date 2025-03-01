import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Upload from "./components/Upload";
import Preview from "./components/Preview";

function App() {
  const [uploadedFile, setUploadedFile] = useState(() => {
    // Load from localStorage if available
    const savedFile = sessionStorage.getItem("uploadedFile");
    return savedFile ? JSON.parse(savedFile) : null;
  });

  // Store file data in session storage to persist across refreshes
  useEffect(() => {
    if (uploadedFile) {
      sessionStorage.setItem("uploadedFile", JSON.stringify(uploadedFile));
    }
  }, [uploadedFile]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Upload setUploadedFile={setUploadedFile} />} />
        <Route
          path="/preview"
          element={uploadedFile ? <Preview uploadedFile={uploadedFile} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
