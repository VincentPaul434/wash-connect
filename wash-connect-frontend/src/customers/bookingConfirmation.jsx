import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Calendar, User, MapPin, Phone } from "lucide-react";
import { FaStar } from "react-icons/fa";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function bookingPrice(serviceName) {
  const services = [
    { name: "Basic Car Wash", price: 400 },
    { name: "Full Detailing", price: 1000 },
    { name: "Underwash", price: 200 },
    { name: "Ceramic Coating", price: 1000 },
    { name: "Basic Motowash", price: 50 },
    { name: "Engine Detailing", price: 2000 },
  ];
  return services.find((s) => s.name === serviceName)?.price || 0;
}

function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Only use state for appointment_id
  const appointment_id = location.state?.appointment_id;

  // Debug log
  // console.log("location.state:", location.state);
  // console.log("appointment_id:", appointment_id);

  const [booking, setBooking] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Fetch booking details
  useEffect(() => {
    if (appointment_id) {
      fetch(`http://localhost:3000/api/bookings/with-personnel/${appointment_id}`)
        .then((res) => res.json())
        .then((data) => {
          setBooking(data);
        })
        .catch(() => {
          setBooking(null);
        });
    } else {
      setBooking(null);
    }
  }, [appointment_id]);

  // Fetch personnel if not already set
  useEffect(() => {
    let ignore = false;
    const ownerId = booking && booking.owner_id;
    if (ownerId && !booking.personnelId) {
      fetch(`http://localhost:3000/api/personnel/by-owner/${ownerId}`)
        .then((res) => res.json())
        .then((personnelList) => {
          if (!ignore && personnelList && personnelList.length > 0) {
            const carwashBoy = personnelList[0];
            setBooking((prev) => ({
              ...prev,
              personnelId: carwashBoy?.personnelId,
              personnel_first_name: carwashBoy?.first_name,
              personnel_last_name: carwashBoy?.last_name,
              personnel_address: carwashBoy?.address,
              personnel_email: carwashBoy?.email,
              personnel_avatar: carwashBoy?.avatar,
            }));
          }
        });
    }
    return () => { ignore = true; };
  }, [booking && booking.owner_id]);

  // Add these states for rating
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
  
    if (!appointment_id || !booking) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-semibold mb-4">No Appointments Booked</h2>
            <p className="mb-6">You currently have no active appointments. Book a service to get started!</p>
            <button
              onClick={() => navigate("/book")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Book Now
            </button>
          </div>
        </div>
      );
    }
  
    const servicePrice =
      booking.price !== null && booking.price !== undefined
        ? booking.price
        : bookingPrice(booking.service_name);

  // Get customer name
  const customerName = `${booking.customer_first_name || ""} ${booking.customer_last_name || ""}`.trim();

  // Submit rating handler
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`http://localhost:3000/api/bookings/rate/${appointment_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          customer_name: customerName,
        }),
      });
      setSuccess(true);
    } catch  {
      alert("Failed to submit rating. Please try again.");
    }
    setSubmitting(false);
  };

  const handleCancelBooking = async () => {
    if (!appointment_id) return;
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCanceling(true);
    try {
      const res = await fetch(`http://localhost:3000/api/bookings/cancel/${appointment_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to cancel booking.");
      setCancelSuccess(true);
      setBooking((prev) => ({ ...prev, status: "Cancelled" }));
    } catch {
      alert("Failed to cancel booking.");
    }
    setCanceling(false);
  };

  return (
    <div className="min-h-screen flex bg-[#c8f1ff]">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col min-h-screen">
        <div className="flex items-center px-8 py-8 border-b border-gray-100">
          <span className="text-3xl" style={{ fontFamily: "Brush Script MT, cursive" }}>
            <span className="text-cyan-500">Wash</span>{" "}
            <span className="text-red-500">Connect</span>
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer">
            <Mail className="mr-3 w-5 h-5" />
            Inbox
            <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">0</span>
          </div>
          <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
                onClick={() => navigate("/user-dashboard")}
          >
            <User className="mr-3 w-5 h-5" />
            Account
          </div>
          <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => navigate("/popular-carwash")}
          >
            <span className="mr-3">★</span>
            Carwash Shops
          </div>
          <div className="flex items-center w-full px-4 py-3 rounded-lg bg-cyan-100 text-cyan-700 font-semibold cursor-pointer"
            onClick={() => navigate("/book")}
          >
            <span className="text-xl">♡</span>
            Bookings
          </div>
          <hr className="my-4" />
          <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer">
            <Calendar className="mr-3 w-5 h-5" />
            Appointment
          </div>
          <div className="mt-auto px-4 pt-8">
            <div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              <span className="text-xl">📁</span>
              LogOut
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center py-8 px-4">
        <div className="flex items-center w-full max-w-5xl mb-6">
          <button
            className="mr-4 text-black hover:bg-gray-100 rounded-full p-2"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ArrowLeft size={32} />
          </button>
          <h1 className="text-3xl font-semibold text-gray-700">Appointment</h1>
        </div>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
          {/* Left: Booking Info */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow p-6 mb-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <span className="bg-green-100 rounded-full p-2 mr-3">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#22c55e" />
                    <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <div className="text-lg font-semibold text-green-700">Appointment Booked!</div>
                  <div className="text-gray-600 text-sm">You'll receive a confirmation mail shortly!</div>
                </div>
                <span className="ml-auto bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full font-semibold text-sm flex items-center">
                  ● {booking.status}
                </span>
              </div>
              {/* Interactive Map */}
              <div className="rounded-lg overflow-hidden mb-3" style={{ height: "200px" }}>
                {booking.lat && booking.lng ? (
                  <MapContainer
                    center={[booking.lat, booking.lng]}
                    zoom={16}
                    style={{ width: "100%", height: "200px" }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[booking.lat, booking.lng]}>
                      <Popup>
                        {booking.address}
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No location data available.
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-2">
                <div className="flex-1">
                  <div className="flex items-center mb-1 text-gray-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    {booking.address}
                  </div>
                  <div className="flex items-center mb-1 text-gray-700">
                    <Phone className="w-4 h-4 mr-2" />
                    {booking.customer_phone}
                  </div>
                  <div className="flex items-center mb-1 text-gray-700">
                    <Mail className="w-4 h-4 mr-2" />
                    {booking.customer_email}
                  </div>
                  <div className="flex items-center mb-1 text-gray-700">
                    <User className="w-4 h-4 mr-2" />
                    {booking.customer_first_name} {booking.customer_last_name}
                  </div>
                  <button className="mt-2 px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 text-sm">
                    View Location
                  </button>
                </div>
              </div>
              <div className="border-t pt-2 mt-2 text-xs text-gray-500">
                <div className="font-semibold mb-1">Assigned Carwash Boy</div>
                {booking.personnelId ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.personnel_avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
                      alt="Carwash Boy"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div>
                        <span className="font-semibold">Carwash boy:</span>{" "}
                        {booking.personnel_first_name} {booking.personnel_last_name}
                      </div>
                      <div>
                        <span className="font-semibold">Address:</span> {booking.personnel_address}
                      </div>
                      <div>
                        <span className="font-semibold">Email:</span> {booking.personnel_email}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">No personnel assigned yet.</div>
                )}
                <div className="mt-2 text-gray-600">
                  Carwashboy will arrive between <b>{booking.schedule_date}</b>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded font-semibold hover:bg-blue-200 text-sm">
                    Reschedule
                  </button>
                  <button
                    className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded font-semibold hover:bg-red-200 text-sm"
                    onClick={handleCancelBooking}
                    disabled={canceling || booking.status === "Declined"}
                  >
                    {canceling ? "Cancelling..." : booking.status === "Declined" ? "Booking Cancelled" : "Cancel Booking"}
                  </button>
                </div>
              </div>
            </div>
            {/* Service Checklist */}
            <div className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-200">
              <div className="font-semibold mb-2">Service Checklist</div>
              <div className="text-gray-700 text-sm">
                See what all you should know or do while the carwashboy serve you.
              </div>
            </div>
            {/* Need help */}
            <div className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-200 flex items-center justify-between">
              <div>
                <div className="font-semibold mb-1">Need our help?</div>
                <div className="text-gray-700 text-sm">
                  Call us in case you face any issue in our service
                </div>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-sm">
                <Phone className="w-4 h-4" /> 09949066002
              </button>
            </div>
            {/* --- Rating and Comment Section --- */}
            <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
              <form onSubmit={handleRatingSubmit}>
                <div className="font-semibold mb-2">Rate Our Service</div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={28}
                      className={`cursor-pointer transition ${
                        (hover || rating) >= star ? "text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      data-testid={`star-${star}`}
                    />
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-gray-600">
                      {rating} star{rating > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <textarea
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Leave a comment about your experience..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  required
                />
                <div className="text-xs text-gray-500 mb-2">
                  Your review will be posted as <b>{customerName || "Customer"}</b>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
                  disabled={submitting || rating === 0}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                {success && (
                  <div className="text-green-600 mt-2 font-semibold">
                    Thank you for your feedback!
                  </div>
                )}
              </form>
            </div>
            {/* --- End Rating and Comment Section --- */}
          </div>
          {/* Right: Payment Summary */}
          <div className="w-full md:w-80">
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200 mb-4">
              <div className="font-semibold text-lg mb-2">Payment Summary</div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Promo code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type here.."
                    className="flex-1 px-3 py-1 border rounded bg-blue-50"
                  />
                  <button className="px-3 py-1 bg-blue-200 rounded hover:bg-blue-300 text-sm">
                    Apply
                  </button>
                </div>
              </div>
              <div className="bg-white border rounded p-4 mb-3">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>PHP {servicePrice}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Partial payment</span>
                  <span>PHP {servicePrice / 2}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Discount</span>
                  <span>PHP 00.00</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>PHP {servicePrice / 2}</span>
                </div>
              </div>
              <button className="w-full bg-green-500 text-white py-2 rounded font-semibold mb-2 hover:bg-green-600"
                onClick={() => navigate("/payment", { state: { appointment_id } })}
              >
                Pay Now 
              </button>
              <button
                className="w-full bg-gray-200 text-gray-700 py-2 rounded font-semibold hover:bg-gray-300"
                onClick={handleCancelBooking}
                disabled={canceling || booking.status === "Declined"}
              >
                {canceling ? "Cancelling..." : booking.status === "Declined" ? "Booking Cancelled" : "Request Cancellation"}
              </button>
              {cancelSuccess && (
                <div className="text-red-600 mt-2 font-semibold">
                  Booking has been cancelled.
                </div>
              )}
              <div className="mt-4 bg-blue-50 rounded p-2 flex items-center gap-2">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/616/616489.png"
                  alt="Refer"
                  className="w-10 h-10"
                />
                <div>
                  <div className="font-semibold text-sm">Refer a friend and get rewarded!</div>
                  <button className="mt-1 px-2 py-1 bg-blue-200 rounded text-xs font-semibold hover:bg-blue-300">
                    Refer Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;