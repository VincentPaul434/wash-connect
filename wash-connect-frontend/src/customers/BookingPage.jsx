import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft, FaArrowRight } from "react-icons/fa";

const services = [
  {
    name: "Basic Carwash",
    img: "https://images.pexels.com/photos/372810/pexels-photo-372810.jpeg?auto=compress&w=100&h=100&fit=crop",
  },
  {
    name: "Full Detailing",
    img: "https://images.pexels.com/photos/3806273/pexels-photo-3806273.jpeg?auto=compress&w=100&h=100&fit=crop",
  },
  {
    name: "Underwash",
    img: "https://images.pexels.com/photos/48889/pexels-photo-48889.jpeg?auto=compress&w=100&h=100&fit=crop",
  },
  {
    name: "Ceramic Coating",
    img: "https://images.pexels.com/photos/170782/pexels-photo-170782.jpeg?auto=compress&w=100&h=100&fit=crop",
  },
  {
    name: "Basic Motowash",
    img: "https://images.pexels.com/photos/372810/pexels-photo-372810.jpeg?auto=compress&w=100&h=100&fit=crop",
  },
];

 function BookingPage() {
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();

      useEffect(() => {
    const token = localStorage.getItem("token") 
    if (!token) {
      navigate("/login")
    }
  }, [navigate])

      const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }



  return (
    <div className="flex h-screen bg-[#c8f1ff]">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-4xl mb-2 text-center" style={{ fontFamily: "Brush Script MT, cursive" }}>
            <span className="text-cyan-500">Wash</span>{" "}
            <span className="text-red-500" style={{ fontFamily: "Brush Script MT, cursive" }}>Connect</span>
          </h1>
        </div>
        <nav className="p-4 space-y-2">
          <div className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
            <div className="flex items-center space-x-3">
              <FaEnvelope className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Inbox</span>
            </div>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">24</span>
          </div>
          <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
            <FaUser className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Account</span>
          </div>
          <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
            <span className="text-xl">★</span>
            <span className="text-gray-700">Carwash Shops</span>
          </div>
          <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
            <span className="text-xl">♡</span>
            <span className="text-gray-700">Bookings</span>
          </div>
          <div className="border-t pt-4 mt-4">
            <p className="text-gray-500 text-sm px-3 mb-2">Transactions</p>
          </div>
          <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
            <span className="text-xl">🗓️</span>
            <span className="text-gray-700">Appointment</span>
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer" onClick={handleLogout} >
              <span className="text-xl">📁</span>
              <span className="text-gray-700">LogOut</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center bg-[#a3b8c7] px-8 py-3">
          <button className="mr-4 text-2xl text-black hover:text-gray-700">
            <FaArrowLeft />
          </button>
          <h2 className="text-3xl text-white font-normal" style={{ fontFamily: "sans-serif" }}>
            Booking Confirmation
          </h2>
          <div className="ml-auto">
            <span className="text-2xl text-gray-700"><FaUser /></span>
          </div>
        </header>

        {/* Booking Card */}
        <div className="flex-1 bg-[#c8f1ff] flex items-center justify-center p-8">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow p-8 border border-gray-300" style={{ minWidth: 400 }}>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                className="text-2xl text-gray-500"
                onClick={() => setSelected((selected - 1 + services.length) % services.length)}
                type="button"
              >
                <FaArrowLeft />
              </button>
              {services.map((service, idx) => (
                <div
                  key={service.name}
                  className={`flex flex-col items-center cursor-pointer group`}
                  onClick={() => setSelected(idx)}
                >
                  <img
                    src={service.img}
                    alt={service.name}
                    className={`rounded-full w-24 h-24 object-cover border-4 transition-all duration-200 ${
                      selected === idx
                        ? "border-cyan-500 scale-105 shadow-lg"
                        : "border-transparent opacity-70 group-hover:opacity-100"
                    }`}
                  />
                  <span
                    className={`mt-2 text-sm font-medium transition-all duration-200 ${
                      selected === idx
                        ? "text-cyan-600 border-b-4 border-cyan-400"
                        : "text-gray-500"
                    }`}
                  >
                    {service.name}
                  </span>
                </div>
              ))}
              <button
                className="text-2xl text-gray-500"
                onClick={() => setSelected((selected + 1) % services.length)}
                type="button"
              >
                <FaArrowRight />
              </button>
            </div>
            {/* Form */}
            <form className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    className="w-full border rounded px-8 py-2"
                    placeholder="First name"
                    defaultValue=""
                  />
                </div>
                <div className="flex-1 relative">
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    className="w-full border rounded px-8 py-2"
                    placeholder="Last name"
                    defaultValue=""
                  />
                </div>
                <div className="flex-1 relative">
                  <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    className="w-full border rounded px-8 py-2"
                    placeholder="Email address"
                    defaultValue=""
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    className="w-full border rounded px-8 py-2"
                    placeholder="Address"
                    defaultValue=""
                  />
                </div>
                <div className="flex-1 relative">
                  <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    className="w-full border rounded px-8 py-2"
                    placeholder="Schedule date"
                    defaultValue=""
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Additional message</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Additional message"
                  defaultValue=""
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-2xl py-3 rounded-lg shadow-md font-semibold hover:from-cyan-500 hover:to-blue-600 transition-all duration-200 border-none"
              >
                <span className="flex items-center justify-center gap-2">
                  <FaArrowRight className="inline-block" /> Submit Booking
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;


