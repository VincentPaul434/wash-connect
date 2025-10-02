import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PasswordReset() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill out both fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Your password has been reset successfully.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.error || "Unable to reset password.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-cyan-700">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            className="w-full px-4 py-3 bg-white text-black rounded-full border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full px-4 py-3 bg-white text-black rounded-full border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          {msg && <div className="text-green-600 text-sm text-center">{msg}</div>}
          <button
            type="submit"
            className="w-full bg-cyan-600 text-white py-3 rounded-full font-medium hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            className="text-cyan-600 hover:underline text-sm font-medium"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}