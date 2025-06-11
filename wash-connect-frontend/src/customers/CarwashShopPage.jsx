import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaEnvelope,
  FaUser,
  FaStar,
  FaHeart,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa"
import {
  Search,
  MapPin,
  Plus,
  Building2,
} from "lucide-react"

function CarwashShopPage() {
   const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("Cordova")

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
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-cyan-200 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg">
        {/* Logo */}
          <div className="p-6 border-b">
            <h1 className="text-4xl mb-2 text-center" style={{ fontFamily: "Brush Script MT, cursive" }}>
              <span className="text-cyan-500">Wash</span>{" "}
              <span className="text-red-500" style={{ fontFamily: "Brush Script MT, cursive" }}>Connect</span>
            </h1>
          </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <div className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
            <div className="flex items-center space-x-3">
              <FaEnvelope className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Inbox</span>
            </div>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">24</span>
          </div>

          <div
            className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
            onClick={() => navigate('/user-dashboard')}
          >
            <FaUser className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Account</span>
          </div>

           <div className="flex items-center space-x-3 p-3 bg-blue-100 rounded-lg cursor-pointer">
            <FaStar className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Carwash Shops</span>
          </div>

          <div
            className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
            <FaHeart className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Bookings</span>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-gray-500 text-sm px-3 mb-2">Transactions</p>
          </div>

          <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
            <FaCalendarAlt className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Appointment</span>
          </div>

             <div className="border-t pt-4 mt-4">
            <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer" onClick={handleLogout}>
              <FaSignOutAlt className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">LogOut</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header
            className="text-white p-4 flex items-center justify-between"
            style={{ backgroundColor: "#87A5B7" }}
          >
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Reviews</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white-400" />
              <input
                type="text"
                placeholder="Search carwash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full text-white-900 placeholder-white-500 focus:outline-none focus:ring-2 focus:ring-white w-64"
              />
            </div>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <FaUser className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Popular Carwash</h2>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Cordova">Cordova</option>
                <option value="Cebu City">Cebu City</option>
                <option value="Mandaue">Mandaue</option>
                <option value="Lapu-Lapu">Lapu-Lapu</option>
              </select>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Building2 className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Carwash Registered Yet</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              There are currently no carwash companies registered in {selectedLocation}. Be the first to discover and
              review carwash services in your area!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors">
                <Plus className="w-5 h-5" />
                <span>Suggest a Carwash</span>
              </button>
              <button className="flex items-center space-x-2 border border-cyan-500 text-cyan-500 px-6 py-3 rounded-lg hover:bg-cyan-50 transition-colors">
                <Search className="w-5 h-5" />
                <span>Search Other Areas</span>
              </button>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-white rounded-lg p-8 shadow-lg mt-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Are you a Carwash Owner?</h3>
            <p className="text-gray-600 mb-6">
              Join Wash Connect and reach more customers in {selectedLocation}. Register your carwash business today!
            </p>
            <button className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-cyan-600 transition-colors font-medium">
              Register Your Business
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarwashShopPage
