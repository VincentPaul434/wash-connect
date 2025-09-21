import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function PersonnelAssign() {
  const navigate = useNavigate();
  const location = useLocation();
  const personnel = location.state?.personnel || null;

  const [carwashApp, setCarwashApp] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const owner = JSON.parse(localStorage.getItem("carwashOwner") || "{}");
        if (!owner?.id) {
          navigate("/carwash-login");
          return;
        }
        // Get this owner's carwash application
        const appRes = await fetch(`http://localhost:3000/api/carwash-applications/by-owner/${owner.id}`);
        const appData = await appRes.json();
        setCarwashApp(appData || null);

        if (appData?.applicationId) {
          const svcRes = await fetch(
            `http://localhost:3000/api/services/by-application/${appData.applicationId}`
          );
          const svcData = await svcRes.json();
          setServices(Array.isArray(svcData) ? svcData : []);
        } else {
          setServices([]);
        }
      } catch {
        setError("Failed to load services.");
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleAssign = async () => {
    if (!personnel?.personnelId) {
      setError("Missing personnel.");
      return;
    }
    if (!selectedServiceId) {
      setError("Select a service first.");
      return;
    }
    setError("");
    setAssigning(true);
    try {
      const res = await fetch("http://localhost:3000/api/personnel/assign-to-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personnelId: personnel.personnelId,
          serviceId: selectedServiceId,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to assign.");
      }
      navigate("/personnel-list");
    } catch (e) {
      setError(e.message || "Network error.");
    } finally {
      setAssigning(false);
    }
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
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6">
      <div className="bg-white w-full max-w-xl rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Assign Personnel to Service</h1>

        <div className="mb-3 text-sm text-gray-600">
          <div className="font-medium text-gray-800">
            {personnel.name || `${personnel.first_name || ""} ${personnel.last_name || ""}`.trim()}
          </div>
          {carwashApp?.carwashName && <div>Carwash: {carwashApp.carwashName}</div>}
        </div>

        {loading ? (
          <div className="text-gray-500">Loading services…</div>
        ) : services.length === 0 ? (
          <div className="p-3 bg-gray-50 border rounded text-gray-700 text-sm">
            No services found for your carwash. Add services first.
          </div>
        ) : (
          <>
            <label className="block mb-1 text-sm text-gray-700">Select Service</label>
            <select
              className="border rounded px-3 py-2 w-full mb-4"
              value={String(selectedServiceId)}
              onChange={(e) => setSelectedServiceId(e.target.value)}
            >
              <option value="">Select Service</option>
              {services.map((s) => (
                <option key={s.serviceId ?? s.id} value={String(s.serviceId ?? s.id)}>
                  {s.name} {Number(s.price) ? `• ₱${Number(s.price)}` : ""}
                </option>
              ))}
            </select>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            <div className="flex gap-2">
              <button className="flex-1 border rounded px-3 py-2" onClick={() => navigate("/personnel-list")} disabled={assigning}>
                Cancel
              </button>
              <button
                className="flex-1 bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-60"
                onClick={handleAssign}
                disabled={assigning || !selectedServiceId}
              >
                {assigning ? "Assigning..." : "Assign"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PersonnelAssign;