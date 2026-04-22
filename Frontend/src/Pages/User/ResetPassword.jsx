import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../api/authService';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userId = location.state?.userId;
    const resetToken = location.state?.resetToken;

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!userId || !resetToken) {
            console.warn('Missing userId or resetToken, redirecting to forgot-password');
            navigate('/forgot-password');
        }
    }, [userId, resetToken, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        if (formData.newPassword.length < 8) {
            return setError("Password must be at least 8 characters");
        }

        setLoading(true);
        setError('');

        try {
            await authService.resetPassword({
                userId,
                resetToken,
                newPassword: formData.newPassword
            });
            setMessage('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const msg = err.error?.message || err.message || 'Failed to reset password. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-2.5rem)] w-[calc(100vw-2.5rem)] overflow-hidden font-inter m-5 rounded-3xl bg-white shadow-2xl">
            {/* Right Side */}
            <div className="flex w-full flex-col items-center justify-center bg-white p-8 lg:w-full overflow-y-auto">
                <div className="w-full max-w-md space-y-10">
                    <div className="space-y-2 text-center lg:text-left">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Security & Access</p>
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
                            Reset Your Password
                        </h1>
                        <p className="text-gray-500 text-sm max-w-sm">
                            Please choose a strong new password for your account.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                            <p className="text-sm text-green-700">{message}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                                    New Password
                                </label>
                                <input
                                    name="newPassword"
                                    type="password"
                                    required
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="block w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:ring-0 transition-all outline-none shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                                    Confirm New Password
                                </label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="block w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:ring-0 transition-all outline-none shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full rounded-2xl bg-black py-4 text-sm font-bold text-white shadow-xl hover:translate-y-1 hover:shadow-2xl transition-all active:scale-[0.98] tracking-widest uppercase ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
