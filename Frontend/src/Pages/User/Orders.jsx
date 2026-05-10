import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../Toast/ToastContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PackageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const res = await axiosInstance.get('/api/orders/user'); // Need to check if this route exists
            if (res.success) {
                setOrders(res.data);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            // Fallback: If route doesn't exist, maybe it's just /api/orders
            try {
                 const res = await axiosInstance.get('/api/orders');
                 if (res.success) setOrders(res.data);
            } catch (e) {}
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order? Pre-paid orders will be refunded to your wallet.')) return;
        try {
            const res = await axiosInstance.post(`/api/orders/${orderId}/cancel`);
            if (res.success) {
                showToast('Success', 'Order cancelled successfully', 'success');
                fetchOrders();
            }
        } catch (err) {
            showToast('Error', err.response?.data?.message || 'Failed to cancel order', 'error');
        }
    };

    const handleReturnOrder = async (orderId) => {
        if (!window.confirm('Request a return for this order? Refund will be credited to your wallet.')) return;
        try {
            const res = await axiosInstance.post(`/api/orders/${orderId}/return`);
            if (res.success) {
                showToast('Success', 'Return requested successfully', 'success');
                fetchOrders();
            }
        } catch (err) {
            showToast('Error', err.response?.data?.message || 'Failed to request return', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Returned': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#FDFDFB] min-h-screen pt-[120px] pb-20 px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-5xl font-serif font-medium tracking-tight">Your Orders</h1>
                    <p className="text-slate-400 mt-3 font-medium">Track and manage your luxury selections</p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <PackageIcon />
                        </div>
                        <h2 className="text-2xl font-serif italic text-slate-400 mb-6">No orders yet</h2>
                        <button 
                            onClick={() => navigate('/product-list')}
                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all"
                        >
                            Explore Collection
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <AnimatePresence>
                            {orders.map((order, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={order._id} 
                                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-700"
                                >
                                    {/* Order Header */}
                                    <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-wrap justify-between items-center gap-6">
                                        <div className="flex gap-10">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Order Placed</p>
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                                    <CalendarIcon />
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
                                                <p className="text-sm font-black text-slate-900">${order.totalAmount.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Order ID</p>
                                                <p className="text-sm font-medium text-slate-500">#{order._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-8 space-y-6">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex gap-6 items-center">
                                                <div className="w-20 h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img 
                                                        src={item.product?.image?.[0] ? (item.product.image[0].startsWith('http') ? item.product.image[0] : `http://localhost:5000${item.product.image[0]}`) : 'https://via.placeholder.com/200x300'} 
                                                        alt={item.product?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-base font-serif font-medium">{item.product?.name || 'Product'}</h4>
                                                    <p className="text-xs text-slate-400 mt-1">Qty: {item.quantity} | Size: {item.size} | Color: {item.color}</p>
                                                    <p className="text-sm font-bold text-slate-900 mt-2">${item.price || item.product?.price}</p>
                                                </div>
                                                {order.orderStatus === 'Delivered' && (
                                                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-300 transition-all">
                                                        Write Review
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Actions */}
                                    <div className="p-8 bg-slate-50/20 border-t border-slate-50 flex justify-end gap-4">
                                        {['Processing', 'Pending'].includes(order.orderStatus) && (
                                            <button 
                                                onClick={() => handleCancelOrder(order._id)}
                                                className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 border border-rose-100 hover:bg-rose-50 transition-all"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                        {order.orderStatus === 'Delivered' && (
                                            <button 
                                                onClick={() => handleReturnOrder(order._id)}
                                                className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-600 border border-amber-100 hover:bg-amber-50 transition-all"
                                            >
                                                Return Items
                                            </button>
                                        )}
                                        <button className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-black transition-all">
                                            Track Shipment
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
