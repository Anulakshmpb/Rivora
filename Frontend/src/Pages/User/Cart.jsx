import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../Toast/ToastContext';

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

export default function Cart() {
    const { cartItems, updateQuantity, removeFromCart, cartTotalPrice, cartTotalItems } = useCart();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsVerifying(true);
        try {
            const res = await axiosInstance.post('/api/coupons/validate', { code: couponCode });
            setAppliedCoupon(res.data.data);
            showToast('Success', `Coupon "${res.data.data.code}" applied!`, 'success');
        } catch (err) {
            showToast('Invalid Coupon', err.response?.data?.message || 'Failed to apply coupon', 'error');
            setAppliedCoupon(null);
        } finally {
            setIsVerifying(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        showToast('Coupon Removed', 'The discount has been removed', 'info');
    };

    const shipping = cartTotalItems > 0 ? 15.00 : 0;
    const discountAmount = appliedCoupon ? (cartTotalPrice * appliedCoupon.discount) / 100 : 0;
    const taxes = (cartTotalPrice - discountAmount) * 0.08; // Assuming 8% tax on discounted price
    const orderTotal = (cartTotalPrice - discountAmount) + shipping + taxes;

    return (
        <div className="bg-[#FDFDFB] min-h-screen text-[#1A1A1A] font-sans selection:bg-slate-900 selection:text-white pt-[120px] pb-20">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="mb-10">
                    <h1 className="text-4xl font-serif font-medium tracking-tight">Your Cart</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium tracking-wide">
                        {cartTotalItems} {cartTotalItems === 1 ? 'item' : 'items'} in your bag
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-slate-200 border-dashed text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-serif italic text-slate-600 mb-3">Your cart is empty</h2>
                        <p className="text-slate-500 text-sm mb-8 max-w-xs leading-relaxed">
                            Looks like you haven't added anything to your cart yet. Discover our latest collections.
                        </p>
                        <button 
                            onClick={() => navigate('/product-list')}
                            className="bg-slate-900 text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        {/* Cart Items List */}
                        <div className="flex-1 w-full space-y-6">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group">
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <TrashIcon />
                                    </button>

                                    <div className="w-32 h-40 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => navigate(`/product-list/${item.product._id}`)}>
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

                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start pr-12">
                                                <h3 className="text-lg font-serif font-medium cursor-pointer hover:text-slate-600 transition-colors" onClick={() => navigate(`/product-list/${item.product._id}`)}>
                                                    {item.product.name}
                                                </h3>
                                            </div>
                                            <p className="text-sm font-medium text-slate-900 mt-1">${item.product.price}</p>
                                            
                                            <div className="flex gap-4 mt-4 text-[11px] font-black uppercase tracking-widest text-slate-500">
                                                {item.size && (
                                                    <span className="bg-slate-50 px-3 py-1 rounded-md">Size: {item.size}</span>
                                                )}
                                                {item.color && (
                                                    <span className="bg-slate-50 px-3 py-1 rounded-md flex items-center gap-2">
                                                        Color: 
                                                        <span 
                                                            className="w-3 h-3 rounded-full inline-block border border-slate-200" 
                                                            style={{ backgroundColor: item.color.startsWith('custom-') ? `#${item.color.split('-')[1]}` : item.color }} 
                                                        />
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 p-1">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors rounded-md hover:bg-white"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors rounded-md hover:bg-white"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="w-full lg:w-[380px] bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.05)] sticky top-32">
                            <div className="mb-8 bg-slate-50/50 rounded-3xl border border-slate-100/50">
                                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">PROMOTION CODE</h3>
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-xs">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-emerald-900">{appliedCoupon.code}</p>
                                                <p className="text-[9px] font-bold text-emerald-600 uppercase">{appliedCoupon.discount}% Discount Applied</p>
                                            </div>
                                        </div>
                                        <button onClick={removeCoupon} className="text-emerald-900/40 hover:text-rose-500 transition-colors p-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <input 
                                            type="text" 
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Enter Code"
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl h-14 pl-5 pr-24 text-sm font-black tracking-widest placeholder:text-slate-300 placeholder:font-medium focus:border-slate-900 transition-all outline-none"
                                        />
                                        <button 
                                            onClick={handleApplyCoupon}
                                            disabled={isVerifying || !couponCode.trim()}
                                            className="absolute right-2 top-2 bottom-2 px-5 bg-slate-900 text-white rounded-[1.1rem] text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:bg-slate-200 disabled:text-slate-500 transition-all active:scale-95"
                                        >
                                            {isVerifying ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                )}
                            </div>
                           
                            <h2 className="text-lg font-serif font-medium mb-6">Order Summary</h2>
                            
                            <div className="space-y-4 text-sm font-medium text-slate-600 border-b border-slate-100 pb-6 mb-6">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900">${cartTotalPrice.toFixed(2)}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Discount ({appliedCoupon.discount}%)</span>
                                        <span>-${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-slate-900">${shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Estimated Tax</span>
                                    <span className="text-slate-900">${taxes.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-sm font-black uppercase tracking-widest text-slate-500">Total</span>
                                <span className="text-3xl font-light tracking-tighter text-slate-900">${orderTotal.toFixed(2)}</span>
                            </div>

                            <button 
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-slate-900 text-white h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-slate-900/20 hover:bg-black hover:-translate-y-0.5 transition-all active:scale-95 mb-4"
                            >
                                Checkout
                            </button>
                            
                            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                Secure Encrypted Checkout
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}