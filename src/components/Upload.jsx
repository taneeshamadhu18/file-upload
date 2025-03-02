
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, CheckCircle, ArrowRight, Store, Printer, FileUp } from "lucide-react"; 
// Import from a relative path if the exact path is unavailable
import logo from "./print.jpeg"; // Adjust the path as needed

const Upload = ({ setUploadedFile }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  // Check if the uploaded file was previously stored in session storage
  useEffect(() => {
    const storedFile = sessionStorage.getItem("uploadedFile");
    if (storedFile) {
      try {
        const fileData = JSON.parse(storedFile);
        // We can't reconstruct the actual File object from sessionStorage
        // But we can show the file name to the user
        setFile({ name: fileData.name, type: fileData.type });
      } catch (err) {
        console.error("Error parsing stored file:", err);
      }
    }
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    try {
      setError(null);
      // Check if files exist
      if (!event.target.files || event.target.files.length === 0) {
        console.log("No file selected");
        return;
      }
      
      const selectedFile = event.target.files[0];
      
      if (selectedFile) {
        console.log("File selected:", selectedFile.name);
        setFile(selectedFile);
        
        // Store basic file info in session storage
        sessionStorage.setItem("uploadedFile", JSON.stringify({
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          lastModified: selectedFile.lastModified
        }));
        
        // Check if setUploadedFile prop exists before calling it
        if (typeof setUploadedFile === 'function') {
          setUploadedFile(selectedFile);
        } else {
          console.warn("setUploadedFile is not provided as a function prop");
          // Continue anyway since we're storing the file in state and sessionStorage
        }
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      setError("There was a problem selecting your file. Please try again.");
    }
  };

  // Handle mouse enter
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Handle drag enter event
  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  // Handle drag leave event
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  // Handle drag over event
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  // Direct file upload via drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    try {
      setError(null);
      if (!event.dataTransfer.files || event.dataTransfer.files.length === 0) {
        console.log("No file dropped");
        return;
      }
      
      const droppedFile = event.dataTransfer.files[0];
      
      if (droppedFile) {
        console.log("File dropped:", droppedFile.name);
        setFile(droppedFile);
        
        // Store in session storage
        sessionStorage.setItem("uploadedFile", JSON.stringify({
          name: droppedFile.name,
          type: droppedFile.type,
          size: droppedFile.size,
          lastModified: droppedFile.lastModified
        }));
        
        if (typeof setUploadedFile === 'function') {
          setUploadedFile(droppedFile);
        }
      }
    } catch (error) {
      console.error("Error handling dropped file:", error);
      setError("There was a problem with the dropped file. Please try again.");
    }
  };

  // Handle file upload click
  const handleUploadClick = () => {
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      console.log("Triggering file input click");
      fileInput.click();
    } else {
      console.error("File input element not found");
      setError("There was a problem with the file selector. Please refresh and try again.");
    }
  };

  // Navigate to preview page
  const handleNext = () => {
    if (file) {
      // Set active step in session storage for the workflow
      sessionStorage.setItem("activeStep", "2");
      navigate("/preview");
    } else {
      setError("Please select a file first.");
    }
  };

  // Get the appropriate style class based on interaction state
  const getUploadAreaClass = () => {
    if (isDragging) {
      return "border-blue-600 bg-blue-200";
    } else if (isHovering) {
      return "border-blue-500 bg-blue-200";
    } else {
      return "border-blue-400 bg-blue-100";
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-500 flex flex-col items-center relative">
      {/* Watermark */}
      {/* <img src={logo} alt="Watermark" className="absolute opacity-10 top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4" /> */}

      {/* Header */}
      <header className="w-full flex justify-between items-center p-4 bg-blue-500 shadow-md">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-10" />
          <h1 className="text-2xl font-bold text-white">MYPRINTCORNER.COM</h1>
        </div>
        <button className="text-blue-500 bg-white px-4 py-2 rounded-lg hover:bg-gray-200"> Sign In</button>
      </header>
      
      {/* Main Content */}
      <div className="w-4/5 mt-6 text-center">
        <h1 className="text-xl text-blue-600 font-semibold">"Printing your ideas, shaping your future."</h1>
        
        {/* Upload Box Centered */}
        <div className="flex justify-center mt-6">
          <div 
            className={`flex flex-col items-center justify-center w-80 h-40 border-2 border-dashed ${getUploadAreaClass()} rounded-xl transition-all duration-200 cursor-pointer shadow-lg`}
            onClick={handleUploadClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <UploadCloud size={40} className={`${isHovering || isDragging ? 'text-blue-600' : 'text-blue-500'} mb-2 transition-colors duration-200`} />
            <span className={`${isHovering || isDragging ? 'text-blue-700' : 'text-blue-600'} font-semibold transition-colors duration-200`}>
              {isDragging ? 'Drop Your File Here' : 'Click or Drop a File Here'}
            </span>
            <input 
              id="file-upload"
              type="file" 
              className="hidden" 
              onChange={handleFileChange}
              accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />
            <p className={`text-xs ${isHovering || isDragging ? 'text-blue-500' : 'text-blue-400'} mt-2 transition-colors duration-200`}>
              PDF, Images, Word & Excel files accepted
            </p>
          </div>
        </div>
        
        {/* Debug information during development - remove in production */}
        <div className="mt-4 text-xs text-gray-500">
          Hover: {isHovering ? 'Yes' : 'No'} | Dragging: {isDragging ? 'Yes' : 'No'}
        </div>
        
        {/* Error message if any */}
        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-2 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Show Selected File */}
        {file && (
          <div className="mt-4 flex items-center gap-2 bg-blue-200 px-4 py-2 rounded-lg shadow-md">
            <CheckCircle size={20} className="text-green-500" />
            <p className="text-blue-700 font-medium">{file.name}</p>
          </div>
        )}
        
        {/* Centered Next Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleNext}
            disabled={!file}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-white font-semibold transition ${
              file ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Next <ArrowRight size={20} />
          </button>
        </div>
        
        {/* How It Works */}
        <div className="mt-12 bg-gray-100 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-black mb-4 text-center">How It Works</h1>
          <div className="flex justify-between text-center gap-6">
            <div className="flex-1">
              <FileUp size={40} className="text-blue-500 mx-auto" />
              <h3 className="text-xl font-bold text-black mt-2">1. Upload Your Files</h3>
              <p className="text-gray-700 mt-1">Choose your file and specify print settings.</p>
            </div>
            <div className="flex-1">
              <Store size={40} className="text-blue-500 mx-auto" />
              <h3 className="text-xl font-bold text-black mt-2">2. Select a Print Shop</h3>
              <p className="text-gray-700 mt-1">Receive a unique code to access your print-ready files.</p>
            </div>
            <div className="flex-1">
              <Printer size={40} className="text-blue-500 mx-auto" />
              <h3 className="text-xl font-bold text-black mt-2">3. Share & Print</h3>
              <p className="text-gray-700 mt-1">Show the code at the shop and get your documents printed instantly.</p>
            </div>
          </div>
        </div>

        {/* Become Partner With Us */}
        <div className="mt-12 bg-gray-100 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-blue-600 mb-4 text-center">Become Partner With Us</h1>
          <p className="text-gray-700 text-center">Join our network of trusted printing partners.</p>
          <p className="text-gray-700 text-center">Expand your reach and grow your business with us!</p>
          <p className="text-gray-700 text-center">Becoming a partner with My Print Corner connects your print shop to a growing community of customers who need secure, reliable, and affordable paper printing services.</p>
        </div>

        {/* WHY PARTNER WITH US Section */}
        <div className="mt-12 bg-gray-100 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-black mb-4 text-center">Why Partner With Us?</h1>
          <ul className="text-gray-700 text-center list-disc list-inside mt-2">
            <li>Increase your customer base: Gain access to a steady stream of local and online customers.</li>
            <li>Boost your Revenue: Receive more print jobs effortlessly.</li>
            <li>Seamless Integration: Our platform makes onboarding and order management simple.</li>
            <li>No Upfront Costs: Join our network for free and start earning instantly.</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 w-full p-4 bg-blue-500 text-center text-white font-medium">
        &copy; 2025 MYPRINTCORNER.COM. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Upload;
