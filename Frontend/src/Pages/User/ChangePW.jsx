import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChangePW = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // A simple validation checker for the UI
    const hasLength = formData.newPassword.length >= 8;
    const hasNumber = /\d/.test(formData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword);
    const hasUpperCase = /[A-Z]/.test(formData.newPassword);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add submit logic here
        console.log("Submitting password change...", formData);
    };

    const RequirementItem = ({ met, text }) => (
        <li className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
            <svg className={`w-4 h-4 mr-2 ${met ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {met ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                ) : (
                    <circle cx="12" cy="12" r="9" strokeWidth="2"></circle>
                )}
            </svg>
            {text}
        </li>
    );

    return (
        <div className="max-h-vh bg-white flex items-center justify-center p-4 mt-[65px]">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-10">
                <div className="bg-white p-8 text-gray-700 relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full blur-xl -ml-5 -mb-5"></div>
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-gray-300 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Change Password</h1>
                        <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                            To protect your account, ensure your new password is unique, strong, and uses a combination of characters.
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                <input 
                                    type="password" 
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white"
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>

                            <div className="border-t border-gray-100 pt-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <input 
                                    type="password" 
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white"
                                    placeholder="Confirm new password"
                                    required
                                />
                                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                    <p className="text-red-500 text-xs font-medium mt-2">Passwords do not match</p>
                                )}
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Password Requirements</h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <RequirementItem met={hasLength} text="At least 8 characters" />
                                <RequirementItem met={hasNumber} text="Includes a number" />
                                <RequirementItem met={hasUpperCase} text="One uppercase letter" />
                                <RequirementItem met={hasSpecialChar} text="One special character" />
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                            <button 
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all text-sm"
                            >
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePW;