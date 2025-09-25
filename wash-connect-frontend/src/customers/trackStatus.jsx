import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaRegCheckSquare } from "react-icons/fa";

export default function TrackStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment_id = location.state?.appointment_id;

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      setError("");
      try {
        if (!appointment_id) {
          setError("No booking selected.");
          setLoading(false);
          return;
        }
        const res = await fetch(`http://localhost:3000/api/bookings/${appointment_id}`);
        if (!res.ok) {
          setError("Booking not found.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setStatus(data.status || "");
      } catch {
        setError("Failed to fetch booking status.");
      }
      setLoading(false);
    }
    fetchStatus();
  }, [appointment_id]);

  // Status color logic
  const statusColor =
    status === "Completed"
      ? "bg-green-100 text-green-700"
      : status === "halfway"
      ? "bg-yellow-100 text-yellow-700"
      : status === "On Going"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-100">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2 justify-center">
          <FaRegCheckSquare className="text-blue-500" /> Booking Status
        </h2>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={`px-6 py-3 rounded-lg text-xl font-semibold ${statusColor}`}>
              {status ? status : "No status available"}
            </div>
          </div>
        )}
        <button
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}