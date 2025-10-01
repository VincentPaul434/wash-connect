import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaRegEnvelope, FaRegEye, FaRegUser, FaRegCheckSquare, FaRegFolderOpen, FaTrophy } from "react-icons/fa";

const STATUS_OPTIONS = ["halfway", "Completed", "On Going"]; // No cancel/declined

export default function StatusUpdate() {
  const { appointmentId: paramAppointmentId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [selectedId, setSelectedId] = useState(paramAppointmentId || "");
  const [oldStatus, setOldStatus] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("status-update");
  const navigate = useNavigate();

  // Fetch all bookings for this carwash
  useEffect(() => {
    async function fetchBookings() {
      setError("");
      try {
        const owner = JSON.parse(localStorage.getItem("carwashOwner") || "{}");
        const token = localStorage.getItem("token");
        if (!owner?.id || !token) {
          navigate("/carwash-login");
          return;
        }
        const appRes = await fetch(`http://localhost:3000/api/carwash-applications/by-owner/${owner.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (appRes.status === 401) {
          navigate("/carwash-login");
          return;
        }
        const appData = await appRes.json();
        if (!appData?.applicationId) {
          setError("No carwash application found.");
          return;
        }
        const bookingsRes = await fetch(`http://localhost:3000/api/bookings/by-application/${appData.applicationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bookingsRes.status === 401) {
          navigate("/carwash-login");
          return;
        }
        const bookingsData = await bookingsRes.json();
        if (!Array.isArray(bookingsData) || bookingsData.length === 0) {
          setError("No bookings found for this carwash.");
          setBookings([]);
          setSelectedId("");
          return;
        }
        setBookings(bookingsData);
        // If no param, select first booking
        if (!paramAppointmentId && bookingsData.length > 0) {
          setSelectedId(bookingsData[0].appointment_id || bookingsData[0].appointmentId);
        }
      } catch {
        setError("Failed to load bookings.");
        setBookings([]);
        setSelectedId("");
      }
    }
    fetchBookings();
  }, [paramAppointmentId, navigate]);

  // Fetch status for selected booking
  useEffect(() => {
    async function fetchStatus() {
      setOldStatus("");
      setNewStatus("");
      if (!selectedId) return;
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/carwash-login");
        return;
      }
      try {
        const res = await fetch(`http://localhost:3000/api/bookings/${selectedId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          navigate("/carwash-login");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setOldStatus(data.status || "");
          setNewStatus(data.status || "");
        } else {
          setOldStatus("");
          setNewStatus("");
        }
      } catch {
        setOldStatus("");
        setNewStatus("");
      }
    }
    fetchStatus();
  }, [selectedId, navigate]);

  const handleUpdate = async () => {
    if (!selectedId) {
      setMsg("");
      setError("Please select a booking.");
      return;
    }
    setLoading(true);
    setMsg("");
    setError("");
    const token = localStorage.getItem("token");
    try {
      // Use PATCH /api/bookings/status with appointmentId in body
      const res = await fetch(`http://localhost:3000/api/bookings/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId: selectedId, new_status: newStatus, reason })
      });
      if (res.ok) {
        setMsg("Status updated!");
        setTimeout(() => navigate(-1), 1000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update status.");
      }
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* Logo */}
        <div className="px-6 py-8">
          <div className="text-3xl flex items-center select-none">
            <span
              className="text-gray-700"
              style={{ fontFamily: '"Great Vibes", cursive', fontSize: "2.2rem" }}
            >
              Wash
            </span>
            <span
              className="ml-2 text-red-500 font-semibold"
              style={{ fontFamily: '"Great Vibes", cursive', fontSize: "2.2rem" }}
            >
              Connect
            </span>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
              activeTab === "overview"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-gray-100 cursor-pointer"
            }`}
            onClick={() => {
              setActiveTab("overview");
              navigate("/carwash-dashboard");
            }}
          >
            <FaRegEye /> Overview
          </button>
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
              activeTab === "customers"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-gray-100 cursor-pointer"
            }`}
            onClick={() => {
              setActiveTab("customers");
              navigate("/customer-list");
            }}
          >
            <span className="text-lg">★</span> Customers & Employee
          </button>
          {/* Status Update Tab */}
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
              activeTab === "status-update"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-gray-100 cursor-pointer"
            }`}
            onClick={() => {
              setActiveTab("status-update");
              navigate("/status-update");
            }}
          >
            <FaRegCheckSquare className="text-lg" />
            <span>Status Update</span>
          </button>
          <hr className="my-2 border-gray-300" />
          <button
            className="flex items-center gap-2 mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200 w-full text-left"
            onClick={() => navigate("/bookings")}
          >
            <FaRegCheckSquare className="text-lg" />
            <span>Manage Bookings</span>
          </button>
          <div
            className="flex items-center gap-2 mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200"
            onClick={() => navigate("/booking-history")}
          >
            <FaRegCheckSquare className="text-lg" />
            <span>Booking History</span>
          </div>
          <div className="flex items-center gap-2 mt-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200" onClick={() => navigate('/earning-dashboard')}>
            <FaTrophy className="text-lg" />
            <span>Earnings Dashboard</span>
          </div>
          {/* Add Refund Request below Earnings Dashboard */}
          <div className="flex items-center gap-2 mt-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200" onClick={() => navigate('/refund-request')}>
            <FaRegFolderOpen className="text-lg" />
            <span>Request Refund</span>
          </div>
          <hr className="my-4 border-gray-300" />
        </nav>
        <div className="mt-auto px-4 py-6">
          <button
            className="flex items-center gap-2 text-gray-700 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("carwashOwner");
              navigate("/carwash-login");
            }}
          >
            <FaRegFolderOpen className="text-lg" /> Logout
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-100">
        <div className="max-w-lg w-full mt-10 bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
          <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
            <FaRegCheckSquare className="text-blue-500" /> Update Booking Status
          </h2>
          {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Choose Booking</label>
            <select
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              disabled={bookings.length === 0}
            >
              <option value="">Select a booking</option>
              {bookings
                .filter(b => !["Cancelled", "Declined", "Completed"].includes(b.status))
                .map(b => (
                  <option key={b.appointment_id || b.appointmentId} value={b.appointment_id || b.appointmentId}>
                    {(b.customer_first_name || "") + " " + (b.customer_last_name || "")} • {b.service_name} • {new Date(b.schedule_date).toLocaleDateString()}
                  </option>
                ))}
            </select>
          </div>
          {selectedId && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Current Status</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-gray-100 font-semibold text-gray-600"
                  value={oldStatus}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Status</label>
                <select
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  disabled={oldStatus === "Completed"} // Disable if already completed
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason <span className="text-gray-400">(optional)</span></label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[60px] focus:ring-2 focus:ring-blue-100"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Add a reason for the status update (optional)"
                  disabled={oldStatus === "Completed"} // Disable if already completed
                />
              </div>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition mt-2 shadow"
                onClick={handleUpdate}
                disabled={loading || oldStatus === "Completed"} // Disable if already completed
              >
                {loading ? "Updating..." : "Update Status"}
              </button>
              {oldStatus === "Completed" && (
                <div className="mt-2 text-gray-500 text-center font-semibold">
                  This booking is marked as <span className="text-green-600">Completed</span> and cannot be updated.
                </div>
              )}
              {msg && <div className="mt-2 text-green-600 text-center font-semibold">{msg}</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}