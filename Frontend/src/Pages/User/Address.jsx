import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../api/authService';

export default function Address() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        street: '',
        apartment: '',
        city: '',
        state: '',
        pinCode: '',
        country: 'United States',
        isDefault: false
    });

    const fetchProfile = async () => {
        try {
            const response = await authService.getProfile();
            const userData = response.data?.user || response.user;
            if (userData) {
                setUser(userData);
                setAddresses(userData.addresses || []);
            }
        } catch (err) {
            console.error("Fetch profile failed", err);
            setError('Failed to load addresses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openAddModal = () => {
        setEditingIndex(null);
        setForm({
            street: '',
            apartment: '',
            city: '',
            state: '',
            pinCode: '',
            country: 'United States',
            isDefault: false
        });
        setModalOpen(true);
    };

    const openEditModal = (index) => {
        const addr = addresses[index];
        setEditingIndex(index);
        setForm({
            street: addr.street || '',
            apartment: addr.apartment || addr.apartmentSuite || '',
            city: addr.city || '',
            state: addr.state || '',
            pinCode: addr.pinCode || '',
            country: addr.country || 'United States',
            isDefault: addr.isDefault || false
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            let updatedAddresses;
            if (editingIndex !== null) {
                // Editing existing
                updatedAddresses = [...addresses];
                updatedAddresses[editingIndex] = form;
            } else {
                // Adding new
                updatedAddresses = [...addresses, form];
            }

            // If new address is default, reset others
            if (form.isDefault) {
                updatedAddresses = updatedAddresses.map((a, i) => ({
                    ...a,
                    isDefault: (editingIndex !== null ? i === editingIndex : i === updatedAddresses.length - 1)
                }));
            }

            await authService.updateProfile({ addresses: updatedAddresses });
            setSuccess(editingIndex !== null ? 'Address updated!' : 'Address added!');
            setModalOpen(false);
            fetchProfile();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to save address.');
        }
    };

    const handleDelete = async (index) => {
        if (!window.confirm("Remove this address?")) return;
        try {
            const updatedAddresses = addresses.filter((_, i) => i !== index);
            await authService.updateProfile({ addresses: updatedAddresses });
            fetchProfile();
        } catch (err) {
            setError('Failed to delete address.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] pt-28 pb-20 font-inter">
            <div className="max-w-6xl mx-auto px-6 lg:px-12">

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-[44px] font-extrabold text-[#111827] tracking-tight mb-3">Address Book</h1>
                    <p className="text-[#6B7280] text-lg max-w-2xl leading-relaxed">
                        Manage your shipping destinations for a seamless checkout experience at Lumiere Atelier.
                    </p>
                </div>

                {success && (
                    <div className="fixed top-24 right-8 z-50 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl border border-emerald-100 shadow-xl font-bold flex items-center animate-in fade-in slide-in-from-right-4">
                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Add New Address Card */}
                    <button
                        onClick={openAddModal}
                        className="group h-[320px] bg-transparent border-2 border-dashed border-[#E5E7EB] rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-[#3B82F6] hover:bg-white transition-all cursor-pointer"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <span className="text-[#111827] font-bold text-lg">Add New Address</span>
                    </button>

                    {/* Address List */}
                    {addresses.map((addr, index) => (
                        <div key={index} className="h-auto bg-white rounded-[32px] p-10 shadow-sm border border-[#F3F4F6] flex flex-col justify-between hover:shadow-xl hover:shadow-blue-100/20 transition-all group overflow-hidden relative">
                            {addr.isDefault && (
                                <div className="absolute top-8 right-8 flex items-center gap-1.5 bg-[#2563EB] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-blue-100">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                    </svg>
                                    Default
                                </div>
                            )}

                            <div>
                                <div className="text-[#6B7280] font-medium space-y-1.5 leading-relaxed">
                                    <p className="text-[#111827] font-bold">{addr.street}{addr.apartment ? `, ${addr.apartment}` : (addr.apartmentSuite ? `, ${addr.apartmentSuite}` : '')}</p>
                                    <p>{addr.city}, {addr.state} {addr.pinCode}</p>
                                    <p>{addr.country}</p>
                                </div>

                            </div>

                            <div className="border-t border-[#F3F4F6] flex items-center gap-6">
                                <button onClick={() => openEditModal(index)} className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">Edit</button>
                                <button onClick={() => handleDelete(index)} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* High-Fidelity Address Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>

                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="p-12">
                            {/* Modal Header */}
                            <div className="mb-10 text-center sm:text-left">
                                <p className="text-[#3B82F6] font-bold text-xs uppercase tracking-[0.2em] mb-3">Shipping Settings</p>
                                <h2 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-4">Add/Edit Address</h2>
                                <p className="text-[#6B7280] leading-relaxed">
                                    Manage your delivery destinations with precision. Ensure your Lumiere orders arrive exactly where they belong.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* <div>
                                    <label className="flex items-center text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2 ml-1">
                                        Full Name <span className="text-blue-500 ml-1">●</span>
                                    </label>
                                    <input
                                        type="text" name="fullName" value={form.fullName} onChange={handleChange} required
                                        placeholder="e.g. Julian Sterling"
                                        className="w-full px-6 py-4 bg-white rounded-2xl border border-[#F3F4F6] shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium text-[#111827] placeholder:text-[#D1D5DB]"
                                    />
                                </div> */}

                                <div>
                                    <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2 block ml-1">Street Address</label>
                                    <input
                                        type="text" name="street" value={form.street} onChange={handleChange} required
                                        placeholder="1248 Design District Blvd"
                                        className="w-full px-6 py-4 bg-white rounded-2xl border border-[#F3F4F6] shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium text-[#111827] placeholder:text-[#D1D5DB]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2 block ml-1">Apartment/Suite</label>
                                        <input
                                            type="text" name="apartment" value={form.apartment} onChange={handleChange}
                                            placeholder="Suite 402"
                                            className="w-full px-6 py-4 bg-white rounded-2xl border border-[#F3F4F6] shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium text-[#111827] placeholder:text-[#D1D5DB]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2 block ml-1">City</label>
                                        <input
                                            type="text" name="city" value={form.city} onChange={handleChange} required
                                            placeholder="Metropolis"
                                            className="w-full px-6 py-4 bg-white rounded-2xl border border-[#F3F4F6] shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium text-[#111827] placeholder:text-[#D1D5DB]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2 block ml-1">State / Province</label>
                                        <div className="relative">
                                            <select
                                                name="state" value={form.state} onChange={handleChange} required
                                                className="w-full px-6 py-4 bg-white rounded-2xl border border-[#F3F4F6] shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium text-[#111827] appearance-none"
                                            >
                                                <option value="">Select State</option>
                                                <option value="California">California</option>
                                                <option value="New York">New York</option>
                                                <option value="Texas">Texas</option>
                                                <option value="Florida">Florida</option>
                                                {/* Add more states as needed */}
                                            </select>
                                            <svg className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2 block ml-1">Zip / Postal Code</label>
                                        <input
                                            type="text" name="pinCode" value={form.pinCode} onChange={handleChange} required
                                            placeholder="90210"
                                            className="w-full px-6 py-4 bg-white rounded-2xl border border-[#F3F4F6] shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium text-[#111827] placeholder:text-[#D1D5DB]"
                                        />
                                    </div>
                                </div>

                                {/* <div>
                                    <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2 block ml-1">Phone Number</label>
                                    <div className="flex gap-4">
                                        <div className="w-24 px-6 py-4 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6] text-[#111827] font-bold text-center flex items-center justify-center">
                                            +1
                                        </div>
                                        <input
                                            type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required
                                            placeholder="(555) 000-0000"
                                            className="flex-1 px-6 py-4 bg-white rounded-2xl border border-[#F3F4F6] shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium text-[#111827] placeholder:text-[#D1D5DB]"
                                        />
                                    </div>
                                </div> */}

                                {/* Set as Default Row */}
                                <div className="bg-[#F9FAFB] rounded-[24px] p-6 flex items-center justify-between group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-[#F3F4F6]">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-[#EFF6FF] text-[#2563EB] rounded-2xl flex items-center justify-center shadow-inner">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-[#111827] font-bold text-base leading-none mb-1.5">Set as Default Address</p>
                                            <p className="text-[#6B7280] text-xs font-medium">Orders will automatically ship to this location.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, isDefault: !f.isDefault }))}
                                        className={`w-14 h-8 rounded-full transition-all duration-300 relative ${form.isDefault ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${form.isDefault ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button
                                        type="button" onClick={() => setModalOpen(false)}
                                        className="flex-1 py-4 text-[#6B7280] font-bold text-base hover:bg-gray-50 rounded-2xl transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] bg-[#1D4ED8] text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Save Address Settings
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}