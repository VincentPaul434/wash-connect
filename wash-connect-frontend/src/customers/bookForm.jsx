import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, User, Mail, Calendar, MapPin } from "lucide-react";

const services = [
  {
    name: "Basic Car Wash",
    img: "https://images.pexels.com/photos/372810/pexels-photo-372810.jpeg?auto=compress&w=400&h=300&fit=crop",
    price: 400,
  },
  {
    name: "Full Detailing",
    img: "https://images.pexels.com/photos/3806273/pexels-photo-3806273.jpeg?auto=compress&w=400&h=300&fit=crop",
    price: 1000,
  },
  {
    name: "Underwash",
    img: "https://images.pexels.com/photos/48889/pexels-photo-48889.jpeg?auto=compress&w=400&h=300&fit=crop",
    price: 200,
  },
  {
    name: "Ceramic Coating",
    img: "https://images.pexels.com/photos/170782/pexels-photo-170782.jpeg?auto=compress&w=400&h=300&fit=crop",
    price: 1000,
  },
  {
    name: "Basic Motowash",
    img: "https://images.pexels.com/photos/372810/pexels-photo-372810.jpeg?auto=compress&w=400&h=300&fit=crop",
    price: 50,
  },
];

function BookForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedServiceName = location.state?.serviceName || services[0].name;
  const carwashName = location.state?.carwashName || "Carwash";
  const applicationId = location.state?.applicationId || "";

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      firstName: location.state?.firstName || "",
      lastName: location.state?.lastName || "",
      email: location.state?.email || "",
      address: location.state?.address || "",
    }));
  }, [location.state]);

  // Use the selected service from the booking page; no re-selection here
  const selectedService = useMemo(
    () => services.find((s) => s.name === selectedServiceName) || services[0],
    [selectedServiceName]
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    date: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [personnelList, setPersonnelList] = useState([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const user_id = user.id || user.user_id || "";

    // Use the read-only selected service
    const service_name = selectedService.name;
    const price = selectedService.price;
    const schedule_date = form.date;
    const address = form.address;
    const message = form.message;

    if (!user_id || !applicationId || !service_name || !schedule_date || !address) {
      alert("Missing required fields.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          applicationId,
          service_name,
          schedule_date,
          address,
          message,
          personnelId: selectedPersonnelId,
          price,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit booking.");
      }
      // Navigate to booking confirmation with appointment_id from API response
      navigate("/booking-status", { state: { appointment_id: data.appointment_id } });
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch personnel when form loads
  useEffect(() => {
    async function fetchOwnerIdAndPersonnel() {
      if (applicationId) {
        const res = await fetch(
          `http://localhost:3000/api/carwash-applications/by-application/${applicationId}`
        );
        const app = await res.json();
        if (app.ownerId) {
          const personnelRes = await fetch(
            `http://localhost:3000/api/personnel/by-owner/${app.ownerId}`
          );
          const personnelData = await personnelRes.json();
          setPersonnelList(personnelData);
        } else {
          setPersonnelList([]);
        }
      }
    }
    fetchOwnerIdAndPersonnel();
  }, [applicationId]);

  // Define appointment_id from location.state if available
  const appointment_id = location.state?.appointment_id;

  useEffect(() => {
    if (!appointment_id) {
      // fallback: fetch latest booking for this user
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user.user_id || "";
      if (userId) {
        fetch(`http://localhost:3000/api/bookings/customers/${userId}`).then(
          (res) => res.json()
        );
      }
    }
  }, [appointment_id]);

  return (
    <div
      className="min-h-screen flex bg-[#c8f1ff] relative"
      style={{
        backgroundImage:
          "url('https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUyaWE2Zzlla3FhdWRvN2RwbTVrNDV3NzhlMnNmdm8yOGswNTZxM2FzMiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/dkNo3GLO22E5xORKL4/source.gif')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="w-72" />
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="bg-white bg-opacity-95 rounded-2xl shadow p-10 max-w-2xl w-full mx-auto mt-10 mb-10 border border-gray-200 relative">
          <button
            className="absolute left-6 top-6 text-black hover:bg-gray-100 rounded-full p-1"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-3xl font-semibold mb-2 mt-2 text-center w-full">
            You have booked <span className="text-blue-600">{selectedService.name}</span> in <span className="text-cyan-600">{carwashName}</span>
          </h1>
          <p className="mb-6 text-gray-700 text-center w-full">
            Please review your selected service and fill out the booking form below.
          </p>

          {/* REPLACE carousel with a read-only summary of the chosen service */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-4 border rounded-lg p-3 bg-white">
              <img
                src={selectedService.img}
                alt={selectedService.name}
                className="w-20 h-20 rounded object-cover"
              />
              <div>
                <div className="font-semibold">{selectedService.name}</div>
                <div className="text-gray-700">Price: ₱{selectedService.price}</div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 text-gray-700">First name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2 rounded border border-gray-300 w-full focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-gray-700">Last name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2 rounded border border-gray-300 w-full focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-gray-700">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Johndoe123@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2 rounded border border-gray-300 w-full focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 text-gray-700">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    placeholder="Pilipog Cordova Cebu"
                    value={form.address}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2 rounded border border-gray-300 w-full focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-gray-700">Schedule date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2 rounded border border-gray-300 w-full focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-gray-700">Select Carwash Boy</label>
              <select
                name="personnelId"
                value={selectedPersonnelId}
                onChange={e => setSelectedPersonnelId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select...</option>
                {personnelList.map(p => (
                  <option key={p.personnelId} value={p.personnelId}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-gray-700">Additional message</label>
              <textarea
                name="message"
                placeholder="Type any additional request or message here."
                value={form.message}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-3 min-h-[80px] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-4 bg-[#b3e0ff] hover:bg-[#90c8e8] text-black text-2xl font-medium py-2 rounded border border-gray-300 transition"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
      {/* Backdrop overlay for better readability */}
      <div className="absolute inset-0 bg-[#c8f1ff] opacity-60 pointer-events-none z-0" />
    </div>
  );
}

export default BookForm;