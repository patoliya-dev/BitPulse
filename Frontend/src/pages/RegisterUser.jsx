import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import axios from "axios";

const RegisterUser = () => {
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

  // Load face-api models once
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    };
    loadModels();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
      setShowWebcam(false);
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

  // Eye aspect ratio (EAR) for open/closed eyes
  const calcEAR = (eye) => {
    const A = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
    const B = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
    const C = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
    return (A + B) / (2.0 * C);
  };

  // Validate inputs
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

  // Face validation (must face forward + eyes open)
  const validateFace = async () => {
    const img = await faceapi.fetchImage(photo);
    const detections = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      alert("No face detected! Please face the camera.");
      return false;
    }

    const landmarks = detections.landmarks;

    // Face orientation check
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNose()[3]; // nose tip

    const eyeDistance = Math.abs(leftEye[0].x - rightEye[3].x);
    const noseCenter = (leftEye[3].x + rightEye[0].x) / 2;

    if (Math.abs(nose.x - noseCenter) > eyeDistance * 0.25) {
      alert("Please face the camera directly!");
      return false;
    }

    // Eye openness check
    const leftEAR = calcEAR(leftEye);
    const rightEAR = calcEAR(rightEye);
    const ear = (leftEAR + rightEAR) / 2.0;

    if (ear < 0.2) {
      alert("Please keep your eyes open!");
      return false;
    }

    return detections.descriptor; // embedding vector
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const embedding = await validateFace();
    if (!embedding) return;

    await axios.post("http://localhost:5000/register", {
      ...form,
      photo,
      embedding: Array.from(embedding),
    });

    alert("User registered successfully 🎉");

    // Reset form
    setForm({ firstName: "", lastName: "", email: "", phone: "", password: "" });
    setPhoto(null);
    setShowWebcam(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6">
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
          <label className="font-semibold text-lg block mb-3">
            Profile Photo
          </label>

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
                    className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
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
              <img
                src={photo}
                alt="Selected"
                className="w-40 h-40 object-cover rounded-full border-4 border-pink-500 shadow-lg"
              />
              <button
                onClick={deletePhoto}
                className="absolute top-0 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
              >
                X
              </button>
            </div>
          )}
          {errors.photo && (
            <p className="text-red-500 text-sm">{errors.photo}</p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleRegister}
          className="w-full mt-6 bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default RegisterUser;
