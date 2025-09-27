import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function RescheduleForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment_id = location.state?.appointment_id;
  const personnel_id = location.state?.personnel_id; // Pass this from previous page

  const [availableSlots, setAvailableSlots] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAvailability() {
      if (!personnel_id) return;
      try {
        const res = await fetch(`http://localhost:3000/api/personnel/${personnel_id}/availability`);
        const data = await res.json();
        setAvailableSlots(data);
      } catch {
        setAvailableSlots([]);
      }
    }
    fetchAvailability();
  }, [personnel_id]);

  // Get unique available dates
  const availableDates = [...new Set(availableSlots.map(slot => slot.available_date))];
  // Get times for selected date
  const availableTimes = availableSlots.filter(slot => slot.available_date === date).map(slot => slot.available_time);

  const handleReschedule = async (e) => {
    e.preventDefault();
    setLoading(true);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-100">
      <form
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-blue-100"
        onSubmit={handleReschedule}
      >
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Reschedule Appointment</h2>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Available Dates</label>
          <select
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
            value={date}
            onChange={e => { setDate(e.target.value); setTime(""); }}
            required
          >
            <option value="">Select date</option>
            {availableDates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Available Times</label>
          <select
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
            value={time}
            onChange={e => setTime(e.target.value)}
            required
            disabled={!date}
          >
            <option value="">Select time</option>
            {availableTimes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
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