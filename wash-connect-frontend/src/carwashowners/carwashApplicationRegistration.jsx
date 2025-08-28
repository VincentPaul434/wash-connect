import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, FileText, Upload, ArrowLeft } from "lucide-react";

function CarwashApplicationRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    carwashName: "",
    location: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [requirementsFile, setRequirementsFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already registered (checks backend)
  useEffect(() => {
    const owner = JSON.parse(localStorage.getItem("carwashOwner"));
    if (!owner || !owner.id) return;
    // Check registration status from backend
    fetch(`http://localhost:3000/api/carwash-applications/status/${owner.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.registered) {
          navigate("/carwash-dashboard");
        }
      })
      .catch(() => {});
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files[0]);
    setError("");
    setSuccess("");
  };
  const handleRequirementsChange = (e) => {
    setRequirementsFile(e.target.files[0]);
    setError("");
    setSuccess("");
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!form.carwashName || !form.location || !logoFile || !requirementsFile) {
      setError("All fields and files are required.");
      setLoading(false);
      return;
    }

    try {
      const owner = JSON.parse(localStorage.getItem("carwashOwner"));
      if (!owner || !owner.id) {
        setError("Owner not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("carwashName", form.carwashName);
      formData.append("location", form.location);
      formData.append("logo", logoFile);
      formData.append("requirements", requirementsFile);
      formData.append("ownerId", owner.id);

      const res = await fetch("http://localhost:3000/api/carwash-applications", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed");
        setLoading(false);
        return;
      }
      // Optionally update localStorage if backend returns owner info
      if (data.owner) {
        localStorage.setItem("carwashOwner", JSON.stringify(data.owner));
      }
      setSuccess("Application submitted! Await admin approval.");
      setLoading(false);
      setTimeout(() => navigate("/awaiting-approval"), 1200);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-100">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
        <button
          className="mb-6 p-2 hover:bg-black/10 rounded-full transition-colors"
          onClick={() => navigate("/carwash-login")}
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
          Carwash Application Registration
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="carwashName"
              value={form.carwashName}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-white text-black rounded-full border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Company Name"
              required
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-white text-black rounded-full border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Business Location"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Company Logo</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center cursor-pointer bg-cyan-50 border border-cyan-200 px-4 py-2 rounded-full hover:bg-cyan-100 transition">
                <Upload className="w-5 h-5 mr-2 text-cyan-500" />
                <span className="text-cyan-700 font-medium">Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  required
                />
              </label>
              {logoFile && (
                <span className="text-gray-700 text-sm truncate">{logoFile.name}</span>
              )}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Requirements (PDF or Word)</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center cursor-pointer bg-cyan-50 border border-cyan-200 px-4 py-2 rounded-full hover:bg-cyan-100 transition">
                <FileText className="w-5 h-5 mr-2 text-cyan-500" />
                <span className="text-cyan-700 font-medium">Upload File</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleRequirementsChange}
                  className="hidden"
                  required
                />
              </label>
              {requirementsFile && (
                <span className="text-gray-700 text-sm truncate">{requirementsFile.name}</span>
              )}
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
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CarwashApplicationRegistration;