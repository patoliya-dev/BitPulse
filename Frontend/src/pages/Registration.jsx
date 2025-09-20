import React, { useState } from "react";
import axios from "axios";

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phNumber: "",
    password: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [realPic, setRealPic] = useState(null);
  const [uploadOption, setUploadOption] = useState("profile"); // 'profile' or 'real'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (uploadOption === "profile") {
      setProfilePic(file);
    } else {
      setRealPic(file);
    }
  };

  const handleOptionChange = (e) => {
    setUploadOption(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phNumber ||
      !formData.password
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (uploadOption === "profile" && !profilePic) {
      alert("Please upload a profile picture.");
      return;
    }
    if (uploadOption === "real" && !realPic) {
      alert("Please upload a real picture.");
      return;
    }

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("email", formData.email);
    data.append("phNumber", formData.phNumber);
    data.append("password", formData.password);

    if (uploadOption === "profile") {
      data.append("profilePic", profilePic);
    } else {
      data.append("realPic", realPic);
    }

    try {
      const response = await axios.post("/api/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Registration successful");
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-semibold">First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Phone Number:</label>
          <input
            type="tel"
            name="phNumber"
            value={formData.phNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <span className="block mb-2 font-semibold">
            Choose picture to upload:
          </span>
          <label className="inline-flex items-center mr-6">
            <input
              type="radio"
              className="form-radio"
              name="uploadOption"
              value="profile"
              checked={uploadOption === "profile"}
              onChange={handleOptionChange}
            />
            <span className="ml-2">Profile Picture</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="uploadOption"
              value="real"
              checked={uploadOption === "real"}
              onChange={handleOptionChange}
            />
            <span className="ml-2">Real Picture</span>
          </label>
        </div>
        <div>
          <label className="block mb-1 font-semibold">
            {uploadOption === "profile"
              ? "Upload Profile Picture:"
              : "Upload Real Picture:"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-3 rounded font-semibold"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Registration;
