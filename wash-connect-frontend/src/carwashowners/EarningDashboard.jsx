import React, { useEffect, useState } from "react";
import { FaRegCheckSquare, FaTrophy, FaUserCircle, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function EarningDashboard() {
    const [summary, setSummary] = useState({
        carwashName: "Carwash Name",
        month: "April,2024",
        finished: 0,
        totalServices: 0,
        efficiency: "80%",
        logoUrl: "/carwash-logo.png",
        bestMonth: { name: "March 2024", profit: "12,800" },
        lowestMonth: { name: "July 2024", profit: "6,500" },
        income: "12,800",
        incomeChange: "↑ 5% this month",
        expense: "5,600",
        expenseChange: "↓ 2% this month",
        profit: "7,200",
        profitChange: "↑ 4% this month"
    });
    const [trend, setTrend] = useState([
        { name: "Jan", short: "Jan", value: 1000 },
        { name: "Feb", short: "Feb", value: 1200 },
        { name: "Mar", short: "Mar", value: 1500 },
        { name: "Apr", short: "Apr", value: 900 },
        { name: "May", short: "May", value: 800 },
        { name: "Jun", short: "Jun", value: 700 },
    ]);
    const [details, setDetails] = useState([
        { date: "2024-04-01", type: "Income", description: "Wash Service", amount: "500", status: "Completed" },
        { date: "2024-04-02", type: "Expense", description: "Supplies", amount: "200", status: "Completed" },
        { date: "2024-04-03", type: "Refund", description: "Customer Refund", amount: "100", status: "Refunded" },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // No API calls, using static data above
    }, []);

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
                    <hr className="my-2 border-gray-300" />
                    <button className="flex items-center gap-2 mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200 w-full text-left" onClick={() => navigate("/bookings")}> <FaRegCheckSquare className="text-lg" /> <span>Manage Bookings</span> </button>
                    <button className="flex items-center gap-2 mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200 w-full text-left" onClick={() => navigate("/booking-history")}> <FaRegCheckSquare className="text-lg" /> <span>Booking History</span> </button>
                    <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-blue-100 text-blue-700 font-semibold rounded cursor-pointer transition-colors duration-200"> <FaTrophy className="text-lg" /> <span>Earnings Dashboard</span> </div>
                    <hr className="my-4 border-gray-300" />
                </nav>
                <div className="mt-auto px-4 py-6">
                    <button className="flex items-center gap-2 text-gray-700 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200" onClick={() => navigate("/carwash-login")}>Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="flex items-center justify-between px-8 py-4 bg-blue-100 border-b">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-semibold">Earnings Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Owner</span>
                        <FaUserCircle className="text-2xl text-gray-400" />
                    </div>
                </header>

                <div className="flex-1 grid grid-cols-3 gap-6 p-8">
                    {/* Summary Section */}
                    <section className="col-span-2 space-y-6">
                        <div className="flex gap-6">
                            <div className="flex-1 bg-white rounded-xl shadow p-6 flex flex-col gap-2">
                                <h2 className="text-xl font-semibold">{summary?.carwashName}</h2>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500">Track bookings and manage CRM here...</span>
                                    <span className="ml-auto text-sm text-gray-400">Date: {summary?.month}</span>
                                </div>
                                <div className="flex items-center gap-8 mt-4">
                                    <div>
                                        <span className="font-bold text-lg">{summary?.finished}</span>
                                        <span className="text-xs text-gray-500 ml-1">/ {summary?.totalServices} services</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-lg">{summary?.efficiency}</span>
                                        <span className="text-xs text-gray-500 ml-1">Efficiency</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-40 h-40 bg-white rounded-xl shadow flex items-center justify-center">
                                <img src={summary?.logoUrl} alt="Carwash Logo" className="w-32 h-32 object-contain" />
                            </div>
                        </div>

                        {/* Best/Lowest Month & Income/Expense/Profit */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                                <span className="text-green-600 font-semibold">Best Month</span>
                                <span className="text-lg">{summary?.bestMonth?.name}</span>
                                <span className="text-xs text-gray-500">Net Profit: ₱{summary?.bestMonth?.profit}</span>
                            </div>
                            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                                <span className="text-red-600 font-semibold">Lowest Month</span>
                                <span className="text-lg">{summary?.lowestMonth?.name}</span>
                                <span className="text-xs text-gray-500">Net Profit: ₱{summary?.lowestMonth?.profit}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                                    <span className="text-blue-600 font-semibold">Total Income</span>
                                    <span className="text-lg">₱{summary?.income}</span>
                                    <span className="text-xs text-green-600">{summary?.incomeChange}</span>
                                </div>
                                <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                                    <span className="text-red-600 font-semibold">Expense & Refunds</span>
                                    <span className="text-lg">₱{summary?.expense}</span>
                                    <span className="text-xs text-red-600">{summary?.expenseChange}</span>
                                </div>
                                <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                                    <span className="text-green-600 font-semibold">Net Profit</span>
                                    <span className="text-lg">₱{summary?.profit}</span>
                                    <span className="text-xs text-green-600">{summary?.profitChange}</span>
                                </div>
                            </div>
                        </div>

                        {/* Net Income Trend */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h4 className="font-semibold mb-2">Net Income Trend</h4>
                            <div className="flex items-end gap-2 h-32">
                                {trend.map((month) => (
                                    <div key={month.name} className="flex flex-col items-center justify-end h-full">
                                        <div
                                            className={`w-6 rounded ${month.value > 0 ? "bg-green-400" : month.value < 0 ? "bg-red-400" : "bg-yellow-400"}`}
                                            style={{ height: `${Math.abs(month.value) / 200 * 100}%` }}
                                        ></div>
                                        <span className="text-xs mt-1">{month.short}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Income & Expense Details */}
                    <section className="col-span-1">
                        <div className="bg-white rounded-xl shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold">Income & Expense Details</h4>
                                <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs font-medium hover:bg-gray-200">
                                    <FaDownload className="text-sm" /> Export
                                </button>
                            </div>
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
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${row.type === "Income" ? "bg-green-100 text-green-700" : row.type === "Expense" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                    {row.type}
                                                </span>
                                            </td>
                                            <td className="py-2">{row.description}</td>
                                            <td className="py-2">₱{row.amount}</td>
                                            <td className="py-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${row.status === "Completed" ? "bg-green-200 text-green-800" : row.status === "Refunded" ? "bg-red-200 text-red-800" : "bg-gray-200 text-gray-800"}`}>
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
                    </section>
                </div>
            </main>
        </div>
    );
}