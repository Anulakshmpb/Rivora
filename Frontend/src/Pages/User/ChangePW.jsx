import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../api/authService';

const ChangePW = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    // A simple validation checker for the UI
    const hasLength = formData.newPassword.length >= 8;
    const hasNumber = /\d/.test(formData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword);
    const hasUpperCase = /[A-Z]/.test(formData.newPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!hasLength || !hasNumber || !hasUpperCase || !hasSpecialChar) {
            setError("Password does not meet requirements");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await authService.changePassword(formData);
            setSuccess('Password updated successfully!');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            // Optional: navigate away after success
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err) {
            console.error("Password update error:", err);
            setError(err.error?.message || err.message || 'Failed to update password. Please check your current password.');
        } finally {
            setLoading(false);
        }
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
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                            <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                            <p className="text-sm font-semibold text-red-700">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                            <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <p className="text-sm font-semibold text-green-700">{success}</p>
                        </div>
                    )}
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
                                disabled={loading}
                                className={`flex-1 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all text-sm flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Updating...
                                    </>
                                ) : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePW;