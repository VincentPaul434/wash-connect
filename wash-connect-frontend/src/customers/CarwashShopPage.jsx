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
import { Search, MapPin } from "lucide-react"

const MAIN_LOCATIONS = ["All", "Cordova", "Cebu City", "Mandaue", "Lapu-Lapu"]

function CarwashShopPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBooking, setActiveBooking] = useState(null) // <-- update to useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
    }
  }, [navigate])

  
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        // Only fetch approved carwash shops
        const res = await fetch("http://localhost:3000/api/carwash-applications/approved");
        const data = await res.json();
        setShops(data);
      } catch {
        setShops([]);
      }
      setLoading(false);
    };
    fetchShops();
  }, [])

  // Fetch user's active booking
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || user.user_id;
    if (userId) {
      fetch(`http://localhost:3000/api/bookings/customers/${userId}`)
        .then(res => res.json())
        .then(bookings => {
          const latest = bookings.find(
            b => b.status !== "Declined" && b.status !== "Done"
          );
          setActiveBooking(latest || null);
        });
    }
  }, []);

  // Filter by location and search query
  const filteredShops = shops.filter(shop => {
    if (selectedLocation === "All") {
      return true;
    }
    if (selectedLocation === "Other") {
      return !MAIN_LOCATIONS.slice(1).some(loc =>
        shop.location.toLowerCase().includes(loc.toLowerCase())
      )
    } else {
      return shop.location.toLowerCase().includes(selectedLocation.toLowerCase())
    }
  }).filter(shop =>
    shop.carwashName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.owner_first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.owner_last_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex bg-[#c7f1ff]">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col min-h-screen">
        <div className="flex items-center px-8 py-8 border-b border-gray-100">
          <span className="text-3xl" style={{ fontFamily: "Brush Script MT, cursive" }}>
            <span className="text-cyan-500">Wash</span>{" "}
            <span className="text-red-500">Connect</span>
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer">
            <FaEnvelope className="mr-3 w-5 h-5" />
            Inbox
            <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">0</span>
          </div>
          <div
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => navigate('/user-dashboard')}
          >
            <FaUser className="mr-3 w-5 h-5" />
            Account
          </div>
          <div className="flex items-center w-full px-4 py-3 rounded-lg bg-cyan-100 text-cyan-700 font-semibold cursor-pointer">
            <FaStar className="mr-3 w-5 h-5" />
            Carwash Shops
          </div>
          <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => navigate('/book')}
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
                alert("No active appointment found.");
              }
            }}
          >
            <FaCalendarAlt className="mr-3 w-5 h-5" />
            Appointment
          </div>
          <div className="mt-auto px-4 pt-8">
            <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer" onClick={handleLogout}>
              <FaSignOutAlt className="mr-3 w-5 h-5" />
              LogOut
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 bg-[#a8d6ea] border-b border-gray-200">
          <div className="flex items-center">
            <button className="mr-4">
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search carwash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none w-64"
              />
            </div>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <FaUser className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Popular Carwash</h2>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="All">All</option>
                <option value="Cordova">Cordova</option>
                <option value="Cebu City">Cebu City</option>
                <option value="Mandaue">Mandaue</option>
                <option value="Lapu-Lapu">Lapu-Lapu</option>
                <option value="Other">Other Locations</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : filteredShops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect width="20" height="2" x="2" y="6" rx="1" fill="currentColor" />
                  <rect width="20" height="2" x="2" y="11" rx="1" fill="currentColor" />
                  <rect width="20" height="2" x="2" y="16" rx="1" fill="currentColor" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Carwash Registered Yet</h3>
              <p className="text-gray-600 text-center max-w-md mb-6">
                There are currently no carwash companies registered in {selectedLocation}. Be the first to discover and
                review carwash services in your area!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors">
                  <span>Suggest a Carwash</span>
                </button>
                <button className="flex items-center space-x-2 border border-cyan-500 text-cyan-500 px-6 py-3 rounded-lg hover:bg-cyan-50 transition-colors">
                  <span>Search Other Areas</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {filteredShops.map((shop) => (
                <div
                  key={shop.applicationId}
                  className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-200"
                  style={{ width: 220 }} // Set fixed width to match the sample card
                >
                  <div
                    className="w-48 h-48 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden mb-2"
                    style={{ width: 180, height: 180 }} // Adjust image box size
                  >
                    <img
                      src={
                        shop.logo
                          ? `http://localhost:3000/uploads/logos/${shop.logo}`
                          : "/default-logo.png"
                      }
                      alt="Logo"
                      className="w-full h-full object-contain"
                      onError={e => {
                        if (e.target.src !== window.location.origin + "/default-logo.png") {
                          e.target.src = "/default-logo.png";
                        }
                      }}
                    />
                  </div>
                  <div className="text-base font-semibold text-center text-gray-900 mb-2">{shop.carwashName}</div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {/* Static stars */}
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20"><polygon points="9.9,1.1 12.3,6.6 18.2,7.3 13.7,11.3 15,17.1 9.9,14.1 4.8,17.1 6.1,11.3 1.6,7.3 7.5,6.6 "/></svg>
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20"><polygon points="9.9,1.1 12.3,6.6 18.2,7.3 13.7,11.3 15,17.1 9.9,14.1 4.8,17.1 6.1,11.3 1.6,7.3 7.5,6.6 "/></svg>
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20"><polygon points="9.9,1.1 12.3,6.6 18.2,7.3 13.7,11.3 15,17.1 9.9,14.1 4.8,17.1 6.1,11.3 1.6,7.3 7.5,6.6 "/></svg>
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20"><polygon points="9.9,1.1 12.3,6.6 18.2,7.3 13.7,11.3 15,17.1 9.9,14.1 4.8,17.1 6.1,11.3 1.6,7.3 7.5,6.6 "/></svg>
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20"><polygon points="9.9,1.1 12.3,6.6 18.2,7.3 13.7,11.3 15,17.1 9.9,14.1 4.8,17.1 6.1,11.3 1.6,7.3 7.5,6.6 "/></svg>
                    <span className="ml-1 text-xs text-gray-500">4.9/5.0</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-xs hover:bg-gray-800 transition">
                      Message
                    </button>
                    <button
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition border border-blue-300"
                      onClick={() =>
                        navigate("/book", { state: { applicationId: shop.applicationId, carwashName: shop.carwashName } })
                      }
                    >
                      <span className="text-lg">♡</span> Services
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CarwashShopPage
