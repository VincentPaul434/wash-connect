import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PAYMENT_METHODS = [
  { key: "gcash", label: "GCash", icon: "💵", qr: "https://i.ibb.co/0jQ7R2Y/gcash-qr-demo.png" },
  { key: "maya", label: "Maya", icon: "🏦", qr: "https://i.ibb.co/6R8yQ6g/maya-qr-demo.png" },
  { key: "gopay", label: "GoPay", icon: "💳", qr: "https://i.ibb.co/4Z3b9Qk/go-qr-demo.png" },
  { key: "other", label: "Other", icon: "📝" },
];

function Payment() {
  const navigate = useNavigate();
  const { appointmentId: paramAppointmentId } = useParams();
  const location = useLocation();
  const appointment_id = location.state?.appointment_id || paramAppointmentId;

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [uploading, setUploading] = useState(false);

  // Booking details
  const [booking, setBooking] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [previousPayments, setPreviousPayments] = useState(0);

  useEffect(() => {
    if (appointment_id) {
      fetch(`http://localhost:3000/api/bookings/with-personnel/${appointment_id}`)
        .then(res => res.json())
        .then(data => {
          console.log("Booking object:", data); // <-- Add this line
          setBooking(data);
          setSubtotal(data.price || 0);
          setPreviousPayments(data.amount_paid || 0);
        });
    }
  }, [appointment_id]);

  // Calculate remaining balance
  const enteredAmount = parseFloat(amount) || 0;
  const paidAmount = previousPayments + enteredAmount;
  const remaining = subtotal - paidAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    if (!method) {
      alert("Please select a payment method.");
      setUploading(false);
      return;
    }

    if (appointment_id) {
      const res = await fetch(
        `http://localhost:3000/api/bookings/payment/${appointment_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: booking?.user_id || booking?.customer_id,
            amount: Number(amount),
            method,
            payment_status: remaining > 0 ? "Partial" : "Paid",
          }),
        }
      );

      console.log({
        user_id: booking?.user_id || booking?.customer_id,
        amount,
        method,
        status: remaining > 0 ? "Partially Paid" : "Paid",
        payment_status: remaining > 0 ? "Partial" : "Paid",
      });

      setUploading(false);

      if (res.ok) {
        alert("Payment successful!");
        navigate(`/booking-confirmation`); // Redirect to booking confirmation
      } else {
        const errorData = await res.json();
        alert("Payment failed: " + (errorData.error || "Please try again."));
      }
    } else {
      setUploading(false);
      alert("No appointment ID found. Cannot process payment.");
    }
  };

  const handlePayRemaining = async () => {
    setUploading(true);
    const res = await fetch(
      `http://localhost:3000/api/bookings/payment/${appointment_id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: booking?.user_id || booking?.customer_id,
          amount: remaining,
          method,
          payment_status: "Paid",
        }),
      }
    );
    setUploading(false);
    if (res.ok) {
      alert("Remaining balance paid!");
      navigate(`/booking-confirmation`);
    } else {
      const errorData = await res.json();
      alert("Payment failed: " + (errorData.error || "Please try again."));
    }
  };

  if (!appointment_id) {
    return <div>No appointment_id provided for payment.</div>;
  }

  if (!booking) {
    return <div>Loading booking details...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-xl mx-auto mt-8 w-full">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <span className="text-blue-500 text-2xl mt-1">ℹ️</span>
          <div>
            <div className="font-semibold mb-1">
              Enter the amount received from the client for this booking.
            </div>
            <div className="text-sm text-gray-600">
              If it’s a partial payment, the system will track the remaining balance. Please select the payment method and upload a receipt (if available).
            </div>
          </div>
        </div>
        <form
          className="bg-white rounded-xl shadow p-6 flex flex-col gap-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="font-medium block mb-1">
              Amount Received<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full border rounded px-3 py-2 text-lg"
              placeholder={`₱ Enter amount${subtotal > 0 ? ` (e.g. ${subtotal})` : ""}`}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              Enter the amount received from the client.
            </div>
          </div>
          <div>
            <label className="font-medium block mb-1">
              Payment Method<span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map(pm => (
                <button
                  type="button"
                  key={pm.key}
                  className={`flex items-center gap-2 border rounded px-4 py-2 font-medium text-base transition ${
                    method === pm.key
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-400"
                  }`}
                  onClick={() => setMethod(pm.key)}
                >
                  <span>{pm.icon}</span> {pm.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Choose how the payment was received.
            </div>
          </div>
          <div>
            <label className="font-medium block mb-1">Upload Receipt (Optional)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="block"
            />
            <span>JPEG, PNG, or PDF up to 5MB.</span>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
            <span className="text-blue-500 text-2xl">💰</span>
            <div>
              <div className="text-sm text-gray-600">
                Remaining Balance for <span className="font-semibold">{booking.service_name}</span>:
              </div>
              <div className="text-2xl font-bold text-blue-700">
                ₱{(subtotal - previousPayments - (parseFloat(amount) || 0)) > 0
                  ? (subtotal - previousPayments - (parseFloat(amount) || 0)).toLocaleString()
                  : 0}
              </div>
              <div className="text-xs text-gray-500">
                Subtotal: ₱{subtotal.toLocaleString()}<br />
                Paid: ₱{(Number(previousPayments) + Number(amount || 0)).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
              disabled={!amount || !method || uploading}
            >
              {uploading ? "Saving..." : "Save Payment"}
            </button>
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300"
              onClick={() => window.history.back()}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-blue-500 text-white px-6 py-2 rounded font-semibold hover:bg-blue-600"
              onClick={handlePayRemaining}
              disabled={subtotal - previousPayments <= 0 || uploading}
            >
              Pay Remaining
            </button>
          </div>
        </form>
      </div>
      <footer className="mt-auto py-6 text-center text-gray-400 text-sm">
        © 2024 Your Company. All rights reserved.
        <div className="flex justify-center mt-2">
          <span className="inline-flex items-center gap-2">
            <span className="text-blue-600 text-xl">🏦</span>
            Receive Payment
          </span>
        </div>
      </footer>
    </div>
  );
}
export default Payment;