import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaRegEnvelope, FaRegEye, FaRegCheckSquare, FaTrophy } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const TABS = [
  { key: "overall", label: "Overall Booking" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "confirmed", label: "Confirmed" },
  { key: "ongoing", label: "On Going" },
];

// Sidebar component (inline)
function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r flex flex-col h-screen">
      <div className="px-6 py-8">
        <div className="text-3xl flex items-center select-none">
          <span className="text-gray-700" style={{ fontFamily: '"Great Vibes", cursive', fontSize: "2.2rem" }}>
            Wash
          </span>
          <span className="ml-2 text-red-500 font-semibold" style={{ fontFamily: '"Great Vibes", cursive', fontSize: "2.2rem" }}>
            Connect
          </span>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <div className="flex items-center justify-between mb-2 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors duration-200">
          <span className="flex items-center gap-2 text-gray-700">
            <FaRegEnvelope className="text-lg" /> Inbox
          </span>
          <span className="text-xs text-gray-700">24</span>
        </div>
        <button
          className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
            location.pathname === "/carwash-dashboard"
              ? "bg-blue-100 text-blue-700 font-semibold"
              : "hover:bg-gray-100 cursor-pointer"
          }`}
          onClick={() => navigate("/carwash-dashboard")}
        >
          <FaRegEye /> Overview
        </button>
        <button
          className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
            location.pathname === "/customer-list"
              ? "bg-blue-100 text-blue-700 font-semibold"
              : "hover:bg-gray-100 cursor-pointer"
          }`}
          onClick={() => navigate("/customer-list")}
        >
          <span className="text-lg">★</span> Customers & Employee
        </button>
        <hr className="my-2 border-gray-300" />
        <button
          className={`flex items-center gap-2 mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200 w-full text-left ${
            location.pathname === "/bookings"
              ? "bg-blue-100 text-blue-700 font-semibold"
              : ""
          }`}
          onClick={() => navigate("/bookings")}
        >
          <FaRegCheckSquare className="text-lg" />
          <span>Manage Bookings</span>
        </button>
        <div className="flex items-center gap-2 mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200">
          <FaRegCheckSquare className="text-lg" />
          <span>Booking History</span>
        </div>
        <div className="flex items-center gap-2 mt-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200" onClick={() => navigate('/earning-dashboard')}>
          <FaTrophy className="text-lg" />
          <span>Earnings Dashboard</span>
        </div>
        <hr className="my-4 border-gray-300" />
      </nav>
      <div className="mt-auto px-4 py-6">
        <button
          className="flex items-center gap-2 text-gray-700 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200"
          onClick={() => navigate("/carwash-login")}
        >
          <span className="text-lg">⏻</span> Logout
        </button>
      </div>
    </aside>
  );
}

