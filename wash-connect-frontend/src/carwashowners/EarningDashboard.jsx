import React, { useEffect, useMemo, useState } from "react";
import { FaRegCheckSquare, FaTrophy, FaUserCircle, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function EarningDashboard() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [carwash, setCarwash] = useState({ carwashName: "Carwash", logo: "" });
  const [payments, setPayments] = useState([]);
  const [apiSummary, setApiSummary] = useState({ total_amount: 0, total_paid: 0, total_refunded: 0 });
  const [services, setServices] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Load owner -> application -> payments
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const owner = JSON.parse(localStorage.getItem("carwashOwner") || "{}");
        if (!owner?.id || !token) {
          navigate("/carwash-login");
          return;
        }

        // Get this owner's carwash application
        const appRes = await fetch(`http://localhost:3000/api/carwash-applications/by-owner/${owner.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (appRes.status === 401) {
          navigate("/carwash-login");
          return;
        }
        const appData = await appRes.json();

        const applicationId = appData?.applicationId;
        const logoUrl = appData?.logo
          ? `http://localhost:3000/uploads/logos/${appData.logo}`
          : "/default-logo.png";

        setCarwash({
          carwashName: appData?.carwash_name || appData?.carwashName || "Carwash",
          logo: logoUrl,
          applicationId,
        });

        if (!applicationId) {
          setPayments([]);
          setApiSummary({ total_amount: 0, total_paid: 0, total_refunded: 0 });
          setServices([]);
          return;
        }

        // Fetch payments for this carwash
        const payRes = await fetch(`http://localhost:3000/api/payments/by-application/${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (payRes.status === 401) {
          navigate("/carwash-login");
          return;
        }
        const payData = await payRes.json();
        setPayments(Array.isArray(payData?.payments) ? payData.payments : []);
        setApiSummary(payData?.summary || { total_amount: 0, total_paid: 0, total_refunded: 0 });

        // Fetch services for this carwash
        const svcRes = await fetch(`http://localhost:3000/api/services/by-application/${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (svcRes.status === 401) {
          navigate("/carwash-login");
          return;
        }
        const svcData = await svcRes.json();
        setServices(Array.isArray(svcData) ? svcData : []);
      } catch {
        setPayments([]);
        setApiSummary({ total_amount: 0, total_paid: 0, total_refunded: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [navigate]);

  // Fetch refunds for this carwash owner
  useEffect(() => {
    const token = localStorage.getItem("token");
    const owner = JSON.parse(localStorage.getItem("carwashOwner") || "{}");
    const applicationId = owner.applicationId;
    if (!applicationId || !token) return;
    fetch(`http://localhost:3000/api/refunds?ownerId=${applicationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 401) {
          navigate("/carwash-login");
          return [];
        }
        return res.json();
      })
      .then((data) => setRefunds(Array.isArray(data) ? data : []))
      .catch(() => setRefunds([]));
  }, [navigate]);

  const fmtPHP = (n) =>
    `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const nowLabel = useMemo(() => {
    const d = new Date();
    return `${d.toLocaleString("en-US", { month: "long" })}, ${d.getFullYear()}`;
  }, []);

  // Build derived UI data
  const { summary, trend, details } = useMemo(() => {
    const toDate = (s) => {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    };
    const isRefund = (s) => String(s || "").toLowerCase() === "refunded";
    const isCompleted = (s) => {
      const v = String(s || "").toLowerCase();
      return v.includes("complete") || v.includes("finished") || v === "done";
    };

    // Table rows
    const detailsRows = payments.map((p) => ({
      date: toDate(p.created_at)?.toISOString().slice(0, 10) || "",
      type: isRefund(p.payment_status) ? "Refund" : "Income",
      description: p.service_name || "Payment",
      amount: Number(p.amount || 0),
      status: p.payment_status || "—",
    }));

    // Efficiency
    const totalServices = new Set(payments.map((p) => p.appointment_id)).size;
    const finished = payments.filter((p) => isCompleted(p.booking_status)).length;
    const efficiencyPct = totalServices ? Math.round((finished / totalServices) * 100) : 0;

    // Trend: last 6 months net = income - refunds
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ y: d.getFullYear(), m: d.getMonth() });
    }
    const monthKey = (y, m) => `${y}-${String(m + 1).padStart(2, "0")}`;

    const grouped = new Map(months.map(({ y, m }) => [monthKey(y, m), { income: 0, refund: 0 }]));
    for (const p of payments) {
      const d = toDate(p.created_at);
      if (!d) continue;
      const key = monthKey(d.getFullYear(), d.getMonth());
      if (!grouped.has(key)) continue;
      const g = grouped.get(key);
      if (isRefund(p.payment_status)) g.refund += Number(p.amount || 0);
      else g.income += Number(p.amount || 0);
    }
    const trendRows = months.map(({ y, m }) => {
      const g = grouped.get(monthKey(y, m));
      const net = (g?.income || 0) - (g?.refund || 0);
      return {
        name: new Date(y, m, 1).toLocaleString("en-US", { month: "long" }),
        short: new Date(y, m, 1).toLocaleString("en-US", { month: "short" }),
        value: net,
      };
    });

    // Best/lowest month by net
    const best = trendRows.reduce((a, b) => (b.value > (a?.value ?? -Infinity) ? b : a), null) || { name: "—", value: 0 };
    const low = trendRows.reduce((a, b) => (b.value < (a?.value ?? Infinity) ? b : a), null) || { name: "—", value: 0 };

    // Income/Expense/Profit cards from API summary
    const income = apiSummary.total_paid || 0;
    const refunds = apiSummary.total_refunded || 0;
    const profit = (apiSummary.total_amount || 0);

    // Simple change indicators vs previous month net
    const thisMonth = trendRows[trendRows.length - 1]?.value || 0;
    const prevMonth = trendRows[trendRows.length - 2]?.value || 0;
    const deltaPct = prevMonth === 0 ? (thisMonth > 0 ? 100 : 0) : Math.round(((thisMonth - prevMonth) / Math.abs(prevMonth)) * 100);

    return {
      summary: {
        carwashName: carwash.carwashName,
        month: nowLabel,
        finished,
        totalServices,
        efficiency: `${efficiencyPct}%`,
        logoUrl: carwash.logo,
        bestMonth: { name: best.name, profit: best.value },
        lowestMonth: { name: low.name, profit: low.value },
        income: income.toLocaleString(),
        incomeChange: `${deltaPct >= 0 ? "↑" : "↓"} ${Math.abs(deltaPct)}% this month`,
        expense: refunds.toLocaleString(),
        expenseChange: refunds > 0 ? "↑ refunds" : "—",
        profit: profit.toLocaleString(),
        profitChange: `${deltaPct >= 0 ? "↑" : "↓"} ${Math.abs(deltaPct)}% this month`,
      },
      trend: trendRows,
      details: detailsRows.sort((a, b) => (a.date < b.date ? 1 : -1)),
    };
  }, [payments, apiSummary, carwash.carwashName, carwash.logo, nowLabel]);

  // Prepare analytics data
  const totalIncome = details.filter((d) => d.type === "Income").reduce((sum, d) => sum + d.amount, 0);
  const byStatus = details.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + d.amount;
    return acc;
  }, {});

  // Prepare Net Income Trend chart data (Bar chart for last 6 months)
  const trendLabels = trend.map((month) => month.short);
  const trendValues = trend.map((month) => month.value);
  const trendBarData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Net Income",
        data: trendValues,
        backgroundColor: trendValues.map((v) =>
          v > 0 ? "#34d399" : v < 0 ? "#f87171" : "#fbbf24"
        ),
      },
    ],
  };

  // Count finished services (each service with at least one finished booking)
  const finishedServicesCount = useMemo(() => {
    if (!services.length || !payments.length) return 0;
    return services.filter(svc =>
      payments.some(p =>
        (p.service_id === svc.service_id || p.service_id === svc.id) &&
        (
          String(p.booking_status).toLowerCase().includes("complete") ||
          String(p.booking_status).toLowerCase().includes("finished") ||
          String(p.booking_status).toLowerCase() === "done"
        )
      )
    ).length;
  }, [services, payments]);

  const totalRefundedAmount = refunds
    .filter(r => r.status === "Approved")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  // Chart data
  const doughnutData = {
    labels: ["Income", "Refund"],
    datasets: [
      {
        data: [totalIncome, totalRefundedAmount], // <-- use totalRefundedAmount here
        backgroundColor: ["#34d399", "#f87171"],
      },
    ],
  };

  const barData = {
    labels: Object.keys(byStatus),
    datasets: [
      {
        label: "Amount by Status",
        data: Object.values(byStatus),
        backgroundColor: ["#38bdf8", "#fbbf24", "#34d399", "#f87171", "#a78bfa"],
      },
    ],
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="px-6 py-8">
          <div className="text-3xl flex items-center select-none">
            <span className="text-gray-700" style={{ fontFamily: '"Great Vibes", cursive', fontSize: "2.2rem" }}>Wash</span>
            <span className="ml-2 text-red-500 font-semibold" style={{ fontFamily: '"Great Vibes", cursive', fontSize: "2.2rem" }}>Connect</span>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 hover:bg-gray-100 cursor-pointer" onClick={() => navigate("/carwash-dashboard")}>Overview</button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 hover:bg-gray-100 cursor-pointer" onClick={() => navigate("/customer-list")}>Customers & Employee</button>
          {/* Status Update tab below Customers & Employee */}
          <button
            className="flex items-center gap-2 mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200 w-full text-left"
            onClick={() => navigate("/status-update")}
          >
            <FaRegCheckSquare className="text-lg" />
            <span>Status Update</span>
          </button>
          <hr className="my-2 border-gray-300" />
          <button className="flex items-center gap-2 mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200 w-full text-left" onClick={() => navigate("/bookings")}> <FaRegCheckSquare className="text-lg" /> <span>Manage Bookings</span> </button>
          <button className="flex items-center gap-2 mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200 w-full text-left" onClick={() => navigate("/booking-history")}> <FaRegCheckSquare className="text-lg" /> <span>Booking History</span> </button>
          <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-blue-100 text-blue-700 font-semibold rounded cursor-pointer transition-colors duration-200" onClick={() => navigate('/earning-dashboard')}> <FaTrophy className="text-lg" /> <span>Earnings Dashboard</span> </div>
          <hr className="my-4 border-gray-300" />
        </nav>
        <div className="mt-auto px-4 py-6">
          <button
            className="flex items-center gap-2 text-gray-700 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("carwashOwner");
              navigate("/carwash-login");
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Navigation Tabs */}
        <header className="flex items-center justify-between px-8 py-4 bg-blue-100 border-b">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">Earnings Dashboard</h1>
            <nav className="ml-8 flex gap-2">
              <button
                className={`px-4 py-2 rounded ${activeTab === "dashboard" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border"}`}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={`px-4 py-2 rounded ${activeTab === "refunds" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border"}`}
                onClick={() => setActiveTab("refunds")}
              >
                Refund Requests
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Owner</span>
            <FaUserCircle className="text-2xl text-gray-400" />
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 grid grid-cols-3 gap-6 p-8 overflow-auto">
          {activeTab === "dashboard" ? (
            <React.Fragment>
              {/* Summary Section */}
              <section className="col-span-2 space-y-6">
                <div className="flex gap-6">
                  <div className="flex-1 bg-white rounded-xl shadow p-6 flex flex-col gap-2">
                    <h2 className="text-xl font-semibold">{summary.carwashName}</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">Track bookings and manage CRM here...</span>
                      <span className="ml-auto text-sm text-gray-400">Date: {summary.month}</span>
                    </div>
                    <div className="flex items-center gap-8 mt-4">
                      <div>
                        <span className="font-bold text-lg">{finishedServicesCount}</span>
                        <span className="text-xs text-gray-500 ml-1">/ {services.length} services</span>
                      </div>
                      <div>
                        <span className="font-bold text-lg">{summary.efficiency}</span>
                        <span className="text-xs text-gray-500 ml-1">Efficiency</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-40 h-40 bg-white rounded-xl shadow flex items-center justify-center">
                    <img src={carwash.logo || "/default-logo.png"} alt="Carwash Logo" className="w-32 h-32 object-contain" />
                  </div>
                </div>

                {/* Best/Lowest Month & Income/Expense/Profit */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                    <span className="text-green-600 font-semibold">Best Month</span>
                    <span className="text-lg">{summary.bestMonth?.name}</span>
                    <span className="text-xs text-gray-500">Net Profit: {fmtPHP(summary.bestMonth?.profit || 0)}</span>
                  </div>
                  <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                    <span className="text-red-600 font-semibold">Lowest Month</span>
                    <span className="text-lg">{summary.lowestMonth?.name}</span>
                    <span className="text-xs text-gray-500">Net Profit: {fmtPHP(summary.lowestMonth?.profit || 0)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                      <span className="text-blue-600 font-semibold">Total Income</span>
                      <span className="text-lg">{fmtPHP(apiSummary.total_paid)}</span>
                      <span className="text-xs text-green-600">{summary.incomeChange}</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                      <span className="text-red-600 font-semibold">Refunds</span>
                      <span className="text-lg">₱{Number(totalRefundedAmount || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                      <span className="text-xs text-red-600">
                        {totalRefundedAmount > 0 ? `↑ ₱${Number(totalRefundedAmount).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} refunded` : "—"}
                      </span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                      <span className="text-green-600 font-semibold">Net Profit</span>
                      <span className="text-lg">{fmtPHP(apiSummary.total_amount)}</span>
                      <span className="text-xs text-green-600">{summary.profitChange}</span>
                    </div>
                  </div>
                </div>

                {/* Net Income Trend */}
                <div className="bg-white rounded-xl shadow p-6">
                  <h4 className="font-semibold mb-2">Net Income Trend (Last 6 Months)</h4>
                  <div style={{ width: "100%", height: "200px" }}>
                    <Bar
                      data={trendBarData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: { callbacks: { label: (ctx) => `₱${ctx.parsed.y.toLocaleString()}` } },
                        },
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
              </section>

              {/* Income & Expense Details + Analytics Charts */}
              <section className="col-span-1 space-y-6">
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Income & Refund Details</h4>
                    <button
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs font-medium hover:bg-gray-200"
                      onClick={() => {
                        const rows = [
                          ["Date", "Type", "Description", "Amount", "Status"],
                          ...details.map((r) => [r.date, r.type, r.description, r.amount, r.status]),
                        ];
                        const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
                        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `earnings_${carwash.carwashName.replace(/\s+/g, "_")}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <FaDownload className="text-sm" /> Export
                    </button>
                  </div>
                  <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="py-2 text-left">Date</th>
                          <th className="py-2 text-left">Type</th>
                          <th className="py-2 text-left">Description</th>
                          <th className="py-2 text-left">Amount</th>
                          <th className="py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.map((row, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2">{row.date}</td>
                            <td className="py-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                  row.type === "Income"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {row.type}
                              </span>
                            </td>
                            <td className="py-2">{row.description}</td>
                            <td className="py-2">{fmtPHP(row.amount)}</td>
                            <td className="py-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  row.status === "Completed"
                                    ? "bg-green-200 text-green-800"
                                    : row.status === "Refunded"
                                    ? "bg-red-200 text-red-800"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {details.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center text-gray-400 py-4">No data available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl shadow p-4 border border-gray-100 flex flex-col items-center">
                    <h4 className="font-semibold mb-2">Income vs Refund</h4>
                    <div style={{ width: "100%", maxWidth: 120, height: 120 }}>
                      <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                    </div>
                    <div className="mt-2 text-center text-xs">
                      <span className="text-green-600 font-bold">Income: {fmtPHP(totalIncome)}</span>
                      <br />
                      <span className="text-red-600 font-bold">Refund: {fmtPHP(totalRefundedAmount)}</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-4 border border-gray-100 flex flex-col items-center">
                    <h4 className="font-semibold mb-2">Payments by Status</h4>
                    <div style={{ width: "100%", maxWidth: 140, height: 120 }}>
                      <Bar
                        data={barData}
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
              </section>
            </React.Fragment>
          ) : (
            <section className="col-span-3">
              <div className="bg-white rounded-xl shadow p-6 mt-4">
                <h4 className="font-semibold mb-4">Refund Requests</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="py-2 text-left">Customer</th>
                      <th className="py-2 text-left">Amount</th>
                      <th className="py-2 text-left">Reason</th>
                      <th className="py-2 text-left">Status</th>
                      <th className="py-2 text-left">Requested At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="py-2">{r.customer}</td>
                        <td className="py-2">₱{Number(r.amount || 0).toFixed(2)}</td>
                        <td className="py-2">{r.reason}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            r.status === "Approved"
                              ? "bg-green-200 text-green-800"
                              : r.status === "Rejected"
                              ? "bg-red-200 text-red-800"
                              : "bg-yellow-200 text-yellow-800"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2">{r.requestedAt ? r.requestedAt.slice(0, 19).replace("T", " ") : ""}</td>
                      </tr>
                    ))}
                    {refunds.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-gray-400 py-4">No refund requests.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}