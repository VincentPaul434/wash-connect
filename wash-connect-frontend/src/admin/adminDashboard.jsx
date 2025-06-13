import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Eye, Users, FileText, Inbox, LogOut, UserCircle } from "lucide-react";
function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const navigate = useNavigate();

  const bestMonth = { month: "March 2024", profit: "$12,800" };
  const lowestMonth = { month: "July 2024", profit: "$6,500" };
  const totalIncome = 12800;
  const expenses = 5600;
  const netProfit = 7200;
  const netIncomeTrend = [
    { month: "Jan", value: 9000 },
    { month: "Feb", value: 12000 },
    { month: "Mar", value: 12800 },
    { month: "Apr", value: 8000 },
    { month: "May", value: 9000 },
    { month: "Jun", value: 6500 },
    { month: "Jul", value: 6500 },
    { month: "Aug", value: 11000 },
    { month: "Sep", value: 9500 },
    { month: "Oct", value: 12000 },
    { month: "Nov", value: 10000 },
    { month: "Dec", value: 12500 },
  ];
    const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }


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
            className={`flex items-center w-full px-4 py-3 rounded-lg transition ${
              activeMenu === "dashboard"
                ? "bg-cyan-100 text-cyan-700 font-semibold"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActiveMenu("dashboard")}
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

        {/* Dashboard Content */}
        <div className="p-10">
          {/* Top Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="col-span-2 flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
                <span className="text-green-600 font-semibold flex items-center mb-2">
                  <svg width="20" height="20" fill="none" className="mr-1"><path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Best Month
                </span>
                <span className="text-xl font-bold">{bestMonth.month}</span>
                <span className="text-gray-500 text-sm">Net Profit: {bestMonth.profit}</span>
              </div>
              <div className="flex-1 bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
                <span className="text-red-500 font-semibold flex items-center mb-2">
                  <svg width="20" height="20" fill="none" className="mr-1"><path d="M2 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Lowest Month
                </span>
                <span className="text-xl font-bold">{lowestMonth.month}</span>
                <span className="text-gray-500 text-sm">Net Profit: {lowestMonth.profit}</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
              <span className="text-blue-600 font-semibold mb-2">Total Income</span>
              <span className="text-2xl font-bold">${totalIncome.toLocaleString()}</span>
              <span className="text-green-600 text-sm mt-1">↑ 5% this month</span>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
              <span className="text-red-500 font-semibold mb-2">Expenses & Refunds</span>
              <span className="text-2xl font-bold">${expenses.toLocaleString()}</span>
              <span className="text-red-500 text-sm mt-1">↓ 2% this month</span>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
              <span className="text-green-600 font-semibold mb-2">Net Profit</span>
              <span className="text-2xl font-bold">${netProfit.toLocaleString()}</span>
              <span className="text-green-600 text-sm mt-1">↑ 4% this month</span>
            </div>
          </div>

          {/* Net Income Trend */}
          <div className="bg-white rounded-xl shadow p-8 border border-gray-100">
            <h3 className="text-lg font-semibold mb-6">Net Income Trend</h3>
            <div className="flex items-end h-48 gap-3">
              {netIncomeTrend.map((item) => (
                <div key={item.month} className="flex flex-col items-center w-8">
                  <div
                    className={`rounded-t-md ${item.value >= 10000 ? "bg-green-400" : item.value >= 8000 ? "bg-yellow-300" : "bg-red-400"}`}
                    style={{
                      height: `${(item.value / 13000) * 100}%`,
                      minHeight: "12px",
                      width: "100%",
                      transition: "height 0.3s"
                    }}
                  ></div>
                  <span className="text-xs mt-2 text-gray-500">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;