import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SideBar from './Layouts/SideBar';
import Header from './Layouts/Header';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../Toast/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const managementPages = [
    {
        title: 'Home Category',
        description: 'Manage hero banners, featured sections, and homepage layout',
        path: '/site/home-category',
        color: 'from-indigo-500 to-blue-600',
        bgLight: 'bg-indigo-50',
        textColor: 'text-indigo-600',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
    },
    {
        title: 'About',
        description: 'Edit company story, mission, team members, and values',
        path: '/site/about',
        color: 'from-violet-500 to-purple-600',
        bgLight: 'bg-violet-50',
        textColor: 'text-violet-600',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        title: 'Contact',
        description: 'Update contact info, social links, and support channels',
        path: '/site/contact',
        color: 'from-emerald-500 to-teal-600',
        bgLight: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        title: 'Coupons',
        description: 'Create and manage discount codes, promotions, and offers',
        path: '/site/coupons',
        color: 'from-amber-500 to-orange-600',
        bgLight: 'bg-amber-50',
        textColor: 'text-amber-600',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
        ),
    },
    {
        title: 'Reviews',
        description: 'Moderate customer reviews, ratings, and testimonials',
        path: '/site/reviews',
        color: 'from-rose-500 to-pink-600',
        bgLight: 'bg-rose-50',
        textColor: 'text-rose-600',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
    },
];

