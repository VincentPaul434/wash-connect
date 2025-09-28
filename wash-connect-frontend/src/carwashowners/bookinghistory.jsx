import React, { useEffect, useMemo, useState } from "react";
import { FaUserCircle, FaRegCheckSquare, FaTrophy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function BookingHistory() {
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const owner = JSON.parse(localStorage.getItem("carwashOwner"));
        if (!owner || !owner.id) return;

        const appRes = await fetch(`http://localhost:3000/api/carwash-applications/by-owner/${owner.id}`);
        const appData = await appRes.json();

        if (appData && appData.applicationId) {
          const bookingsRes = await fetch(`http://localhost:3000/api/bookings/by-application/${appData.applicationId}`);
          const bookingsData = await bookingsRes.json();
          const rows = Array.isArray(bookingsData)
            ? bookingsData.slice().sort((a, b) => new Date(b.schedule_date) - new Date(a.schedule_date))
            : [];
          setBookingHistory(rows);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derive page size so total pages <= 4
  const { totalPages, pageItems } = useMemo(() => {
    const total = bookingHistory.length;
    if (!total) return { totalPages: 0, pageItems: [] };
    const size = Math.max(1, Math.ceil(total / 4)); // ensures pages <= 4
    const pages = Math.ceil(total / size);
    const start = (currentPage - 1) * size;
    return {
      totalPages: pages,
      pageItems: bookingHistory.slice(start, start + size),
    };
  }, [bookingHistory, currentPage]);

  // Clamp current page when data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [totalPages, currentPage]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="px-6 py-8">
          <div className="text-3xl flex items-center select-none">
            <span className="text-gray-700" style={{ fontFamily: '"Great Vibes", cursive', fontSize: "2.2rem" }}>Wash</span>
            <span className="ml-2 text-red-500 font-semibold" style={{ fontFamily: '"Great Vibes", cursive', fontSize: "2.2rem" }}>Connect</span>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 hover:bg-gray-100 cursor-pointer" onClick={() => navigate("/carwash-dashboard")}>Overview</button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 hover:bg-gray-100 cursor-pointer" onClick={() => navigate("/customer-list")}>Customers & Employee</button>
          <hr className="my-2 border-gray-300" />
          <button className="flex items-center gap-2 mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200 w-full text-left" onClick={() => navigate("/bookings")}>
            <FaRegCheckSquare className="text-lg" /><span>Manage Bookings</span>
          </button>
          <div className="flex items-center gap-2 mb-1 px-2 py-1 bg-blue-100 text-blue-700 font-semibold rounded cursor-pointer transition-colors duration-200 w-full text-left">
            <FaRegCheckSquare className="text-lg" /><span>Booking History</span>
          </div>
          <div className="flex items-center gap-2 mt-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200" onClick={() => navigate('/earning-dashboard')}>
            <FaTrophy className="text-lg" /><span>Earnings Dashboard</span>
          </div>
          <hr className="my-4 border-gray-300" />
        </nav>
        <div className="mt-auto px-4 py-6">
          <button className="flex items-center gap-2 text-gray-700 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200" onClick={() => navigate("/carwash-login")}>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-8 py-4 bg-blue-100 border-b">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">Booking History</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Owner</span>
            <FaUserCircle className="text-2xl text-gray-400" />
          </div>
        </header>

        <div className="flex-1 grid grid-cols-3 gap-6 p-8">
          {/* Booking History List */}
          <section className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Past Bookings</h3>
              {bookingHistory.length > 0 && (
                <div className="text-xs text-gray-500">
                  Showing {pageItems.length} of {bookingHistory.length} • Page {totalPages ? currentPage : 0}/{totalPages || 0}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {bookingHistory.length === 0 && (
                <div className="text-gray-500 text-center">No booking history found.</div>
              )}
              {pageItems.map((booking) => (
                <div key={booking.appointment_id} className="flex flex-col md:flex-row items-start md:items-center bg-white border border-gray-200 rounded-xl shadow p-4 gap-4 relative">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${booking.customer_first_name || ""} ${booking.customer_last_name || ""}`)}`}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                  />
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{`${booking.customer_first_name || ""} ${booking.customer_last_name || ""}`}</span>
                      <span className="text-xs text-gray-500">Customer</span>
                      <span className="ml-auto flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{booking.status || "Completed"}</span>
                    </div>
                    {/* Show booking creation date/time if available */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        Booked: {booking.created_at
                          ? new Date(booking.created_at).toLocaleDateString() +
                            " " +
                            new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date(booking.schedule_date).toLocaleDateString() +
                            " " +
                            new Date(booking.schedule_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {/* Show scheduled date and time */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        Scheduled: {booking.schedule_date
                          ? new Date(booking.schedule_date).toLocaleDateString()
                          : "N/A"}
                        {booking.schedule_time && (
                          <span className="ml-2">
                            | Time: {booking.schedule_time}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="font-semibold">Address:</span>
                      <span className="truncate">{booking.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">Services:</span>
                      <span className="truncate">{booking.service_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">Email:</span>
                      <span className="truncate">{booking.customer_email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination (max 4 pages) */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className={`px-3 py-1 rounded border text-sm ${n === currentPage ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
