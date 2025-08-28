import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaCalendarAlt, FaUsers, FaSignOutAlt } from "react-icons/fa";

function PersonnelAssign() {
  const navigate = useNavigate();
  const location = useLocation();
  const personnel = location.state?.personnel || null;

  const [approvedCarwashes, setApprovedCarwashes] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchApprovedCarwashes = async () => {
      const res = await fetch("http://localhost:3000/api/carwash-applications/approved-with-appointments");
      const data = await res.json();
      setApprovedCarwashes(data);
    };
    fetchApprovedCarwashes();
  }, []);

  const handleAssign = async () => {
    if (!selectedAppointmentId || !personnel) return;
    setAssigning(true);
    await fetch(`http://localhost:3000/api/personnel/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personnelId: personnel.personnelId,
        appointment_id: selectedAppointmentId,
      }),
    });
    setAssigning(false);
    navigate("/personnel-list");
  };

  const handleLogout = () => {
    localStorage.removeItem("carwashOwner");
    localStorage.removeItem("token");
    navigate("/carwash-login");
  };

  if (!personnel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">No Personnel Selected</h2>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => navigate("/personnel-list")}
          >
            Back to Personnel List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
        <div className="flex items-center px-8 py-8 border-b border-gray-100">
          <span className="text-3xl font-bold text-blue-600">WashConnect</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => navigate("/carwash-dashboard")}
          >
            <FaUser className="mr-3 w-5 h-5" />
            Dashboard
          </div>
          <div
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => navigate("/personnel-list")}
          >
            <FaUsers className="mr-3 w-5 h-5" />
            Personnel
          </div>
          <div
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => navigate("/appointments")}
          >
            <FaCalendarAlt className="mr-3 w-5 h-5" />
            Appointments
          </div>
          <div className="mt-auto px-4 pt-8">
            <div
              className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="mr-3 w-5 h-5" />
              Log Out
            </div>
          </div>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mt-12">
          <h2 className="text-2xl font-semibold mb-6">
            Assign {personnel.name} to Appointment
          </h2>
          <select
            className="border rounded px-2 py-1 w-full mb-4"
            value={selectedAppointmentId}
            onChange={e => setSelectedAppointmentId(e.target.value)}
          >
            <option value="">Select Appointment</option>
            {approvedCarwashes.map(cw =>
              cw.appointments?.map(appt => (
                <option key={appt.appointmentId} value={appt.appointmentId}>
                  {cw.carwashName} — {appt.userName} ({appt.userEmail})
                </option>
              ))
            )}
          </select>
          <div className="flex gap-2">
            <button
              className="flex-1 bg-gray-200 rounded px-3 py-1"
              onClick={() => navigate("/personnel-list")}
              disabled={assigning}
            >
              Cancel
            </button>
            <button
              className="flex-1 bg-blue-500 text-white rounded px-3 py-1"
              onClick={handleAssign}
              disabled={assigning || !selectedAppointmentId}
            >
              {assigning ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonnelAssign;