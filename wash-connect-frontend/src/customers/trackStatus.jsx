import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaUser, FaStar, FaHeart, FaCalendarAlt } from "react-icons/fa";


export default function TrackStatus() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Fetch bookings for current user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || user.user_id;
    if (!userId) return;
    fetch(`http://localhost:3000/api/bookings/customers/${userId}`)
      .then((res) => res.json())
      .then((data) => setBookings(data || []));
  }, []);

  // Filter bookings by search
  useEffect(() => {
    let rows = bookings;
    if (searchId.trim()) {
      rows = rows.filter(b => String(b.appointment_id).includes(searchId.trim()));
    }
    setFiltered(rows);
    setCurrentPage(1);
  }, [bookings, searchId]);

  // Filter for Completed and On Going bookings first
  const filteredBookings = bookings.filter(
    (b) => ["Completed", "On Going"].includes(b.status)
  );

  // Sort by schedule_date descending (latest first)
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (a.schedule_date && b.schedule_date) {
      return new Date(b.schedule_date) - new Date(a.schedule_date);
    }
    return (b.appointment_id || 0) - (a.appointment_id || 0);
  });

  // Apply search filter
  const searchedBookings = searchId.trim()
    ? sortedBookings.filter(b => String(b.appointment_id).includes(searchId.trim()))
    : sortedBookings;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(searchedBookings.length / pageSize));
  const paged = searchedBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Get first active booking for sidebar actions


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
          {/* Track Status Tab */}
          <div
            className="flex items-center w-full px-4 py-3 rounded-lg bg-cyan-100 text-cyan-700 font-semibold cursor-pointer"
            onClick={() => navigate("/track-status")}
          >
            <span className="text-xl">🔎</span>
            <span className="text-gray-700">Track Status</span>
          </div>
          {/* Appointment Tab */}
          <div
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => navigate("/booking-confirmation")}
          >
            <FaCalendarAlt className="mr-3 w-5 h-5" />
            Appointment
          </div>
          <div className="mt-auto px-4 pt-8">
            <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer" onClick={() => navigate("/login")}>
              <span className="text-xl">📁</span>
              <span className="text-gray-700">LogOut</span>
            </div>
          </div>
        </nav>
      </div>
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
          <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
            Track Status
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter Booking ID"
              className="border px-3 py-2 rounded w-64"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
            <button
              className="border px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setSearchId(searchId)}
            >
              Track
            </button>
            <button
              className="border px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setSearchId("")}
            >
              My Bookings
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border mb-2">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-4 py-2">Booking ID</th>
                  <th className="border px-4 py-2">Service</th>
                  <th className="border px-4 py-2">Date</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No bookings found.</td>
                  </tr>
                ) : (
                  paged.map(b => (
                    <tr key={b.appointment_id}>
                      <td className="border px-4 py-2">{b.appointment_id}</td>
                      <td className="border px-4 py-2">{b.service_name}</td>
                      <td className="border px-4 py-2">{b.schedule_date?.slice(0,16).replace("T"," ")}</td>
                      <td className="border px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          b.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : b.status === "Halfway"
                            ? "bg-yellow-100 text-yellow-700"
                            : b.status === "Confirmed"
                            ? "bg-purple-100 text-purple-700"
                            : b.status === "On Going"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          className="text-blue-600 underline"
                          onClick={() => navigate("/track-status-details", { state: { appointment_id: b.appointment_id } })}
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} · Showing {paged.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{(currentPage - 1) * pageSize + paged.length} of {filtered.length}
            </span>
            <button
              className="border px-2 py-1 rounded disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="border px-2 py-1 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}