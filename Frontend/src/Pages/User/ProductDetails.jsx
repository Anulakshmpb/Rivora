import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../Toast/ToastContext';
export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.product || null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(!product);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const { showToast } = useToast();
  const { addToCart, cartItems } = useCart();
  const { addToWishlist } = useWishlist();

  const productImages = Array.isArray(product.image) ? product.image : [product.image].filter(Boolean);

  const getStockStatus = (qty) => {
    if (qty > 50) return { label: 'In Stock', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    if (qty > 0) return { label: `Low Stock (${qty} left)`, class: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    return { label: 'Out of Stock', class: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
  };

  const stockStatus = getStockStatus(product.quantity);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0);
    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/api/products/${id}`);
        if (response.data && response.data.success) {
          const fetchedProduct = response.data.product;
          setProduct(fetchedProduct);
          setActiveImage(0);

          const colors = Array.isArray(fetchedProduct.colors) ? fetchedProduct.colors : (fetchedProduct.color ? (Array.isArray(fetchedProduct.color) ? fetchedProduct.color : [fetchedProduct.color]) : []);
          if (colors.length > 0) setSelectedColor(colors[0]);
        } else if (response.success) {
          const fetchedProduct = response.data.product;
          setProduct(fetchedProduct);
          setActiveImage(0);

          const colors = Array.isArray(fetchedProduct.colors) ? fetchedProduct.colors : (fetchedProduct.color ? (Array.isArray(fetchedProduct.color) ? fetchedProduct.color : [fetchedProduct.color]) : []);
          if (colors.length > 0) setSelectedColor(colors[0]);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        showToast('Error fetching product details', "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, showToast]);

  useEffect(() => {
    if (!product) return;

    const fetchSimilar = async () => {
      try {
        const category = Array.isArray(product.category) ? product.category[0] : product.category;
        const response = await axiosInstance.get('/api/products', {
          params: { category }
        });
        const products = response.data?.products || response.products || [];
        const isSuccess = response.success || response.data?.success;

        if (isSuccess) {
          const others = products.filter(p => p._id !== product._id).slice(0, 4);
          setSimilarProducts(others);
        }
      } catch (error) {
        console.error('Error fetching similar products:', error);
        showToast('Error fetching similar products', "error");
      }
    };

    fetchSimilar();
  }, [product?._id, product?.category, showToast]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y });
  };

  if (!product) return null;

  return (
    <div className="py-24 bg-[#FDFDFB] min-h-screen text-[#1A1A1A] font-sans selection:bg-slate-900 selection:text-white pb-20">

      <div className="max-w-[1440px] mx-auto px-8 pt-12">
        <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-12">
          <a onClick={() => navigate('/')} className="hover:text-black cursor-pointer transition-colors">Atelier</a>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <a onClick={() => navigate('/shop')} className="hover:text-black cursor-pointer transition-colors">Shop</a>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <span className="text-black">{Array.isArray(product.category) ? product.category[0] : (product.category || 'Collection')}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* Left */}
          <div className="flex gap-6 h-fit">
            {productImages.length > 1 && (
              <div className="hidden md:flex flex-col gap-4 w-20">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImage === i
                      ? 'border-slate-900 shadow-lg scale-105'
                      : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'
                      }`}
                  >
                    <img
                      src={img.startsWith('http') || img.startsWith('/uploads') ? (img.startsWith('http') ? img : `http://localhost:5000${img}`) : img}
                      className="w-full h-full object-cover"
                      alt={`Thumbnail ${i + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              className="flex-1 aspect-[3/4] overflow-hidden rounded-[3rem] bg-slate-50 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.15)] group relative cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
            >
              <img
                src={(() => {
                  const imgPath = productImages[activeImage];
                  if (!imgPath) return 'https://via.placeholder.com/600x800';
                  return imgPath.startsWith('http') || imgPath.startsWith('/uploads') ? (imgPath.startsWith('http') ? imgPath : `http://localhost:5000${imgPath}`) : imgPath;
                })()}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-out"
                style={{
                  transform: isZooming ? 'scale(2.5)' : 'scale(1)',
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                }}
              />

              <div className="absolute top-8 right-8 flex flex-col gap-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                <button onClick={() => { addToWishlist(product); navigate('/wishlist'); }} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl hover:bg-white transition-all hover:scale-110 active:scale-90 group/btn">
                  <HeartIcon className="w-5 h-5 text-slate-400 group-hover/btn:text-rose-500 transition-colors" />
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl hover:bg-white transition-all hover:scale-110 active:scale-90 group/btn">
                  <ShareIcon className="w-5 h-5 text-slate-400 group-hover/btn:text-indigo-500 transition-colors" />
                </button>
              </div>

              <div className="absolute top-8 left-8 flex flex-col gap-3">
                <div className="bg-slate-900/90 backdrop-blur-md px-5 py-2 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">New Edition</span>
                </div>
                {product.return_policy && (
                  <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/40 shadow-lg flex items-center gap-2">
                    <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">7-Day Returns</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col justify-center">
            <header className="space-y-4 mb-10">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Essential Collection</span>
                <div className="h-[1px] w-12 bg-slate-200" />
                <div className="flex items-center gap-1">
                  <StarIcon className="w-3 h-3 text-yellow-500" />
                  <span className="text-[10px] font-black text-slate-400 italic">4.9 (124 reviews)</span>
                </div>
              </div>
              <h1 className="text-6xl font-serif font-medium tracking-tight leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-6">
                <span className="text-4xl font-light tracking-tighter">${product.price}</span>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-sm ${stockStatus.class}`}>
                  {stockStatus.label}
                </div>
              </div>
            </header>

            <div className="space-y-10">
              <div className="space-y-4">
                <p className="text-slate-500 text-lg font-semibold leading-relaxed max-w-lg">
                  {product.description}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hue</h3>
                <div className="flex gap-4">
                  {(Array.isArray(product.color) ? product.color : (product.color ? (Array.isArray(product.color) ? product.color : [product.color]) : [])).map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full ring-2 ring-offset-4 transition-transform ${selectedColor === color ? 'ring-slate-900 scale-110' : 'ring-transparent hover:scale-105'}`}
                      style={{ backgroundColor: (typeof color === 'string' && color.startsWith('custom-')) ? `#${color.split('-')[1]}` : color }}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="space-y-4">
                <div className="flex justify-between items-center max-w-md">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Metric</h3>
                  <button className="text-[9px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-900 pb-0.5">Size Guide</button>
                </div>
                <div className="flex gap-3">
                  {(Array.isArray(product.sizes) ? product.sizes : (Array.isArray(product.size) ? product.size : (product.size ? [product.size] : []))).map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-16 h-14 flex items-center justify-center rounded-2xl text-xs font-black transition-all border ${selectedSize === size
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="pt-10 flex flex-col sm:flex-row gap-4 max-w-lg">
                <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    —
                  </button>
                  <span className="w-12 text-center font-black text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => {
                    const exists = cartItems.some(item =>
                      item.product._id === product._id
                    );

                    if (exists) {
                      showToast('This item is already in your bag.', 'warning');
                      navigate('/cart');
                      return;
                    }

                    addToCart(product, quantity, selectedSize, selectedColor);
                    navigate('/cart');
                  }}
                  className="flex-1 bg-slate-900 text-white h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/30 hover:bg-black hover:-translate-y-1 transition-all active:scale-95"
                >
                  Add to Bag
                </button>
                <button onClick={() => { addToWishlist(product); navigate('/wishlist'); }} className="w-14 h-14 flex items-center justify-center rounded-2xl border border-slate-200 hover:border-slate-900 transition-all group">
                  <HeartIcon className="w-5 h-5 text-slate-300 group-hover:text-red-500 group-hover:scale-110 transition-all" />
                </button>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-100">
                <Feature icon={<TruckIcon />} title="Ethical Shipping" desc="Carbon neutral delivery" />
                <Feature icon={<ShieldIcon />} title="Secure Checkout" desc="256-bit SSL encryption" />
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        <section className="mt-40 space-y-16">
          <div className="flex flex-col items-start text-left space-y-4">
            <h2 className="text-3xl font-serif font-medium tracking-tight">Similar Products</h2>
            <div className="h-1 w-20 bg-slate-900 rounded-full" />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 animate-in fade-in duration-1000">
              {similarProducts.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Sub-components
function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-center gap-5 p-4 rounded-3xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
      <div className="p-3.5 bg-white rounded-2xl text-slate-900 shadow-sm group-hover:scale-110 transition-transform duration-500">
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.1em] mb-1 text-slate-900">{title}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{desc}</p>
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToWishlist } = useWishlist();

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/product-list/${product._id}`, { state: { product } })}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-50 rounded-[2.5rem] mb-6 group-hover:shadow-2xl transition-all duration-700">
        <img
          src={(() => {
            const imgPath = Array.isArray(product.image) ? product.image[0] : (product.image || '');
            if (!imgPath) return 'https://via.placeholder.com/600x800';
            return imgPath.startsWith('http') || imgPath.startsWith('/uploads') ? (imgPath.startsWith('http') ? imgPath : `http://localhost:5000${imgPath}`) : imgPath;
          })()}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-500" />

        {/* Quick Wishlist */}
        <button onClick={(e) => { e.stopPropagation(); addToWishlist(product); navigate('/wishlist'); }} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md border border-white/40 shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 hover:bg-white hover:scale-110">
          <HeartIcon className="w-4 h-4 text-slate-400 hover:text-rose-500 transition-colors" />
        </button>
      </div>
      <div className="space-y-2 text-center">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block">
          {Array.isArray(product.category) ? product.category[0] : (product.category || 'Collection')}
        </span>
        <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase group-hover:text-slate-500 transition-colors">{product.name}</h3>
        <span className="text-xl font-light tracking-tighter block">${product.price}</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="aspect-[3/4] bg-slate-100 rounded-[2rem]" />
      <div className="space-y-3 flex flex-col items-center">
        <div className="h-2 w-20 bg-slate-100 rounded-full" />
        <div className="h-4 w-full bg-slate-100 rounded-lg" />
        <div className="h-3 w-24 bg-slate-100 rounded-md" />
      </div>
    </div>
  );
}

// Icons
const CheckBadgeIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const StarIcon = (props) => <svg {...props} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const HeartIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>;
const ShareIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>;
const TruckIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>;
const ShieldIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