export default function SiteManagement() {
    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
            <SideBar />

            <main className="flex-1 lg:ml-72 bg-slate-50 min-h-screen">
                <Header title="Site Management" subtitle="Manage your website pages and content" />

                <div className="p-8 max-w-7xl mx-auto">
                    {/* Page Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {managementPages.map((page) => (
                            <Link
                                key={page.title}
                                to={page.path}
                                className="group relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgb(0,0,0,0.1)] hover:-translate-y-1"
                                style={{ textDecoration: 'none' }}
                            >
                                {/* Gradient accent bar */}
                                <div className={`h-1.5 bg-gradient-to-r ${page.color}`} />

                                <div className="p-6">
                                    {/* Icon & Arrow */}
                                    <div className="flex justify-between items-start mb-5">
                                        <div className={`p-3.5 rounded-2xl ${page.bgLight} ${page.textColor} group-hover:scale-110 transition-transform duration-300`}>
                                            {page.icon}
                                        </div>
                                        <div className="p-2 rounded-xl bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all duration-300">
                                            <svg className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17L17 7M17 7H7M17 7v10" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1.5 group-hover:text-indigo-600 transition-colors duration-300">
                                        {page.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        {page.description}
                                    </p>

                                    {/* Bottom label */}
                                    <div className="mt-5 pt-4 border-t border-slate-50">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors duration-300">
                                            Manage →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}export const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', discount: '', minAmount: '', expiryDate: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const { showToast } = useToast();

    const fetchCoupons = async () => {
        try {
            const res = await axiosInstance.get('/api/coupons');
            setCoupons(res.data?.coupons || []);
        } catch (err) {
            showToast('Failed to fetch coupons', err.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({ name: '', code: '', discount: '', minAmount: '', expiryDate: '' });
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.code || !form.discount || form.minAmount === '' || !form.expiryDate) {
            return showToast('Warning', 'All fields are required', 'warning');
        }

        setSaving(true);
        try {
            if (editId) {
                await axiosInstance.put(`/api/coupons/${editId}`, form);
                showToast('Success', 'Coupon updated successfully', 'success');
            } else {
                await axiosInstance.post('/api/coupons', form);
                showToast('Success', 'Coupon created successfully', 'success');
            }
            resetForm();
            fetchCoupons();
        } catch (err) {
            showToast('Error', err.response?.data?.message || 'Failed to save coupon', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (coupon) => {
        setEditId(coupon._id);
        const date = new Date(coupon.expiryDate).toISOString().split('T')[0];
        setForm({ name: coupon.name, code: coupon.code, discount: coupon.discount,minAmount:coupon.minAmount, expiryDate: date });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (coupon) => {
        setItemToDelete(coupon);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axiosInstance.delete(`/api/coupons/${itemToDelete._id}`);
            showToast('Success', 'Coupon deleted permanently', 'success');
            fetchCoupons();
        } catch (err) {
            showToast('Error', err.response?.data?.message || 'Delete failed', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
            <SideBar />
            <main className="flex-1 lg:ml-72 min-h-screen bg-slate-50">
                <Header title="Coupon Management" subtitle="Create and manage promotional discount codes and offers" />

                <div className="p-8 max-w-7xl mx-auto">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[
                            { label: 'Active Coupons', value: coupons.filter(c => new Date(c.expiryDate) > new Date()).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Total Coupons', value: coupons.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { label: 'Expired', value: coupons.filter(c => new Date(c.expiryDate) <= new Date()).length, color: 'text-rose-600', bg: 'bg-rose-50' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center font-black text-xl`}>
                                    {stat.value}
                                </div>
                                <div>
                                    <p className="text-md font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Creation Form */}
                        <div className="xl:col-span-1">
                            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden h-fit">
                                <div className={`h-1.5 absolute top-0 left-0 right-0 ${editId ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-indigo-500 to-blue-600'}`} />
                                
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${editId ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={editId ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900 leading-none mb-1">
                                            {editId ? 'Edit Coupon' : 'New Coupon'}
                                        </h2>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            {editId ? 'Update the details below' : 'Fill details below'}
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Coupon Name</label>
                                        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Summer Sale 2024"
                                            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-all duration-300" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Coupon Code</label>
                                        <input type="text" name="code" value={form.code} onChange={handleChange} placeholder="SUMMER50"
                                            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-all duration-300 uppercase" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Discount (%)</label>
                                            <input type="number" name="discount" value={form.discount} onChange={handleChange} placeholder="20"
                                                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-all duration-300" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Minimum Amount (₹)</label>
                                            <input type="number" name="minAmount" value={form.minAmount} onChange={handleChange} placeholder="0"
                                                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-all duration-300" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Expiry Date</label>
                                            <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange}
                                                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-all duration-300" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button type="submit" disabled={saving} className={`flex-1 py-4 text-white rounded-2xl text-sm font-black shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-70 ${editId ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-orange-100 hover:shadow-orange-200' : 'bg-gradient-to-r from-indigo-500 to-blue-600 shadow-indigo-100 hover:shadow-indigo-200'}`}>
                                            {saving ? 'Saving...' : editId ? 'Update Coupon' : 'Create Coupon'}
                                        </button>
                                        {editId && (
                                            <button type="button" onClick={resetForm} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all duration-300">
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/*  Table */}
                        <div className="xl:col-span-2">
                            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden min-h-[500px]">
                                <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-blue-600 absolute top-0 left-0 right-0" />
                                
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900 leading-none mb-1">Active Coupons</h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manage existing promotions</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    {loading ? (
                                        <div className="py-20 flex flex-col items-center">
                                            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin mb-4" />
                                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Coupons...</p>
                                        </div>
                                    ) : coupons.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 text-4xl">📭</div>
                                            <h3 className="text-base font-black text-slate-900 mb-1">No coupons yet</h3>
                                            <p className="text-sm font-medium text-slate-500">Create your first discount code using the form</p>
                                        </div>
                                    ) : (
                                        <table className="w-full border-separate border-spacing-y-3">
                                            <thead>
                                                <tr>
                                                    {['Code', 'Name', 'Discount','Min Amount','Expiry', 'Status', 'Actions'].map(h => (
                                                        <th key={h} className="px-4 py-2 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {coupons.map((coupon) => {
                                                    const isExpired = new Date(coupon.expiryDate) <= new Date();
                                                    return (
                                                        <tr key={coupon._id} className="bg-slate-50/50 hover:bg-indigo-50/50 transition-all duration-300 group">
                                                            <td className="px-4 py-4 rounded-l-2xl font-black text-indigo-600 text-sm">{coupon.code}</td>
                                                            <td className="px-4 py-4 font-bold text-slate-700 text-sm">{coupon.name}</td>
                                                            <td className="px-4 py-4 font-black text-slate-900 text-sm">{coupon.discount}% OFF</td>
                                                            <td className="px-4 py-4 font-black text-slate-900 text-sm">{coupon.minAmount}₹</td>
                                                            <td className="px-4 py-4 text-xs font-bold text-slate-500 uppercase">
                                                                {new Date(coupon.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${isExpired ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                                    {isExpired ? 'Expired' : 'Active'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 rounded-r-2xl">
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => handleEdit(coupon)} className="p-2 bg-white text-amber-500 rounded-xl shadow-sm border border-slate-100 hover:bg-amber-50 transition-all duration-300">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                    </button>
                                                                    <button onClick={() => handleDelete(coupon)} className="p-2 bg-white text-rose-500 rounded-xl shadow-sm border border-slate-100 hover:bg-rose-50 transition-all duration-300">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden"
                        >
                            <div className="h-2 bg-gradient-to-r from-rose-500 to-pink-600 absolute top-0 left-0 right-0" />

                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h3>
                                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                    You are about to delete <span className="text-slate-900 font-black italic">"{itemToDelete?.name}"</span>. This action cannot be undone.
                                </p>

                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all duration-300"
                                    >
                                        No, Keep it
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-rose-100 hover:shadow-rose-200 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                                    >
                                        Yes, Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}



export const Reviews = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
            <SideBar />
            <main className="flex-1 lg:ml-72 min-h-screen bg-slate-50">
                <Header title="Review Management" subtitle="Moderate customer reviews, ratings, and testimonials" />

                <div className="p-8 max-w-7xl mx-auto text-center py-20">
                    <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-rose-500">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Review Moderation</h2>
                    <p className="text-slate-500 font-medium max-w-md mx-auto">This module is currently being optimized to provide better insights into customer feedback.</p>
                </div>
            </main>
        </div>
    );
}

