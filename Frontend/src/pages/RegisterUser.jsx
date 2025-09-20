// RegisterUser.jsx
import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import axios from "axios";
import { API_URL } from "../constants";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti-boom";

const RegisterUser = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [photo, setPhoto] = useState(null);
  const [showWebcam, setShowWebcam] = useState(true);
  const webcamRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showBoom, setShowBoom] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);


useEffect(() => {
  const MODEL_URL = "/models"; // direct path to public/models

  const loadModels = async () => {
    try {
      console.log("Loading models from:", MODEL_URL);

      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      console.log("✅ ssdMobilenetv1 loaded");

      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      console.log("✅ faceLandmark68Net loaded");

      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log("✅ faceRecognitionNet loaded");

      setModelsLoaded(true);
      console.log(modelsLoaded);
    } catch (err) {
      console.error("❌ Failed to load a model", err);
      alert("Failed to load face models. Check console and public/models folder.");
    }
  };

  loadModels();
}, []);

  // ---------- Helpers ----------
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // use dataURL so face-api can load it reliably
      const reader = new FileReader();
      reader.onload = () => {
        setPhoto(reader.result);
        setShowWebcam(false);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const captureWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
    setShowWebcam(false);
  };

  const deletePhoto = () => {
    setPhoto(null);
    setShowWebcam(true);
  };

  // EAR (eye aspect ratio)
  const calcEAR = (eye) => {
    // eye is an array of 6 points (x,y), order from face-api is consistent
    const A = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
    const B = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
    const C = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
    return (A + B) / (2.0 * C);
  };

  // Validate fields (same as you had)
  const validate = () => {
    let temp = {};
    if (!form.firstName) temp.firstName = "First name is required";
    if (!form.lastName) temp.lastName = "Last name is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      temp.email = "Valid email is required";
    if (!form.phone || !/^\d{10}$/.test(form.phone))
      temp.phone = "Valid 10-digit phone is required";
    if (!form.password || form.password.length < 6)
      temp.password = "Password must be at least 6 characters";
    if (!photo) temp.photo = "Profile photo is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // Create HTMLImageElement from a dataURL or blob URL (robust)
  const createImageElement = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
    });
  };

  // ---------- Face validation: orientation + EAR + descriptor ----------
  const validateFace = async () => {
    if (!modelsLoaded) {
      alert("Face models not loaded yet. Please wait a few seconds.");
      return false;
    }
    if (!photo) {
      alert("Please capture or upload a photo first.");
      return false;
    }

    try {
      // convert src -> HTMLImageElement (more robust than fetchImage in some cases)
      const img = await createImageElement(photo);

      // detect single face with landmarks and descriptor
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        alert("No face detected. Please face the camera directly.");
        return false;
      }

      const landmarks = detection.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const nose = landmarks.getNose()[3]; // approximate nose tip

      // Orientation check: nose should be near the midpoint between eyes
      const leftEyeAvgX = (leftEye[0].x + leftEye[3].x) / 2;
      const rightEyeAvgX = (rightEye[0].x + rightEye[3].x) / 2;
      const eyeCenterX = (leftEyeAvgX + rightEyeAvgX) / 2;
      const eyeDistance = Math.abs(leftEyeAvgX - rightEyeAvgX);

      if (Math.abs(nose.x - eyeCenterX) > eyeDistance * 0.28) {
        // 0.28 is a lenient tolerance; tweak if needed
        alert("Please face the camera directly (turn head less).");
        return false;
      }

      // Eye openness check (EAR)
      const leftEAR = calcEAR(leftEye);
      const rightEAR = calcEAR(rightEye);
      const ear = (leftEAR + rightEAR) / 2.0;
      console.log("EAR left:", leftEAR.toFixed(3), "right:", rightEAR.toFixed(3), "avg:", ear.toFixed(3));

      // Thresholds: tune these on your dataset / camera
      const EAR_OPEN_THRESHOLD = 0.23; // if avg < this, eyes likely closed
      if (ear < EAR_OPEN_THRESHOLD) {
        alert("Please keep your eyes open (no blinking).");
        return false;
      }

      // Return descriptor (Float32Array)
      return detection.descriptor; 
    } catch (err) {
      console.error("validateFace error:", err);
      alert("Face validation failed. See console for details.");
      return false;
    }
  };

  // ---------- Register handler ----------
  const handleRegister = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const descriptor = await validateFace();
      if (!descriptor) {
        setBusy(false);
        return;
      }

      // Convert Float32Array to plain Array for JSON transport
      const embeddingArray = Array.from(descriptor);

      const payload = {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        password: form.password,
        registration_mode: "live",
        profile_pic_url: photo,
        attendance_pic_url: photo,
      }

      // send to backend
      await axios.post(`${API_URL}/users/register`, {
        ...payload,
      });

      setShowBoom(true);
      setShowThankYou(true);
      toast.success("Registration successful!");
      setTimeout(() => {
        setShowBoom(false);
      }, 1000);

    } catch (err) {
      console.error("register error:", err);
      alert("Registration failed. Check console for details.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
    {showBoom && <Confetti />}
    {showThankYou ? <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-green-400">Thank You! 🎉</h1>
      <p className="text-xl font-semibold mb-6">Your attendance has been recorded.</p>

      <a
        onClick={() => navigate("/login")}
        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition cursor-pointer"
      >
        Go to Login
      </a>
    </div>:<div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
          User Registration
        </h1>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            value={form.firstName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            value={form.lastName}
            onChange={handleChange}
          />
        </div>
        {errors.firstName && (
          <p className="text-red-500 text-sm">{errors.firstName}</p>
        )}
        {errors.lastName && (
          <p className="text-red-500 text-sm">{errors.lastName}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full mt-3 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          className="w-full mt-3 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          value={form.phone}
          onChange={handleChange}
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full mt-3 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          value={form.password}
          onChange={handleChange}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}

        {/* Photo Section */}
<div className="mt-6 text-center">
          <label className="font-semibold text-lg block mb-3">Profile Photo</label>
          {!photo ? (
            <div className="flex flex-col items-center gap-3">
              {showWebcam && (
                <div className="flex flex-col items-center">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded-full border-4 border-indigo-400 shadow-md w-40 h-40 object-cover"
                    videoConstraints={{ facingMode: "user" }}
                  />
                  <button
                    onClick={captureWebcam}
                    disabled={!modelsLoaded}
                    className={`mt-2 px-4 py-2 rounded-lg text-white ${modelsLoaded ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    Capture
                  </button>
                </div>
              )}
              <p className="text-gray-600">or</p>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="relative flex justify-center mt-3">
              <img src={photo} alt="Selected" className="w-40 h-40 object-cover rounded-full border-4 border-pink-500 shadow-lg" />
              <button onClick={deletePhoto} className="absolute top-0 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs">X</button>
            </div>
          )}
          {errors.photo && (<p className="text-red-500 text-sm">{errors.photo}</p>)}
        </div>

        <button onClick={handleRegister} disabled={busy || !modelsLoaded} className={`w-full mt-6 p-3 rounded-lg font-semibold ${busy || !modelsLoaded ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white`}>
          {busy ? "Registering..." : "Register"}
        </button>
      </div>
    </div>}
      
    </>
  );
};

export default RegisterUser;
