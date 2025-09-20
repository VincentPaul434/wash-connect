import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DAYS = [
  { key: "Mon", label: "Mon" },
  { key: "Tue", label: "Tue" },
  { key: "Wed", label: "Wed" },
  { key: "Thu", label: "Thu" },
  { key: "Fri", label: "Fri" },
  { key: "Sat", label: "Sat" },
  { key: "Sun", label: "Sun" },
];

// Validates strings like "8:00 AM", "1:05 pm", "12:30PM"
const TIME_REGEX = /^([1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;

function normalizeTime(input) {
  if (!input) return "";
  let t = input.trim().toUpperCase();
  // Add space before AM/PM if missing (e.g., "8:00AM" -> "8:00 AM")
  t = t.replace(/(AM|PM)$/i, " $1").replace(/\s+/g, " ").trim();
  return t;
}

function AddEmployee() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    role: "",
    type: "Full-Time",
    address: "",
    email: "",
    avatar: "",
    days_available: [],         // array of day abbreviations 
    start_time: "",             // "x:xx AM/PM"
    end_time: "",               // "x:xx AM/PM"
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const set = new Set(prev.days_available);
      set.has(day) ? set.delete(day) : set.add(day);
      return { ...prev, days_available: Array.from(set).sort((a, b) => DAYS.findIndex(d => d.key === a) - DAYS.findIndex(d => d.key === b)) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const owner = JSON.parse(localStorage.getItem("carwashOwner"));
    if (!owner || !owner.id) return;

    const start = normalizeTime(form.start_time);
    const end = normalizeTime(form.end_time);

    if (!TIME_REGEX.test(start) || !TIME_REGEX.test(end)) {
      alert("Please enter time in the format h:mm AM/PM (e.g., 8:00 AM, 3:30 PM).");
      return;
    }
    if (form.days_available.length === 0) {
      alert("Please select at least one available day.");
      return;
    }

    const day_available = form.days_available.join(", ");          // e.g., "Mon, Wed, Fri"
    const time_available = `${start} - ${end}`;                     // e.g., "8:00 AM - 3:00 PM"
    const time_availability = `${day_available} ${time_available}`; // legacy combined string

    await fetch(`http://localhost:3000/api/personnel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_id: owner.id,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        type: form.type,
        address: form.address,
        email: form.email,
        avatar: form.avatar,
        // New explicit fields
        day_available,
        time_available,
        // Backward compatibility if backend still expects this
        time_availability,
      }),
    });
    navigate("/personnel-list");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">Add Employee</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              className="border rounded px-2 py-1 flex-1"
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
            <input
              className="border rounded px-2 py-1 flex-1"
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <select
            className="border rounded px-2 py-1"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="Carwash Attendant">Carwash Attendant</option>
            <option value="Detailing Specialist">Detailing Specialist</option>
          </select>

          <select
            className="border rounded px-2 py-1"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contractual">Contractual</option>
          </select>

          <input
            className="border rounded px-2 py-1"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            required
          />
          <input
            className="border rounded px-2 py-1"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="border rounded px-2 py-1"
            name="avatar"
            placeholder="Avatar URL (optional)"
            value={form.avatar}
            onChange={handleChange}
          />

          {/* Days Available */}
          <div>
            <label className="block text-sm font-medium mb-2">Days Available</label>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map((d) => (
                <label key={d.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.days_available.includes(d.key)}
                    onChange={() => toggleDay(d.key)}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          {/* Time Available */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm mb-1">Start Time</label>
              <input
                className="border rounded px-2 py-1 w-full"
                name="start_time"
                placeholder="e.g., 8:00 AM"
                value={form.start_time}
                onChange={handleChange}
                onBlur={(e) => setForm((p) => ({ ...p, start_time: normalizeTime(e.target.value) }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">End Time</label>
              <input
                className="border rounded px-2 py-1 w-full"
                name="end_time"
                placeholder="e.g., 3:00 PM"
                value={form.end_time}
                onChange={handleChange}
                onBlur={(e) => setForm((p) => ({ ...p, end_time: normalizeTime(e.target.value) }))}
                required
              />
            </div>
          </div>

          {/* Preview */}
          <div className="text-sm text-gray-600">
            Preview:{" "}
            <span className="font-semibold">
              {form.days_available.join(", ") || "—"}{" "}
              {form.start_time && form.end_time ? `— ${normalizeTime(form.start_time)} - ${normalizeTime(form.end_time)}` : ""}
            </span>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-1 rounded bg-gray-200"
              onClick={() => navigate("/personnel-list")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded bg-blue-500 text-white"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployee;