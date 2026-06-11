import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';

export default function WishList() {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const navigate = useNavigate();

    return (
        <div className="bg-[#FDFDFB] min-h-screen text-[#1A1A1A] font-sans selection:bg-slate-900 selection:text-white mt-[50px]">
            {/* Banner */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pt-10 mt-[50px]">
                <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.05)] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50/50 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
                    <div className="relative z-10 flex flex-col justify-center items-start gap-4">
                        <nav className="flex items-center gap-3 text-[8px] md:text-[12px] font-black uppercase tracking-[0.2em] text-slate-600">
                            <a href="/" className="hover:text-black transition-colors">Atelier</a>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-black">Your Wishlist</span>
                        </nav>
                        <h1 className="text-lg md:text-4xl sm:text-7xl font-serif font-medium tracking-tight leading-none sm:leading-[0.9]">
                            Curated <span className="italic text-slate-600">Desires</span>
                        </h1>
                        <p className="text-slate-600 text-xs md:text-lg font-light leading-relaxed">
                            A personal collection of your favorite pieces, waiting to be yours.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-16">
                <main className="flex-1">
                    {wishlistItems.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-10 gap-y-10 sm:gap-y-20 transition-all duration-700 ease-in-out">
                            {wishlistItems.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onRemove={() => removeFromWishlist(product._id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 sm:py-40 bg-slate-50 rounded-3xl sm:rounded-[3rem] border border-dashed border-slate-200">
                            <HeartOutlineIcon className="w-16 h-16 text-slate-200 mb-6" />
                            <h2 className="text-lg md:text-3xl font-serif italic text-slate-600 mb-2">Your wishlist is empty</h2>
                            <p className="text-slate-600 text-xs md:text-sm font-medium tracking-wide">Explore our collection and find pieces you love.</p>
                            <button
                                onClick={() => navigate('/product-list')}
                                className="mt-8 px-8 py-3 bg-white border border-slate-200 rounded-full text-xs md:text-sm font-black uppercase tracking-widest hover:border-slate-900 transition-all"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// Sub-components
function ProductCard({ product, onRemove }) {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    return (
        <div
            className="group flex flex-col cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate(`/product-list/${product._id}`, { state: { product } })}
        >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#F3F3F1] rounded-2xl sm:rounded-[2rem] transition-all duration-700 group-hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)]">
                <img
                    src={(() => {
                        const imgPath = Array.isArray(product.image) ? product.image[0] : (product.image || '');
                        if (!imgPath) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600&h=800';
                        return imgPath.startsWith('http') || imgPath.startsWith('/uploads') ? (imgPath.startsWith('http') ? imgPath : `http://localhost:5000${imgPath}`) : imgPath;
                    })()}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-[1.5s] ease-out ${isHovered ? 'scale-110 blur-[2px]' : 'scale-100'}`}
                />

                {/* Remove from Wishlist Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2 sm:p-3 bg-white/60 backdrop-blur-md rounded-full border border-white/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 md:translate-y-2 md:group-hover:translate-y-0 hover:bg-white"
                >
                    <CloseIcon className="w-3 h-3 sm:w-4 sm:h-4 text-slate-900" />
                </button>

                {/* Quick Add Overlay */}
                <div className={`absolute inset-x-2 sm:inset-x-6 bottom-2 sm:bottom-6 transition-all duration-700 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <button className="w-full py-2 sm:py-4 bg-slate-900 text-white rounded-2xl text-[9px] sm:text-[12px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all">
                        View Details
                    </button>
                </div>

                {/* Badges */}
                {product.quantity < 10 && product.quantity > 0 && (
                    <div className="absolute top-3 left-3 sm:top-6 sm:left-6 px-2 py-0.5 sm:px-3 sm:py-1 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-full">
                        <span className="text-[7px] sm:text-[9px] font-black text-red-600 uppercase tracking-widest italic">Rare Find</span>
                    </div>
                )}
            </div>

            <div className="mt-4 sm:mt-8 space-y-2 sm:space-y-3 px-1 sm:px-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <span className="text-[7px] sm:text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                            {Array.isArray(product.category) ? product.category[0] : (product.category || 'Atelier Collection')}
                        </span>
                        <h3 className="text-xs sm:text-base md:text-lg font-serif font-medium leading-tight group-hover:text-slate-600 transition-colors">{product.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg">
                        <StarIcon className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-yellow-500" />
                        <span className="text-[9px] sm:text-[12px] font-black text-slate-600 italic">4.9</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm sm:text-lg md:text-xl font-light tracking-tight text-slate-900">${product.price}</span>
                </div>
            </div>
        </div>
    );
}

// Icons
const CloseIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const HeartOutlineIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const StarIcon = (props) => <svg {...props} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;