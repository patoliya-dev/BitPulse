import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const AttendanceScannerUI = () => {
  const webcamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [descriptorsLoaded, setDescriptorsLoaded] = useState(false);
  const [message, setMessage] = useState("Initializing...");
  const [showThankYou, setShowThankYou] = useState(false);
  const [scannerAnimation, setScannerAnimation] = useState(false);
  const [userList, setUserList] = useState([]);

  const registeredDescriptorsRef = useRef([]);
  const attendanceLogRef = useRef({});

  // Load face-api models
  useEffect(() => {
    const MODEL_URL = "/models";
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
      setMessage("Models loaded. Loading users...");
    };
    loadModels();
  }, []);

  // Send attendance to backend
  const sendAttendanceToBackend = async (id, status) => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/attendence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, status }),
      });
      const data = await response.json();
      console.log("✅ Attendance saved:", data);
    } catch (error) {
      console.error("❌ Error sending attendance:", error);
    }
  };

  // Load static user descriptors from backend
  useEffect(() => {
    if (!modelsLoaded) return;

    const loadDescriptors = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/users/list");
        const users = await response.json();
        setUserList(users.users || []);

        const labeledDescriptors = [];
        for (let user of users.users) {
          try {
            const img = await faceapi.fetchImage(user.profile_pic_url);
            const detection = await faceapi
              .detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detection) {
              labeledDescriptors.push(
                new faceapi.LabeledFaceDescriptors(user.email, [
                  detection.descriptor,
                ])
              );
            } else {
              console.warn(`⚠️ No face found for ${user.email}`);
            }
          } catch (err) {
            console.error(`❌ Error loading ${user.email}`, err);
          }
        }

        registeredDescriptorsRef.current = labeledDescriptors;
        setDescriptorsLoaded(true);
        setMessage("✅ Users loaded. Place your face inside the scanner.");
      } catch (err) {
        console.error("❌ Failed to fetch users:", err);
        setMessage("❌ Failed to load users. Please retry.");
      }
    };

    loadDescriptors();
  }, [modelsLoaded]);

  // Face detection loop
  useEffect(() => {
    if (!modelsLoaded || !descriptorsLoaded) return;

    const interval = setInterval(async () => {
      if (!webcamRef.current) return;
      const video = webcamRef.current.video;
      if (!video) return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.7 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        setMessage("⚠️ No face detected. Please look at the camera.");
        setScannerAnimation(false);
        return;
      }

      if (detections.length > 1) {
        setMessage("❌ Multiple faces detected! Only one person allowed.");
        setScannerAnimation(false);
        return;
      }

      // Ensure face is large enough
      const box = detections[0].detection.box;
      if (box.width < 100 || box.height < 100) {
        setMessage("⚠️ Move closer to the camera.");
        return;
      }

      setScannerAnimation(true);

      // Make sure descriptors are loaded
      if (!registeredDescriptorsRef.current.length) {
        setMessage("⚠️ Waiting for registered users to load...");
        return;
      }

      const faceMatcher = new faceapi.FaceMatcher(registeredDescriptorsRef.current, 0.4);
      const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);

      if (bestMatch.label !== "unknown" && bestMatch.distance < 0.4) {
        const matchedUser = userList.find((u) => u.email === bestMatch.label);
        const userId = matchedUser?._id;

        if (!userId) {
          setMessage("❌ Matched face, but user not found in DB!");
          return;
        }

        const status = attendanceLogRef.current[bestMatch.label]
          ? "check-out"
          : "check-in";
        attendanceLogRef.current[bestMatch.label] = status;

        setMessage(`✅ ${matchedUser.email} verified successfully!`);
        setShowThankYou(true);
        sendAttendanceToBackend(userId, status);

        // Auto return to scanner
        setTimeout(() => {
          setShowThankYou(false);
          setMessage("Place your face inside the scanner.");
          setScannerAnimation(false);
        }, 10000);
      } else {
        setMessage("❌ Face not recognized or unclear. Try again!");
        setScannerAnimation(false);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [modelsLoaded, descriptorsLoaded, userList]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 text-white">
      {!modelsLoaded || !descriptorsLoaded ? (
        <div className="flex flex-col items-center">
          <div className="loader border-4 border-t-4 border-indigo-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
          <p className="text-lg font-semibold">{message}</p>
        </div>
      ) : !showThankYou ? (
        <div className="relative">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Face Attendance Scanner
          </h1>

          <div className="relative w-96 h-72">
            <Webcam
              ref={webcamRef}
              mirrored
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="rounded-lg border-4 border-indigo-400 shadow-lg w-full h-full object-cover"
            />

            {/* Scanner overlay */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div
                className={`absolute top-0 left-0 w-full h-1 border-t-4 border-green-400 animate-slide`}
                style={{ display: scannerAnimation ? "block" : "none" }}
              />
            </div>
          </div>

          <p className="mt-4 text-lg font-semibold text-center">{message}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4 text-green-400">Thank You! 🎉</h1>
          <p className="text-xl font-semibold">
            Your attendance has been recorded.
          </p>
        </div>
      )}

      {/* Scanner animation */}
      <style>
        {`
          @keyframes slide {
            0% { top: 0; }
            50% { top: calc(100% - 4px); }
            100% { top: 0; }
          }
          .animate-slide {
            animation: slide 2s linear infinite;
          }
          .loader {
            border-color: rgba(255, 255, 255, 0.2);
            border-top-color: #6366f1;
          }
        `}
      </style>
    </div>
  );
};

export default AttendanceScannerUI;
