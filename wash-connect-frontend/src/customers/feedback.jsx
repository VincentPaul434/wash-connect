import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();
  // If appointment_id is passed, use it; otherwise, let user select
  const [selectedId, setSelectedId] = useState(location.state?.appointment_id || "");
  const [booking, setBooking] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [eligibleBookings, setEligibleBookings] = useState([]);

  // Fetch completed bookings for the user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || user.user_id;
    if (!userId) return;

    fetch(`http://localhost:3000/api/bookings/customers/${userId}`)
      .then(res => res.ok ? res.json() : [])
      .then(bookings => {
        const eligible = (bookings || []).filter(
          b => b.status === "Completed"
        );
        setEligibleBookings(eligible);
        // If no appointment selected, pick most recent completed
        if (!selectedId && eligible.length > 0) {
          setSelectedId(eligible[0].appointment_id);
        }
      })
      .catch(() => {
        // handle error if needed
      });
  }, []);

  // Fetch booking details for the selected appointment
  useEffect(() => {
    if (!selectedId) {
      setBooking(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`http://localhost:3000/api/bookings/${selectedId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setBooking(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch booking.");
        setLoading(false);
      });
  }, [selectedId]);

  // Check if eligible for feedback
  const canGiveFeedback =
    booking &&
    booking.status === "Completed" &&
    (
      booking.payment_status === "Paid" ||
      (Array.isArray(booking.payments) &&
        booking.payments.some(p => p.payment_status === "Paid"))
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!canGiveFeedback) {
      setError("You can only give feedback after the service is completed and paid.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/feedback/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: booking.customer_name || booking.user_name || "Anonymous",
          rating,
          comment: feedback,
        }),
      });
      if (res.ok) {
        setMsg("Thank you for your feedback!");
        setFeedback("");
        setRating(5);
      } else {
        setError("Failed to submit feedback.");
      }
    } catch {
      setError("Failed to submit feedback.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold mb-4">
        Leave Feedback for {booking?.carwash_name || "Carwash Shop"}
      </h2>
      {/* Select completed booking */}
      {eligibleBookings.length > 0 && (
        <div className="mb-6">
          <label className="block font-semibold mb-2">Choose a completed booking:</label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            {eligibleBookings.map(b => (
              <option key={b.appointment_id} value={b.appointment_id}>
                {(b.carwash_name || b.carwash_name || "Carwash")} — 
                {b.date ? ` ${b.date}` : ""} 
                {b.time ? ` ${b.time}` : ""}
                {b.service_name ? ` — ${b.service_name}` : ""}
                {b.appointment_id ? ` (#${b.appointment_id})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}
      {!canGiveFeedback ? (
        <div className="text-yellow-700 bg-yellow-100 rounded p-4 mb-4">
          You can only give feedback after your booking is <b>Completed</b> and <b>Paid</b>.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Rating</label>
            <select
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {[5, 4, 3, 2, 1].map(r => (
                <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Feedback</label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={4}
              required
              placeholder="Share your experience..."
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
          >
            Submit Feedback
          </button>
          {msg && <div className="text-green-600 mt-2">{msg}</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}
      <button
        className="mt-6 text-gray-600 hover:underline"
        onClick={() => navigate(-1)}
      >
        Back
      </button>
    </div>
  );
}

export default Feedback;