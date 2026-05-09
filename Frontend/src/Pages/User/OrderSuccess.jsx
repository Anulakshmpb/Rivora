import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';

export default function OrderSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const [similarProducts, setSimilarProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Fallback if accessed directly without state
    const order = location.state?.order || {
        _id: 'ORDER-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        totalAmount: 0,
        shippingAddress: { email: 'user@example.com' }
    };

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const formattedDelivery = deliveryDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchSimilar = async () => {
            try {
                const response = await axiosInstance.get('/api/products');
                if (response.data?.success || response.success) {
                    const allProducts = response.data?.products || response.products || [];
                    // Just pick 4 random or first 4 for now
                    setSimilarProducts(allProducts.slice(0, 4));
                }
            } catch (error) {
                console.error('Error fetching similar products:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSimilar();
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFDFB] pt-20 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Success Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden"
                >
                    {/* Animated Background Element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-4">
                            <span className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-blue-200">
                                <SparklesIcon className="w-3.5 h-3.5" />
                                Order Confirmed
                            </span>
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2">
                            Transaction Successful
                        </span>

                        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-4">
                            Thank you for <br />
                            <span className="italic text-slate-400">your order!</span>
                        </h1>

                        <p className="text-slate-500 text-base font-medium max-w-md leading-relaxed mb-6">
                            Your sartorial journey has begun. We've sent a confirmation to <span className="text-slate-900 font-bold">{order.shippingAddress?.email || 'your email'}</span>.
                        </p>

                        {/* Order Info Card */}
                        <div className="w-full max-w-3xl bg-slate-50 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100 mb-8">
                            <div className="text-left space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Order Number</span>
                                <span className="text-2xl font-serif font-medium text-slate-900">#{order._id.toString().slice(-8).toUpperCase()}</span>
                            </div>
                            
                            <div className="w-px h-12 bg-slate-200 hidden md:block" />

                            <div className="text-left space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Estimated Delivery</span>
                                <span className="text-2xl font-serif font-medium text-slate-900">{formattedDelivery}</span>
                            </div>

                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <BoxIcon className="w-8 h-8 text-slate-200" />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl mb-8">
                            <button 
                                onClick={() => navigate('/orders')}
                                className="flex-1 bg-blue-600 text-white h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                Track Order
                                <ArrowUpRightIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => navigate('/product-list')}
                                className="flex-1 bg-white text-slate-900 border border-slate-200 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 transition-all"
                            >
                                Continue Shopping
                            </button>
                        </div>

                        <div className="pt-6 border-t border-slate-100 w-full">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                Need help? <span className="text-blue-600 cursor-pointer hover:underline">Contact Atelier Support</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Similar Products */}
                <section className="mt-16 space-y-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <h2 className="text-3xl font-serif font-medium tracking-tight italic text-slate-400">
                            More from <span className="text-slate-900">The Collection</span>
                        </h2>
                        <div className="h-1 w-12 bg-slate-900 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
                        ) : (
                            similarProducts.map(p => (
                                <ProductCard key={p._id} product={p} />
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

// Sub-components (Reused styles from ProductDetails/Home)
function ProductCard({ product }) {
    const navigate = useNavigate();
    return (
        <motion.div 
            whileHover={{ y: -10 }}
            className="group cursor-pointer"
            onClick={() => navigate(`/product-list/${product._id}`, { state: { product } })}
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 rounded-[2rem] mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                <img 
                    src={(() => {
                        const imgPath = Array.isArray(product.image) ? product.image[0] : (product.image || '');
                        if (!imgPath) return 'https://via.placeholder.com/600x800';
                        return imgPath.startsWith('http') || imgPath.startsWith('/uploads') ? (imgPath.startsWith('http') ? imgPath : `http://localhost:5000${imgPath}`) : imgPath;
                    })()}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
            </div>
            <div className="space-y-1 text-center">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{product.name}</h3>
                <span className="text-lg font-serif italic text-slate-400">${product.price}</span>
            </div>
        </motion.div>
    );
}

function SkeletonCard() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="aspect-[3/4] bg-slate-100 rounded-[2rem]" />
            <div className="h-4 w-32 bg-slate-100 rounded-full mx-auto" />
        </div>
    );
}

// Icons
const SparklesIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>;
const BoxIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const ArrowUpRightIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>;
