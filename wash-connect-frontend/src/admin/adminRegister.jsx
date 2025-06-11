import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, MapPin, Calendar, Lock, ArrowLeft } from "lucide-react";

function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    numberId: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    gender: "",
    birthdate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }
      setSuccess("Admin registered successfully!");
      setLoading(false);
      setTimeout(() => navigate("/admin-login"), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex bg-gradient-to-br from-sky-50 to-cyan-100 relative">
      {/* Carwash GIF backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://i.gifer.com/t6Y.gif"
          alt="Carwash gif"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      {/* Form container */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-lg bg-white bg-opacity-90 rounded-2xl shadow-lg p-10 border border-gray-200">
          <button
            className="mb-6 p-2 hover:bg-black/10 rounded-full transition-colors"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
          <h1
            className="text-4xl mb-2 text-center"
            style={{ fontFamily: "Brush Script MT, cursive" }}
          >
            <span className="text-cyan-500">Wash</span>{" "}
            <span className="text-red-500">Connect</span>
          </h1>
          <h2 className="text-cyan-500 text-2xl font-medium italic mb-6 text-center">
            Admin Registration
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white text-black rounded-full border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="flex-1 relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white text-black rounded-full border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                name="numberId"
                value={form.numberId}
                onChange={handleChange}
                className="w-full pl-4 pr-4 py-3 bg-white text-black rounded-full border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Number ID (e.g. 201-301-3987)"
                required
                pattern="\d{3}-\d{3}-\d{4}"
                title="Format: 201-301-3987"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-white text-black rounded-full border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Password"
                required
                minLength={8}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-white text-black rounded-full border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Confirm Password"
                required
                minLength={8}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-white text-black rounded-full border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Phone (optional)"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-white text-black rounded-full border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Address (optional)"
              />
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full pl-4 pr-4 py-3 bg-white text-black rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex-1 relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="birthdate"
                  value={form.birthdate}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white text-black rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-center font-medium">{error}</div>
            )}
            {success && (
              <div className="text-green-600 text-center font-medium">{success}</div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xl py-3 rounded-full font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg mt-2"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <div className="text-center mt-6">
            <span className="text-gray-700">Already have an account?</span>{" "}
            <button
              className="text-cyan-600 hover:underline font-medium"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;