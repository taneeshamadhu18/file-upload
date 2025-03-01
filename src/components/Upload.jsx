import { useState } from "react"; 
import { useNavigate } from "react-router-dom"; 
import { UploadCloud, CheckCircle, ArrowRight } from "lucide-react"; // Icons for better UI  

const Upload = ({ setUploadedFile }) => {
 const [file, setFile] = useState(null);
 const navigate = useNavigate();
 
 // Handle file selection
 const handleFileChange = (event) => {
   const selectedFile = event.target.files[0];
   if (selectedFile) {
     setFile(selectedFile);
     setUploadedFile(selectedFile);
   }
 };
 
 // Navigate to preview page
 const handleNext = () => {
   if (file) navigate("/preview");
 };
 
 return (
   <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
     <h1 className="text-3xl font-bold mb-6 text-gray-100">Upload a File</h1>
     
     {/* Upload Box */}
     <label className="flex flex-col items-center justify-center w-80 h-40 border-2 border-dashed border-gray-500 rounded-xl bg-gray-800 hover:bg-gray-700 transition cursor-pointer shadow-md">
       <UploadCloud size={40} className="text-gray-300 mb-2" />
       <span className="text-gray-300 font-semibold">Click to Select a File</span>
       <input type="file" className="hidden" onChange={handleFileChange} />
     </label>
     
     {/* Show Selected File */}
     {file && (
       <div className="mt-4 flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg shadow-md">
         <CheckCircle size={20} className="text-green-400" />
         <p className="text-gray-200">{file.name}</p>
       </div>
     )}
     
     {/* Next Button */}
     <button
       onClick={handleNext}
       disabled={!file}
       className={`mt-6 flex items-center gap-2 px-5 py-2 rounded-full text-white font-semibold transition ${
         file ? "bg-green-500 hover:bg-green-600" : "bg-gray-600 cursor-not-allowed"
       }`}
     >
       Next <ArrowRight size={20} />
     </button>
   </div>
 );
};

export default Upload;
