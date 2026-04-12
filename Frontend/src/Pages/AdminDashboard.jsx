import React from 'react';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-white p-8 text-black">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex justify-between items-center border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-slate-400">Welcome to the Rivora Management Terminal.</p>
                    </div>
                    <button 
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/admin/login';
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold transition-all"
                    >
                        Sign Out
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-800">
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Users</p>
                        <h3 className="text-4xl font-bold mt-2">1,284</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-800">
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Sales</p>
                        <h3 className="text-4xl font-bold mt-2">$42,920</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-800">
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Pending Orders</p>
                        <h3 className="text-4xl font-bold mt-2">18</h3>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-800 min-h-[400px] flex items-center justify-center">
                    <p className="text-slate-500 font-mono tracking-widest uppercase">System Operational</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
