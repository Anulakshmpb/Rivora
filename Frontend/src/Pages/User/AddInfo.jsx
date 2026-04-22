import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../api/authService';

export default function AddInfo() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        age: '',
        dob: '',
        gender: '',
        isVerifiedBadge: false
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
                    bio: userData.bio || '',
                    age: userData.age || '',
                    dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
                    gender: userData.gender || '',
                    isVerifiedBadge: userData.isVerifiedBadge || false
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const { email, ...updateData } = formData;
            await authService.updateProfile(updateData);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error("Update error:", err);
            setError(err.message || 'Failed to update profile.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 mt-[65px] pb-12 font-inter">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/profile')}
                    className="flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors mb-6 group"
                >
                    <svg className="w-5 h-5 mr-1.5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Profile
                </button>

                <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100/20 border border-gray-100 overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full shadow-lg">
                            <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-3xl font-bold border-2 border-white">
                                {formData.name.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                        {formData.isVerifiedBadge && (
                            <div className="absolute -bottom-8 left-24 bg-blue-500 text-white p-1.5 rounded-full shadow-md border-2 border-white">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="pt-16 pb-10 px-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Personal Information</h1>
                                <p className="text-gray-500 mt-1">Manage your digital identity and account specifics.</p>
                            </div>
                            {success && (
                                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 flex items-center animate-in fade-in slide-in-from-top-1">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    <span className="text-sm font-semibold">{success}</span>
                                </div>
                            )}
                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                    <span className="text-sm font-semibold">{error}</span>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* General Section */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Basic Details</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Full Name</label>
                                        <input 
                                            type="text" name="name" 
                                            value={formData.name} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-900"
                                            placeholder="Your Name" required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
                                        <input 
                                            type="email" name="email" 
                                            value={formData.email} disabled
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-100 border border-transparent text-gray-500 cursor-not-allowed font-medium"
                                            placeholder="email@example.com"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1.5 ml-1 uppercase tracking-wider font-bold">Email cannot be changed for security reasons</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Phone Number</label>
                                        <input 
                                            type="tel" name="phone" 
                                            value={formData.phone} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-900"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>

                                {/* Additional Section */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Extended Profile</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Age</label>
                                            <input 
                                                type="number" name="age" 
                                                value={formData.age} onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-900"
                                                placeholder="25"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Gender</label>
                                            <select 
                                                name="gender" value={formData.gender} onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-900 appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                                <option value="prefer-not-to-say">Prefer Not to Say</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Date of Birth</label>
                                        <input 
                                            type="date" name="dob" 
                                            value={formData.dob} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-900"
                                        />
                                    </div>

                                    {/* <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                        <div className="flex items-center">
                                            <input 
                                                type="checkbox" id="isVerifiedBadge" name="isVerifiedBadge"
                                                checked={formData.isVerifiedBadge} onChange={handleChange}
                                                className="w-5 h-5 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </div>
                                        <label htmlFor="isVerifiedBadge" className="text-sm font-semibold text-indigo-900 cursor-pointer">
                                            Show Verified Badge on Profile
                                        </label>
                                    </div> */}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Bio / About You</label>
                                    <textarea 
                                        name="bio" value={formData.bio} onChange={handleChange}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-900 resize-none"
                                        placeholder="Tell us something about yourself..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                                <button 
                                    type="button" onClick={() => navigate(-1)}
                                    className="px-8 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-all"
                                >
                                    Discard Changes
                                </button>
                                <button 
                                    type="submit" disabled={submitting}
                                    className={`px-10 py-3.5 text-sm font-bold text-white bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Saving...
                                        </>
                                    ) : 'Save Profile Details'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}