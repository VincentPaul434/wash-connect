import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaEnvelope, FaMapMarkerAlt, FaUserCircle, FaIdBadge } from "react-icons/fa";

export default function PersonnelDetails() {
  const { personnelId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const initial = state?.personnel;
  const [person, setPerson] = useState(initial || null);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState("");

  // Fetch by ID on refresh (add/keep it here)
  useEffect(() => {
    if (initial) return;
    fetch(`http://localhost:3000/api/personnel/${personnelId}`)
      .then(r => r.json())
      .then(data => setPerson(data))
      .catch(() => setError("Failed to load personnel"))
      .finally(() => setLoading(false));
  }, [initial, personnelId]);

  const avatarUrl = useMemo(() => {
    if (person?.avatar) return person.avatar;
    const name = `${person?.first_name || ""} ${person?.last_name || ""}`.trim();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  }, [person]);

  if (loading) {
    return (
      <div className="p-6">
        <button className="text-blue-600 mb-4 flex items-center gap-2" onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="p-6">
        <button className="text-blue-600 mb-4 flex items-center gap-2" onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>
        <div className="text-red-600">{error || "Personnel not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between px-8 py-4 bg-blue-100 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Personnel Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Admin</span>
          <FaUserCircle className="text-2xl text-gray-400" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <button className="text-blue-600 mb-6 flex items-center gap-2" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div className="bg-white border rounded-xl p-6 flex gap-6">
          <img src={avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover border" />
          <div className="flex-1">
            <div className="text-2xl font-semibold">
              {person.first_name} {person.last_name}
            </div>
            <div className="text-sm text-blue-600 flex items-center gap-2 mt-1">
              <FaIdBadge /> {person.role || "—"}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="text-sm">
                <div className="text-gray-500">Type</div>
                <div className="font-medium">{person.type || "—"}</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">Email</div>
                <div className="font-medium flex items-center gap-2">
                  <FaEnvelope className="text-gray-400" /> {person.email || "—"}
                </div>
              </div>
              <div className="text-sm md:col-span-2">
                <div className="text-gray-500">Address</div>
                <div className="font-medium flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400" /> {person.address || "—"}
                </div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">Days Available</div>
                <div className="font-medium">{person.day_available || "—"}</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">Time Available</div>
                <div className="font-medium">{person.time_available || "—"}</div>
              </div>
              <div className="text-sm md:col-span-2">
                <div className="text-gray-500">Combined Availability</div>
                <div className="font-medium">{person.time_availability || "—"}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}