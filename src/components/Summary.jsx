  import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, MinusCircle, PlusCircle, Edit, FileText } from "lucide-react";
import logo from "./print.jpeg";

const Summary = () => {
  const [quantity, setQuantity] = useState(2);
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState({
    shop: "Quick Print Hub",
    guestId: "guest_1738786781200",
    code: "7250",
    fileName: "Screenshot from 2025-01-08 17-16-33.png",
    fileFormat: "A4, B&W",
    unitPrice: 1,
    subtotal: 2.00,
    discount: -0.40,
    deliveryFee: 0,
    total: 1.60
  });

  // Handle quantity change
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      recalculateTotal(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
    recalculateTotal(quantity + 1);
  };

  // Recalculate order total
  const recalculateTotal = (newQuantity) => {
    const newSubtotal = orderDetails.unitPrice * newQuantity;
    const newDiscount = newSubtotal * 0.2; // 20% discount
    
    setOrderDetails({
      ...orderDetails,
      subtotal: newSubtotal.toFixed(2),
      discount: -newDiscount.toFixed(2),
      total: (newSubtotal - newDiscount).toFixed(2)
    });
  };

  // Navigate to previous step
  const goToPrevious = () => {
    navigate("/location");
  };

  // Navigate to next step (typically checkout or confirmation)
  const goToNext = () => {
    // Here you would typically process the order
    alert("Order placed successfully! Your code is: " + orderDetails.code);
  };

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
          
          {/* Step 3 - Complete */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
              <CheckCircle size={20} />
            </div>
            <span className="text-blue-600 mt-2">Location</span>
          </div>
          <div className="flex-1 h-1 bg-blue-500 mx-2"></div>
          
          {/* Step 4 - Current */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              4
            </div>
            <span className="text-blue-600 mt-2">Summary</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="w-full max-w-4xl px-4">
        {/* Shop Selection Info */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold">Shop Selected: {orderDetails.shop}</h2>
            <p className="text-gray-600">{orderDetails.guestId}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Your Unique Code</p>
            <p className="text-xl font-bold text-blue-600">{orderDetails.code}</p>
          </div>
        </div>
        
        {/* File Details */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6 flex items-center">
          <div className="bg-white p-3 rounded mr-4">
            <FileText size={24} className="text-gray-700" />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium">{orderDetails.fileName}</h3>
            <p className="text-sm text-gray-600">{orderDetails.fileFormat}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium">${orderDetails.unitPrice}</span>
            <button onClick={decreaseQuantity} className="text-gray-500 hover:text-gray-700">
              <MinusCircle size={20} />
            </button>
            <span className="w-6 text-center">{quantity}</span>
            <button onClick={increaseQuantity} className="text-gray-500 hover:text-gray-700">
              <PlusCircle size={20} />
            </button>
            <button className="text-blue-500 hover:text-blue-700 ml-2">
              <Edit size={20} />
            </button>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${orderDetails.subtotal}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>1st Order Discount (-20%)</span>
              <span>${orderDetails.discount}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>${orderDetails.deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>${orderDetails.total}</span>
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mb-8">
          <button
            className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded"
            onClick={goToPrevious}
          >
            Previous
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            onClick={goToNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Summary;
