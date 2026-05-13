import React, { useState } from 'react';
import LoginImg from '../../Images/screen.png';
import Logo from '../../Images/logo.png';
import { useNavigate } from 'react-router-dom';
import authService from '../../api/authService';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authService.adminLogin(formData);
            console.log('Admin login successful:', data);

            // Update Auth Context
            await login(data.data.admin, data.data.token);

            // Redirect to admin dashboard
            navigate('/admin/dashboard');
        } catch (err) {
            const message = err.error?.message || err.message || 'Failed to sign in. Please check your admin credentials.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-2.5rem)] w-[calc(100vw-2.5rem)] overflow-hidden font-inter m-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            {/* Left Side*/}
            <div className="relative hidden w-1/2 lg:block">
                <img
                    className="h-full w-full object-cover rounded-2xl opacity-60"
                    src={LoginImg}
                    alt="Admin Control"
                />
                <div className="absolute inset-0 bg-indigo-900/40 flex flex-col justify-end p-12 text-white">
                    <h2 className="text-3xl font-bold mb-4 leading-tight">Admin Terminal</h2>
                    <p className="text-lg opacity-90 max-w-md">Secure access to the RIVORA management suite.</p>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex w-full flex-col items-center justify-center bg-slate-950 p-8 lg:w-1/2 border-l border-slate-800">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:text-left">
                        <div className="mb-6 flex justify-center lg:justify-start grayscale invert">
                            <img src={Logo} alt="LOGO" className="h-12 w-auto" />
                        </div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400 mb-2 font-mono">System Authentication</p>
                        <p className="text-slate-500 text-xs">Enter administrative credentials to proceed</p>
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Admin Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                                    placeholder="admin@rivora.com"
                                />
                            </div>
                            <div className="relative">
                                <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Master Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Authenticating System...' : 'Access Terminal'}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-xs text-slate-500 uppercase tracking-widest">
                        Unauthorized access is strictly prohibited
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
