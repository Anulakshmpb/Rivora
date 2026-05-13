import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../Toast/ToastContext';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function Checkout() {
    const { cartItems, cartTotalPrice, cartTotalItems, clearCart, appliedCoupon, setAppliedCoupon } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const [shippingMethod, setShippingMethod] = useState('standard');
    const [couponCode, setCouponCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) {
                setLoadingAddresses(false);
                return;
            }
            try {
                const res = await axiosInstance.get('/api/auth/get-profile');
                const userAddresses = res.data.user.addresses || [];
                setAddresses(userAddresses);
                const defaultAddr = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
                setSelectedAddress(defaultAddr);
            } catch (err) {
                console.error('Failed to fetch addresses:', err);
                if (err.status !== 401) {
                    showToast('Error', 'Failed to fetch addresses', 'error');
                }
            } finally {
                setLoadingAddresses(false);
            }
        };
        fetchAddresses();
    }, [user]);

    const shipping = cartTotalItems > 0 ? 15.00 : 0.00;
    const shippingCost = shippingMethod === 'express' ? shipping + 25.00 : shipping;
    const discountAmount = appliedCoupon ? (cartTotalPrice * appliedCoupon.discount) / 100 : 0;
    const taxes = (cartTotalPrice - discountAmount) * 0.08;
    const total = cartTotalPrice - discountAmount + shippingCost + taxes;

    // Monitor cart total and remove coupon if it doesn't meet minAmount
    useEffect(() => {
        if (appliedCoupon && cartTotalPrice < appliedCoupon.minAmount) {
            setAppliedCoupon(null);
            showToast('Coupon Removed', `Cart total is now below ₹${appliedCoupon.minAmount}. Coupon removed.`, 'warning');
        }
    }, [cartTotalPrice, appliedCoupon, showToast]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsVerifying(true);
        try {
            const res = await axiosInstance.post('/api/coupons/validate', {
                code: couponCode,
                cartTotal: cartTotalPrice
            });
            setAppliedCoupon(res.data);
            showToast('Success', `Coupon applied: ${res.data.discount}% OFF`, 'success');
        } catch (err) {
            showToast('Error', err.message || 'Invalid coupon', 'error');
            setAppliedCoupon(null);
        } finally {
            setIsVerifying(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleConfirmAndPay = async () => {
        if (!selectedAddress) {
            showToast('Error', 'Please select a delivery address', 'error');
            return;
        }

        setIsProcessing(true);

        try {
            if (paymentMethod === 'cod') {
                const res = await axiosInstance.post('/api/orders/place-cod-order', {
                    orderDetails: {
                        items: cartItems.map(item => ({
                            product: item.product._id,
                            quantity: item.quantity,
                            size: item.size,
                            color: item.color,
                            price: item.product.price
                        })),
                        shippingAddress: selectedAddress,
                        totalAmount: total,
                        discountAmount: discountAmount,
                        shippingCost: shippingCost,
                        taxAmount: taxes
                    }
                });

                if (res.success) {
                    showToast('Success', 'Order placed successfully (COD)!', 'success');
                    clearCart();
                    navigate('/order-success', { state: { order: res.data } });
                } else {
                    throw new Error(res.message || 'Failed to place COD order');
                }
                return;
            }

            if (paymentMethod === 'wallet') {
                const orderDetails = {
                    items: cartItems.map(item => ({
                        product: item.product._id,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color,
                        price: item.product.price
                    })),
                    shippingAddress: selectedAddress,
                    totalAmount: total,
                    discountAmount: discountAmount,
                    shippingCost: shippingCost,
                    taxAmount: taxes
                };

                await axiosInstance.post('/api/orders/send-wallet-otp');
                showToast('OTP Sent', 'A verification code has been sent to your email.', 'success');
                navigate('/verify-otp', {
                    state: {
                        userId: user?._id,
                        isWalletPayment: true,
                        orderDetails
                    }
                });
                return;
            }
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                showToast('Error', 'Razorpay SDK failed to load. Check your internet connection.', 'error');
                setIsProcessing(false);
                return;
            }

            // 2. Create Razorpay order on backend
            const orderRes = await axiosInstance.post('/api/orders/create-razorpay-order', {
                amount: total,
                currency: 'INR',
                receipt: `receipt_order_${Date.now()}`
            });

            if (!orderRes.success) {
                throw new Error(orderRes.message || 'Failed to create order');
            }

            const { id: razorpayOrderId, amount, currency } = orderRes.data;

            // 3. Open Razorpay Checkout
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: amount,
                currency: currency,
                name: 'Rivora Boutique',
                description: 'Luxury Curated Selection',
                image: '/logo.png', // Add your logo path
                order_id: razorpayOrderId,
                handler: async (response) => {
                    try {
                        // 4. Verify payment on backend
                        const verifyRes = await axiosInstance.post('/api/orders/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderDetails: {
                                items: cartItems.map(item => ({
                                    product: item.product._id,
                                    quantity: item.quantity,
                                    size: item.size,
                                    color: item.color,
                                    price: item.product.price
                                })),
                                shippingAddress: selectedAddress,
                                totalAmount: total,
                                discountAmount: discountAmount,
                                shippingCost: shippingCost,
                                taxAmount: taxes
                            }
                        });

                        if (verifyRes.success) {
                            showToast('Success', 'Order placed successfully!', 'success');
                            clearCart();
                            navigate('/order-success', { state: { order: verifyRes.data } });
                        } else {
                            showToast('Error', 'Payment verification failed', 'error');
                            navigate('/payment-failed');
                        }
                    } catch (err) {
                        showToast('Error', err.message || 'Verification failed', 'error');
                        navigate('/payment-failed');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone || ''
                },
                notes: {
                    address: `${selectedAddress.street}, ${selectedAddress.city}`
                },
                theme: {
                    color: '#2563eb' // Blue-600
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error('Payment Error:', err);
            showToast('Error', err.message || 'Something went wrong', 'error');
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-[#FDFDFB] min-h-screen pt-32 pb-20 font-inter">
            <div className="max-w-[1200px] mx-auto px-8">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2 uppercase">Checkout</h1>
                    <p className="text-xs font-black text-slate-500 tracking-[0.3em] uppercase">Finalize your curated selection</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    {/* Left   */}
                    <div className="flex-1 space-y-12">
                        <section>
                            <div className="flex justify-between items-end mb-6">
                                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Delivery Address</h2>
                                <button
                                    onClick={() => setIsAddressModalOpen(true)}
                                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                                >
                                    Change Address
                                </button>
                            </div>

                            {loadingAddresses ? (
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.03)] flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                                </div>
                            ) : selectedAddress ? (
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.03)] flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 mb-1">{user?.name}</h3>
                                        <div className="text-sm font-medium text-slate-500 leading-relaxed">
                                            {selectedAddress.street}, {selectedAddress.apartment && `${selectedAddress.apartment}, `}<br />
                                            {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pinCode}<br />
                                            {selectedAddress.country}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.03)] text-center py-12">
                                    <p className="text-slate-500 font-medium mb-4">No addresses found</p>
                                    <button
                                        onClick={() => navigate('/address')}
                                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-2 border-blue-100 px-6 py-2 rounded-xl hover:bg-blue-50 transition-all"
                                    >
                                        Add New Address
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Shipping Method */}
                        <section>
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Shipping Method</h2>
                            <div className="space-y-4">
                                <button
                                    onClick={() => setShippingMethod('express')}
                                    className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${shippingMethod === 'express' ? 'border-blue-600 bg-white shadow-xl shadow-blue-900/5' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${shippingMethod === 'express' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-black text-slate-900 text-base">Express Delivery</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Next Day Delivery • Insured</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-slate-900">$25.00</span>
                                </button>

                                <button
                                    onClick={() => setShippingMethod('standard')}
                                    className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${shippingMethod === 'standard' ? 'border-blue-600 bg-white shadow-xl shadow-blue-900/5' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${shippingMethod === 'standard' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-black text-slate-900 text-base">Standard Delivery</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">3-5 Business Days</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Free</span>
                                </button>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section>
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Payment Method</h2>
                            <div className="space-y-4">
                                {/* Razorpay */}
                                <button
                                    onClick={() => setPaymentMethod('razorpay')}
                                    className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${paymentMethod === 'razorpay' ? 'border-blue-600 bg-white shadow-xl shadow-blue-900/5' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${paymentMethod === 'razorpay' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-black text-slate-900 text-base">Razorpay</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Cards, UPI, Netbanking</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'razorpay' ? 'border-blue-600' : 'border-slate-200'}`}>
                                        {paymentMethod === 'razorpay' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                                    </div>
                                </button>

                                {/* Cash on Delivery */}
                                <button
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${paymentMethod === 'cod' ? 'border-blue-600 bg-white shadow-xl shadow-blue-900/5' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-black text-slate-900 text-base">Cash on Delivery</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Pay when you receive</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'cod' ? 'border-blue-600' : 'border-slate-200'}`}>
                                        {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                                    </div>
                                </button>

                                {/* Wallet */}
                                <button
                                    onClick={() => setPaymentMethod('wallet')}
                                    className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${paymentMethod === 'wallet' ? 'border-blue-600 bg-white shadow-xl shadow-blue-900/5' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${paymentMethod === 'wallet' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-black text-slate-900 text-base">Wallet Payment</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Pay using your wallet</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'wallet' ? 'border-blue-600' : 'border-slate-200'}`}>
                                        {paymentMethod === 'wallet' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                                    </div>
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="w-full lg:w-[420px] bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] sticky top-32">
                        <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight">Order Summary</h2>

                        <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-20 h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0">
                                        <img
                                            src={(() => {
                                                const imgPath = Array.isArray(item.product.image) ? item.product.image[0] : (item.product.image || '');
                                                if (!imgPath) return 'https://via.placeholder.com/600x800';
                                                return imgPath.startsWith('http') || imgPath.startsWith('/uploads') ? (imgPath.startsWith('http') ? imgPath : `http://localhost:5000${imgPath}`) : imgPath;
                                            })()}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">{item.product.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.color} / Size {item.size}</p>
                                        <p className="text-sm font-black text-slate-900 mt-2">${Number(item.product.price).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 border-t border-slate-50 pt-8 mb-8">
                            <div className="flex justify-between text-sm font-medium text-slate-500">
                                <span>Subtotal</span>
                                <span className="font-black text-slate-900">${cartTotalPrice.toFixed(2)}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-sm font-medium text-emerald-600">
                                    <span>Discount ({appliedCoupon.discount}%)</span>
                                    <span className="font-black">-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-medium text-slate-500">
                                <span>Shipping</span>
                                <span className="font-black text-slate-900">${shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-slate-500">
                                <span>Estimated Tax</span>
                                <span className="font-black text-slate-900">${taxes.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-10">
                            <span className="text-2xl font-black text-slate-900 uppercase tracking-tight">Total</span>
                            <span className="text-3xl font-black text-blue-600 tracking-tighter">${total.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleConfirmAndPay}
                            disabled={isProcessing || cartItems.length === 0}
                            className="w-full bg-blue-600 text-white h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 mb-6 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isProcessing ? 'Processing...' : 'Confirm and Pay'}
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>

                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] leading-relaxed">
                                Secure encrypted transaction
                            </p>
                        </div>

                        {/* Promo Code - Re-styled as per image */}
                        {/* <div className="mt-10 pt-10 border-t border-slate-50">
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Promo Code"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] h-14 pl-14 pr-24 text-sm font-black tracking-widest placeholder:text-slate-500 placeholder:font-bold focus:bg-white focus:border-slate-100 transition-all outline-none"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={isVerifying || !couponCode.trim()}
                                    className="absolute right-2 top-2 bottom-2 px-6 bg-slate-200 text-slate-500 rounded-[1rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {isVerifying ? '...' : 'Apply'}
                                </button>
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Address Selection Modal */}
                <AnimatePresence>
                    {isAddressModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsAddressModalOpen(false)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden"
                            >
                                <div className="h-2 bg-blue-600 absolute top-0 left-0 right-0" />

                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Select Address</h3>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Choose a delivery location for this order</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddressModalOpen(false)}
                                        className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {addresses.map((addr) => (
                                        <button
                                            key={addr._id}
                                            onClick={() => {
                                                setSelectedAddress(addr);
                                                setIsAddressModalOpen(false);
                                            }}
                                            className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all relative group flex items-start gap-4 ${selectedAddress?._id === addr._id ? 'border-blue-600 bg-blue-50/10 shadow-lg shadow-blue-900/5' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${selectedAddress?._id === addr._id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-black text-slate-900 text-base capitalize">{addr.street}</h4>
                                                    {addr.isDefault && (
                                                        <span className="bg-blue-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-slate-500">
                                                    {addr.apartment && `${addr.apartment}, `} {addr.city}, {addr.state} {addr.pinCode}, {addr.country}
                                                </p>
                                            </div>
                                            {selectedAddress?._id === addr._id && (
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => navigate('/address')}
                                        className="w-full p-6 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-500 font-black text-sm flex items-center justify-center gap-3 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        Add New Address
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
