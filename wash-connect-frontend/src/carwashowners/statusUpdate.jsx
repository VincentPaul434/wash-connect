import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const STATUS_OPTIONS = ["halfway", "Completed", "On Going"];

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
  const navigate = useNavigate();

  // Fetch all bookings for this carwash
  useEffect(() => {
    async function fetchBookings() {
      setError("");
      try {
        const owner = JSON.parse(localStorage.getItem("carwashOwner") || "{}");
        const token = localStorage.getItem("token");
        if (!owner?.id || !token) {
          setError("Not authenticated.");
          return;
        }
        const appRes = await fetch(`http://localhost:3000/api/carwash-applications/by-owner/${owner.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const appData = await appRes.json();
        if (!appData?.applicationId) {
          setError("No carwash application found.");
          return;
        }
        const bookingsRes = await fetch(`http://localhost:3000/api/bookings/by-application/${appData.applicationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
      } catch (e) {
        setError("Failed to load bookings.");
        setBookings([]);
        setSelectedId("");
      }
    }
    fetchBookings();
  }, [paramAppointmentId]);

  // Fetch status for selected booking
  useEffect(() => {
    async function fetchStatus() {
      setOldStatus("");
      setNewStatus("");
      if (!selectedId) return;
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:3000/api/bookings/${selectedId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
  }, [selectedId]);

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
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Update Booking Status</h2>
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      <div className="mb-2">
        <label className="block text-sm text-gray-700">Choose Booking</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          disabled={bookings.length === 0}
        >
          <option value="">Select a booking</option>
          {bookings.map(b => (
            <option key={b.appointment_id || b.appointmentId} value={b.appointment_id || b.appointmentId}>
              {(b.customer_first_name || "") + " " + (b.customer_last_name || "")} • {b.service_name} • {new Date(b.schedule_date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>
      {selectedId && (
        <>
          <div className="mb-2">
            <label className="block text-sm text-gray-700">Current Status</label>
            <input className="w-full border rounded px-2 py-1 bg-gray-100" value={oldStatus} disabled />
          </div>
          <div className="mb-2">
            <label className="block text-sm text-gray-700">New Status</label>
            <select className="w-full border rounded px-2 py-1" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm text-gray-700">Reason (optional)</label>
            <input className="w-full border rounded px-2 py-1" value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2" onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update Status"}
          </button>
          {msg && <div className="mt-2 text-green-600">{msg}</div>}
        </>
      )}
    </div>
  );
}