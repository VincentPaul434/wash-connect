import React, { useEffect, useState } from "react";
import { FaUserCircle, FaMapMarkerAlt, FaEnvelope, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // <-- Add this import

const statusColors = {
  "New Customer": "border-blue-400 text-blue-600",
  "Repeat Customer": "border-green-400 text-green-600",
  "Blocked": "border-red-400 text-red-600",
};

 function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");
  const navigate = useNavigate(); // <-- Add this line

  useEffect(() => {
    // Fetch confirmed customers for this carwash branch
    const owner = JSON.parse(localStorage.getItem("carwashOwner"));
    if (!owner || !owner.id) return;

    // Get applicationId for this owner
    fetch(`http://localhost:3000/api/carwash-applications/by-owner/${owner.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.applicationId) {
          // Fetch only confirmed bookings for this applicationId
          fetch(`http://localhost:3000/api/bookings/confirmed/${data.applicationId}`)
            .then(res => res.json())
            .then(setCustomers)
            .catch(() => setCustomers([]));
        }
      });
  }, []);

  // Filter and sort customers
  const filtered = customers
    .filter(c =>
      (c.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "date") return new Date(b.latest_booking) - new Date(a.latest_booking);
      if (sort === "name") return (a.customer_name || "").localeCompare(b.customer_name || "");
      return 0;
    });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-blue-100 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Customers & Employee</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Admin</span>
          <FaUserCircle className="text-2xl text-gray-400" />
        </div>
      </div>

      {/* Tabs and Stats */}
      <div className="bg-white px-8 pt-6 pb-2 border-b flex flex-col gap-4">
        <div className="flex gap-8 items-end">
          <div className="flex gap-4">
            <button className="border-b-2 border-blue-400 text-blue-600 font-semibold pb-1 px-2">Customer</button>
            <button
              className="text-gray-400 pb-1 px-2 hover:text-blue-600"
              onClick={() => navigate("/personnel-list")} // <-- Add this handler
            >
              Personnel
            </button>
          </div>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-3 flex flex-col items-center">
            <span className="text-2xl font-bold">{customers.length}</span>
            <span className="text-xs text-gray-500">Total Customer</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-3 flex flex-col items-center">
            <span className="text-2xl font-bold">
              {customers.filter(c => c.status === "New Customer").length}
            </span>
            <span className="text-xs text-gray-500">New Customer</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-3 flex flex-col items-center">
            <span className="text-2xl font-bold">
              {customers.filter(c => c.status === "Repeat Customer").length}
            </span>
            <span className="text-xs text-gray-500">Repeat Customer</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-3 flex flex-col items-center">
            <span className="text-2xl font-bold">
              {customers.filter(c => c.status === "Blocked").length}
            </span>
            <span className="text-xs text-gray-500">Blocked Customer</span>
          </div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="border rounded px-2 py-1 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Customer Cards */}
      <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">All Customer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-300 p-4 flex flex-col gap-2 relative"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    c.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      (c.customer_first_name || "") + " " + (c.customer_last_name || "")
                    )}`
                  }
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div className="flex-1">
                  <div className="font-semibold text-base">
                    {(c.customer_first_name || "") + " " + (c.customer_last_name || "")}
                  </div>
                  <div className="text-xs text-gray-500">Customer</div>
                </div>
                {c.status && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full border text-xs font-semibold ${
                      statusColors[c.status] || "border-gray-300 text-gray-500"
                    }`}
                  >
                    {c.status}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs text-gray-600 mb-1">
                  <FaMapMarkerAlt className="mr-1 text-gray-400" />
                  <span>{c.address}</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <FaEnvelope className="mr-1 text-gray-400" />
                  <span>{c.customer_email}</span>
                </div>
              </div>
              <button className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-700">
                <svg width="20" height="20" fill="currentColor">
                  <circle cx="10" cy="5" r="1.5" />
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="10" cy="15" r="1.5" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} export default CustomerList;