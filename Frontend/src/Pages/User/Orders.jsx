import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../Toast/ToastContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewModal from './ReviewModal';
import { useNotification } from '../../context/NotificationContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Loader from '../../Components/Loader';

const PackageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);

export default function Orders() {
    const { addNotification } = useNotification();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [returnReason, setReturnReason] = useState('');
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null,
        orderId: null,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: ''
    });

    const [detailsModal, setDetailsModal] = useState({
        isOpen: false,
        order: null
    });

    const [reviewModal, setReviewModal] = useState({
        isOpen: false,
        productId: null
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    const downloadInvoice = (order) => {
        if (!order) return;

        const doc = new jsPDF();

        // Check overall order status for color theme & title
        let primaryColor = [15, 23, 42]; // Default Slate 900
        let invoiceTitle = 'TAX INVOICE';
        
        if (order.orderStatus === 'Cancelled') {
            primaryColor = [225, 29, 72]; // Rose 600
            invoiceTitle = 'CANCELLED INVOICE';
        } else if (order.orderStatus === 'Returned') {
            primaryColor = [217, 119, 6]; // Amber 600
            invoiceTitle = 'RETURNED INVOICE';
        }
        
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 35, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('RIVORA', 15, 22);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Premium Fashion & Lifestyle', 15, 28);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(invoiceTitle, 195, 22, { align: 'right' });

        doc.setTextColor(51, 65, 85);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE DETAILS', 15, 50);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Order ID: #${order._id.toUpperCase()}`, 15, 57);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 15, 64);
        doc.text(`Order Status: ${order.orderStatus}`, 15, 71);
        doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 15, 78);
        doc.text(`Payment Status: ${order.paymentStatus}`, 15, 85);

        // Shipping 
        doc.setFont('helvetica', 'bold');
        doc.text('SHIPPING DESTINATION', 120, 50);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`${order.shippingAddress.street}`, 120, 57);
        let currentAddrY = 64;
        if (order.shippingAddress.apartment) {
            doc.text(`${order.shippingAddress.apartment}`, 120, currentAddrY);
            currentAddrY += 7;
        }
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, 120, currentAddrY);
        currentAddrY += 7;
        doc.text(`${order.shippingAddress.pinCode}, ${order.shippingAddress.country}`, 120, currentAddrY);

        // Items Table
        const headers = [['Product', 'Variant (Size/Color)', 'Qty', 'Unit Price', 'Total']];
        const rows = order.items.map(item => {
            const isCancelled = item.status === 'Cancelled';
            const isReturned = item.status === 'Returned';
            const statusLabel = isCancelled ? ' (Cancelled)' : (isReturned ? ' (Returned)' : '');
            
            return [
                `${item.product?.name || 'Product'}${statusLabel}`,
                `${item.size || 'N/A'} / ${item.color || 'N/A'}`,
                item.quantity || 1,
                `$${item.price.toFixed(2)}`,
                (isCancelled || isReturned) ? `$0.00` : `$${(item.price * item.quantity).toFixed(2)}`
            ];
        });

        const tableStartY = 95;
        
        autoTable(doc, {
            startY: tableStartY,
            head: headers,
            body: rows,
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252] // Slate 50
            },
            margin: { left: 15, right: 15 },
            theme: 'striped'
        });

        // Pricing Summary
        const finalY = doc.lastAutoTable.finalY + 15;
        const activeItems = order.items.filter(item => !['Cancelled', 'Returned'].includes(item.status));
        const subtotal = activeItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shipping = order.shippingCost || 0;
        const tax = order.taxAmount || 0;
        const discount = order.discountAmount || 0;
        const total = Math.max(0, subtotal + shipping + tax - discount);

        const summaryStartX = 120;
        const lineSpacing = 7;
        let currentSummaryY = finalY;

        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal (Active Items):', summaryStartX, currentSummaryY);
        doc.text(`$${subtotal.toFixed(2)}`, 195, currentSummaryY, { align: 'right' });

        if (discount > 0) {
            currentSummaryY += lineSpacing;
            doc.setTextColor(16, 185, 129); 
            doc.text('Discount Applied:', summaryStartX, currentSummaryY);
            doc.text(`-$${discount.toFixed(2)}`, 195, currentSummaryY, { align: 'right' });
            doc.setTextColor(51, 65, 85);
        }

        currentSummaryY += lineSpacing;
        doc.text('Shipping:', summaryStartX, currentSummaryY);
        doc.text(`$${shipping.toFixed(2)}`, 195, currentSummaryY, { align: 'right' });

        currentSummaryY += lineSpacing;
        doc.text('Estimated Tax:', summaryStartX, currentSummaryY);
        doc.text(`$${tax.toFixed(2)}`, 195, currentSummaryY, { align: 'right' });

        currentSummaryY += lineSpacing + 2;
        doc.setDrawColor(226, 232, 240); 
        doc.setLineWidth(0.5);
        doc.line(summaryStartX, currentSummaryY - 4, 195, currentSummaryY - 4);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Total Amount:', summaryStartX, currentSummaryY);
        doc.text(`$${total.toFixed(2)}`, 195, currentSummaryY, { align: 'right' });

        // Footer 
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); 
        doc.text('Thank you for shopping with RIVORA!', 105, currentSummaryY + 25, { align: 'center' });

        doc.save(`invoice_${order._id.toUpperCase()}.pdf`);
    };

    const fetchOrders = async () => {
        try {
            const res = await axiosInstance.get('/api/orders');
            if (res.success) {
                setOrders(res.data);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            showToast('Error', 'Failed to load your orders', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = (orderId, productId) => {
        setModalConfig({
            isOpen: true,
            type: 'cancel',
            orderId,
            productId,
            title: 'Cancel Item',
            message: 'Are you sure you want to cancel this item? Pre-paid orders will be refunded to your wallet balance instantly.',
            confirmText: 'Yes, Cancel Item',
            confirmColor: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
        });
    };

    const handleReturnOrder = (orderId, productId) => {
        setReturnReason('');
        setModalConfig({
            isOpen: true,
            type: 'return',
            orderId,
            productId,
            title: 'Request Return',
            message: 'Please provide a reason for returning this item. Once approved, the refund will be credited to your wallet.',
            confirmText: 'Submit Return Request',
            confirmColor: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
        });
    };

    const handleViewDetails = (order) => {
        setDetailsModal({
            isOpen: true,
            order
        });
    };

    const executeAction = async () => {
        const { type, orderId, productId } = modalConfig;
        closeModal();

        try {
            const endpoint = type === 'cancel' ? `/api/orders/${orderId}/cancel` : `/api/orders/${orderId}/return`;
            const payload = type === 'return' ? { reason: returnReason, productId } : { productId };
            const res = await axiosInstance.post(endpoint, payload);

            if (res.success) {
                let successMessage = type === 'cancel' ? 'Item cancelled successfully' : 'Item returned successfully';

                // Add refund amount to message
                if (res.data.refundAmount !== undefined) {
                    successMessage += `. $${res.data.refundAmount.toFixed(2)} has been added to your wallet.`;
                }

                if (res.data.couponInvalidated) {
                    successMessage += ' Your coupon was removed as the order total fell below the required minimum.';
                    if (res.data.validCoupons?.length > 0) {
                        const couponsList = res.data.validCoupons.map(c => `${c.code} (${c.discount}% OFF)`).join(', ');
                        successMessage += ` Available coupons: ${couponsList}`;
                    }
                }
                showToast('Success', successMessage, 'success');
                fetchOrders();
            }
        } catch (err) {
            showToast('Error', err.response?.data?.message || `Failed to ${type} item`, 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Returned': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Return Requested': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (isLoading) {
        return <Loader fullPage variant="user" text="Loading your orders..." />;
    }

    return (
        <div className="bg-[#FDFDFB] min-h-screen pt-[120px] pb-20 px-4 sm:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight">Your Orders</h1>
                    <p className="text-slate-500 mt-3 font-medium">Track and manage your luxury selections</p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl sm:rounded-[3rem] p-6 sm:p-20 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <PackageIcon />
                        </div>
                        <h2 className="text-2xl font-serif italic text-slate-500 mb-6">No orders yet</h2>
                        <button
                            onClick={() => navigate('/product-list')}
                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all w-full sm:w-auto"
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
                                    className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-700"
                                >
                                    {/* Order Header */}
                                    <div className="p-4 sm:p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 w-full md:w-auto">
                                            <div>
                                                <p className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-1">Order Placed</p>
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                                    <CalendarIcon />
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Amount</p>
                                                <p className="text-sm font-black text-slate-900">${order.totalAmount.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-1">Order ID</p>
                                                <p className="text-sm font-medium text-slate-500">#{order._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className={`px-5 py-2 rounded-2xl text-[12px] font-black uppercase tracking-widest border self-end sm:self-auto ${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-4 sm:p-8 space-y-6">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start sm:items-center py-4 border-b border-slate-50 last:border-b-0 w-full">
                                                <div className="flex gap-4 items-center flex-1 w-full">
                                                    <div className="w-20 h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={item.product?.image?.[0] ? (item.product.image[0].startsWith('http') ? item.product.image[0] : `http://localhost:5000${item.product.image[0]}`) : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'%3E%3Crect width='3' height='4' fill='%23f1f5f9'/%3E%3C/svg%3E"}
                                                            alt={item.product?.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="text-base font-serif font-medium truncate">{item.product?.name || 'Product'}</h4>
                                                            {item.status && item.status !== 'Ordered' && (
                                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                                                                    {item.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity} | Size: {item.size} | Color: {item.color}</p>
                                                        <p className="text-sm font-bold text-slate-900 mt-2">${item.price || item.product?.price}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 items-center self-end sm:self-auto mt-2 sm:mt-0">
                                                    {item.status === 'Delivered' && (
                                                        <button
                                                            onClick={() => setReviewModal({ isOpen: true, productId: item.product._id })}
                                                            className="text-[12px] font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-300 transition-all"
                                                        >
                                                            Write Review
                                                        </button>
                                                    )}

                                                    {/* Item Specific Actions */}
                                                    {(!item.status || item.status === 'Ordered') && ['Processing', 'Pending'].includes(order.orderStatus) && (
                                                        (() => {
                                                            const orderDate = new Date(order.createdAt);
                                                            const now = new Date();
                                                            const diffInHours = (now - orderDate) / (1000 * 60 * 60);
                                                            if (diffInHours <= 48) {
                                                                return (
                                                                    <button
                                                                        onClick={() => handleCancelOrder(order._id, item.product._id)}
                                                                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 border border-rose-100 hover:bg-rose-50 transition-all"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                );
                                                            }
                                                            return null;
                                                        })()
                                                    )}

                                                    {item.status === 'Delivered' && (
                                                        <button
                                                            onClick={() => handleReturnOrder(order._id, item.product._id)}
                                                            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-600 border border-amber-100 hover:bg-amber-50 transition-all"
                                                        >
                                                            Return
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 sm:p-8 bg-slate-50/20 border-t border-slate-50 flex justify-end">
                                        <button
                                            onClick={() => handleViewDetails(order)}
                                            className="px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-black transition-all w-full sm:w-auto text-center"
                                        >
                                            View Details
                                        </button>
                                    </div>

                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Premium Confirmation Modal */}
            <AnimatePresence>
                {modalConfig.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-md rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden"
                        >
                            <div className="p-10">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${modalConfig.type === 'cancel' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {modalConfig.type === 'cancel' ? (
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    ) : (
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg>
                                    )}
                                </div>
                                <h3 className="text-3xl font-serif font-medium text-slate-900 mb-4">{modalConfig.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    {modalConfig.message}
                                </p>

                                {modalConfig.type === 'return' && (
                                    <div className="mt-6">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Reason for Return</label>
                                        <textarea
                                            value={returnReason}
                                            onChange={(e) => setReturnReason(e.target.value)}
                                            placeholder="Please describe why you are returning these items..."
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all min-h-[120px] resize-none"
                                        />
                                    </div>
                                )}

                                <div className="mt-10 flex flex-col gap-3">
                                    <button
                                        onClick={executeAction}
                                        className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-xl active:scale-[0.98] ${modalConfig.confirmColor}`}
                                    >
                                        {modalConfig.confirmText}
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className="w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-colors"
                                    >
                                        Keep Order
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Order Details Modal */}
            <AnimatePresence>
                {detailsModal.isOpen && detailsModal.order && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDetailsModal({ isOpen: false, order: null })}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-white w-full max-w-2xl rounded-3xl sm:rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-4 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-slate-50/30">
                                <div>
                                    <h3 className="text-2xl font-serif font-medium text-slate-900">Order Details</h3>
                                    <p className="text-[12px] font-black uppercase tracking-widest text-slate-500 mt-1">#{detailsModal.order._id.toUpperCase()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => downloadInvoice(detailsModal.order)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-[0.98]"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Invoice
                                    </button>
                                    <button
                                        onClick={() => setDetailsModal({ isOpen: false, order: null })}
                                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-10">
                                    {/* Shipping Address */}
                                    <div>
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-4">Shipping Destination</h4>
                                        <div className="text-sm font-bold text-slate-900 leading-relaxed">
                                            {detailsModal.order.shippingAddress.street}<br />
                                            {detailsModal.order.shippingAddress.apartment && `${detailsModal.order.shippingAddress.apartment}, `}
                                            {detailsModal.order.shippingAddress.city}, {detailsModal.order.shippingAddress.state}<br />
                                            {detailsModal.order.shippingAddress.pinCode}, {detailsModal.order.shippingAddress.country}
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div>
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-4">Payment Information</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium text-slate-500">Method</span>
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-900">{detailsModal.order.paymentMethod}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium text-slate-500">Status</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${detailsModal.order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {detailsModal.order.paymentStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Breakdown */}
                                <div className="mb-10">
                                    <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-6">Items Summary</h4>
                                    <div className="space-y-4">
                                        {detailsModal.order.items.map((item, i) => (
                                            <div key={i} className="flex gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                                <div className="w-16 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                                                    <img
                                                        src={item.product?.image?.[0] ? (item.product.image[0].startsWith('http') ? item.product.image[0] : `http://localhost:5000${item.product.image[0]}`) : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'%3E%3Crect width='3' height='4' fill='%23f1f5f9'/%3E%3C/svg%3E"}
                                                        alt={item.product?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h5 className="text-sm font-bold text-slate-900">{item.product?.name}</h5>
                                                        {item.status && item.status !== 'Ordered' && (
                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                                                                {item.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[12px] text-slate-600 mt-0.5">{item.size} / {item.color} | Qty: {item.quantity}</p>
                                                </div>
                                                <div className="text-sm font-black text-slate-900">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 text-white">
                                    {(() => {
                                        const activeItems = detailsModal.order.items.filter(item => !['Cancelled', 'Returned'].includes(item.status));
                                        const subtotal = activeItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                                        const shipping = detailsModal.order.shippingCost || 0;
                                        const tax = detailsModal.order.taxAmount || 0;
                                        const discount = detailsModal.order.discountAmount || 0;
                                        const total = Math.max(0, subtotal + shipping + tax - discount);

                                        return (
                                            <>
                                                <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-white/50 font-medium">Subtotal (Active Items)</span>
                                                        <span className="font-bold">${subtotal.toFixed(2)}</span>
                                                    </div>
                                                    {discount > 0 && (
                                                        <div className="flex justify-between items-center text-sm text-emerald-400">
                                                            <span className="font-medium">Discount Applied</span>
                                                            <span className="font-bold">-${discount.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-white/50 font-medium">Shipping</span>
                                                        <span className="font-bold">${shipping.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-white/50 font-medium">Estimated Tax</span>
                                                        <span className="font-bold">${tax.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Total Amount</span>
                                                    <span className="text-xl sm:text-3xl font-serif tracking-tighter">${total.toFixed(2)}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {detailsModal.order.returnReason && (
                                    <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Return Reason</h4>
                                        <p className="text-sm font-medium text-amber-900 italic leading-relaxed">
                                            "{detailsModal.order.returnReason}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ReviewModal
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal({ isOpen: false, productId: null })}
                productId={reviewModal.productId}
                type="product"
            />
        </div>
    );
}
