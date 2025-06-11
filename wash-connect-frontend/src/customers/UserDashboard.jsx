// ...existing imports...
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  User,
  Inbox,
  Star,
  Heart,
  Calendar,
  LogOut,
  Mail,
  Phone,
  Video,
  MessageCircle,
  MoreVertical,
  MapPin,
  Navigation,
} from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { FaEnvelope, FaUser } from "react-icons/fa"

function UserDashboard() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState("April 2024")
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    address: "",
    birthday: "",
    gender: "",
  })
  const [profilePic, setProfilePic] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (!token || !user) {
      navigate("/login")
      return
    }
    try {
      const parsedUser = JSON.parse(user)
      setUserInfo({
        firstName: parsedUser.first_name || "",
        lastName: parsedUser.last_name || "",
        email: parsedUser.email || "",
        contactNumber: parsedUser.phone || "",
        address: parsedUser.address || "",
        birthday: parsedUser.birth_date || "",
        gender: parsedUser.gender || "",
      })
    } catch {
      navigate("/login")
    }
  }, [navigate])

  const bookings = []

  const carwashLocations = [
    {
      name: "The Carwash Mafia",
      rating: 4.8,
      reviews: 148,
      type: "Car wash • Naga City",
      status: "Open",
      hours: "24 hours",
    },
    { name: "UNCLE CARWASH", rating: 4.9, reviews: 5, type: "Car wash • Naga City", status: "Open", hours: "24 hours" },
    {
      name: "4D's Car Wash",
      rating: 4.7,
      reviews: 91,
      type: "Car wash • 16 Masalog Road",
      status: "Closed",
      hours: "Opens 6 AM Tue",
    },
    {
      name: "SPOTLESS CLEAN CAR WASH",
      rating: 4.9,
      reviews: 17,
      type: "Car wash • 16 Masalog Road",
      status: "Closed",
      hours: "Opens 6 AM",
    },
  ]

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  // Handle profile picture upload
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePic(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

return (
  <div className="flex h-screen">
    <div className="w-80 bg-white border-r flex flex-col">
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
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">0</span>
        </div>
        <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
          <FaUser className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700">Account</span>
        </div>
        <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer" 
        onClick={() => navigate("/popular-carwash")}
        >
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
          <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer" onClick={handleLogout}>
            <span className="text-xl">📁</span>
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
          <h1 className="text-xl font-semibold">Accounts</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">{userInfo.firstName || "User"}</span>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-400" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* User Profile Card with Upload */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={profilePic || "/placeholder.svg"}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border"
                      style={{ borderColor: "#87A5B7", borderWidth: "2px", borderStyle: "solid" }}
                    />
                    <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 cursor-pointer hover:bg-blue-600">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePicChange}
                      />
                      <User className="w-4 h-4 text-white" />
                    </label>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {userInfo.firstName} {userInfo.lastName}
                    </h2>
                    <p className="text-gray-600">Customer</p>
                  </div>
                </div>
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex space-x-4 mb-6">
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Mail className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Time Slots</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="text"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm"
                    />
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Bookings</span>
                  <span className="bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {bookings.length}
                  </span>
                </div>
              </div>
            </div>

              {/* Detailed Information */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={userInfo.firstName}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={userInfo.lastName}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={userInfo.email}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Contact Number</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={userInfo.contactNumber}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={userInfo.address}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Birthday</label>
                    <input
                      type="text"
                      name="birthday"
                      value={userInfo.birthday}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Gender</label>
                    <input
                      type="text"
                      name="gender"
                      value={userInfo.gender}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Bookings Section */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold">Bookings</span>
                    <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">{bookings.length}</span>
                    </div>
                  </div>
                  <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors">
                    Book Now
                  </button>
                </div>

                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-gray-500 text-center">No bookings yet.</div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-xs text-gray-500">{booking.date}</div>
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex space-x-3">
                          <img
                            src={booking.image || "/placeholder.svg"}
                            alt={booking.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{booking.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{booking.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-900">{booking.price}</span>
                              <span className={`px-2 py-1 rounded text-xs text-white ${booking.statusColor}`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-64 relative">
                  <MapContainer
                    center={[10.3157, 123.8854]} // Cebu City coordinates
                    zoom={12}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {carwashLocations.map((location, idx) => (
                      <Marker
                        key={idx}
                        position={[
                          10.3157 + Math.random() * 0.1, // Randomize for demo
                          123.8854 + Math.random() * 0.1,
                        ]}
                      >
                        <Popup>
                          <strong>{location.name}</strong>
                          <br />
                          {location.type}
                          <br />
                          Status: {location.status}
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                  <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-lg">
                    <span className="text-sm font-medium">Find a Carwash Near by.</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex space-x-4 mb-4">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">Area Setup</button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">Pinned location</button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">Location Name:</label>
                    <input
                      type="text"
                      placeholder="Cordova Cebu City"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Results</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {carwashLocations.map((location, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{location.name}</h4>
                            <div className="flex space-x-1">
                              <button className="p-1 hover:bg-gray-100 rounded">
                                <Navigation className="w-3 h-3 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-100 rounded">
                                <MapPin className="w-3 h-3 text-gray-400" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 mb-1">
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs ml-1">{location.rating}</span>
                            </div>
                            <span className="text-xs text-gray-500">({location.reviews})</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{location.type}</p>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                location.status === "Open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {location.status}
                            </span>
                            <span className="text-xs text-gray-500">{location.hours}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard