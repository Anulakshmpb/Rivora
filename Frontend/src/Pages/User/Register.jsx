import React, { useState } from 'react';
import Account from '../../Images/account.png';
import { useNavigate } from 'react-router-dom';
import authService from '../../api/authService';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';

const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        'string.empty': 'Full name is required',
        'string.min': 'Name must be at least 3 characters',
        'any.required': 'Full name is required'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required'
    }),
    confirmPassword: Joi.any().equal(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password'
    }),
    terms: Joi.boolean().invalid(false).required().messages({
        'any.invalid': 'You must agree to the terms and conditions'
    })
});

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: joiResolver(schema),
        mode: 'onTouched'
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setApiError('');

        try {
            const { name, email, password } = data;
            const response = await authService.register({ name, email, password });
            console.log('Registration Response:', response);
            
            const userId = response.data?.userId || response.data?.user?._id || response.userId || response.user?._id;
            console.log('Calculated userId for navigation:', userId);

            if (!userId) {
                console.error('Failed to extract userId from response');
                setApiError('Registration successful, but system failed to process verification. Please try logging in.');
                return;
            }

            navigate('/verify-otp', { state: { userId } });
        } catch (err) {
            console.error('Registration error:', err);
            
            const errorInfo = err.error || err;
            const { message, details, statusCode } = errorInfo;

            if (statusCode === 409 && details?.userId && !details?.isVerified) {
                console.log('User exists but unverified. Redirecting to OTP...');
                return navigate('/verify-otp', { state: { userId: details.userId } });
            }

            if (details && Array.isArray(details)) {
                const detailMessages = details.map(d => d.message).join('. ');
                setApiError(`Validation failed: ${detailMessages}`);
            } else {
                setApiError(message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-0.5rem)] w-[calc(100vw-2.5rem)] overflow-hidden font-inter m-2 rounded-3xl bg-white shadow-2xl">
            {/* Left Side*/}
            <div className="relative hidden w-1/2 lg:block">
                <img
                    className="h-full w-full object-cover rounded-2xl"
                    src={Account}
                    alt="Register Hero"
                />
                <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12 text-white">
                    <h2 className="text-3xl font-bold mb-4 leading-tight">Welcome to Our Store.</h2>
                    <p className="text-lg opacity-90 max-w-md">Discover a curated selection of premium products designed to elevate your everyday life.</p>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex w-full flex-col items-center justify-center bg-white p-8 lg:w-1/2 mt-5">
                <div className="w-full max-w-lg space-y-6">
                    <div className="text-center lg:text-left">
                        <p className="text-md font-bold uppercase tracking-widest text-gray-700 mb-2">Create Account</p>
                        <p className="text-gray-500 text-xs">Create your account to access exclusive collections and manage your orders.</p>
                    </div>

                    {apiError && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-sm text-red-700">{apiError}</p>
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    {...register('name')}
                                    className={`block w-full rounded-2xl border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-gray-400 focus:ring-gray-400'} px-4 py-2 text-gray-900 placeholder-gray-400 transition-all outline-none focus:ring-1`}
                                    placeholder="Enter your full name"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500 ml-2">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    className={`block w-full rounded-2xl border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-gray-400 focus:ring-gray-400'} px-4 py-2 text-gray-900 placeholder-gray-400 transition-all outline-none focus:ring-1`}
                                    placeholder="name@example.com"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500 ml-2">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    className={`block w-full rounded-2xl border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-gray-400 focus:ring-gray-400'} px-4 py-2 text-gray-900 placeholder-gray-400 transition-all outline-none focus:ring-1`}
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-500 ml-2">{errors.password.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    {...register('confirmPassword')}
                                    className={`block w-full rounded-2xl border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-gray-400 focus:ring-gray-400'} px-4 py-2 text-gray-900 placeholder-gray-400 transition-all outline-none focus:ring-1`}
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 ml-2">{errors.confirmPassword.message}</p>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="terms" 
                                        {...register('terms')}
                                        className={`rounded border ${errors.terms ? 'border-red-500' : 'border-gray-300'} text-black focus:ring-black`} 
                                    />
                                    <label htmlFor="terms" className="block text-sm font-medium text-gray-700">I agree to the terms and conditions</label>
                                </div>
                                {errors.terms && <p className="text-xs text-red-500 ml-6">{errors.terms.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full rounded-lg bg-black py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-gray-800 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <button className="font-semibold text-black hover:underline transition-colors"
                            onClick={() => navigate('/login')}>Sign In</button>
                    </p>
                    <div className="relative mt-10">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-400"></div>
                        </div>
                        <div className="relative flex justify-center text-xs font-medium leading-6">
                            <span className="bg-white px-4 text-gray-500 uppercase tracking-wider">or JOIN with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all active:scale-[0.98]">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Google</span>
                        </button>
                        <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all active:scale-[0.98]">
                            <svg className="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span>Facebook</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;