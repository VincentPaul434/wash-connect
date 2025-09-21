import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaUser,
  FaStar,
  FaHeart,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { Search, MapPin } from "lucide-react";

const MAIN_LOCATIONS = ["All", "Cordova", "Cebu City", "Mandaue", "Lapu-Lapu"];

const placeholderLogo = "/default-logo.png";
const normalizeLogo = (raw) => {
  if (!raw) return placeholderLogo;
  const s = String(raw);
  if (s.startsWith("http")) return s;
  if (!s.startsWith("/")) return `http://localhost:3000/uploads/logos/${s}`;
  return `http://localhost:3000${s}`;
};

function CarwashShopPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/api/carwash-applications/approved");
        const data = await res.json();
        setShops(Array.isArray(data) ? data : []);
      } catch {
        setShops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || user.user_id;
    if (userId) {
      fetch(`http://localhost:3000/api/bookings/customers/${userId}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((bookings) => {
          const latest = (Array.isArray(bookings) ? bookings : []).find(
            (b) => b.status === "Pending" || b.status === "Confirmed"
          );
          setActiveBooking(latest || null);
        })
        .catch(() => setActiveBooking(null));
    }
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const filteredShops = useMemo(() => {
    const byLocation = shops.filter((shop) => {
      if (selectedLocation === "All") return true;
      if (selectedLocation === "Other") {
        return !MAIN_LOCATIONS.slice(1).some((loc) =>
          (shop.location || "").toLowerCase().includes(loc.toLowerCase())
        );
      }
      return (shop.location || "").toLowerCase().includes(selectedLocation.toLowerCase());
    });
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byLocation;
    return byLocation.filter(
      (shop) =>
        (shop.carwashName || "").toLowerCase().includes(q) ||
        (shop.owner_first_name || "").toLowerCase().includes(q) ||
        (shop.owner_last_name || "").toLowerCase().includes(q)
    );
  }, [shops, selectedLocation, searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleViewServices = (shop) => {
    localStorage.setItem("selectedApplicationId", String(shop.applicationId));
    navigate("/book", {
      state: { applicationId: shop.applicationId, carwashName: shop.carwashName },
    });
  };

  return (
    <div className="h-screen overflow-hidden flex bg-gradient-to-br from-[#c7f1ff] to-[#e7f7ff]">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-cyan-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
            <FaCalendarAlt className="w-5 h-5" />
            <span className="font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-72 bg-white/90 backdrop-blur border-r border-gray-200 flex flex-col">
        <div className="flex items-center px-8 py-8 border-b border-gray-100">
          <span className="text-3xl" style={{ fontFamily: "Brush Script MT, cursive" }}>
            <span className="text-cyan-500">Wash</span> <span className="text-red-500">Connect</span>
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
            onClick={() => navigate("/user-dashboard")}
          >
            <FaUser className="mr-3 w-5 h-5" />
            Account
          </div>
          <div className="flex items-center w-full px-4 py-3 rounded-lg bg-cyan-100 text-cyan-700 font-semibold cursor-pointer">
            <FaStar className="mr-3 w-5 h-5" />
            Carwash Shops
          </div>
          <div
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
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
                showToast("No active appointment found.");
              }
            }}
          >
            <FaCalendarAlt className="mr-3 w-5 h-5" />
            Appointment
          </div>
          <div className="mt-auto px-4 pt-8">
            <div
              className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="mr-3 w-5 h-5" />
              LogOut
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-[#7cc3e2] to-[#a8d6ea] border-b border-gray-200">
          <h1 className="text-xl font-semibold text-white">Find a Carwash</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-200" />
              <input
                type="text"
                placeholder="Search carwash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-white/40 bg-white/90 text-gray-700 focus:outline-none w-64"
              />
            </div>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <FaUser className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="px-8 pt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <MapPin className="w-4 h-4 text-gray-600" />
            {MAIN_LOCATIONS.concat("Other").map((loc) => (
              <button
                key={loc}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  selectedLocation === loc
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedLocation(loc)}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          <div className="max-w-6xl mx-auto">
            {/* Loading */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-md shadow border border-gray-200 p-3 animate-pulse h-full flex flex-col">
                    <div className="w-full h-32 md:h-36 bg-gray-200 rounded mb-3 shrink-0" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
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
                  There are currently no carwash companies registered in {selectedLocation}. Try searching other areas.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                    Suggest a Carwash
                  </button>
                  <button
                    className="border border-cyan-500 text-cyan-700 px-6 py-3 rounded-lg hover:bg-cyan-50 transition-colors"
                    onClick={() => setSelectedLocation("All")}
                  >
                    Show All
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                {filteredShops.map((shop) => {
                  const logoUrl = normalizeLogo(shop.logo);
                  return (
                    <div
                      key={shop.applicationId}
                      className="bg-white rounded-md shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden h-full flex flex-col"
                    >
                      <div className="w-full h-36 md:h-40 bg-white border-b border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={logoUrl}
                          alt={`${shop.carwashName} logo`}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            if (e.currentTarget.src !== window.location.origin + placeholderLogo) {
                              e.currentTarget.src = placeholderLogo;
                            }
                          }}
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {shop.carwashName}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-700">
                            <FaStar className="text-yellow-500" />
                            4.9
                          </div>
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{shop.location || "—"}</span>
                        </div>
                        <div className="mt-auto flex gap-2">
                          <button className="flex-1 bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-800 transition">
                            Message
                          </button>
                          <button
                            className="flex-1 bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs border border-blue-300 hover:bg-blue-100 transition"
                            onClick={() => handleViewServices(shop)}
                          >
                            View Services
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Toast animation styles */}
        <style>{`
          .animate-slide-in {
            animation: slide-in 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }
          @keyframes slide-in {
            0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default CarwashShopPage;
