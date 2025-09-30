import { Trophy, Eye, Users, FileText, Inbox, LogOut, UserCircle } from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function getAnalytics(payments, refunds) {
  const totalIncome = payments.reduce((sum, p) => sum + (p.amount > 0 ? Number(p.amount) : 0), 0);
  const totalRefund = refunds.reduce((sum, r) => sum + (r.amount ? Number(r.amount) : 0), 0);
  const byMethod = {};
  payments.forEach(p => {
    byMethod[p.method] = (byMethod[p.method] || 0) + Number(p.amount);
  });
  return { totalIncome, totalRefund, byMethod };
}

function AdminDashboard() {
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:3000/api/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (res.status === 401) {
          navigate("/login");
          return [];
        }
        return res.json();
      })
      .then(data => setPayments(data))
      .catch(() => setPayments([]));

    fetch("http://localhost:3000/api/refunds", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (res.status === 401) {
          navigate("/login");
          return [];
        }
        return res.json();
      })
      .then(data => setRefunds(data))
      .catch(() => setRefunds([]));
    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const analytics = getAnalytics(payments, refunds);

  // Chart data
  const barData = {
    labels: Object.keys(analytics.byMethod),
    datasets: [
      {
        label: "Total by Method",
        data: Object.values(analytics.byMethod),
        backgroundColor: ["#38bdf8", "#fbbf24", "#34d399", "#f87171", "#a78bfa"],
      },
    ],
  };
  const doughnutData = {
    labels: ["Income", "Refund"],
    datasets: [
      {
        data: [analytics.totalIncome, analytics.totalRefund],
        backgroundColor: ["#34d399", "#f87171"],
      },
    ],
  };



  // Prepare tax by method for chart
  const taxByMethod = {};
  payments
    .filter(p => p.payment_status === "Paid")
    .forEach(p => {
      const method = p.method || "Unknown";
      const tax = p.tax ? Number(p.tax) : Number(p.amount) * 0.10;
      taxByMethod[method] = (taxByMethod[method] || 0) + tax;
    });

  const taxBarData = {
    labels: Object.keys(taxByMethod),
    datasets: [
      {
        label: "Tax Collected by Method",
        data: Object.values(taxByMethod),
        backgroundColor: ["#60a5fa", "#fbbf24", "#34d399", "#f87171", "#a78bfa"],
      },
    ],
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col min-h-screen">
        <div className="flex items-center px-8 py-8 border-b border-gray-100">
          <span className="text-3xl" style={{ fontFamily: "Brush Script MT, cursive" }}>
            <span className="text-black-500">Wash</span>{" "}
            <span className="text-red-500">Connect</span>
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            className="flex items-center w-full px-4 py-3 rounded-lg bg-cyan-100 text-cyan-700 font-semibold"
            onClick={() => navigate("/admin-dashboard")}
          >
            <Trophy className="mr-3 w-5 h-5" />
            Earnings Dashboard
          </button>
          <button
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
            onClick={() => navigate("/admin-carwash-management")}
          >
            <Eye className="mr-3 w-5 h-5" />
            Carwash Shops
          </button>
          <button
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
            onClick={() => navigate("/admin-customer-management")}
          >
            <Users className="mr-3 w-5 h-5" />
            Customers
          </button>
          <hr className="my-4" />
          <button
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
            onClick={() => navigate("/admin-application-requests")}
          >
            <FileText className="mr-3 w-5 h-5" />
            Application Request
          </button>
        </nav>
        <div className="px-8 pb-8 mt-auto">
          <button className="flex items-center text-gray-700 hover:text-red-500" onClick={handleLogout}>
            <LogOut className="mr-2 w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#e6faff] min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-10 py-6 bg-cyan-100 border-b border-gray-200">
          <div className="flex items-center">
            <button className="mr-4">
              <Inbox className="w-6 h-6 text-gray-700" />
            </button>
            <span className="text-lg font-semibold">Earnings Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">SuperAdmin</span>
            <UserCircle className="w-7 h-7 text-gray-700" />
          </div>
        </header>

        <div className="p-10">
          {/* Analytical Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col items-center">
              <h4 className="font-semibold mb-4">Income vs Refund</h4>
              <div style={{ width: "100%", maxWidth: 180, height: 180 }}>
                <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
              </div>
              <div className="mt-4 text-center">
                <div className="text-green-600 font-bold">Income: ₱{analytics.totalIncome.toLocaleString()}</div>
                <div className="text-red-600 font-bold">Refund: ₱{analytics.totalRefund.toLocaleString()}</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col items-center">
              <h4 className="font-semibold mb-4">Payments by Method</h4>
              <div style={{ width: "100%", maxWidth: 220, height: 180 }}>
                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col items-center">
              <h4 className="font-semibold mb-4">Tax Collected by Method</h4>
              <div style={{ width: "100%", maxWidth: 220, height: 180 }}>
                <Bar
                  data={taxBarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { callback: (value) => `₱${value.toLocaleString()}` },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
          {/* Payments Table */}
          <div className="bg-white rounded-xl shadow p-8 border border-gray-100">
            <h3 className="text-lg font-semibold mb-6">All Payments of Services</h3>
            <div style={{ maxHeight: "340px", overflowY: "auto" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="py-2 text-left">Payment ID</th>
                    <th className="py-2 text-left">Service</th>
                    <th className="py-2 text-left">Amount</th>
                    <th className="py-2 text-left">Date</th>
                    <th className="py-2 text-left">Method</th>
                    <th className="py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 py-4">No payments found.</td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.payment_id} className="border-t">
                        <td className="py-2">{p.payment_id}</td>
                        <td className="py-2">{p.service_name}</td>
                        <td className="py-2">₱{Number(p.amount).toLocaleString()}</td>
                        <td className="py-2">{p.date ? p.date.slice(0, 16).replace("T", " ") : ""}</td>
                        <td className="py-2">{p.method}</td>
                        <td className="py-2">{p.payment_status || p.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;