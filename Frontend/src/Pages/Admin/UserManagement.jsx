import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import SideBar from "./Layouts/SideBar";
import Header from "./Layouts/Header";

export default function UserManagement() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedUser, setSelectedUser] = useState(null);
	const [modalMode, setModalMode] = useState(null); // 'view' | 'edit' | 'delete'
	const [editForm, setEditForm] = useState({});
	const [actionLoading, setActionLoading] = useState(false);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const res = await axiosInstance.get("/api/admin/users");
			setUsers(res.data.users);
			setError(null);
		} catch (err) {
			setError("Failed to fetch users");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetchUsers(); }, []);

	const filteredUsers = users.filter(
		(u) =>
			u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			u.email?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const openView = (user) => { setSelectedUser(user); setModalMode("view"); };
	const openEdit = (user) => {
		setSelectedUser(user);
		setEditForm({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
		setModalMode("edit");
	};
	const openDelete = (user) => { setSelectedUser(user); setModalMode("delete"); };
	const closeModal = () => { setSelectedUser(null); setModalMode(null); };

	const handleEditSubmit = async () => {
		setActionLoading(true);
		try {
			const res = await axiosInstance.put(`/api/admin/users/${selectedUser._id}`, editForm);
			const updated = res.data.user;
			setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? { ...u, ...updated } : u)));
			setSelectedUser((prev) => ({ ...prev, ...updated }));
			setModalMode("view");
		} catch { alert("Failed to update user"); }
		finally { setActionLoading(false); }
	};

	const handleDelete = async () => {
		setActionLoading(true);
		try {
			await axiosInstance.delete(`/api/admin/users/${selectedUser._id}`);
			setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
			closeModal();
		} catch { alert("Failed to delete user"); }
		finally { setActionLoading(false); }
	};

	const handleBanToggle = async () => {
		setActionLoading(true);
		try {
			const endpoint = selectedUser.isBanned
				? `/api/admin/users/${selectedUser._id}/unban`
				: `/api/admin/users/${selectedUser._id}/ban`;
			const res = await axiosInstance.post(endpoint);
			const updated = res.data.user;
			setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? { ...u, ...updated } : u)));
			setSelectedUser((prev) => ({ ...prev, ...updated }));
		} catch { alert("Failed to update ban status"); }
		finally { setActionLoading(false); }
	};

	const Overlay = ({ children, onClose }) => (
		<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }} onClick={onClose}>
			<div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
				{children}
			</div>
		</div>
	);

	const InfoRow = ({ label, value }) => (
		<div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
			<span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
			<span className="text-sm font-semibold text-slate-700 text-right max-w-[60%]">{value || "—"}</span>
		</div>
	);

	const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";

	const addr = selectedUser?.addresses?.[0];

	return (
		<div className="min-h-screen bg-slate-50 flex font-inter">
			<SideBar />
			<main className="flex-1 lg:ml-72 bg-slate-50 min-h-screen">
				<Header title="User Management" subtitle="Manage registered users and accounts" />
				<div className="p-8 max-w-7xl mx-auto space-y-6">
					{/* Stats */}
					<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
						{[
							{ label: "Total Users", value: users.length, color: "text-indigo-600", bg: "bg-indigo-50", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
							{ label: "Verified", value: users.filter((u) => u.isVerified).length, color: "text-emerald-600", bg: "bg-emerald-50", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
							{ label: "Unverified", value: users.filter((u) => !u.isVerified).length, color: "text-amber-600", bg: "bg-amber-50", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
							{ label: "Banned", value: users.filter((u) => u.isBanned).length, color: "text-rose-600", bg: "bg-rose-50", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg> },
						].map((s) => (
							<div key={s.label} className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-100/80 flex items-center gap-4">
								<div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>{s.icon}</div>
								<div>
									<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
									<p className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</p>
								</div>
							</div>
						))}
					</div>

					{/* Search */}
					<div className="relative">
						<svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
						<input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-100 text-sm font-medium text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 shadow-[0_4px_20px_rgb(0,0,0,0.04)] transition-all" />
					</div>

					{/* Table */}
					<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
						<div className="p-6 border-b border-slate-50 flex justify-between items-center">
							<div>
								<h3 className="text-lg font-black text-slate-900 tracking-tight">All Users</h3>
								<p className="text-gray-500 text-xs font-medium uppercase tracking-[0.15em] mt-1">{filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"} found</p>
							</div>
							<button onClick={fetchUsers} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-all uppercase tracking-[0.15em] flex items-center gap-1.5">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
								Refresh
							</button>
						</div>

						{loading ? (
							<div className="flex items-center justify-center py-20">
								<div className="flex flex-col items-center gap-3">
									<div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
									<p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading users...</p>
								</div>
							</div>
						) : error ? (
							<div className="flex items-center justify-center py-20">
								<div className="text-center">
									<div className="w-12 h-12 mx-auto mb-3 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
									</div>
									<p className="text-sm font-bold text-slate-700">{error}</p>
									<button onClick={fetchUsers} className="mt-2 text-xs font-bold text-indigo-600 hover:underline">Retry</button>
								</div>
							</div>
						) : filteredUsers.length === 0 ? (
							<div className="flex items-center justify-center py-20"><p className="text-sm font-medium text-gray-500">No users found</p></div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left">
									<thead>
										<tr className="bg-slate-50/50">
											<th className="px-6 py-4 text-[12px] font-black text-gray-500 uppercase tracking-widest">Sl No</th>
											<th className="px-6 py-4 text-[12px] font-black text-gray-500 uppercase tracking-widest">Name</th>
											<th className="px-6 py-4 text-[12px] font-black text-gray-500 uppercase tracking-widest">Email</th>
											<th className="px-6 py-4 text-[12px] font-black text-gray-500 uppercase tracking-widest text-center">Verified</th>
											<th className="px-6 py-4 text-[12px] font-black text-gray-500 uppercase tracking-widest text-center">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-50">
										{filteredUsers.map((user, idx) => (
											<tr key={user._id} className={`hover:bg-slate-50/30 transition-colors group ${user.isBanned ? "bg-rose-50/30" : ""}`}>
												<td className="px-6 py-4"><span className="text-xs font-mono font-bold text-gray-500">{idx + 1}</span></td>
												<td className="px-6 py-4">
													<div className="flex items-center gap-3">
														<div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 ${user.isBanned ? "bg-gradient-to-br from-rose-500 to-red-600" : "bg-gradient-to-br from-indigo-500 to-purple-600"}`}>
															{user.name?.charAt(0)?.toUpperCase() || "?"}
														</div>
														<div>
															<span className="text-sm font-bold text-slate-900">{user.name}</span>
															{user.isBanned && <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-600 uppercase">Banned</span>}
														</div>
													</div>
												</td>
												<td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
												<td className="px-6 py-4 text-center">
													{user.isVerified ? (
														<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-600">
															<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
															Verified
														</span>
													) : (
														<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold tracking-wider uppercase bg-amber-50 text-amber-600">Pending</span>
													)}
												</td>
												<td className="px-6 py-4 text-center">
													<div className="flex items-center justify-center gap-2">
														<button onClick={() => openView(user)} title="View" className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-100 transition-all duration-200">
															<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
														</button>
														{/* <button onClick={() => openEdit(user)} title="Edit" className="p-2 rounded-xl text-amber-600 hover:bg-amber-100 transition-all duration-200">
															<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
														</button> */}
														<button onClick={() => openDelete(user)} title="Delete" className="p-2 rounded-xl text-red-600 hover:bg-red-100 transition-all duration-200">
															<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</main>

			{/* ========== MODAL ========== */}
			{selectedUser && modalMode && (
				<Overlay onClose={closeModal}>
					{/* Header */}
					<div className={`p-6 ${modalMode === "delete" ? "bg-gradient-to-br from-rose-500 to-red-600" : "bg-gradient-to-br from-indigo-600 to-purple-600"}`}>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-black">
									{selectedUser.name?.charAt(0)?.toUpperCase()}
								</div>
								<div>
									<h3 className="text-white font-black text-lg tracking-tight">{selectedUser.name}</h3>
									<div className="flex items-center gap-2 mt-0.5">
										<span className="text-white/60 text-xs font-medium">{selectedUser.role?.toUpperCase()}</span>
										{selectedUser.isVerified && (
										<span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-bold uppercase tracking-wider bg-white text-indigo-600">
											<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
											Verified
										</span>
									)}
									{selectedUser.isBanned && (
										<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600">
											<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
											Banned
										</span>
									)}
										{/* {selectedUser.isBanned && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 text-white uppercase">Banned</span>} */}
									</div>
								</div>
							</div>
							<button onClick={closeModal} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
							</button>
						</div>
					</div>

					{/* VIEW MODE */}
					{modalMode === "view" && (
						<>
							{/* <div className="px-6 pt-5 pb-4 border-b border-slate-100">
							<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 backdrop-blur flex items-center justify-center text-black text-2xl font-black">
									{selectedUser.name?.charAt(0)?.toUpperCase()}
								</div>
								<h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedUser.name}</h2>
								<div className="flex items-center gap-2 mt-2 flex-wrap">
									<span className="px-2.5 py-1 rounded-lg text-[12px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600">
										{selectedUser.role}
									</span>
									{selectedUser.isVerified && (
										<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600">
											<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
											Verified
										</span>
									)}
									{selectedUser.isBanned && (
										<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600">
											<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
											Banned
										</span>
									)}
								</div>
							</div> */}

							<div className="p-6 m-4 max-w-4xl">
								<p className="text-md font-bold text-gray-700 uppercase tracking-widest mb-4">Personal Information</p>
								<div className="grid grid-cols-3 gap-x-6 gap-y-4 ">
									<div className="mb-1">
										<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Email</p>
										<p className="text-sm font-semibold text-slate-700 break-all">{selectedUser.email || "—"}</p>
									</div>
									<div className="mb-1">
										<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Phone</p>
										<p className="text-sm font-semibold text-slate-700">{selectedUser.phone || "—"}</p>
									</div>
									<div className="mb-1">
										<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Gender</p>
										<p className="text-sm font-semibold text-slate-700 capitalize">{selectedUser.gender || "—"}</p>
									</div>
									<div className="mb-1">
										<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Age</p>
										<p className="text-sm font-semibold text-slate-700">{selectedUser.age || "—"}</p>
									</div>
									<div className="mb-1">
										<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Date of Birth</p>
										<p className="text-sm font-semibold text-slate-700">{selectedUser.dob || "—"}</p>
									</div>
									<div className="mb-1">
										<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Joined</p>
										<p className="text-sm font-semibold text-slate-700">{formatDate(selectedUser.createdAt)}</p>
									</div>
									<div className="col-span-2">
										<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Bio</p>
										<p className="text-sm font-semibold text-slate-700">{selectedUser.bio || "—"}</p>
									</div>
								</div>
							</div>

							{/* Address Section */}
							{addr && (
								<div className="px-6 pb-4">
									<p className="text-md font-bold text-gray-700 uppercase tracking-widest mb-4">Address</p>
									<div className="grid grid-cols-3 gap-x-6 gap-y-4">
										<div>
											<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Street</p>
											<p className="text-sm font-semibold text-slate-700">{addr.street || "—"}</p>
										</div>
										<div>
											<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Apartment</p>
											<p className="text-sm font-semibold text-slate-700">{addr.apartment || "—"}</p>
										</div>
										<div>
											<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">City</p>
											<p className="text-sm font-semibold text-slate-700">{addr.city || "—"}</p>
										</div>
										<div>
											<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">State</p>
											<p className="text-sm font-semibold text-slate-700">{addr.state || "—"}</p>
										</div>
										<div>
											<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Pin Code</p>
											<p className="text-sm font-semibold text-slate-700">{addr.pinCode || "—"}</p>
										</div>
										<div>
											<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Country</p>
											<p className="text-sm font-semibold text-slate-700">{addr.country || "—"}</p>
										</div>
									</div>
								</div>
							)}

							{/* Action Buttons — Edit, Delete, Ban */}
							<div className="p-6 border-t border-slate-100 flex gap-3">
								{/* <button onClick={() => openEdit(selectedUser)} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
									Edit
								</button> */}
								<button onClick={() => openDelete(selectedUser)} className="flex-1 py-3 rounded-xl bg-rose-50 text-rose-700 text-sm font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
									Delete
								</button>
								<button onClick={() => handleBanToggle()} disabled={actionLoading} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${selectedUser.isBanned ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
									{actionLoading ? "..." : selectedUser.isBanned ? "Unban" : "Ban"}
								</button>
							</div>
						</>
					)}

					{/* EDIT MODE */}
					{modalMode === "edit" && (
						<>
							<div className="p-6 space-y-4">
								<p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Edit Information</p>
								{[
									{ label: "Name", key: "name", type: "text" },
									{ label: "Email", key: "email", type: "email" },
									{ label: "Phone", key: "phone", type: "text" },
								].map((f) => (
									<div key={f.key}>
										<label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{f.label}</label>
										<input type={f.type} value={editForm[f.key]} onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all" />
									</div>
								))}
							</div>
							<div className="p-6 border-t border-slate-50 flex gap-3">
								<button onClick={() => setModalMode("view")} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all">Cancel</button>
								<button onClick={handleEditSubmit} disabled={actionLoading} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50">
									{actionLoading ? "Saving..." : "Save Changes"}
								</button>
							</div>
						</>
					)}

					{/* DELETE MODE */}
					{modalMode === "delete" && (
						<div className="p-6 text-center">
							<p className="text-sm text-gray-500 font-medium mb-6">
								This will permanently remove <strong className="text-slate-700">{selectedUser.name}</strong> and all their data. This action cannot be undone.
							</p>
							<div className="flex gap-3">
								<button onClick={closeModal} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all">Cancel</button>
								<button onClick={handleDelete} disabled={actionLoading} className="flex-1 py-3 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-all disabled:opacity-50">
									{actionLoading ? "Deleting..." : "Delete User"}
								</button>
							</div>
						</div>
					)}
				</Overlay>
			)}
		</div>
	);
}