function Bookings() {
  const [activeTab, setActiveTab] = useState("overall");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setApplicationId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch applicationId and bookings (same logic as CustomerList)
  useEffect(() => {
    // Use the same owner key as in CustomerList
    const owner = JSON.parse(localStorage.getItem("carwashOwner"));
    if (!owner || !owner.id) {
      setLoading(false);
      return;
    }

    // Get applicationId for this owner
    fetch(`http://localhost:3000/api/carwash-applications/by-owner/${owner.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.applicationId) {
          setApplicationId(data.applicationId);
          // Fetch only confirmed bookings for this applicationId
          fetch(`http://localhost:3000/api/bookings/confirmed/${data.applicationId}`)
            .then(res => res.json())
            .then(setBookings)
            .catch(() => setBookings([]))
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter bookings by tab (since only confirmed bookings are fetched)
  const filteredBookings = bookings.filter(b => {
    if (activeTab === "overall") return true;
    if (activeTab === "pending") return b.status === "Pending" || b.status === "Pending Approval";
    if (activeTab === "approved") return b.status === "Approved";
    if (activeTab === "ongoing") return b.status === "On Going";
    if (activeTab === "confirmed") return b.status === "Confirmed";
    return true;
  });

  // Accept booking
  const handleAccept = async (id) => {
    await fetch(`http://localhost:3000/api/bookings/confirm/${id}`, { method: "PATCH" });
    setBookings(prev => prev.map(b => b.appointment_id === id ? { ...b, status: "Confirmed" } : b));
  };

  // Decline booking
  const handleDecline = async (id) => {
    await fetch(`http://localhost:3000/api/bookings/decline/${id}`, { method: "PATCH" });
    setBookings(prev => prev.filter(b => b.appointment_id !== id));
  };

  // Get bookings for a customer that match the current tab
  const getBookingsForCustomer = (customerId) =>
    bookings.filter(b => {
      if (b.customer_id !== customerId) return false;
      if (activeTab === "overall") return true;
      if (activeTab === "pending") return b.status === "Pending" || b.status === "Pending Approval";
      if (activeTab === "approved") return b.status === "Approved";
      if (activeTab === "ongoing") return b.status === "On Going";
      if (activeTab === "confirmed") return b.status === "Confirmed";
      return true;
    });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full">
        <div className="flex items-center justify-between px-8 py-6 bg-blue-100 border-b">
          <h1 className="text-2xl font-semibold">Manage Bookings</h1>
        </div>
        <div className="flex gap-4 px-8 py-4 bg-white border-b">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded font-semibold ${activeTab === tab.key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center text-gray-400">No bookings found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map(booking => (
                <div key={booking.appointment_id} className="bg-white rounded-xl border border-gray-300 p-4 flex flex-col gap-2 shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={booking.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customer_first_name || "")}`}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div>
                      <div className="font-semibold text-lg">{booking.customer_first_name} {booking.customer_last_name}</div>
                      <div className="text-xs text-gray-500">{booking.customer_email}</div>
                    </div>
                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === "Pending" || booking.status === "Pending Approval"
                        ? "bg-yellow-100 text-yellow-700"
                        : booking.status === "Approved"
                        ? "bg-blue-100 text-blue-700"
                        : booking.status === "On Going"
                        ? "bg-orange-100 text-orange-700"
                        : booking.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <FaMapMarkerAlt className="mr-1" /> {booking.address}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Service:</span>
                    <span className="ml-1">{booking.service_name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Date:</span>
                    <span className="ml-1">{new Date(booking.schedule_date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {booking.status === "On Going" && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">
                        On Going
                      </span>
                    )}
                    {booking.payment_status === "Partial" && (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">
                        Partially Paid
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {(booking.status === "Pending" || booking.status === "Pending Approval") && (
                      <>
                        <button
                          className="flex-1 bg-blue-500 text-white rounded px-3 py-1 text-xs font-medium hover:bg-blue-600"
                          onClick={() => handleAccept(booking.appointment_id)}
                        >
                          Accept
                        </button>
                        <button
                          className="flex-1 bg-red-100 text-red-700 rounded px-3 py-1 text-xs font-medium hover:bg-red-600 hover:text-white"
                          onClick={() => handleDecline(booking.appointment_id)}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {booking.status === "Approved" && (
                      <button className="flex-1 bg-green-100 text-green-700 rounded px-3 py-1 text-xs font-medium">
                        Mark as On Going
                      </button>
                    )}
                    {booking.status === "On Going" && (
                      <button className="flex-1 bg-gray-200 text-gray-700 rounded px-3 py-1 text-xs font-medium">
                        Done
                      </button>
                    )}
                  </div>
                  <button
                    className="mt-2 text-blue-500 text-xs underline"
                    onClick={() => setSelectedCustomer(booking.customer_id)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Modal for customer bookings */}
          {selectedCustomer && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                  onClick={() => setSelectedCustomer(null)}
                >
                  &times;
                </button>
                <h2 className="text-lg font-semibold mb-2">Customer Bookings</h2>
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                  {getBookingsForCustomer(selectedCustomer).map(b => (
                    <li key={b.appointment_id} className="border-b pb-2">
                      <div className="font-medium">{b.service_name}</div>
                      <div className="text-xs text-gray-500">{new Date(b.schedule_date).toLocaleString()}</div>
                      <div className="text-xs">{b.status}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Bookings;