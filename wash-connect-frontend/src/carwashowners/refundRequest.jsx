import React, { useState, useEffect } from "react";

export default function RefundRequest() {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);

	// Fetch refund requests from backend
	useEffect(() => {
		const owner = JSON.parse(localStorage.getItem("owner") || "{}");
		const applicationId = owner.applicationId; // <-- use applicationId here
		fetch(`http://localhost:3000/api/refunds?ownerId=${applicationId}`)
			.then((res) => res.json())
			.then((data) => {
				setRequests(data);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const handleAction = async (id, action) => {
		// Update status in backend
		await fetch(`http://localhost:3000/api/refunds/${id}/status`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status: action }),
		});
		// Update UI
		setRequests((prev) =>
			prev.map((req) => (req.id === id ? { ...req, status: action } : req))
		);
	};

	return (
		<div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
			<h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
				Refund Requests
			</h2>
			{loading ? (
				<div className="text-center text-gray-500">Loading...</div>
			) : requests.length === 0 ? (
				<p className="text-center text-gray-500">No refund requests.</p>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border border-gray-200 rounded-lg">
						<thead>
							<tr className="bg-gray-100">
								<th className="py-3 px-4 text-left font-semibold text-gray-700">
									Customer
								</th>
								<th className="py-3 px-4 text-left font-semibold text-gray-700">
									Amount
								</th>
								<th className="py-3 px-4 text-left font-semibold text-gray-700">
									Reason
								</th>
								<th className="py-3 px-4 text-left font-semibold text-gray-700">
									Status
								</th>
								<th className="py-3 px-4 text-left font-semibold text-gray-700">
									Action
								</th>
							</tr>
						</thead>
						<tbody>
							{requests.map((req) => (
								<tr
									key={req.id}
									className="border-t border-gray-200 hover:bg-gray-50"
								>
									<td className="py-3 px-4">{req.customer}</td>
									<td className="py-3 px-4">
										{req.amount
											? `₱${Number(req.amount).toFixed(2)}`
											: "-"}
									</td>
									<td className="py-3 px-4">{req.reason}</td>
									<td className="py-3 px-4">
										<span
											className={`px-2 py-1 rounded-full text-xs font-semibold ${
												req.status === "Pending"
													? "bg-yellow-100 text-yellow-800"
													: req.status === "Approved"
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{req.status}
										</span>
									</td>
									<td className="py-3 px-4">
										{req.status === "Pending" ? (
											<div className="flex gap-2">
												<button
													className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
													onClick={() =>
														handleAction(req.id, "Approved")
													}
												>
													Approve
												</button>
												<button
													className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
													onClick={() =>
														handleAction(req.id, "Rejected")
													}
												>
													Reject
												</button>
											</div>
										) : (
											<span className="text-gray-500">
												{req.status}
											</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

