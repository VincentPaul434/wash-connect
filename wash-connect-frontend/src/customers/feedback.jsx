import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast"; // Add this import at the top

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
  const [alreadyGiven, setAlreadyGiven] = useState(false);

  const fetchEligibleBookings = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const user_id = user.user_id || user.id;
    const token = localStorage.getItem("token");
    if (!user_id) return;

    fetch(`http://localhost:3000/api/bookings/customers/${user_id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.ok ? res.json() : [])
      .then(bookings => {
        const eligible = (bookings || []).filter(
          b =>
            b.status === "Completed" &&
            (
              b.payment_status === "Paid" ||
              (Array.isArray(b.payments) && b.payments.some(p => p.payment_status === "Paid"))
            ) &&
            !(
              Array.isArray(b.feedbacks) &&
              b.feedbacks.some(fb => String(fb.user_id) === String(user_id))
            )
        );
        setEligibleBookings(eligible);
        // If the current selectedId is no longer eligible, reset it
        if (!eligible.some(b => b.appointment_id === selectedId)) {
          setSelectedId(eligible.length > 0 ? eligible[0].appointment_id : "");
        }
      })
      .catch(() => {});
  };

  // Fetch completed bookings for the user (carwash_name included from backend)
  useEffect(() => {
    fetchEligibleBookings();
  }, []);

  // Fetch booking details for the selected appointment
  useEffect(() => {
    if (!selectedId) {
      setBooking(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3000/api/bookings/${selectedId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setBooking(data);
        setLoading(false);
        // Check if feedback already exists
        if (data && Array.isArray(data.feedbacks)) {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          const user_id = user.user_id || user.id;
          const found = data.feedbacks.some(fb => fb.user_id === user_id);
          setAlreadyGiven(found);
        } else {
          setAlreadyGiven(false);
        }
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
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const user_id = user.user_id || user.id;
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/feedback/${selectedId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id,
          rating,
          comment: feedback,
        }),
      });
      if (res.status === 409) {
        toast("You have already submitted feedback for this booking.", { icon: "✅" }); // <-- Show toast instead of error
        setAlreadyGiven(true);
        return;
      }
      if (res.ok) {
        setMsg("Thank you for your feedback!");
        setFeedback("");
        setRating(5);
        fetchEligibleBookings();
        fetch(`http://localhost:3000/api/bookings/${selectedId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            setBooking(data);
            if (data && Array.isArray(data.feedbacks)) {
              const found = data.feedbacks.some(fb => fb.user_id === user_id);
              setAlreadyGiven(found);
            }
          });
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
      <Toaster position="top-right" /> {/* <-- Add this line */}
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
                  {b.service_name ? ` ${b.service_name}` : ""}
                  {b.appointment_id ? ` (#${b.appointment_id})` : ""}
                </option>
              ))}
            </select>
          </div>
          {alreadyGiven ? (
            <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span>
                You have already submitted feedback for this booking.
              </span>
            </div>
          ) : canGiveFeedback && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Rating</label>
                <select
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:outline-none bg-gray-50"
                  disabled={alreadyGiven}
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
                  disabled={alreadyGiven}
                />
              </div>
              <button
                type="submit"
                className={`bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold transition ${
                  alreadyGiven ? "bg-gray-400 cursor-not-allowed" : "hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
                }`}
                disabled={alreadyGiven}
              >
                Submit Feedback
              </button>
              {msg && <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mt-2">{msg}</div>}
              {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mt-2">{error}</div>}
            </form>
          )}
          {!canGiveFeedback && !alreadyGiven && (
            <div className="text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>
                You can only give feedback after your booking is <b>Completed</b> and <b>Paid</b>.
              </span>
            </div>
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