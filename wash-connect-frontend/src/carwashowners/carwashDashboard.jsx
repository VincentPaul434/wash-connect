import React, { useEffect, useState } from "react";
import { FaEnvelope, FaPhone, FaUserCircle, FaStar, FaRegStar, FaEye, FaBars, FaRegEnvelope, FaRegUser, FaRegCheckSquare, FaRegFolderOpen, FaTrophy, FaRegEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const services = [
	{
		name: "Full detailing",
		date: "April 5, 2024",
		tag: "Detailers",
		tagColor: "bg-pink-200 text-pink-700",
		avatar: "https://randomuser.me/api/portraits/men/32.jpg",
	},
	{
		name: "Ceramic Coating",
		date: "April 5, 2024",
		tag: "Service Technician",
		tagColor: "bg-blue-200 text-blue-700",
		avatar: "https://randomuser.me/api/portraits/men/33.jpg",
	},
	{
		name: "Carwash",
		date: "April 5, 2024",
		tag: "Carwash Attendants",
		tagColor: "bg-red-200 text-red-700",
		avatar: "https://randomuser.me/api/portraits/men/34.jpg",
	},
];

const reviews = [
	{
		service: "Full detailing",
		stars: 5,
		desc: "From John Doe 1.2 miles away lorem ipsum dolor sit amet...",
		img: "https://randomuser.me/api/portraits/men/35.jpg",
	},
	{
		service: "Basic carwash",
		stars: 4,
		desc: "From John Doe 1.2 miles away lorem ipsum dolor sit amet...",
		img: "https://randomuser.me/api/portraits/men/36.jpg",
	},
	{
		service: "Ceramic Coating",
		stars: 3,
		desc: "From John Doe 1.2 miles away lorem ipsum dolor sit amet...",
		img: "https://randomuser.me/api/portraits/men/37.jpg",
	},
	{
		service: "Engine Detailing",
		stars: 4,
		desc: "From John Doe 1.2 miles away lorem ipsum dolor sit amet...",
		img: "https://randomuser.me/api/portraits/men/38.jpg",
	},
	{
		service: "Motorwash",
		stars: 2,
		desc: "From John Doe 1.2 miles away lorem ipsum dolor sit amet...",
		img: "https://randomuser.me/api/portraits/men/39.jpg",
	},
];

export default function CarwashDashboard() {
    const [recentBookings, setRecentBookings] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [ownerData, setOwnerData] = useState(null);
    const [carwashData, setCarwashData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profileUploaded, setProfileUploaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const owner = JSON.parse(localStorage.getItem("carwashOwner"));
                if (!owner || !owner.id) return;

                // Fetch owner credentials
                const ownerRes = await fetch(`http://localhost:3000/api/carwash-owners/${owner.id}`);
                const ownerDataRaw = await ownerRes.json();
                const ownerData = {
                    ...ownerDataRaw,
                    first_name: ownerDataRaw.first_name || ownerDataRaw.owner_first_name || "",
                    last_name: ownerDataRaw.last_name || ownerDataRaw.owner_last_name || "",
                };
                setOwnerData(ownerData);

                // Fetch carwash application data
                const appRes = await fetch(`http://localhost:3000/api/carwash-applications/by-owner/${owner.id}`);
                const appData = await appRes.json();
                setCarwashData(appData);

                // Fetch bookings if application exists
                if (appData && appData.applicationId) {
                    const bookingsRes = await fetch(`http://localhost:3000/api/bookings/by-application/${appData.applicationId}`);
                    const bookingsData = await bookingsRes.json();
                    setRecentBookings(bookingsData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

	// Optionally, hide the indicator after 2 seconds
	useEffect(() => {
		if (profileUploaded) {
			const timer = setTimeout(() => setProfileUploaded(false), 2000);
			return () => clearTimeout(timer);
		}
	}, [profileUploaded]);

	if (isLoading) {
		return <div className="flex justify-center items-center h-screen">Loading...</div>;
	}

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Sidebar */}
			<aside className="w-64 bg-white border-r flex flex-col">
				{/* Logo */}
				<div className="px-6 py-8">
					<div className="text-3xl flex items-center select-none">
						<span
							className="text-gray-700"
							style={{ fontFamily: '"Great Vibes", cursive', fontSize: "2.2rem" }}
						>
							Wash
						</span>
						<span
							className="ml-2 text-red-500 font-semibold"
							style={{ fontFamily: '"Great Vibes", cursive', fontSize: "2.2rem" }}
						>
							Connect
						</span>
					</div>
				</div>
            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
              <div className="flex items-center justify-between mb-2 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors duration-200">
                <span className="flex items-center gap-2 text-gray-700">
                  <FaRegEnvelope className="text-lg" /> Inbox
                </span>
                <span className="text-xs text-gray-700">24</span>
              </div>
              
              <button
                className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
				  activeTab === "overview" 
					? "bg-blue-100 text-blue-700 font-semibold" 
					: "hover:bg-gray-100 cursor-pointer"
				}`}
				onClick={() => setActiveTab("overview")}
			  >
				<FaRegEye /> Overview
			  </button>
			  
			  <button
				className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
				  activeTab === "customers" 
					? "bg-blue-100 text-blue-700 font-semibold" 
					: "hover:bg-gray-100 cursor-pointer"
				}`}
			onClick={() => {
				setActiveTab("customers");
				navigate("/customer-list");
			}}>
				<span className="text-lg">★</span> Customers & Employee
			  </button>
              
              <hr className="my-2 border-gray-300" />
              
              <div className="flex items-center gap-2 mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200">
                <FaRegCheckSquare className="text-lg" />
                <span>Manage Bookings</span>
              </div>
              
              <div className="flex items-center gap-2 mb-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200">
                <FaRegCheckSquare className="text-lg" />
                <span>Booking History</span>
              </div>
              
              <div className="flex items-center gap-2 mt-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200">
                <FaTrophy className="text-lg" />
                <span>Earnings Dashboard</span>
              </div>
              
              <hr className="my-4 border-gray-300" />
            </nav>
          <div className="mt-auto px-4 py-6">
            <button className="flex items-center gap-2 text-gray-700 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200"
				onClick={() => navigate("/carwash-login")}
			>
              <FaRegFolderOpen className="text-lg" /> Logout
            </button>
          </div>
			</aside>

			{/* Main Content */}
			<main className="flex-1 flex flex-col"> 
				{/* Header */}
				<header className="flex items-center justify-between px-8 py-4 bg-blue-100 border-b">
					<div className="flex items-center gap-4">
						<FaBars className="text-2xl text-gray-500" />
						<h1 className="text-2xl font-semibold">Overview</h1>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-gray-500">Owner</span>
						<FaUserCircle className="text-2xl text-gray-400" />
					</div>
				</header>

				{/* Main Grid */}
				<div className="flex-1 grid grid-cols-3 gap-6 p-8">
					{/* Profile & Services */}
					<section className="col-span-2">
						<div className="flex items-center gap-6">
							<div className="relative">
								<img
									src={
										ownerData?.owner_avatar
											? ownerData.owner_avatar.startsWith('http')
												? ownerData.owner_avatar
												: `http://localhost:3000${ownerData.owner_avatar}`
											: "https://ui-avatars.com/api/?name=" +
												encodeURIComponent(
													`${ownerData?.first_name || ""} ${ownerData?.last_name || ""}`
												)
									}
									alt="Profile"
									className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
								/>
								{/* Upload Icon */}
								<label className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow cursor-pointer">
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={async (e) => {
											const file = e.target.files[0];
											if (!file) return;
			
											try {
												const formData = new FormData();
												formData.append("file", file); // Try both "avatar" and "file" as field names

												const owner = JSON.parse(localStorage.getItem("carwashOwner"));
												const res = await fetch(
													`http://localhost:3000/api/carwash-owners/${owner.id}/avatar`,
													{
														method: "POST",
														body: formData,
														// Don't set Content-Type header manually
													}
												);
												
												if (!res.ok) {
													const errorData = await res.json();
													console.error("Upload failed:", errorData);
													return;
												}
												
												const updated = await res.json();
												setOwnerData((prev) => ({
													...prev,
													avatar: updated.avatar.startsWith('http')
														? updated.avatar
														: `http://localhost:3000${updated.avatar}`,
												}));
												setProfileUploaded(true);
											} catch (error) {
												console.error("Error uploading avatar:", error);
											}
										}}
									/>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 text-blue-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4v16m8-8H4"
										/>
									</svg>
								</label>
                                {/* Success indicator */}
                                {profileUploaded && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow flex items-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
							</div>
							<div>
								<h2 className="text-2xl font-bold">
									{ownerData
										? `${ownerData.first_name} ${ownerData.last_name}`
										: "Carwash Owner"}
								</h2>
								<p className="text-gray-500">Carwash owner</p>
							</div>
							<div className="ml-auto flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-lg shadow flex items-center justify-center mb-2">
              <img
                src={
                  carwashData?.logo
                    ? `http://localhost:3000/uploads/logos/${carwashData.logo}`
                    : "/default-logo.png"
                }
                alt="Company Logo"
                className="w-20 h-20 object-contain"
                onError={e => { e.target.onerror = null; e.target.src = "/default-logo.png"; }}
              />
            </div>
            <div className="text-center text-base mt-1 font-semibold">
              {carwashData?.carwash_name || carwashData?.carwashName || "Carwash Company"}
            </div>
            {/* Optionally, add stars or rating here */}
          </div>
						</div>

						{/* Services */}
						<div className="mt-8">
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-semibold">Services</h3>
								<span
									className="text-blue-400 cursor-pointer"
									title="Services info"
								>
									?
								</span>
								<button className="ml-auto px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
									Add Services +
								</button>
							</div>
							<div className="space-y-3 mt-4">
								{services.map((s, i) => (
									<div
										key={i}
										className="flex items-center bg-white rounded-lg shadow px-4 py-2"
									>
										<span className="font-semibold">{s.name}</span>
										<span className="mx-3 text-gray-400">
											<svg
												className="inline w-4 h-4 mr-1"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
											{s.date}
										</span>
										<span
											className={`px-2 py-0.5 rounded text-xs font-medium ${s.tagColor}`}
										>
											{s.tag}
										</span>
										<img
											src={s.avatar}
											alt=""
											className="w-8 h-8 rounded-full ml-auto"
										/>
										<button className="ml-2 text-gray-400 hover:text-gray-700">
											<svg width="20" height="20" fill="currentColor">
												<circle cx="10" cy="5" r="1.5" />
												<circle cx="10" cy="10" r="1.5" />
												<circle cx="10" cy="15" r="1.5" />
											</svg>
										</button>
									</div>
								))}
							</div>
						</div>

						{/* Recent Booking Request */}
						<div className="mt-10">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold">Recent Booking Request</h3>
								<button className="px-3 py-1 bg-gray-100 rounded text-sm font-medium hover:bg-gray-200">
									View All
								</button>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{recentBookings.length === 0 && (
									<div className="text-gray-500 text-center col-span-2">No recent bookings.</div>
								)}
								{recentBookings.filter(b => b.status !== "Declined").map((booking) => (
									<div
										key={booking.id}
										className="flex flex-col md:flex-row items-start md:items-center bg-white border border-gray-200 rounded-xl shadow p-4 gap-4 relative"
										style={{ borderColor: "#ffeeba", background: "#fffde7" }}
									>
										<img
											src={booking.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customer_name || "Customer")}`}
											alt=""
											className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
										/>
										<div className="flex-1 flex flex-col gap-1">
											<div className="flex items-center gap-2">
												<span className="font-semibold text-base">{booking.customer_name}</span>
												<span className="text-xs text-gray-500">Customer</span>
												<span className="ml-auto flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">
													<svg width="12" height="12" fill="currentColor"><circle cx="6" cy="6" r="6" /></svg>
													{booking.status || "Pending"}
												</span>
											</div>
											<div className="flex items-center gap-2 text-xs text-gray-500">
												<span>{new Date(booking.schedule_date).toLocaleDateString()}</span>
												<span>{new Date(booking.schedule_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
											</div>
											<div className="flex items-center gap-2 text-sm mt-1">
												<span className="font-semibold">Address:</span>
												<span className="truncate">{booking.address}</span>
											</div>
											<div className="flex items-center gap-2 text-sm">
												<span className="font-semibold">Services:</span>
												<span className="truncate">{booking.service_name}</span>
											</div>
											<div className="flex items-center gap-2 text-sm">
												<span className="font-semibold">Email:</span>
												<span className="truncate">{booking.customer_email}</span>
											</div>
											<div className="flex gap-2 mt-2">
												<button className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
													View Details
												</button>
												{booking.status !== "Confirmed" && (
													<>
														<button
															className="flex-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-600 hover:text-white transition-colors duration-150"
															onClick={async () => {
																console.log("Confirm clicked", booking.appointment_id);
																await fetch(`http://localhost:3000/api/bookings/confirm/${booking.appointment_id}`, {
																	method: "PATCH",
																});
																// Refresh bookings after confirming
																const owner = JSON.parse(localStorage.getItem("carwashOwner"));
																if (owner && owner.id) {
																	const appRes = await fetch(`http://localhost:3000/api/carwash-applications/by-owner/${owner.id}`);
																	const appData = await appRes.json();
																	if (appData && appData.applicationId) {
																		const bookingsRes = await fetch(`http://localhost:3000/api/bookings/by-application/${appData.applicationId}`);
																		const bookingsData = await bookingsRes.json();
																		setRecentBookings(bookingsData);
																	}
																}
															}}
														>
															Confirm
														</button>
														<button
															className="flex-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-600 hover:text-white transition-colors duration-150"
															onClick={async () => {
																await fetch(`http://localhost:3000/api/bookings/decline/${booking.appointment_id}`, {
																	method: "PATCH",
																});
																// Remove the declined booking from the queue immediately
																setRecentBookings(prev => prev.filter(b => b.appointment_id !== booking.appointment_id));
															}}
														>
															Decline
														</button>
													</>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</section>

					{/* Lead Details & Reviews */}
					<aside className="col-span-1 flex flex-col gap-8">
            {/* Lead Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">Lead Details</h4>
                <button className="text-gray-400 hover:text-gray-700">
                  <svg width="20" height="20" fill="currentColor">
                    <circle cx="10" cy="5" r="1.5" />
                    <circle cx="10" cy="10" r="1.5" />
                    <circle cx="10" cy="15" r="1.5" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center">
                  <span className="w-24 text-gray-500">Company</span>
                  <span className="font-medium">{carwashData?.carwash_name || carwashData?.carwashName || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-500">Industry</span>
                  <span>{carwashData?.industry || "Service"}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-500">Size</span>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                    {carwashData?.company_size || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-500">Email</span>
                  <span className="flex items-center gap-1">
                    <FaEnvelope className="text-gray-400" /> {ownerData?.owner_email || ownerData?.email || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-500">Phone</span>
                  <span className="flex items-center gap-1">
                    <FaPhone className="text-gray-400" /> {ownerData?.owner_phone || ownerData?.phone || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-500">Status</span>
                  <span className="text-green-600 font-medium">{carwashData?.status || "Contacted"}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-500">Owner</span>
                  <span>{ownerData ? `${ownerData.first_name} ${ownerData.last_name}` : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Reviews */}
						<div className="bg-white rounded-lg shadow p-6">
							<h4 className="font-semibold text-lg mb-4">Reviews</h4>
							<div className="space-y-4">
								{reviews.map((r, i) => (
									<div key={i} className="flex items-center gap-3">
										<img
											src={r.img}
											alt=""
											className="w-10 h-10 rounded-full"
										/>
										<div className="flex-1">
											<div className="font-semibold text-sm">{r.service}</div>
											<div className="text-xs text-gray-500 truncate">
												{r.desc}
											</div>
										</div>
										<div className="flex gap-0.5">
											{[...Array(5)].map((_, idx) =>
												idx < r.stars ? (
													<FaStar key={idx} className="text-yellow-400 text-xs" />
												) : (
													<FaRegStar key={idx} className="text-gray-300 text-xs" />
												)
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</aside>
				</div>
			</main>
		</div>
	);
}