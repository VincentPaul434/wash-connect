import { useEffect, useState } from "react";
import { Trophy, Eye, Users, FileText, Inbox, LogOut, MapPin, Search, UserCircle, Star } from "lucide-react";

function AdminUserManagement() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/admin/customers");
      const data = await res.json();
      setCustomers(data);
    } catch {
      setCustomers([]);
    }
    setLoading(false);
  };

  // Filtered customers by search
  const filtered = customers.filter(
    (c) =>
      c.first_name.toLowerCase().includes(search.toLowerCase()) ||
      c.last_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.address || "").toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const overallCount = customers.length;
  const activeCount = customers.filter((c) => c.status === "Active").length;
  const reportedCount = customers.filter((c) => c.status === "Reported").length;
  const bannedCount = customers.filter((c) => c.status === "Banned").length;

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
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
            onClick={() => window.location.href = "/admin-dashboard"}
          >
            <Trophy className="mr-3 w-5 h-5" />
            Earnings Dashboard
          </button>
          <button
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
            onClick={() => window.location.href = "/admin-carwash-management"}
          >
            <Eye className="mr-3 w-5 h-5" />
            Carwash Shops
          </button>
          <button
            className="flex items-center w-full px-4 py-3 rounded-lg bg-cyan-100 text-cyan-700 font-semibold"
            disabled
          >
            <Star className="mr-3 w-5 h-5" />
            Customers
          </button>
          <hr className="my-4" />
          <button
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
            onClick={() => window.location.href = "/admin-application-requests"}
          >
            <FileText className="mr-3 w-5 h-5" />
            Application Request
          </button>
        </nav>
        <div className="px-8 pb-8 mt-auto">
          <button className="flex items-center text-gray-700 hover:text-red-500"
            onClick={() => window.location.href = "/login"}
          >
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
            <Inbox className="w-6 h-6 text-gray-700 mr-4" />
            <span className="text-2xl font-bold">Manage Customers</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">SuperAdmin</span>
            <UserCircle className="w-7 h-7 text-gray-700" />
          </div>
        </header>

        {/* Stats */}
        <div className="flex gap-4 px-10 pt-8">
          <div className="bg-cyan-100 rounded-xl px-6 py-4 flex flex-col items-center min-w-[170px]">
            <span className="text-sm text-gray-700">Overall Customer</span>
            <span className="text-3xl font-bold">{overallCount}</span>
            <span className="text-green-600 text-xs mt-1">↑ 2.5% Service performance this month</span>
          </div>
          <div className="bg-white rounded-xl px-6 py-4 flex flex-col items-center min-w-[170px] border border-gray-200">
            <span className="text-sm text-gray-700">Active Customer</span>
            <span className="text-3xl font-bold">{activeCount}</span>
            <span className="text-green-600 text-xs mt-1">↑ 2.1% Service performance this month</span>
          </div>
          <div className="bg-white rounded-xl px-6 py-4 flex flex-col items-center min-w-[170px] border border-gray-200">
            <span className="text-sm text-gray-700">Reported Customer</span>
            <span className="text-3xl font-bold">{reportedCount}</span>
            <span className="text-green-600 text-xs mt-1">↑ 2.1% Service performance this month</span>
          </div>
          <div className="bg-white rounded-xl px-6 py-4 flex flex-col items-center min-w-[170px] border border-gray-200">
            <span className="text-sm text-gray-700">Banned Customer</span>
            <span className="text-3xl font-bold">{bannedCount}</span>
            <span className="text-green-600 text-xs mt-1">↑ 2.1% Service performance this month</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 px-10 mt-10 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-3 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none w-full"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <span className="text-gray-700">Location</span>
          </div>
        </div>

        {/* Customer Cards */}
        <div className="px-10 pb-10">
          <h2 className="text-3xl font-bold mb-4">Overall Customer</h2>
          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.length === 0 ? (
                <div className="col-span-full text-center text-gray-400 py-20">No customers found.</div>
              ) : (
                filtered.map((c) => (
                  <div key={c.user_id} className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col">
                    <div className="flex items-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-700 mr-3">
                        {c.first_name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{c.first_name} {c.last_name}</div>
                        <div className="text-xs text-gray-500">Customer</div>
                      </div>
                      <div className="ml-auto">
                        {c.status === "Active" && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
                        )}
                        {c.status === "Reported" && (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Reported</span>
                        )}
                        {c.status === "Banned" && (
                          <span className="bg-red-200 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Banned</span>
                        )}
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {c.address}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs text-gray-500">Email</span>
                      <input
                        type="text"
                        className="w-full mt-1 px-2 py-1 rounded border border-gray-200 bg-gray-50 text-gray-700 text-xs"
                        value={c.email}
                        readOnly
                      />
                    </div>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full py-2 mt-2 font-semibold transition"
                      onClick={async () => {
                        await fetch(`http://localhost:3000/api/admin/customers/ban/${c.user_id}`, {
                          method: "PATCH",
                        });
                        fetchCustomers(); // Refresh list after banning
                      }}
                      disabled={c.status === "Banned"}
                    >
                      Ban
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminUserManagement;