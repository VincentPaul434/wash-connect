import React, { useState } from "react";

const PAYMENT_METHODS = [
  { key: "cash", label: "Cash", icon: "💵" },
  { key: "bank", label: "Bank Transfer", icon: "🏦" },
  { key: "upi", label: "UPI / GPay", icon: "💳" },
  { key: "other", label: "Other", icon: "📝" },
];

 function ReceivePayment({ totalAmount = 5000 }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  const remaining = totalAmount - (parseFloat(amount) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
    alert("Payment saved!");
  };

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
              placeholder="₹ Enter amount (e.g. 2000)"
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
            <span className="text-xs text-gray-500 mt-1">
              JPEG, PNG, or PDF up to 5MB.
            </span>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
            <span className="text-blue-500 text-2xl">💰</span>
            <div>
              <div className="text-sm text-gray-600">Remaining Balance (auto-calculated):</div>
              <div className="text-2xl font-bold text-blue-700">
                ₹{remaining.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
              disabled={!amount || !method}
            >
              Save Payment
            </button>
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300"
              onClick={() => window.history.back()}
            >
              Cancel
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
} export default ReceivePayment;
