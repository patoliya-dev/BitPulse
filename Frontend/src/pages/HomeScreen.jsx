import React from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react"; // nice icon

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center text-white px-6">
      {/* Hero Section */}
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
          Face Recognition Attendance System
        </h1>
        <p className="mt-6 text-lg md:text-xl font-medium text-gray-100">
          Say goodbye to manual registers 🚀. Our system makes attendance
          secure, fast, and fully automated using <span className="font-semibold text-yellow-300">AI face recognition</span>.
        </p>
      </div>

      {/* Illustration / Icon */}
      <div className="relative mt-10 w-72 h-72 md:w-96 md:h-96">
        <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative flex items-center justify-center w-full h-full bg-white/10 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20">
          <Camera className="w-20 h-20 text-yellow-300 animate-bounce" />
        </div>
      </div>

      {/* Call to Action */}
      <button
        onClick={() => navigate("/attendanceFace")}
        className="mt-10 px-8 py-4 bg-yellow-400 text-indigo-900 font-bold rounded-full shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
      >
        Start Attendance
      </button>

      {/* Footer Info */}
      <p className="mt-8 text-sm text-gray-200">
        Powered by <span className="font-semibold">face-api.js</span> + AI 🔥
      </p>
    </div>
  );
};

export default HomeScreen;
