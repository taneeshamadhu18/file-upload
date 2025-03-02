import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import heic2any from "heic2any";
import { ArrowLeft, ArrowRight, Download, Settings, Image, FileText, FileSpreadsheet, Plus, X } from "lucide-react";

const Preview = ({ uploadedFile }) => {
  const [activeStep, setActiveStep] = useState(2); // Assuming 1=Upload, 2=Settings, 3=Location, 4=Summary
  const [border, setBorder] = useState("border-none");
  const [bgColor, setBgColor] = useState("bg-white");
  const [colorMode, setColorMode] = useState("bw"); // Default to B&W
  const [orientation, setOrientation] = useState("portrait"); // Default to portrait
  const [margin, setMargin] = useState("normal"); // Default to normal margin
  const [zoomLevel, setZoomLevel] = useState(100); // Default zoom level at 100%
  const [files, setFiles] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [error, setError] = useState(null);
  const [showDropzone, setShowDropzone] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (uploadedFile) {
      setFiles([uploadedFile]);
    } else {
      const storedFiles = sessionStorage.getItem("uploadedFiles");
      if (storedFiles) {
        setFiles(JSON.parse(storedFiles));
      }
    }
  }, [uploadedFile]);

  useEffect(() => {
    if (files.length > 0) {
      previewFile(files[activeFileIndex]);
      // Save files to session storage
      sessionStorage.setItem("uploadedFiles", JSON.stringify(files));
    }
  }, [files, activeFileIndex]);

  // Apply filters based on colorMode
  const applyColorFilter = (element) => {
    if (colorMode === "bw" && element) {
      // Apply grayscale filter to the preview container
      element.style.filter = "grayscale(100%)";
    } else if (element) {
      // Remove any filters
      element.style.filter = "none";
    }
  };

  // Apply color filter when colorMode changes
  useEffect(() => {
    const previewElement = document.getElementById("preview-content");
    applyColorFilter(previewElement);
  }, [colorMode]);
  
  // Apply initial B&W filter when component mounts
  useEffect(() => {
    if (colorMode === "bw") {
      const previewElement = document.getElementById("preview-content");
      applyColorFilter(previewElement);
    }
  }, [previewContent]);

  // Function to Convert HEIC to JPEG
  const convertHeicToJpeg = async (file) => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const blob = new Blob([event.target.result]);
            // Make sure to handle both blob and array of blobs that heic2any might return
            const convertedBlob = await heic2any({
              blob,
              toType: "image/jpeg",
              quality: 0.8
            });
            
            // Handle both single blob and array of blobs
            const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            
            const convertedFile = new File(
              [resultBlob],
              file.name.replace(/\.heic$/i, ".jpg"),
              { type: "image/jpeg" }
            );
            resolve(URL.createObjectURL(convertedFile));
          } catch (error) {
            console.error("HEIC conversion processing error:", error);
            reject(error);
          }
        };
        reader.onerror = (error) => {
          console.error("File reading error:", error);
          reject(error);
        };
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error("HEIC conversion error:", error);
      throw error;
    }
  };

  // Function to Handle File Preview
  const previewFile = async (file) => {
    setError(null);
    setPreviewContent(null);
    
    try {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      // Handle HEIC files by extension since some browsers might not recognize the MIME type
      if (fileType === "image/heic" || fileName.endsWith(".heic") || fileName.endsWith(".heif")) {
        try {
          const convertedUrl = await convertHeicToJpeg(file);
          setPreviewType("image");
          setPreviewContent(convertedUrl);
        } catch (error) {
          console.error("HEIC conversion error:", error);
          setError("Failed to convert HEIC image. Try downloading the file instead.");
          setPreviewContent(null);
        }
      } 
      // Handle regular images
      else if (fileType.includes("image")) {
        setPreviewType("image");
        setPreviewContent(URL.createObjectURL(file));
      } 
      // Handle PDF files
      else if (fileType.includes("pdf")) {
        setPreviewType("pdf");
        setPreviewContent(URL.createObjectURL(file));
      } 
      // Handle Word documents
      else if (
        fileType.includes("officedocument.wordprocessingml.document") || 
        fileName.endsWith(".docx")
      ) {
        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const arrayBuffer = event.target.result;
              const result = await mammoth.convertToHtml({ arrayBuffer });
              setPreviewType("docx");
              setPreviewContent(result.value);
            } catch (conversionError) {
              console.error("Word document conversion error:", conversionError);
              setError("Failed to convert Word document. Try downloading the file instead.");
              setPreviewContent(null);
            }
          };
          reader.onerror = (fileReadError) => {
            console.error("File reading error:", fileReadError);
            setError("Error reading the file. Try downloading it instead.");
          };
          reader.readAsArrayBuffer(file);
        } catch (error) {
          console.error("Word document handling error:", error);
          setError("Failed to process Word document. Try downloading the file instead.");
        }
      } 
      // Handle Excel files
      else if (fileType.includes("officedocument.spreadsheetml.sheet") || fileName.endsWith(".xlsx")) {
        try {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = new Uint8Array(event.target.result);
              const workbook = XLSX.read(data, { type: "array" });
              const sheetName = workbook.SheetNames[0];
              const sheet = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);
              setPreviewType("xlsx");
              setPreviewContent(sheet);
            } catch (conversionError) {
              console.error("Excel conversion error:", conversionError);
              setError("Failed to convert Excel file. Try downloading the file instead.");
            }
          };
          reader.onerror = (fileReadError) => {
            console.error("File reading error:", fileReadError);
            setError("Error reading the file. Try downloading it instead.");
          };
          reader.readAsArrayBuffer(file);
        } catch (error) {
          console.error("Excel handling error:", error);
          setError("Failed to process Excel file. Try downloading the file instead.");
        }
      } 
      // No preview available for other file types
      else {
        setPreviewType(null);
        setPreviewContent(null);
        setError("Preview not available for this file type.");
      }
    } catch (error) {
      console.error("Preview generation error:", error);
      setError("An error occurred while generating the preview.");
      setPreviewContent(null);
    }
  };

  // Handler for file input change
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setActiveFileIndex(files.length); // Set active file to the newly added file
      setShowDropzone(false);
    }
  };

  // Handler for drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const newFiles = Array.from(event.dataTransfer.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setActiveFileIndex(files.length); // Set active file to the newly added file
      setShowDropzone(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const addMoreFiles = () => {
    setShowDropzone(true);
  };

  // Remove a file from the list
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    
    setFiles(newFiles);
    
    // Adjust active file index if needed
    if (newFiles.length === 0) {
      setActiveFileIndex(-1);
    } else if (activeFileIndex >= newFiles.length) {
      setActiveFileIndex(newFiles.length - 1);
    }
  };

  const goToNext = () => {
    // Save current settings to session storage
    sessionStorage.setItem("previewSettings", JSON.stringify({
      border,
      bgColor,
      colorMode,
      orientation,
      margin,
      zoomLevel,
    }));
    
    setActiveStep(3); // Go to location step
    navigate("/location");
  };

  const goToPrevious = () => {
    // Instead of navigating to root, we'll go back to upload page but preserve state
    if (files.length > 0) {
      sessionStorage.setItem("uploadedFiles", JSON.stringify(files));
      sessionStorage.setItem("activeStep", "1");
      sessionStorage.setItem("previewSettings", JSON.stringify({
        border,
        bgColor,
        colorMode,
        orientation,
        margin,
        zoomLevel
      }));
    }
    
    // Navigate to upload page
    navigate("/upload", { state: { fromPreview: true } });
  };

  // Handle orientation change
  const handleOrientationChange = (newOrientation) => {
    setOrientation(newOrientation.toLowerCase());
  };

  // Handle margin change
  const handleMarginChange = (newMargin) => {
    setMargin(newMargin.toLowerCase());
    setBgColor("bg-white"); // Reset background color as we'll use padding instead
  };

  // Handle zoom change
  const handleZoomChange = (e) => {
    setZoomLevel(parseInt(e.target.value, 10));
  };

  // Handle color mode change
  const handleColorModeChange = (e) => {
    const newColorMode = e.target.value === "B&W" ? "bw" : "color";
    setColorMode(newColorMode);
    
    // Immediately apply the filter after state change
    setTimeout(() => {
      const previewElement = document.getElementById("preview-content");
      if (newColorMode === "bw" && previewElement) {
        previewElement.style.filter = "grayscale(100%)";
      } else if (previewElement) {
        previewElement.style.filter = "none";
      }
    }, 0);
  };

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-blue-800">
        <p>No file uploaded. Go back to upload.</p>
        <button className="ml-2 bg-blue-500 px-4 py-2 rounded text-white" onClick={() => navigate("/upload")}>
          Go Back
        </button>
      </div>
    );
  }

  // Icon based on file type
  const getFileIcon = (file) => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    
    if (fileType.includes("image") || fileName.endsWith(".heic") || fileName.endsWith(".heif")) 
      return <Image className="text-blue-500" size={20} />;
    if (fileType.includes("pdf")) 
      return <FileText className="text-blue-500" size={20} />;
    if (fileType.includes("wordprocessingml") || fileName.endsWith(".docx")) 
      return <FileText className="text-blue-500" size={20} />;
    if (fileType.includes("spreadsheetml") || fileName.endsWith(".xlsx")) 
      return <FileSpreadsheet className="text-blue-500" size={20} />;
    return <FileText className="text-blue-400" size={20} />;
  };

  // Get appropriate class based on orientation
  const getOrientationClasses = () => {
    if (orientation === "landscape") {
      return "transform rotate-90 origin-center max-w-full";
    }
    return "";
  };

  // Get appropriate padding based on margin setting
  const getMarginClasses = () => {
    switch (margin) {
      case "narrow":
        return "p-2";
      case "wide":
        return "p-8";
      case "normal":
      default:
        return "p-4";
    }
  };

  // Get zoom style for content
  const getZoomStyle = () => {
    return {
      transform: `scale(${zoomLevel / 100})`,
      transformOrigin: 'top left',
      transition: 'transform 0.2s ease-in-out'
    };
  };

  // Get container classes based on orientation and margin
  const getContainerClasses = () => {
    return `border ${bgColor} w-full h-full max-h-96 overflow-auto ${
      orientation === "landscape" ? "flex items-center justify-center" : ""
    } ${getMarginClasses()}`;
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-blue-800 p-6">
      {/* Logo */}
      <div className="flex items-center mb-8">
        <img src="src/components/print.jpeg" alt="Logo" className="h-8 w-8" />
      </div>

      {/* Process Steps */}
      <h1 className="text-2xl font-bold mb-6">Process</h1>
      
      <div className="w-full max-w-3xl flex justify-between items-center mb-10">
        <div className={`flex flex-col items-center ${activeStep >= 1 ? 'text-blue-500' : 'text-gray-400'}`}>
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${activeStep > 1 ? 'bg-blue-500' : activeStep === 1 ? 'bg-blue-500' : 'bg-gray-200'}`}
            onClick={() => {
              sessionStorage.setItem("activeStep", "1");
              navigate("/upload");
            }}
          >
            {activeStep > 1 ? '✓' : '1'}
          </div>
          <span className="mt-1">Upload</span>
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-2">
          <div className={`h-full bg-blue-500 ${activeStep > 1 ? 'w-full' : 'w-0'}`}></div>
        </div>
        <div className={`flex flex-col items-center ${activeStep >= 2 ? 'text-blue-500' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep > 2 ? 'bg-blue-500' : activeStep === 2 ? 'bg-blue-500' : 'bg-gray-200'}`}>
            {activeStep > 2 ? '✓' : '2'}
          </div>
          <span className="mt-1">Settings</span>
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-2">
          <div className={`h-full bg-blue-500 ${activeStep > 2 ? 'w-full' : 'w-0'}`}></div>
        </div>
        <div className={`flex flex-col items-center ${activeStep >= 3 ? 'text-blue-500' : 'text-gray-400'}`}>
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${activeStep > 3 ? 'bg-blue-500' : activeStep === 3 ? 'bg-blue-500' : 'bg-gray-200'}`}
            onClick={() => {
              if (activeStep > 3) {
                sessionStorage.setItem("activeStep", "3");
                navigate("/location");
              }
            }}
          >
            {activeStep > 3 ? '✓' : '3'}
          </div>
          <span className="mt-1">Location</span>
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-2">
          <div className={`h-full bg-blue-500 ${activeStep > 3 ? 'w-full' : 'w-0'}`}></div>
        </div>
        <div className={`flex flex-col items-center ${activeStep >= 4 ? 'text-blue-500' : 'text-gray-400'}`}>
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${activeStep === 4 ? 'bg-blue-500' : 'bg-gray-200'}`}
            onClick={() => {
              if (activeStep > 3) {
                sessionStorage.setItem("activeStep", "4");
                navigate("/summary");
              }
            }}
          >
            4
          </div>
          <span className="mt-1">Summary</span>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        {/* Two column layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - File options and controls */}
          <div className="w-full md:w-2/5">
            {/* File List */}
            <div className="bg-blue-50 rounded-md p-4 mb-6 shadow">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium">Files ({files.length})</h2>
                <button
                  className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 transition flex items-center text-sm"
                  onClick={addMoreFiles}
                >
                  <Plus size={16} className="mr-1" /> Add More
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {files.map((file, index) => (
                  <div 
                    key={`${file.name}-${index}`} 
                    className={`flex items-center justify-between p-2 mb-1 rounded ${activeFileIndex === index ? 'bg-blue-100' : 'bg-white'} cursor-pointer shadow-sm`}
                    onClick={() => setActiveFileIndex(index)}
                  >
                    <div className="flex items-center overflow-hidden">
                      {getFileIcon(file)}
                      <span className="ml-2 truncate text-sm">{file.name}</span>
                    </div>
                    <button 
                      className="text-gray-400 hover:text-red-500 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Files Dropzone (Hidden by default) */}
            {showDropzone && (
              <div
                className="border-2 border-dashed border-blue-300 rounded-md p-4 mb-6 flex flex-col items-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
                
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition mb-3 w-full"
                  onClick={() => fileInputRef.current.click()}
                >
                  Browse Files
                </button>
                
                <p className="text-center text-blue-500 mb-2">or drop files here</p>
                
                <button
                  className="text-blue-500 hover:text-blue-600"
                  onClick={() => setShowDropzone(false)}
                >
                  Cancel
                </button>
                
                <p className="text-xs text-blue-400 text-center mt-2">
                  Supported formats: PDF, Office (DOCX, XLSX), Images (JPG, PNG, WEBP)
                </p>
              </div>
            )}

            {/* Print Options Panel */}
            {files.length > 0 && activeFileIndex >= 0 && (
              <div className="bg-blue-50 rounded-md p-4 mb-6 shadow">
                <h2 className="text-lg font-medium mb-3">Print Options</h2>
                
                <div className="mb-3">
                  <label className="block text-sm mb-1">Pages</label>
                  <select className="bg-white border border-blue-200 rounded-md p-2 w-full text-blue-800">
                    <option>All</option>
                    <option>Custom Range</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm mb-1">Color</label>
                  <select 
                    className="bg-white border border-blue-200 rounded-md p-2 w-full text-blue-800"
                    value={colorMode === "bw" ? "B&W" : "Color"}
                    onChange={handleColorModeChange}
                  >
                    <option>B&W</option>
                    <option>Color</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm mb-1">Orientation</label>
                  <select 
                    className="bg-white border border-blue-200 rounded-md p-2 w-full text-blue-800"
                    value={orientation === "portrait" ? "Portrait" : "Landscape"}
                    onChange={(e) => handleOrientationChange(e.target.value)}
                  >
                    <option>Portrait</option>
                    <option>Landscape</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm mb-1">Margin</label>
                  <select 
                    className="bg-white border border-blue-200 rounded-md p-2 w-full text-blue-800"
                    value={margin.charAt(0).toUpperCase() + margin.slice(1)}
                    onChange={(e) => handleMarginChange(e.target.value)}
                  >
                    <option>Normal</option>
                    <option>Narrow</option>
                    <option>Wide</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Zoom ({zoomLevel}%)</label>
                  <div className="flex items-center">
                    <span className="text-sm mr-2">50%</span>
                    <input 
                      type="range" 
                      min="50" 
                      max="200" 
                      value={zoomLevel}
                      onChange={handleZoomChange}
                      className="w-full accent-blue-500" 
                    />
                    <span className="text-sm ml-2">200%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column - File preview */}
          <div className="w-full md:w-3/5 bg-blue-50 rounded-md min-h-64 flex items-center justify-center shadow">
            {/* File preview content */}
            {previewContent && files.length > 0 && activeFileIndex >= 0 ? (
              <div id="preview-content" className={getContainerClasses()}>
                {/* Images (including converted HEIC) */}
                {previewType === "image" && (
                  <div className="flex justify-center" style={getZoomStyle()}>
                    <img 
                      src={previewContent} 
                      alt="Uploaded" 
                      className={`max-w-full max-h-80 object-contain ${getOrientationClasses()}`} 
                    />
                  </div>
                )}

                {/* PDF Preview */}
                {previewType === "pdf" && (
                  <div className={`w-full h-96 ${orientation === "landscape" ? "transform -rotate-90 scale-75" : ""}`}>
                    <iframe 
                      src={`${previewContent}#zoom=${zoomLevel/100}`} 
                      className={`w-full h-full border-0 ${orientation === "landscape" ? "transform rotate-90" : ""}`}
                      title="PDF Preview"
                    ></iframe>
                  </div>
                )}

                {/* Word Document Preview */}
                {previewType === "docx" && (
                  <div 
                    className={`bg-white text-black h-full overflow-auto ${getOrientationClasses()}`}
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                    style={getZoomStyle()}
                  ></div>
                )}

                {/* Excel Sheet Preview */}
                {previewType === "xlsx" && (
                  <div 
                    className={`bg-white text-black h-full overflow-auto ${getOrientationClasses()}`}
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                    style={getZoomStyle()}
                  ></div>
                )}
              </div>
            ) : (
              // No preview placeholder
              <div className="text-center p-6">
                <p className="text-blue-500 mb-2">
                  {files.length === 0 
                    ? "No files uploaded. Add files to preview." 
                    : "Select a file to preview."}
                </p>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            className="bg-white border border-blue-500 hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-md flex items-center shadow"
            onClick={goToPrevious}
          >
            <ArrowLeft size={16} className="mr-2" /> Previous
          </button>
          
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center shadow"
            onClick={goToNext}
          >
            Next <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preview;