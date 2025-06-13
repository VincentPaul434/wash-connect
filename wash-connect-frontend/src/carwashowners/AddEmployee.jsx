import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddEmployee() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    role: "",
    type: "Full-Time",
    address: "",
    email: "",
    avatar: ""
  });
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const owner = JSON.parse(localStorage.getItem("carwashOwner"));
    if (!owner || !owner.id) return;

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
        avatar: form.avatar
      })
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