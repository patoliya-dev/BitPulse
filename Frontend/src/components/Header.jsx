import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // if using react-router
import logo from "../assets/logo.png";
import { toast } from "react-toastify";

const Header = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const [user, setUser] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    password: "password123",
    profilePic: "https://i.pravatar.cc/100",
  });

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Saved user data:", user);
    setIsEdit(false);
    setModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-10 object-contain rounded-full"
          />
          <span className="ml-3 text-xl font-semibold text-gray-800">
            Face Recognition Attendance System
          </span>
        </div>

        <div className="flex items-center space-x-6">
          {/* Attendance Menu */}
          <button
            onClick={() => navigate("/attendance")} // Navigate to attendance page
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Attendance
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center focus:outline-none"
            >
              <img
                src={user.profilePic}
                alt="Profile"
                className="h-10 w-10 rounded-full border-2 border-gray-300 hover:border-blue-500 transition"
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setModalOpen(true);
                    setDropdownOpen(false);
                  }}
                >
                  Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[600px] p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold mb-4">Profile</h2>

            <div className="flex flex-col space-y-4">
              <div className="flex justify-center">
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border-2 border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {["firstName", "lastName", "email", "phone", "password"].map(
                  (field) => (
                    <div key={field} className="col-span-2 md:col-span-1">
                      <label className="block text-gray-700 font-medium mb-1">
                        {field === "phone"
                          ? "Phone Number"
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      {isEdit ? (
                        <input
                          type={field === "password" ? "password" : "text"}
                          name={field}
                          value={user[field]}
                          onChange={handleChange}
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-800">
                          {field === "password" ? "••••••••" : user[field]}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              {isEdit ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEdit(false)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEdit(true)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
