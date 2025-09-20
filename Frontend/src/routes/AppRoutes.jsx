import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Registration from "../pages/Registration";
import RegisterUser from "../pages/RegisterUser";
import Attendence from "../pages/Attendence";
import Attendance from "../pages/Attendance";

const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/attendance" element={<Attendence />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/attendanceFace" element={<Attendance />} />
      </Routes>
    </div>
  )
}

export default AppRoutes
