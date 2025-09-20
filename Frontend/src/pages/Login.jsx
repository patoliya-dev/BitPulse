import axios from "axios";
import React, { useState } from "react";
import { API_URL } from "../constants";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti-boom";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showBoom, setShowBoom] = useState(false);  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleLogin = async () => {
    try {
      const validation = validate();
      if (Object.keys(validation).length > 0) {
        setErrors(validation);
        return;
      }
      setErrors({});
      setBusy(true);

      const payload = {
        email: form.email,
        password: form.password,
      }

      // send to backend
      const loginData = await axios.post(`${API_URL}/users/login`, {
        ...payload,
      });

      console.log("loginData", loginData);

      toast.success("Login successful!");
      setShowBoom(true);
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setBusy(false);
      toast.error(
        error.response?.data?.message || "Invalid Credentials"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6">
      {showBoom && <Confetti />}
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
          Login
        </h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

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

        <button
          onClick={handleLogin}
          disabled={busy}
          className={`w-full mt-6 p-3 rounded-lg font-semibold ${
            busy ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
          } text-white`}
        >
          {busy ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don’t have an account?{" "}
          <a href="/register" className="text-indigo-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
