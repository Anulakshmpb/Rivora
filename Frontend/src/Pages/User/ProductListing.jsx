import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function ProductListing() {
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [sortBy, setSortBy] = useState('newest');
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [priceRange, setPriceRange] = useState([0, 2500]);
	const [selectedSizes, setSelectedSizes] = useState([]);
	const [inStockOnly, setInStockOnly] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const navigate = useNavigate();
	
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await axiosInstance.get('http://localhost:5000/api/categories', {
					withCredentials: true
				});
				if (response.data.success) {
					setCategories(response.data.data.categories);
				}
			} catch (error) {
				console.error('Failed to fetch categories:', error);
			}
		};
		fetchCategories();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [prodRes, catRes] = await Promise.all([
					axiosInstance.get('/api/products'),
					axiosInstance.get('/api/categories')
				]);
				if (prodRes.success) setProducts(prodRes.data.products);
				if (catRes.success) setCategories(catRes.data.categories);
			} catch (error) {
				console.error('Data fetch error:', error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	const filteredProducts = useMemo(() => {
		let result = products.filter(p => {
			const matchesCat = selectedCategories.length === 0 || (Array.isArray(p.category) ? p.category.some(c => selectedCategories.includes(c)) : selectedCategories.includes(p.category));
			const matchesPrice = p.price <= priceRange[1];
			const matchesStock = !inStockOnly || p.quantity > 0;
			return matchesCat && matchesPrice && matchesStock;
		});

		if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
		if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
		return result;
	}, [products, selectedCategories, priceRange, inStockOnly, sortBy]);

	return (
		<div className="bg-[#FDFDFB] min-h-screen text-[#1A1A1A] font-sans selection:bg-slate-900 selection:text-white mt-[50px]">

			{/* Banner */}
			<div className="max-w-[1600px] mx-auto px-8 pt-10 mt-[50px]">
				<div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.05)] overflow-hidden relative">
					<div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
					<div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
						<div className="space-y-4">
							<nav className="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-slate-600">
								<a href="/" className="hover:text-black transition-colors">Atelier</a>
								<span className="w-1 h-1 rounded-full bg-slate-300" />
								<span className="text-black">Collection 2025</span>
							</nav>
							<h1 className="text-7xl font-serif font-medium tracking-tight leading-[0.9]">
								The <span className="italic text-slate-600">Essential</span> Edit
							</h1>
							<p className="text-slate-600 max-w-lg text-lg font-light leading-relaxed">
								A meticulously curated selection of timeless pieces, designed for the discerning individual who appreciates subtle luxury.
							</p>
						</div>
						<div className="flex items-center gap-4 bg-white/80 p-2 rounded-2xl shadow-sm border border-slate-100">
							<button
								onClick={() => setIsSidebarOpen(!isSidebarOpen)}
								className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95"
							>
								<AdjustmentsIcon className="w-4 h-4" />
								{isSidebarOpen ? 'Hide Filters' : 'Show Filters'}
							</button>
							<div className="h-8 w-px bg-slate-200 mx-2" />
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="bg-transparent text-xs font-black uppercase tracking-widest outline-none cursor-pointer px-4 appearance-none"
							>
								<option value="newest text-black">Newest Arrivals</option>
								<option value="price-low text-black">Price Low to High</option>
								<option value="price-high text-black">Price High to Low</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-[1600px] mx-auto px-8 py-16 flex gap-16 items-start">

				{/* Sidebar */}
				<aside className={`sticky top-10 transition-all duration-700 overflow-hidden ${isSidebarOpen ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-10'}`}>
					<div className="space-y-12">
						<div className="space-y-6">
							<h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-4">
								Category
								<div className="flex-1 h-px bg-slate-100" />
							</h3>
							<div className="flex flex-wrap gap-2">
								{categories.map(cat => (
									<button
										key={cat._id}
										onClick={() => {
											if (selectedCategories.includes(cat.name)) setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
											else setSelectedCategories([...selectedCategories, cat.name]);
										}}
										className={`px-5 py-2.5 rounded-full text-[11px] font-bold border transition-all duration-300 ${selectedCategories.includes(cat.name)
											? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105'
											: 'bg-white border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900'
											}`}
									>
										{cat.name}
									</button>
								))}
							</div>
						</div>

						{/* Price */}
						<div className="space-y-6">
							<h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-4">
								Price Cap
								<div className="flex-1 h-px bg-slate-100" />
							</h3>
							<div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
								<input
									type="range"
									min="0" max="2500" step="100"
									className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
									onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
								/>
								<div className="flex justify-between items-center">
									<span className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Limit</span>
									<span className="text-xl font-serif italic">${priceRange[1]}</span>
								</div>
							</div>
						</div>

						{/*Size */}
						<div className="space-y-6">
							<h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-4">
								Size
								<div className="flex-1 h-px bg-slate-100" />
							</h3>
							<div className="grid grid-cols-4 gap-2">
								{['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS'].map(size => (
									<button
										key={size}
										onClick={() => {
											if (selectedSizes.includes(size)) setSelectedSizes(selectedSizes.filter(s => s !== size));
											else setSelectedSizes([...selectedSizes, size]);
										}}
										className={`h-12 flex items-center justify-center rounded-xl text-[12px] font-black border transition-all ${selectedSizes.includes(size)
											? 'bg-slate-900 border-slate-900 text-white'
											: 'bg-white border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900'
											}`}
									>
										{size}
									</button>
								))}
							</div>
						</div>

						{/* Stock */}
						<label className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 cursor-pointer group">
							<span className="text-[11px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900 transition-colors">Available Only</span>
							<div className="relative">
								<input
									type="checkbox"
									className="peer hidden"
									checked={inStockOnly}
									onChange={(e) => setInStockOnly(e.target.checked)}
								/>
								<div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-slate-900 transition-colors duration-500" />
								<div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform duration-500" />
							</div>
						</label>
					</div>
				</aside>

				{/* Product Grid */}
				<main className="flex-1">
					{isLoading ? (
						<div className={`grid grid-cols-1 md:grid-cols-2 ${isSidebarOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-10`}>
							{[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
						</div>
					) : filteredProducts.length > 0 ? (
						<div className={`grid grid-cols-1 md:grid-cols-2 ${isSidebarOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-x-10 gap-y-20 transition-all duration-700 ease-in-out`}>
							{filteredProducts.map(product => (
								<ProductCard
									key={product._id}
									product={product}
									onClick={() => navigate(`/product-list/${product._id}`, { state: { product } })}
								/>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-40 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
							<SearchIcon className="w-16 h-16 text-slate-200 mb-6" />
							<h2 className="text-3xl font-serif italic text-slate-600 mb-2">No matching pieces</h2>
							<p className="text-slate-600 text-sm font-medium tracking-wide">Adjust your filters to discover our collection.</p>
							<button
								onClick={() => { setSelectedCategories([]); setPriceRange([0, 2500]); setInStockOnly(false); }}
								className="mt-8 px-8 py-3 bg-white border border-slate-200 rounded-full text-[12px] font-black uppercase tracking-widest hover:border-slate-900 transition-all"
							>
								Clear all filters
							</button>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}

// Sub-components
function ProductCard({ product, onClick }) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className="group flex flex-col cursor-pointer"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onClick}
		>
			<div className="relative aspect-[4/5] overflow-hidden bg-[#F3F3F1] rounded-[2rem] transition-all duration-700 group-hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)]">
				<img
					src={Array.isArray(product.image) ? product.image[0] : product.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600&h=800'}
					alt={product.name}
					className={`w-full h-full object-cover transition-all duration-[1.5s] ease-out ${isHovered ? 'scale-110 blur-[2px]' : 'scale-100'}`}
				/>

				{/* Wishlist Button */}
				<button className="absolute top-6 right-6 p-3 bg-white/60 backdrop-blur-md rounded-full border border-white/40 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 hover:bg-white">
					<HeartIcon className="w-4 h-4 text-slate-900" />
				</button>

				{/* Quick Add Overlay */}
				<div className={`absolute inset-x-6 bottom-6 transition-all duration-700 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
					<button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all">
						Quick Add — ${product.price}
					</button>
				</div>

				{/* Badges */}
				{product.quantity < 10 && product.quantity > 0 && (
					<div className="absolute top-6 left-6 px-3 py-1 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-full">
						<span className="text-[9px] font-black text-red-600 uppercase tracking-widest italic">Rare Find</span>
					</div>
				)}
			</div>

			<div className="mt-8 space-y-3 px-2">
				<div className="flex justify-between items-start">
					<div className="space-y-1">
						<span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Atelier Collection</span>
						<h3 className="text-lg font-serif font-medium leading-tight group-hover:text-slate-600 transition-colors">{product.name}</h3>
					</div>
					<div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
						<StarIcon className="w-2.5 h-2.5 text-yellow-500" />
						<span className="text-[12px] font-black text-slate-600 italic">4.9</span>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<span className="text-xl font-light tracking-tight text-slate-900">${product.price}</span>
					<div className="flex -space-x-1.5">
						{[1, 2].map(i => (
							<div key={i} className="w-3 h-3 rounded-full border-2 border-white bg-slate-200 shadow-sm" />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function SkeletonCard() {
	return (
		<div className="animate-pulse flex flex-col space-y-6">
			<div className="aspect-[4/5] bg-slate-100 rounded-[2rem]" />
			<div className="space-y-4">
				<div className="h-2 w-24 bg-slate-100 rounded-full" />
				<div className="h-6 w-full bg-slate-100 rounded-xl" />
				<div className="h-4 w-32 bg-slate-100 rounded-lg" />
			</div>
		</div>
	);
}

// Icons
const AdjustmentsIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M3 4h13M3 8h9M3 12h5m0 0v-2m0 2v2M12 8V6m0 2v2m4-6V2m0 2v2M3 16h18M3 20h13" /></svg>;
const HeartIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>;
const StarIcon = (props) => <svg {...props} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const SearchIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>;