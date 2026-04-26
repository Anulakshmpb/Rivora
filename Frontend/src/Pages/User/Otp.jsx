import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../api/authService';
import { useAuth } from '../../context/AuthContext';

const Otp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const userId = location.state?.userId;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        console.log('Otp Page Loaded. userId from state:', userId);

        if (!userId) {
            console.warn('No userId found in state, redirecting to register');
            navigate('/register');
        }
    }, [userId, navigate]);

    // Timer logic
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            return setError('Please enter a 6-digit code');
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (location.state?.isReset) {
                const response = await authService.verifyResetOTP({ userId, otp });
                const resetToken = response.data?.resetToken || response.data?.data?.resetToken || response.resetToken;
                setMessage('OTP verified successfully! Redirecting to reset password...');
                setTimeout(() => navigate('/reset-password', { state: { userId, resetToken }, replace: true }), 2000);
            } else {
                const response = await authService.verifyEmail({ userId, otp });
                
                // Update auth context for auto-login
                if (response.data?.user) {
                    await login(response.data.user);
                }
                
                setMessage('Email verified successfully! Redirecting to home...');
                setTimeout(() => navigate('/', { replace: true }), 2000);
            }
        } catch (err) {
            const message = err.error?.message || err.message || 'Invalid OTP. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0) return; // Prevent resend if timer is active

        setResending(true);
        setError('');
        setMessage('');

        try {
            await authService.resendOTP(userId);
            setMessage('A new OTP has been sent to your email.');
            setTimeLeft(300); // Reset timer to 5 minutes
        } catch (err) {
            const message = err.error?.message || err.message || 'Failed to resend OTP. Please try again later.';
            setError(message);
        } finally {
            setResending(false);
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
                            Verify Your Identity
                        </h1>
                        <p className="text-gray-500 text-sm max-w-sm">
                            Please enter the 6-digit verification code sent to your email address.
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
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label htmlFor="otp" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Verification Code
                                </label>
                                {timeLeft > 0 && (
                                    <span className="text-xs font-bold text-gray-400">
                                        Expires in <span className="text-black font-mono">{formatTime(timeLeft)}</span>
                                    </span>
                                )}
                            </div>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="block w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:ring-0 transition-all outline-none shadow-sm text-center text-2xl tracking-widest"
                                placeholder="••••••"
                                maxLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full rounded-2xl bg-black py-4 text-sm font-bold text-white shadow-xl hover:translate-y-[-2px] hover:shadow-2xl transition-all active:scale-[0.98] tracking-widest uppercase ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>

                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={handleResend}
                            disabled={resending || timeLeft > 0}
                            className={`text-xs font-bold transition-all uppercase tracking-widest py-2 ${resending || timeLeft > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-black'}`}
                        >
                            {resending ? 'Resending...' : timeLeft > 0 ? `Resend Code in ${formatTime(timeLeft)}` : 'Resend Code'}
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-xs font-bold text-gray-500 hover:text-black transition-all uppercase tracking-widest py-2"
                        >
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Otp;
