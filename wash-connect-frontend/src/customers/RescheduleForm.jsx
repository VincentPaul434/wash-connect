import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar } from "lucide-react"; // If you want to use the same icon

// Helper to get day abbreviation from date string
function getDayOfWeek(dateStr) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const d = new Date(dateStr);
  return days[d.getDay()];
}

// Helper to parse time (e.g., "8:00 AM" to "08:00")
function parseTime(str) {
  if (!str) return "";
  let [time, period] = str.split(" ");
  let [hour, minute] = time.split(":");
  hour = Number(hour);
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${minute}`;
}

export default function RescheduleForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment_id = location.state?.appointment_id;
  const personnel_id = location.state?.personnel_id; // Pass this from previous page

  const [available, setAvailable] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAvailability() {
      if (!personnel_id) return;
      try {
        const res = await fetch(`http://localhost:3000/api/personnel/${personnel_id}/availability`);
        const data = await res.json();
        setAvailable(data); // data is an object, not array
      } catch {
        setAvailable(null);
      }
    }
    fetchAvailability();
  }, [personnel_id]);

  const handleReschedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    const chosenDay = getDayOfWeek(date); // e.g. "Mon"
    const validDay = availableDays?.includes(chosenDay);

    const validTime =
      personnelMinTime &&
      personnelMaxTime &&
      time >= personnelMinTime &&
      time <= personnelMaxTime;

    if (!validDay || !validTime) {
      toast.error("Selected date/time is not available for this carwash boy.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/bookings/reschedule/${appointment_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule_date: date, schedule_time: time }),
      });
      if (res.ok) {
        toast.success("Appointment rescheduled!");
        navigate("/booking-confirmation", { state: { appointment_id } });
      } else {
        toast.error("Failed to reschedule.");
      }
    } catch {
      toast.error("Network error.");
    }
    setLoading(false);
  };

  const availableDays = available?.day_available?.split(",").map(d => d.trim());
  let personnelMinTime = "";
  let personnelMaxTime = "";
  if (available?.time_available) {
    const [start, end] = available.time_available.split(" - ");
    personnelMinTime = parseTime(start);
    personnelMaxTime = parseTime(end);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-100">
      <form
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-blue-100"
        onSubmit={handleReschedule}
      >
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Reschedule Appointment</h2>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Schedule Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              className="pl-9 pr-3 py-2 rounded border border-gray-300 w-full focus:outline-none"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
              disabled={!availableDays?.length}
              onInput={e => {
                const chosenDay = getDayOfWeek(e.target.value);
                if (availableDays && !availableDays.includes(chosenDay)) {
                  e.target.setCustomValidity(`Please select an available day: ${availableDays.join(", ")}`);
                } else {
                  e.target.setCustomValidity("");
                }
              }}
            />
            {!availableDays?.length && (
              <div className="text-xs text-red-500 mt-1">
                Please select a carwash boy to see available days.
              </div>
            )}
            {available && available.day_available && (
              <div className="mt-2 text-sm text-blue-700">
                <strong>Available Day:</strong> {available.day_available}
              </div>
            )}
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Schedule Time</label>
          <input
            type="time"
            className="pl-3 pr-3 py-2 rounded border border-gray-300 w-full focus:outline-none"
            value={time}
            onChange={e => setTime(e.target.value)}
            required
            min={personnelMinTime}
            max={personnelMaxTime}
            disabled={!personnelMinTime || !personnelMaxTime}
            onInput={e => {
              const val = e.target.value;
              if (personnelMinTime && personnelMaxTime && (val < personnelMinTime || val > personnelMaxTime)) {
                e.target.setCustomValidity(`Please select a time between ${personnelMinTime} and ${personnelMaxTime}.`);
              } else {
                e.target.setCustomValidity("");
              }
            }}
          />
          {(!personnelMinTime || !personnelMaxTime) && (
            <div className="text-xs text-red-500 mt-1">
              Please select a carwash boy with available time.
            </div>
          )}
          {available && available.time_available && (
            <div className="mt-2 text-sm text-blue-700">
              <strong>Available Time:</strong> {available.time_available}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition mt-2 shadow"
          disabled={loading}
        >
          {loading ? "Rescheduling..." : "Reschedule"}
        </button>
        <button
          type="button"
          className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded transition"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}