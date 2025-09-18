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
} from "lucide-react"
import { FaEnvelope, FaUser, FaStar, FaHeart } from "react-icons/fa"
import toast, { Toaster } from "react-hot-toast"

function UserDashboard() {
  const navigate = useNavigate()
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
  const [activeBooking, setActiveBooking] = useState(null)
  const [bookings, setBookings] = useState([])

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

  // Fetch user's active booking and all bookings
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const userId = user.id || user.user_id
    if (userId) {
      fetch(`http://localhost:3000/api/bookings/customers/${userId}`)
        .then((res) => res.json())
        .then((bookingsData) => {
          // Exclude Declined, Done, and Cancelled bookings
          const latest = bookingsData.find(
            (b) => b.status !== "Declined" && b.status !== "Done" && b.status !== "Cancelled"
          )
          setActiveBooking(latest)
          setBookings(
            (bookingsData || []).filter(
              (b) => b.status !== "Declined" && b.status !== "Done" && b.status !== "Cancelled"
            )
          )
        })
        .catch(() => {
          setActiveBooking(null)
          setBookings([])
        })
    } else {
      setBookings([])
    }
  }, [])

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
    <div className="min-h-screen flex bg-gradient-to-br from-cyan-50 to-blue-100">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col min-h-screen shadow-lg">
        <div className="flex items-center px-8 py-8 border-b border-gray-100">
          <span className="text-3xl" style={{ fontFamily: "Brush Script MT, cursive" }}>
            <span className="text-cyan-500">Wash</span>{" "}
            <span className="text-red-500">Connect</span>
          </span>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer">
            <FaEnvelope className="mr-3 w-5 h-5" />
            Inbox
            <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">0</span>
          </div>
          <div className="flex items-center w-full px-4 py-3 rounded-lg bg-cyan-100 text-cyan-700 font-semibold cursor-pointer">
            <FaUser className="mr-3 w-5 h-5" />
            Account
          </div>
          <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => navigate("/popular-carwash")}
          >
            <FaStar className="mr-3 w-5 h-5" />
            Carwash Shops
          </div>
          <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer" 
            onClick={() => navigate("/book")}
          >
            <FaHeart className="mr-3 w-5 h-5" />
            Bookings
          </div>
          <hr className="my-4" />
          <div
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => {
              if (activeBooking) {
                navigate("/booking-confirmation", { state: { appointment_id: activeBooking.appointment_id } });
              } else {
                toast(
                  <div>
                    <span role="img" aria-label="calendar" style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>📅</span>
                    <span>No active appointment found.</span>
                  </div>,
                  {
                    icon: "🚫",
                  }
                );
              }
            }}
          >
            <span className="text-xl">🗓️</span>
            <span className="text-gray-700">Appointment</span>
          </div>
          <div className="mt-auto px-4 pt-8">
            <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer" onClick={handleLogout}>
              <span className="text-xl">📁</span>
              <span className="text-gray-700">LogOut</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 bg-[#a8d6ea] border-b border-gray-200 shadow-sm">
          <div className="flex items-center">
            <span className="text-2xl font-bold">My Account</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">{userInfo.firstName || "User"}</span>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-cyan-200">
              <FaUser className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-10 bg-gradient-to-br from-white to-blue-50">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="col-span-1">
              <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={profilePic || "/placeholder.svg"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-cyan-200"
                  />
                  <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 border-2 border-white">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePicChange}
                    />
                    <FaUser className="w-4 h-4 text-white" />
                  </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {userInfo.firstName} {userInfo.lastName}
                </h2>
                <p className="text-gray-500 mb-2">Customer</p>
                <div className="flex space-x-2 mb-4">
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
                <div className="w-full mt-4">
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500">Email</span>
                    <span className="block font-medium text-gray-800">{userInfo.email}</span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500">Contact</span>
                    <span className="block font-medium text-gray-800">{userInfo.contactNumber}</span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500">Address</span>
                    <span className="block font-medium text-gray-800">{userInfo.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Section */}
            <div className="col-span-2 flex flex-col gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-semibold">My Bookings</span>
                    <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">{bookings.length}</span>
                    </div>
                  </div>
                  <button
                    className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors font-semibold"
                    onClick={() => navigate("/book")}
                  >
                    Book Now
                  </button>
                </div>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No bookings yet.</div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-100 rounded-xl p-5 bg-cyan-50 flex flex-col md:flex-row items-center gap-4 shadow-sm">
                        <img
                          src={booking.image || "/placeholder.svg"}
                          alt={booking.title}
                          className="w-20 h-20 rounded-lg object-cover border border-cyan-200"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{booking.title || booking.service_name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : booking.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "Cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{booking.description || booking.address}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold text-cyan-700">
                              {booking.price ? `₱${booking.price}` : ""}
                            </span>
                            <span className="text-xs text-gray-500">{booking.date || booking.schedule_date}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* User Details Section */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </div>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #a8d6ea",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            fontSize: "1rem",
            padding: "1rem 1.5rem",
            borderRadius: "0.75rem",
          },
          iconTheme: {
            primary: "#06b6d4",
            secondary: "#e0f7fa",
          },
        }}
      />
    </div>
  )
}

export default UserDashboard