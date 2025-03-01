import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, CheckCircle, ArrowRight, Store, Printer, FileUp, MapPin } from "lucide-react";
import logo from "/home/taneesha1432/Desktop/file-upload-app/src/components/print.jpeg";

const location = () => {
  const [selectedShop, setSelectedShop] = useState(null);
  const navigate = useNavigate();

  // Navigate to summary page
  const goToNext = () => {
    // Save selected shop to session storage
    sessionStorage.setItem("selectedShop", JSON.stringify(selectedShop));
    navigate("/Summary");
  };

  // Get print settings from session storage
  const printSettings = JSON.parse(sessionStorage.getItem("previewSettings") || "{}");

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-4 bg-blue-500 shadow-md">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-12" />
          <h1 className="text-4xl font-bold text-white">MYPRINTCORNER.COM</h1>
        </div>
        <button className="text-blue-500 bg-white px-4 py-2 rounded-lg hover:bg-gray-200">Sign In</button>
      </header>
      
      {/* Navigation */}
      <nav className="w-full bg-white shadow-sm">
        <ul className="flex justify-center gap-8 p-4">
          <li><a href="#" className="text-blue-600 hover:text-blue-800">How It Works</a></li>
          <li><a href="#" className="text-blue-600 hover:text-blue-800">Account</a></li>
          <li><a href="#" className="text-blue-600 hover:text-blue-800">Feedback</a></li>
          <li><a href="#" className="text-blue-600 hover:text-blue-800">Contact Us</a></li>
        </ul>
      </nav>
      
      {/* Process Steps */}
      <div className="w-full max-w-4xl mt-8">
        <h2 className="text-xl font-medium mb-6 ml-4">Process</h2>
        <div className="flex items-center justify-between px-8 mb-8">
          {/* Step 1 - Complete */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
              <CheckCircle size={20} />
            </div>
            <span className="text-blue-600 mt-2">Upload</span>
          </div>
          <div className="flex-1 h-1 bg-blue-500 mx-2"></div>
          
          {/* Step 2 - Complete */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
              <CheckCircle size={20} />
            </div>
            <span className="text-blue-600 mt-2">Settings</span>
          </div>
          <div className="flex-1 h-1 bg-blue-500 mx-2"></div>
          
          {/* Step 3 - Current */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              3
            </div>
            <span className="text-blue-600 mt-2">location</span>
          </div>
          <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
          
          {/* Step 4 - Pending */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
              4
            </div>
            <span className="text-gray-500 mt-2">Summary</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="w-full max-w-4xl px-4">
        <h2 className="text-2xl font-bold mb-4">Select a Printer Shop</h2>
        <p className="text-gray-600 mb-6">Please select a printer shop from the list below or on the map.</p>
        
        {/* Map */}
        <div className="w-full h-72 bg-gray-200 rounded-lg mb-6">
          <iframe
            src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=Melbourne,Victoria"
            className="w-full h-full rounded-lg"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
        
        {/* Print Shop List */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((shop) => (
            <div 
              key={shop}
              className={`border rounded-lg overflow-hidden cursor-pointer ${selectedShop === shop ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'}`}
              onClick={() => setSelectedShop(shop)}
            >
              <img 
                src={`/api/placeholder/400/320`} 
                alt={`Print Shop ${shop}`} 
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <h3 className="font-bold">Print Shop {shop}</h3>
                <p className="text-sm text-gray-600">123 Street, Melbourne</p>
                <p className="text-sm text-gray-600">Open: 9AM - 6PM</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Next Button */}
        <div className="flex justify-end mb-8">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            onClick={goToNext}
            disabled={!selectedShop}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default location;