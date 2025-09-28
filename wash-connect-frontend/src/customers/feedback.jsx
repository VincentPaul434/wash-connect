import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(location.state?.appointment_id || "");
  const [booking, setBooking] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [eligibleBookings, setEligibleBookings] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || user.user_id;
    if (!userId) return;

    fetch(`http://localhost:3000/api/bookings/customers/${userId}`)
      .then(res => res.ok ? res.json() : [])
      .then(bookings => {
        // Only show bookings that are Completed and Paid
        const eligible = (bookings || []).filter(
          b => b.status === "Completed" && b.payment_status === "Paid"
        );
        setEligibleBookings(eligible);
        if (!selectedId && eligible.length > 0) {
          setSelectedId(eligible[0].appointment_id);
        }
      })
      .catch(() => {});
  }, []);

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

  const canGiveFeedback =
    booking &&
    booking.status === "Completed" &&
    booking.payment_status === "Paid";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!canGiveFeedback) {
      setError("You can only give feedback after the service is completed and paid.");
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const user_id = user.user_id || user.id;

      const res = await fetch(`http://localhost:3000/api/feedback/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
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
    <div className="max-w-lg mx-auto mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="mb-6 flex items-center gap-3">
        <span className="text-blue-600 text-3xl">⭐</span>
        <h2 className="text-2xl font-bold text-gray-800">
          Leave Feedback
        </h2>
      </div>
      {eligibleBookings.length === 0 ? (
        <div className="text-gray-600 text-center py-8">
          You have no completed and paid bookings to give feedback for.
        </div>
      ) : (
        <>
          <div className="mb-6 text-gray-600">
            For <span className="font-semibold">{booking?.carwash_name || "Carwash Shop"}</span>
          </div>
          <hr className="mb-6" />
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-700">Choose a completed booking:</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:outline-none bg-gray-50"
            >
              {eligibleBookings.map(b => (
                <option key={b.appointment_id} value={b.appointment_id}>
                  {(b.carwash_name || "Carwash")} — 
                  {b.date ? ` ${b.date}` : ""} 
                  {b.time ? ` ${b.time}` : ""}
                  {b.service_name ? ` — ${b.service_name}` : ""}
                  {b.appointment_id ? ` (#${b.appointment_id})` : ""}
                </option>
              ))}
            </select>
          </div>
          {canGiveFeedback && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Rating</label>
                <select
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:outline-none bg-gray-50"
                >
                  {[5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-gray-50"
                  rows={4}
                  required
                  placeholder="Share your experience..."
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 transition"
              >
                Submit Feedback
              </button>
              {msg && <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mt-2">{msg}</div>}
              {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mt-2">{error}</div>}
            </form>
          )}
        </>
      )}
      <button
        className="mt-8 text-gray-500 hover:text-blue-600 hover:underline transition"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
    </div>
  );
}

export default Feedback;