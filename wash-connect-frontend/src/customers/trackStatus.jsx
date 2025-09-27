import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope, FaUser, FaStar, FaHeart, FaRegCheckSquare, FaCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const STATUS_STEPS = [
  { key: "On Going", label: "On Going" },
  { key: "halfway", label: "Halfway" },
  { key: "Completed", label: "Completed" },
];

export default function TrackStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment_id = location.state?.appointment_id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    async function fetchBooking() {
      setLoading(true);
      setError("");
      try {
        if (!appointment_id) {
          setError("No booking selected.");
          setLoading(false);
          return;
        }
        const res = await fetch(`http://localhost:3000/api/bookings/with-personnel/${appointment_id}`);
        if (!res.ok) {
          setError("Booking not found.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setBooking(data);
      } catch {
        setError("Failed to fetch booking.");
      }
      setLoading(false);
    }
    fetchBooking();
  }, [appointment_id]);

  useEffect(() => {
    async function fetchReason() {
      if (!appointment_id) return;
      try {
        const res = await fetch(`http://localhost:3000/api/bookings/reason/${appointment_id}`);
        const data = await res.json();
        console.log("Fetched reason:", data.reason); // <-- Add this
        setReason(data.reason || "");
      } catch {
        setReason("");
      }
    }
    fetchReason();
  }, [appointment_id]);

  // Find current step index
  const currentStep = STATUS_STEPS.findIndex(
    (step) => step.key.toLowerCase() === (booking?.status || "").toLowerCase()
  );

  // Helper to check if booking is paid
  const isPaid =
    booking?.payment_status === "Paid" ||
    (Array.isArray(booking?.payments) &&
      booking.payments.some((p) => p.payment_status === "Paid"));

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-cyan-50 to-blue-100">
      {/* Sidebar - same design flow as UserDashboard */}
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
            onClick={() => {
              if (appointment_id) {
                navigate("/track-status", { state: { appointment_id } });
              } else {
                toast(
                  <div>
                    <span role="img" aria-label="track" style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>🔎</span>
                    <span>No active appointment found.</span>
                  </div>,
                  {
                    icon: "🚫",
                  }
                );
              }
            }}
          >
            <span className="text-xl">🔎</span>
            <span className="text-gray-700">Track Status</span>
          </div>
          {/* Change "Booking Status" to "Appointment" */}
          <div
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => {
              if (
                booking &&
                ["Confirmed", "On Going", "halfway", "Completed"].includes(booking.status)
              ) {
                navigate("/booking-confirmation", { state: { appointment_id: booking.appointment_id } });
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
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
          <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
            Booking Progress
          </h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : booking ? (
            <>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between w-full px-2">
                  {STATUS_STEPS.map((step, idx) => (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                            ${idx <= currentStep ? "bg-purple-700 text-white" : "bg-gray-400 text-white"}
                          `}
                        >
                          {idx + 1}
                        </div>
                        <span className={`mt-2 text-xs font-semibold ${idx <= currentStep ? "text-purple-700" : "text-gray-500"}`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-2 mx-1 rounded ${idx < currentStep ? "bg-purple-700" : "bg-gray-300"}`}></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              {/* Carwash Boy Display */}
              <div className="mb-2 flex items-center gap-2 justify-center">
                <span className="font-semibold text-gray-700">Carwash Boy:</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                  {booking.personnel_first_name} {booking.personnel_last_name}
                </span>
              </div>
              {/* Carwash Service Display */}
              <div className="mb-4 flex items-center gap-2 justify-center">
                <span className="font-semibold text-gray-700">Service Booked:</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                  {booking.service_name}
                </span>
              </div>
              {/* Status Display */}
              <div className="flex flex-col items-center gap-2">
                <div className={`px-6 py-3 rounded-lg text-xl font-semibold ${
                  booking.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : booking.status === "halfway"
                    ? "bg-yellow-100 text-yellow-700"
                    : booking.status === "On Going"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {booking.status}
                </div>
              </div>
              {/* Reason Display */}
              <div className="mt-4 flex items-center gap-2 justify-center">
                <span className="font-semibold text-gray-700">Reason:</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                  {reason ? reason : "No reason provided."}
                </span>
              </div>
              {/* Confirm Completion & Book Again Button */}
              {booking.status === "Completed" && isPaid && (
                <button
                  className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
                  onClick={() => {
                    setBooking(null);
                    toast.success("Booking completed! Would you like to leave feedback?");
                    navigate("/feedback", { state: { appointment_id: booking.appointment_id } });
                  }}
                >
                  Confirm Completion & Book Again
                </button>
              )}
              {booking.status === "Completed" && !isPaid && (
                <div className="mt-6 w-full bg-yellow-100 text-yellow-700 font-bold py-2 rounded text-center">
                  You must complete payment before confirming completion.
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">No booking details found.</div>
          )}
          <button
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </main>
    </div>
  );
}