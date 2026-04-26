import React, { useState } from 'react';
import SideBar from './Layouts/SideBar';
import Header from './Layouts/Header';

const AdminDashboard = () => {
    const StatCard = ({ label, value, trend, icon, color }) => (
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
            {/* Sidebar */}
            <SideBar/>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 bg-slate-50 min-h-screen">
                <Header title="Dashboard Overview" subtitle="Monitoring your business performance" />

                <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            label="Total Customer Base"
                            value="14,284"
                            trend="+12.5%"
                            color="text-indigo-600"
                            icon={<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        />
                        <StatCard
                            label="Net Revenue (MTD)"
                            value="$829,920"
                            trend="+24.1%"
                            color="text-emerald-600"
                            icon={<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <StatCard
                            label="Operational Orders"
                            value="42"
                            trend="-4.2%"
                            color="text-amber-600"
                            icon={<svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                        />
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent User Registrations</h3>
                                <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.15em] mt-1">Live Feed</p>
                            </div>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-all underline decoration-2 underline-offset-4 tracking-widest uppercase">
                                Export Data
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Integrity Score</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Registered</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {[
                                        { id: '#USR-928', name: 'Althea Vance', email: 'althea.v@example.com', score: '98%', date: '2 mins ago' },
                                        { id: '#USR-927', name: 'Cyrus Thorne', email: 'cyrus.t@lux.com', score: '94%', date: '12 mins ago' },
                                        { id: '#USR-926', name: 'Lyra Belvedere', email: 'lyra@rivora.com', score: '100%', date: '1 hour ago' },
                                        { id: '#USR-925', name: 'Julian Vane', email: 'j.vane@archive.org', score: '82%', date: 'Yesterday' },
                                    ].map((user, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">{user.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-900">{user.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="bg-indigo-500 h-full" style={{ width: user.score }}></div>
                                                    </div>
                                                    {user.score}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-bold text-slate-400 tracking-tight">{user.date}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-slate-50/30 text-center">
                            <button className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-all uppercase tracking-[0.2em]">View All Operational Data</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
