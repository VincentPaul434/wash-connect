import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Mail, Star, Calendar, MapPin } from "lucide-react";

const services = [
	{
		name: "Basic Car Wash",
		img: "https://images.pexels.com/photos/372810/pexels-photo-372810.jpeg?auto=compress&w=400&h=300&fit=crop",
		price: 400,
	},
	{
		name: "Full Detailing",
		img: "https://images.pexels.com/photos/3806273/pexels-photo-3806273.jpeg?auto=compress&w=400&h=300&fit=crop",
		price: 1000,
	},
	{
		name: "Underwash",
		img: "https://images.pexels.com/photos/48889/pexels-photo-48889.jpeg?auto=compress&w=400&h=300&fit=crop",
		price: 200,
	},
	{
		name: "Ceramic Coating",
		img: "https://images.pexels.com/photos/170782/pexels-photo-170782.jpeg?auto=compress&w=400&h=300&fit=crop",
		price: 1000,
	},
	{
		name: "Basic Motorwash",
		img: "https://images.pexels.com/photos/372810/pexels-photo-372810.jpeg?auto=compress&w=400&h=300&fit=crop",
		price: 50,
	},
	{
		name: "Engine Detailing",
		img: "https://images.pexels.com/photos/48889/pexels-photo-48889.jpeg?auto=compress&w=400&h=300&fit=crop",
		price: 2000,
	},
];

function BookingPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const applicationId = location.state?.applicationId || "";
	const [selectedSort, setSelectedSort] = useState("New");
	const [search, setSearch] = useState("");
	const [hasActiveBooking, setHasActiveBooking] = useState(false);
	const [activeBooking, setActiveBooking] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
		}
	}, [navigate]);

	useEffect(() => {
		const userId = JSON.parse(localStorage.getItem("user"))?.id;
		if (userId) {
			fetch(`http://localhost:3000/api/bookings/customers/${userId}`)
				.then((res) => res.json())
				.then((bookings) => {
					const active = bookings.find(
						(b) => b.status !== "Declined" && b.status !== "Done" && b.status !== "Cancelled"
					);
					setHasActiveBooking(!!active);
					setActiveBooking(active || null);
				});
		}
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		navigate("/login");
	};

	// Filtering and sorting logic
	const filteredServices = services
		.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
		.sort((a, b) => {
			if (selectedSort === "Price ascending") return a.price - b.price;
			if (selectedSort === "Price descending") return b.price - a.price;
			if (selectedSort === "Rating") return 0; // Placeholder for rating sort
			return 0;
		});

	return (
		<div className="flex min-h-screen bg-[#c8f1ff]">
			{/* Sidebar */}
			<div className="w-72 bg-white border-r border-gray-200 flex flex-col min-h-screen">
				<div className="flex items-center px-8 py-8 border-b border-gray-100">
					<span
						className="text-3xl"
						style={{ fontFamily: "Brush Script MT, cursive" }}
					>
						<span className="text-cyan-500">Wash</span>{" "}
						<span className="text-red-500">Connect</span>
					</span>
				</div>
				<nav className="flex-1 px-4 py-6 space-y-2">
					<div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer">
						<Mail className="mr-3 w-5 h-5" />
						Inbox
						<span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
							0
						</span>
					</div>
					<div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => navigate("/user-dashboard")}
          >
						<User className="mr-3 w-5 h-5" />
						Account
					</div>
					<div className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => navigate("/popular-carwash")}
          >
						<Star className="mr-3 w-5 h-5" />
						<span className="text-gray-700">Carwash Shops</span>
					</div>
					<div className="flex items-center w-full px-4 py-3 rounded-lg bg-cyan-100 text-cyan-700 font-semibold cursor-pointer">
						<span className="text-xl">♡</span>
						<span className="text-gray-700">Bookings</span>
					</div>
					<hr className="my-4" />
					<div
						className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
						onClick={() => {
							if (activeBooking) {
								navigate("/booking-confirmation", { state: { appointment_id: activeBooking.appointment_id } });
							} else {
								navigate("/booking-confirmation", { state: { appointment_id: null } });
							}
						}}
					>
						<Calendar className="mr-3 w-5 h-5" />
						<span className="text-gray-700">Appointment</span>
					</div>
					<div className="mt-auto px-4 pt-8">
						<div
							className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
							onClick={handleLogout}
						>
							<span className="text-xl">📁</span>
							<span className="text-gray-700">LogOut</span>
						</div>
					</div>
				</nav>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col">
				{/* Header */}
				<header className="flex items-center px-8 py-6 bg-[#a8d6ea] border-b border-gray-200">
					<span
						className="text-3xl font-normal text-white"
						style={{ fontFamily: "sans-serif" }}
					>
						{location.state?.carwashName || "Carwash"} {/* Show the chosen carwash name */}
					</span>
					<div className="ml-auto flex items-center gap-6">
						<span className="flex items-center text-black text-sm cursor-pointer">
							<span className="mr-1">💬</span> Message
						</span>
						<span className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
							<User className="w-5 h-5 text-blue-400" />
						</span>
						<span className="text-2xl text-gray-700">•••</span>
					</div>
				</header>

				{/* Filters */}
				<div className="flex flex-col md:flex-row items-center gap-4 px-16 pt-8">
					<div className="flex-1 flex items-center">
						<input
							type="text"
							placeholder="Search"
							className="rounded-full px-4 py-2 border border-gray-300 bg-white w-full max-w-xs"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<div className="flex gap-2">
						<button
							className={`px-4 py-1 rounded-full border Php{
								selectedSort === "New"
									? "bg-black text-white"
									: "bg-gray-100 text-gray-700"
							}`}
							onClick={() => setSelectedSort("New")}
						>
							New
						</button>
						<button
							className={`px-4 py-1 rounded-full border Php{
								selectedSort === "Price ascending"
									? "bg-black text-white"
									: "bg-gray-100 text-gray-700"
							}`}
							onClick={() => setSelectedSort("Price ascending")}
						>
							Price ascending
						</button>
						<button
							className={`px-4 py-1 rounded-full border Php{
								selectedSort === "Price descending"
									? "bg-black text-white"
									: "bg-gray-100 text-gray-700"
							}`}
							onClick={() => setSelectedSort("Price descending")}
						>
							Price descending
						</button>
						<button
							className={`px-4 py-1 rounded-full border Php{
								selectedSort === "Rating"
									? "bg-black text-white"
									: "bg-gray-100 text-gray-700"
							}`}
							onClick={() => setSelectedSort("Rating")}
						>
							Rating
						</button>
					</div>
				</div>

				{/* Services Grid */}
				<div className="flex-1 p-10">
					<h2 className="text-lg font-semibold mb-4">
						{location.state?.carwashName || "Carwash"} Services
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
						{filteredServices.map((service) => (
							<div
								key={service.name}
								className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-200"
								style={{ width: 260 }}
							>
								<div
									className="w-56 h-40 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden mb-2"
									style={{ width: 220, height: 150 }}
								>
									<img
										src={service.img}
										alt={service.name}
										className="w-full h-full object-cover"
									/>
								</div>
								<div className="text-base font-semibold text-center text-gray-900 mb-1">
									{service.name}
								</div>
								<div className="text-md font-bold text-left w-full mb-2">
									Php{service.price}
								</div>
								<button
									className="border border-blue-400 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 text-xs"
									onClick={() => {
										const user = JSON.parse(localStorage.getItem("user")) || {};
										navigate("/book-form", {
											state: {
												applicationId: applicationId,
												serviceName: service.name,
												carwashName: location.state?.carwashName || "Carwash",
												firstName: user.first_name || "",
												lastName: user.last_name || "",
												email: user.email || "",
												address: user.address || "",
											},
										});
									}}
									disabled={hasActiveBooking}
								>
									Book Now
								</button>
								{hasActiveBooking && (
									<div className="text-red-500 mt-2">
										You already have an active booking. Please complete or cancel it before booking another.
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default BookingPage;


