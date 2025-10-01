import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const DAYS = [
  { key: "Mon", label: "Mon" },
  { key: "Tue", label: "Tue" },
  { key: "Wed", label: "Wed" },
  { key: "Thu", label: "Thu" },
  { key: "Fri", label: "Fri" },
  { key: "Sat", label: "Sat" },
  { key: "Sun", label: "Sun" },
];

const TIME_REGEX = /^([1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;

function normalizeTime(input) {
  if (!input) return "";
  let t = input.trim().toUpperCase();
  t = t.replace(/(AM|PM)$/i, " $1").replace(/\s+/g, " ").trim();
  return t;
}

function PersonnelEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const personnel = location.state?.personnel || null;

  const [form, setForm] = useState({
    first_name: personnel?.first_name || "",
    last_name: personnel?.last_name || "",
    role: personnel?.role || "",
    type: personnel?.type || "Full-Time",
    address: personnel?.address || "",
    email: personnel?.email || "",
    avatar: "", // will hold file object
    days_available: personnel?.days_available
      ? personnel.days_available.split(",").map((d) => d.trim())
      : [],
    start_time: personnel?.start_time || "",
    end_time: personnel?.end_time || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(
    personnel?.avatar
      ? personnel.avatar.startsWith("/uploads")
        ? `http://localhost:3000${personnel.avatar}`
        : personnel.avatar
      : "/default-avatar.png"
  );
  const [services, setServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const owner = JSON.parse(localStorage.getItem("carwashOwner"));
    const applicationId = owner?.applicationId;
    if (!applicationId) return;

    fetch(`http://localhost:3000/api/services/by-application/${applicationId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setServices(data))
      .catch(() => setServices([]));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const set = new Set(prev.days_available);
      set.has(day) ? set.delete(day) : set.add(day);
      return {
        ...prev,
        days_available: Array.from(set).sort(
          (a, b) =>
            DAYS.findIndex((d) => d.key === a) -
            DAYS.findIndex((d) => d.key === b)
        ),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const owner = JSON.parse(localStorage.getItem("carwashOwner"));
    const token = localStorage.getItem("token");
    if (!owner || !owner.id || !token) return;

    const start = normalizeTime(form.start_time);
    const end = normalizeTime(form.end_time);

    if (!TIME_REGEX.test(start) || !TIME_REGEX.test(end)) {
      alert(
        "Please enter time in the format h:mm AM/PM (e.g., 8:00 AM, 3:30 PM)."
      );
      return;
    }
    if (form.days_available.length === 0) {
      alert("Please select at least one available day.");
      return;
    }

    const day_available = form.days_available.join(", ");
    const time_available = `${start} - ${end}`;
    const time_availability = `${day_available} ${time_available}`;

    // Use FormData for file upload
    const formData = new FormData();
    formData.append("owner_id", owner.id);
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("role", form.role);
    formData.append("type", form.type);
    formData.append("address", form.address);
    formData.append("email", form.email);
    if (form.avatar) formData.append("avatar", form.avatar);
    formData.append("day_available", day_available);
    formData.append("time_available", time_available);
    formData.append("time_availability", time_availability);

    setSubmitting(true);
    await fetch(`http://localhost:3000/api/personnel/${personnel.personnelId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    setSubmitting(false);
    navigate("/personnel-list");
  };

  if (!personnel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow">
          <div className="font-semibold mb-2">No personnel selected</div>
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => navigate("/personnel-list")}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">Edit Employee</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <img
              src={avatarPreview}
              alt="Avatar Preview"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <label className="block text-sm font-medium mt-2 cursor-pointer">
              <span className="text-blue-600 underline">Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

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
            {services
              .filter((s) => !!s.name)
              .map((s) => (
                <option key={s.serviceId} value={s.name}>
                  {s.name}
                </option>
              ))}
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
                onBlur={(e) =>
                  setForm((p) => ({ ...p, start_time: normalizeTime(e.target.value) }))
                }
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
                onBlur={(e) =>
                  setForm((p) => ({ ...p, end_time: normalizeTime(e.target.value) }))
                }
                required
              />
            </div>
          </div>

          {/* Preview */}
          <div className="text-sm text-gray-600">
            Preview:{" "}
            <span className="font-semibold">
              {form.days_available.join(", ") || "—"}{" "}
              {form.start_time && form.end_time
                ? `— ${normalizeTime(form.start_time)} - ${normalizeTime(form.end_time)}`
                : ""}
            </span>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-1 rounded bg-gray-200"
              onClick={() => navigate("/personnel-list")}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded bg-blue-500 text-white"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PersonnelEdit;