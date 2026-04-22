import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../api/authService';

export default function PersonalManagement() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        age: '',
        languagePreference: 'English (US)',
        newsletterSubscription: false
    });

    const fetchProfile = async () => {
        try {
            const response = await authService.getProfile();
            const userData = response.data?.user || response.user;
            if (userData) {
                setUser(userData);
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || userData.phoneNumber || '',
                    dob: userData.dob ? new Date(userData.dob).toLocaleDateString('en-GB') : 'DD/MM/YYYY',
                    gender: userData.gender || 'Select',
                    age: userData.age || '—',
                    languagePreference: userData.languagePreference || 'English (US)',
                    newsletterSubscription: userData.newsletterSubscription || false
                });
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
            setError('Failed to load profile details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdate = async () => {
		navigate('/addinfo');
        // setUpdating(true);
        // setError('');
        // setSuccess('');
        // try {
        //     await authService.updateProfile({
        //         newsletterSubscription: formData.newsletterSubscription
        //         // In a real app, we'd open a modal or have inputs for the other fields too
        //         // For this UI, we'll assume "Update Information" triggers a save of what's toggleable/editable
        //     });
        //     setSuccess('Profile updated successfully!');
        //     setTimeout(() => setSuccess(''), 3000);
        // } catch (err) {
        //     setError('Failed to update profile.');
        // } finally {
        //     setUpdating(false);
        // }
    };

    const toggleNewsletter = async () => {
        const newValue = !formData.newsletterSubscription;
        setFormData(prev => ({ ...prev, newsletterSubscription: newValue }));
        try {
            await authService.updateProfile({ newsletterSubscription: newValue });
        } catch (err) {
            console.error("Toggle failed", err);
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
                
                {/* Header Section */}
                <div className="mb-16">
                    <p className="text-[#3B82F6] font-bold text-xs uppercase tracking-[0.2em] mb-3">Profile Management</p>
                    <h1 className="text-[44px] font-extrabold text-[#111827] leading-tight">Personal Information</h1>
                    <p className="text-[#6B7280] text-lg mt-5 max-w-2xl leading-relaxed">
                        Manage your digital identity and preferences. These details are used to personalize your shopping experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* Left Column: Profile Card & Main Actions */}
                    <div className="lg:col-span-4 flex flex-col items-center">
                        <div className="w-full bg-white rounded-[32px] p-10 shadow-sm border border-[#F3F4F6] flex flex-col items-center text-center">
                            <div className="relative mb-8">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden bg-[#FED7AA]">
                                    <img 
                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button className="absolute bottom-0 right-0 p-2.5 bg-[#2563EB] rounded-full border-[3px] border-white text-white shadow-lg shadow-blue-200">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-[#111827] mb-1">{formData.name}</h2>
                            <p className="text-[#6B7280] text-sm mb-6 font-medium">{formData.email}</p>
                            
                            <div className="px-4 py-1.5 bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-extrabold rounded-full uppercase tracking-widest">
                                Atelier Member
                            </div>
                        </div>

                        {/* Sidebar Buttons */}
                        <div className="w-full mt-10 space-y-4">
                            <button 
                                onClick={handleUpdate}
                                disabled={updating}
                                className="w-full bg-[#1D4ED8] text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]"
                            >
                                {updating ? 'Updating...' : 'Update Information'}
                            </button>
                            <button 
                                onClick={() => navigate('/address')}
                                className="w-full bg-white text-[#111827] font-bold py-4 rounded-2xl border border-[#E5E7EB] hover:bg-gray-50 transition-all"
                            >
                                Manage Addresses
                            </button>
                            
                            <div className="flex justify-center pt-4">
                                <button 
                                    onClick={() => navigate('/change-password')}
                                    className="flex items-center gap-2 text-[#2563EB] font-bold text-sm hover:underline"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information Grid */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Legal Name */}
                            <div className="bg-white p-7 rounded-[24px] border border-[#F3F4F6] shadow-sm">
                                <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2">Legal Name</p>
                                <p className="text-[#111827] font-bold text-base">{formData.name}</p>
                            </div>
                            
                            {/* Mobile Number */}
                            <div className="bg-white p-7 rounded-[24px] border border-[#F3F4F6] shadow-sm">
                                <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2">Mobile Number</p>
                                <p className="text-[#111827] font-bold text-base">{formData.phone || '+ (555) 000-0000'}</p>
                            </div>

                            {/* Date of Birth */}
                            <div className="bg-white p-7 rounded-[24px] border border-[#F3F4F6] shadow-sm">
                                <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2">Date of Birth</p>
                                <p className="text-[#111827] font-bold text-base">{formData.dob}</p>
                            </div>

                            {/* Gender, Age Small Cards */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-[#F9FAFB] p-7 rounded-[24px] border border-[#F3F4F6] flex flex-col justify-between">
                                    <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2">Gender</p>
                                    <div className="flex items-center justify-between text-[#111827] font-bold">
                                        <span>{formData.gender}</span>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                                <div className="bg-[#F9FAFB] p-7 rounded-[24px] border border-[#F3F4F6] text-center">
                                    <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2 text-left">Age</p>
                                    <p className="text-[#2563EB] font-bold text-2xl mt-1">{formData.age}</p>
                                </div>
                            </div>
                        </div>

                        {/* Language Preference */}
                        <div className="bg-white p-7 rounded-[24px] border border-[#F3F4F6] shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Language Preference</p>
                                <p className="text-[#111827] font-bold text-base">{formData.languagePreference}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                        </div>

                        {/* Newsletter Subscription */}
                        <div className="bg-white p-7 rounded-[24px] border border-[#F3F4F6] shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[#111827] font-bold text-base mb-0.5">Newsletter Subscription</p>
                                <p className="text-[#6B7280] text-xs">Early access to new collections and exclusive offers</p>
                            </div>
                            <button 
                                onClick={toggleNewsletter}
                                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${formData.newsletterSubscription ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.newsletterSubscription ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {success && (
                            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl text-center font-bold animate-pulse">
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-center font-bold">
                                {error}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}