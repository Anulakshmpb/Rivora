import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../Toast/ToastContext';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';

export default function WalletPayment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { clearCart } = useCart();

    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const orderDetails = location.state?.orderDetails;

    useEffect(() => {
        if (!orderDetails) {
            navigate('/checkout');
            return;
        }

        const fetchWallet = async () => {
            try {
                const res = await axiosInstance.get('/api/wallet');
                setWallet(res.data);
            } catch (err) {
                showToast('Error', 'Failed to fetch wallet details', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchWallet();
    }, [orderDetails, navigate]);

    const handlePayNow = async () => {
        if (!wallet || wallet.balance < orderDetails.totalAmount) {
            showToast('Error', 'Insufficient wallet balance', 'error');
            return;
        }

        setIsProcessing(true);
        try {
            const res = await axiosInstance.post('/api/orders/place-wallet-order', {
                orderDetails
            });

            if (res.success) {
                showToast('Success', 'Order placed successfully using wallet!', 'success');
                clearCart();
                navigate('/order-success', { state: { order: res.data } });
            } else {
                throw new Error(res.message || 'Payment failed');
            }
        } catch (err) {
            showToast('Error', err.response?.data?.message || err.message || 'Something went wrong', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center bg-[#FDFDFB]">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    const canPay = wallet && wallet.balance >= orderDetails.totalAmount;

    return (
        <div className="bg-[#FDFDFB] min-h-screen pt-32 pb-20 font-inter">
            <div className="max-w-[800px] mx-auto px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden"
                >
                    <div className="p-12">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Wallet Payment</h1>
                                <p className="text-xs font-black text-slate-500 tracking-[0.3em] uppercase">Authorize your transaction</p>
                            </div>
                        </div>

                        {/* Balance Card */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white mb-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Available Balance</p>
                                <h2 className="text-5xl font-black tracking-tighter">
                                    ${wallet ? wallet.balance.toFixed(2) : '0.00'}
                                </h2>
                                <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Digital Wallet</div>
                                    <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-tighter">Verified</div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-6 mb-10">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Payment Breakdown</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-medium text-slate-500">
                                    <span>Items Total</span>
                                    <span className="font-black text-slate-900">${(orderDetails.totalAmount - orderDetails.shippingCost - orderDetails.taxAmount + (orderDetails.discountAmount || 0)).toFixed(2)}</span>
                                </div>
                                {orderDetails.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm font-medium text-emerald-600">
                                        <span>Discount Applied</span>
                                        <span className="font-black">-${orderDetails.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-medium text-slate-500">
                                    <span>Shipping & Handling</span>
                                    <span className="font-black text-slate-900">${orderDetails.shippingCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-slate-500">
                                    <span>Estimated Taxes</span>
                                    <span className="font-black text-slate-900">${orderDetails.taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="pt-6 border-t border-slate-50 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total Payable</p>
                                        <p className="text-4xl font-black text-blue-600 tracking-tighter">${orderDetails.totalAmount.toFixed(2)}</p>
                                    </div>
                                    {!canPay && (
                                        <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            Insufficient Balance
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayNow}
                            disabled={isProcessing || !canPay}
                            className="w-full bg-slate-900 text-white h-20 rounded-[2rem] font-black uppercase tracking-[0.25em] text-sm shadow-2xl shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                        >
                            {isProcessing ? (
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Confirm & Pay with Wallet
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </>
                            )}
                        </button>

                        <div className="mt-8 flex items-center justify-center gap-8 opacity-40">
                            <div className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                Encrypted
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Secure
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/checkout')}
                        className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors"
                    >
                        ← Cancel and return to checkout
                    </button>
                </div>
            </div>
        </div>
    );
}
