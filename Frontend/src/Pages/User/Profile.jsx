import React, { useState, useEffect } from 'react';
import authService from '../../api/authService';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', pinCode: '', country: '', isDefault: false });

    const fetchProfile = async () => {
        try {
            const response = await authService.getProfile();
            const userData = response.data?.user || response.user;
            if (!userData) {
                throw new Error("Invalid profile data received");
            }
            setUser(userData);
        } catch (err) {
            console.error("Profile view error:", err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSignOut = () => {
        // Sign out logic
        console.log("Signing out...");
    };

    const handleAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddress({
            ...newAddress,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            // Append new address to existing array
            const updatedAddresses = [...(user.addresses || []), newAddress];
            
            // Assume we can put to /api/auth/profile to update
            await authService.updateProfile({ addresses: updatedAddresses });
            
            // Re-fetch profile to sync state
            await fetchProfile();
            
            setIsAddingAddress(false);
            setNewAddress({ street: '', city: '', state: '', pinCode: '', country: '', isDefault: false });
        } catch (err) {
            console.error("Failed to add address", err);
            alert("Failed to update addresses. Please try again.");
        }
    };

    const handleDeleteAddress = async (indexToDelete) => {
        if(!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            const updatedAddresses = user.addresses.filter((_, idx) => idx !== indexToDelete);
            await authService.updateProfile({ addresses: updatedAddresses });
            await fetchProfile();
        } catch (err) {
            console.error("Failed to delete address", err);
            alert("Failed to delete address. Please try again.");
        }
    };

    if (loading) return (
        <div className="flex min-h-[60vh] items-center justify-center bg-transparent mt-[65px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error) return (
        <div className="flex min-h-[60vh] items-center justify-center bg-transparent mt-[65px]">
            <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl shadow-sm border border-red-100 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className="font-medium">{error}</span>
            </div>
        </div>
    );

    if (!user) return (
        <div className="flex min-h-[60vh] items-center justify-center bg-transparent text-gray-500 font-medium mt-[65px]">
            No profile data found.
        </div>
    );

    const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    const accountSettings = [
        {
            title: "Personal Information",
            desc: "Update your name, email and bio",
            icon: <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        },
        {
            title: "My Orders",
            desc: "Track shipments and view history",
            icon: <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
        },
        {
            title: "Payments & Payouts",
            desc: "Manage cards and billing address",
            icon: <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
        },
        {
            title: "Login & Security",
            desc: "Two factor & password updates",
            icon: <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        }
    ];

    const safeAddresses = user.addresses || [];

    return (
        <div className="min-h-screen bg-gray-50/50 mt-[65px] pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                {/* Header Profile Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-20 -translate-y-20 flex-shrink-0"></div>

                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-4xl font-bold shadow-lg shadow-slate-200/50 flex-shrink-0 border border-slate-200">
                        {initials}
                    </div>

                    <div className="text-center md:text-left flex-1 md:mt-2">
                        <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-amber-200/50 to-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-widest mb-3 backdrop-blur-sm border border-amber-200/50">
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            Premium Member
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">{user.name}</h1>
                        <p className="text-gray-500 mb-4">{user.email}</p>
                        <div className="inline-block px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg capitalize">
                            {user.role || 'User'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Settings Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white shadow-sm rounded-3xl p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h2>
                            <div className="space-y-2">
                                {accountSettings.map((item, index) => (
                                    <div key={index} className="group flex items-center p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-gray-100">
                                            {item.icon}
                                        </div>
                                        <div className="ml-5 flex-1">
                                            <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                        <div className="text-gray-300 group-hover:text-indigo-500 transition-colors group-hover:translate-x-1 transform duration-200">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Address Manager */}
                        <div className="bg-white shadow-sm rounded-3xl p-8 border border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                                {!isAddingAddress && (
                                    <button 
                                        onClick={() => setIsAddingAddress(true)}
                                        className="text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        Add New
                                    </button>
                                )}
                            </div>

                            {isAddingAddress ? (
                                <form onSubmit={handleAddAddress} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Add New Address</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="md:col-span-2">
                                            <input type="text" name="street" value={newAddress.street} onChange={handleAddressChange} placeholder="Street Address" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 bg-white" />
                                        </div>
                                        <div>
                                            <input type="text" name="city" value={newAddress.city} onChange={handleAddressChange} placeholder="City" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 bg-white" />
                                        </div>
                                        <div>
                                            <input type="text" name="state" value={newAddress.state} onChange={handleAddressChange} placeholder="State" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 bg-white" />
                                        </div>
                                        <div>
                                            <input type="text" name="pinCode" value={newAddress.pinCode} onChange={handleAddressChange} placeholder="ZIP / Pin Code" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 bg-white" />
                                        </div>
                                        <div>
                                            <input type="text" name="country" value={newAddress.country} onChange={handleAddressChange} placeholder="Country" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 bg-white" />
                                        </div>
                                        <div className="md:col-span-2 flex items-center mt-2">
                                            <input type="checkbox" id="isDefault" name="isDefault" checked={newAddress.isDefault} onChange={handleAddressChange} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer" />
                                            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700 cursor-pointer">Set as default shipping address</label>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end mt-6">
                                        <button type="button" onClick={() => setIsAddingAddress(false)} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                        <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-colors">Save Address</button>
                                    </div>
                                </form>
                            ) : null}

                            {safeAddresses.length === 0 && !isAddingAddress ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <p className="text-gray-500 text-sm">No addresses saved yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {safeAddresses.map((addr, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-2xl p-5 relative group hover:border-indigo-200 transition-colors">
                                            {addr.isDefault && (
                                                <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Default</span>
                                            )}
                                            <div className="flex items-start mb-2">
                                                <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{addr.street}</p>
                                                    <p className="text-sm text-gray-500 leading-relaxed mt-1">
                                                        {addr.city}, {addr.state} <br/>
                                                        {addr.pinCode}, {addr.country}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs font-semibold">
                                                <button className="text-indigo-600 hover:text-indigo-800 transition-colors">Edit</button>
                                                <button onClick={() => handleDeleteAddress(idx)} className="text-red-500 hover:text-red-700 transition-colors">Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Column */}
                    <div className="space-y-6">
                        {/* Invite Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-md relative overflow-hidden group hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-50 opacity-50 blur-2xl group-hover:opacity-100 transition-opacity"></div>
                            <svg className="w-10 h-10 text-indigo-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Invite Friends</h3>
                            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                Earn up to <span className="font-bold text-indigo-600">$100</span> for every friend who makes their first purchase at our store.
                            </p>
                            <button className="w-full bg-indigo-50 text-indigo-600 font-semibold py-2.5 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
                                Copy Invite Link
                            </button>
                        </div>

                        {/* Support & Actions */}
                        <div className="bg-white shadow-sm rounded-3xl p-8 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-5">Support & Help</h3>
                            <div className="space-y-4 mb-6">
                                <a href="#" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    Contact Us
                                </a>
                                <a href="#" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    Help Center
                                </a>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <button
                                    onClick={handleSignOut}
                                    className="flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
