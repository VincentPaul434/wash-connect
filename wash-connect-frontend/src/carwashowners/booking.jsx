import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

const TABS = [
  { key: "overall", label: "Overall Booking" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "confirmed", label: "Confirmed" },
  { key: "ongoing", label: "On Going" },
];

function Bookings() {
  const [activeTab, setActiveTab] = useState("overall");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set your actual applicationId here
  const applicationId = 3;

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      let url = "";
      if (activeTab === "confirmed") {
        url = `http://localhost:3000/api/bookings/confirmed/${applicationId}`;
      } else {
        url = `http://localhost:3000/api/bookings/by-application/${applicationId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setBookings(data);
      setLoading(false);
    }
    fetchBookings();
  }, [activeTab, applicationId]);

  // Filter bookings by tab (except confirmed, which is already filtered by backend)
  const filteredBookings = bookings.filter(b => {
    if (activeTab === "overall") return true;
    if (activeTab === "pending") return b.status === "Pending" || b.status === "Pending Approval";
    if (activeTab === "approved") return b.status === "Approved";
    if (activeTab === "ongoing") return b.status === "On Going";
    if (activeTab === "confirmed") return true; // already filtered by backend
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
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
                <button className="mt-2 text-blue-500 text-xs underline">View Details</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;