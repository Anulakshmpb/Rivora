import React from 'react';
import best from '../../Images/best.png';
import Banner from './Banner';
import Category from './Category';
import axiosInstance from '../../api/axiosInstance';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
function Home() {
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();
	const scrollRef = useRef(null);
	const reviews = [
		{
			name: "Alen Kelvin",
			review: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt nulla sunt, reprehenderit aperiam aut molestias.",
			stars: 5,
		},
		{
			name: "Alen Kelvin",
			review: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt nulla sunt, reprehenderit aperiam aut molestias.",
			stars: 4,
		},
		{
			name: "Alen Kelvin",
			review: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt nulla sunt, reprehenderit aperiam aut molestias.",
			stars: 5,
		},
		{
			name: "Alen Kelvin",
			review: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt nulla sunt, reprehenderit aperiam aut molestias.",
			stars: 4,
		},
	]
	
		useEffect(() => {
			const fetchData = async () => {
				try {
					const [prodRes, catRes] = await Promise.all([
						axiosInstance.get('/api/products'),
						axiosInstance.get('/api/categories')
					]);
					
					if (prodRes.success) {
						setProducts(prodRes.data.products);
					}
					if (catRes.success) {
						setCategories(catRes.data.categories);
					}
				} catch (error) {
					console.error('Data fetch error:', error);
				} finally {
					setIsLoading(false);
				}
			};
			fetchData();
		}, []);
		

	return (
		<div className='mt-[90px]'>
			<Banner />
			<Category />

			{/* Trending Collections */}
			<section className="bg-white overflow-hidden ms-16 me-16">
				<div className="max-w-9xl mx-auto">
					<div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
						<div className="space-y-4">
							<span className="text-blue-600 text-[12px] font-black uppercase tracking-[0.6em] block">
								Curated Selection
							</span>
							<h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-[0.8] tracking-tighter">
								Trending <span className="text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-600 to-gray-400">Collections</span>
							</h2>
						</div>
						
						<div className="flex gap-4">
							<button 
								onClick={() => {
									if (scrollRef.current) scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
								}}
								className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center text-gray-900 hover:bg-black hover:text-white hover:border-black transition-all duration-500 group/btn"
							>
								<svg className="w-6 h-6 transform transition-transform group-hover/btn:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
								</svg>
							</button>
							<button 
								onClick={() => {
									if (scrollRef.current) scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
								}}
								className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center text-gray-900 hover:bg-black hover:text-white hover:border-black transition-all duration-500 group/btn"
							>
								<svg className="w-6 h-6 transform transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>
					</div>

					<div 
						ref={scrollRef}
						className="flex gap-10 overflow-x-auto pb-12 snap-x snap-mandatory no-scrollbar"
						style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
					>
						{products
							.filter(p => {
								const categoryName = Array.isArray(p.category) ? p.category[0] : p.category;
								return categoryName === 'Trending Collection' || categoryName?.name === 'Trending Collection';
							})
							.map((product) => (
								<div 
									key={product._id}
									onClick={() => navigate(`/product-list/${product._id}`, { state: { product } })}
									className="min-w-[320px] md:min-w-[400px] snap-start group cursor-pointer"
								>
									<div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] bg-gray-50 mb-8">
										<img 
											src={(() => {
												const imgPath = Array.isArray(product.image) ? product.image[0] : (product.image || '');
												if (!imgPath) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600&h=800';
												return imgPath.startsWith('http') || imgPath.startsWith('/uploads') 
													? (imgPath.startsWith('http') ? imgPath : `http://localhost:5000${imgPath}`) 
													: imgPath;
											})()}
											alt={product.name}
											className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
										/>
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700"></div>
										<div className="absolute bottom-8 left-8 right-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
											<button className="w-full py-4 bg-white/90 backdrop-blur-md text-gray-900 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl">
												View Details — ${product.price}
											</button>
										</div>
									</div>
									<div className="space-y-2 px-4">
										<div className="flex justify-between items-start">
											<h3 className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
												{product.name}
											</h3>
											<span className="text-xl font-medium text-gray-400">${product.price}</span>
										</div>
										<p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">
											{Array.isArray(product.category) ? product.category[0] : (product.category?.name || product.category)}
										</p>
									</div>
								</div>
						))}
						
						{/* Fallback */}
						{products.filter(p => {
							const categoryName = Array.isArray(p.category) ? p.category[0] : p.category;
							return categoryName === 'Trending Collection' || categoryName?.name === 'Trending Collection';
						}).length === 0 && products.slice(0, 5).map((product) => (
							<div 
								key={product._id}
								onClick={() => navigate(`/product-list/${product._id}`, { state: { product } })}
								className="min-w-[320px] md:min-w-[400px] snap-start group cursor-pointer"
							>
								<div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] bg-gray-50 mb-8">
									<img 
										src={(() => {
											const imgPath = Array.isArray(product.image) ? product.image[0] : (product.image || '');
											if (!imgPath) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600&h=800';
											return imgPath.startsWith('http') || imgPath.startsWith('/uploads') 
												? (imgPath.startsWith('http') ? imgPath : `http://localhost:5000${imgPath}`) 
												: imgPath;
										})()}
										alt={product.name}
										className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
									/>
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700"></div>
									<div className="absolute bottom-8 left-8 right-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
										<button className="w-full py-4 bg-white/90 backdrop-blur-md text-gray-900 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl">
											View Details — ${product.price}
										</button>
									</div>
								</div>
								<div className="space-y-2 px-4">
									<div className="flex justify-between items-start">
										<h3 className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
											{product.name}
										</h3>
										<span className="text-xl font-medium text-gray-400">${product.price}</span>
									</div>
									<p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">
										{Array.isArray(product.category) ? product.category[0] : (product.category?.name || product.category)}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
			{/* About Section */}
			<div id="about-section" className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
				<div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[120px] pointer-events-none"></div>

				{/* Left  */}
				<div className="relative w-full lg:w-1/2 flex justify-center group/visual">
					<div className="relative">
						<div className="overflow-hidden rounded-[4.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] group-hover/visual:shadow-[0_80px_150px_-20px_rgba(0,0,0,0.25)] transition-all duration-1000 border border-gray-100/50">
							<img
								src={best}
								alt="Premium Collection"
								className="h-[350px] md:h-[600px] w-full object-cover transition-transform duration-[3000ms] group-hover/visual:scale-110"
							/>
						</div>

						{/* Badge */}
						<div className="absolute -bottom-10 -right-10 glass p-10 rounded-[3rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] border border-white/60 max-w-[300px] transform transition-all duration-[1500ms]">
							<h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter italic leading-none">Est. 2026</h3>
							<p className="text-[12px] text-gray-500 font-black uppercase tracking-[0.25em] leading-relaxed">
								A decade of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-700 font-black">redefining</span> the silhouette of modern luxury.
							</p>
						</div>
						<div className="absolute -top-6 -left-6 w-24 h-24 border-t-2 border-l-2 border-blue-600/20 rounded-tl-[3rem] group-hover/visual:translate-x-4 group-hover/visual:translate-y-4 transition-transform duration-1000"></div>
					</div>
				</div>

				{/* Right  */}
				<div className="w-full lg:w-1/2 space-y-10 relative z-10 ms-5">
					<div className="space-y-6">
						<span className="logo-font text-blue-600 text-[12px] font-black tracking-[0.7em] block mb-2 px-3 py-1 bg-blue-50/50 w-fit rounded-full">
							THE RIVORA PHILOSOPHY
						</span>
						<h2 className="text-4xl md:text-7xl font-black text-gray-900 leading-[0.9] tracking-tighter">
							Crafting <span className="text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-700 to-gray-400">Permanence</span> in a Transient World.
						</h2>
					</div>

					<p className="text-gray-500 text-xl font-medium leading-relaxed max-w-xl group-hover:text-gray-600 transition-colors duration-700">
						Rivora is more than a boutique—it is a sanctuary of style. We believe garments should tell a story of intentionality, utilizing sustainable fibers and timeless draping that reject the cycle of fast fashion.
					</p>

					<div className="space-y-6 pt-2">
						<div className="flex items-center gap-10 group/feature cursor-default">
							<div className="w-20 h-20 rounded-[2rem] glass flex items-center justify-center text-blue-600 transition-all duration-700 shadow-2xl shadow-blue-50/30 group-hover/feature:bg-blue-600 group-hover/feature:text-white group-hover/feature:rotate-12">
								<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
								</svg>
							</div>
							<div>
								<span className="text-gray-900 font-black text-2xl tracking-tighter block mb-1">Naturally Sourced</span>
								<span className="text-gray-400 text-sm font-bold uppercase tracking-widest block group-hover/feature:text-blue-600 transition-colors">Premium Fibers</span>
							</div>
						</div>

						<div className="flex items-center gap-10 group/feature cursor-default">
							<div className="w-20 h-20 rounded-[2rem] glass flex items-center justify-center text-blue-600 transition-all duration-700 shadow-2xl shadow-blue-50/30 group-hover/feature:bg-blue-600 group-hover/feature:text-white group-hover/feature:-rotate-12">
								<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								</svg>
							</div>
							<div>
								<span className="text-gray-900 font-black text-2xl tracking-tighter block mb-1">Lifetime Excellence</span>
								<span className="text-gray-400 text-sm font-bold uppercase tracking-widest block group-hover/feature:text-blue-600 transition-colors">Bespoke Fit</span>
							</div>
						</div>
					</div>

					<div className="pt-8">
						<button className="group relative flex items-center gap-8 text-gray-900 font-black text-xl uppercase tracking-[0.4em] transition-all duration-[800ms] overflow-hidden py-4">
							<span className="relative z-10 group-hover:text-blue-600 transition-colors">Discover Our Process</span>
							<div className="relative flex items-center">
								<span className="w-14 h-0.5 bg-gray-900 group-hover:w-28 group-hover:bg-blue-600 transition-all duration-[800ms] rounded-full"></span>
								<span className="absolute right-0 group-hover:-right-4 opacity-0 group-hover:opacity-100 transition-all duration-[800ms] text-blue-600 italic">→</span>
							</div>
						</button>
					</div>
				</div>
			</div>

			<section className="relative py-16 overflow-hidden bg-[#fafafa]">
				<div
					className="absolute inset-0 opacity-[0.03] pointer-events-none"
					style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}
				></div>

				<div className="max-w-7xl mx-auto px-6 relative z-10">
					<div className="text-center mb-16">
						<span className="text-blue-600 text-[10px] sm:text-[12px] font-black uppercase tracking-[0.5em] block mb-6 px-4 py-1.5 bg-blue-50/50 w-fit mx-auto rounded-full backdrop-blur-sm">
							Global Standards
						</span>
						<h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-none tracking-tighter mb-8 max-w-4xl mx-auto">
							We've Got You <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-700 via-blue-500 to-indigo-400">Covered.</span>
						</h2>
						<div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
						<div className='group relative bg-white p-8 rounded-[3rem] border border-gray-100/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-4 cursor-default overflow-hidden'>
							<div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-50/30 rounded-full group-hover:scale-150 transition-transform duration-[1000ms] blur-3xl"></div>

							<div className='relative z-10'>
								<div className='w-24 h-24 rounded-[2.5rem] bg-white border border-gray-100 flex items-center justify-center mb-12 shadow-[0_20px_40px_-5px_rgba(59,130,246,0.1)] group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-700 relative'>
									<div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-700 rounded-[2.5rem]"></div>
									<svg className="w-12 h-12 text-blue-600 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 011 1v2a1 1 0 01-1 1h-1m-4-14l-2 2m2-2l2 2m7-2a2 2 0 11-4 0 2 2 0 014 0zM9 20a2 2 0 104 0 2 2 0 00-4 0z" />
									</svg>
								</div>
								<h3 className='font-black text-2xl text-gray-900 mb-5 tracking-tight uppercase italic'>Fast & Free</h3>
								<p className='text-gray-400 font-medium leading-relaxed group-hover:text-gray-600 transition-colors duration-500'>
									Complimentary white-glove delivery on all boutique orders exceeding <span className="text-blue-600 font-black">$799.</span>
								</p>
							</div>
						</div>

						<div className='group relative bg-white p-8 rounded-[3rem] border border-gray-100/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-4 cursor-default overflow-hidden'>
							<div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-50/30 rounded-full group-hover:scale-150 transition-transform duration-[1000ms] blur-3xl"></div>

							<div className='relative z-10'>
								<div className='w-24 h-24 rounded-[2.5rem] bg-white border border-gray-100 flex items-center justify-center mb-12 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:-rotate-[10deg] transition-all duration-700 relative'>
									<div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-5 transition-opacity duration-700 rounded-[2.5rem]"></div>
									<svg className="w-12 h-12 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
									</svg>
								</div>
								<h3 className='font-black text-2xl text-gray-900 mb-5 tracking-tight uppercase italic'>The Flagship</h3>
								<p className='text-gray-400 font-medium leading-relaxed group-hover:text-gray-600 transition-colors duration-500'>
									Explore an exclusive anthology of over <span className="text-gray-900 font-black">1000+</span> avant-garde styles in one iconic destination.
								</p>
							</div>
						</div>

						<div className='group relative bg-white p-8 rounded-[3rem] border border-gray-100/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-4 cursor-default overflow-hidden'>
							<div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-50/30 rounded-full group-hover:scale-150 transition-transform duration-[1000ms] blur-3xl"></div>

							<div className='relative z-10'>
								<div className='w-20 h-20 rounded-[2rem] bg-white border border-gray-100 flex items-center justify-center mb-8 shadow-[0_20px_40px_-5px_rgba(52,211,153,0.1)] group-hover:scale-110 group-hover:rotate-[20deg] transition-all duration-700 relative'>
									<div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-5 transition-opacity duration-700 rounded-[2.5rem]"></div>
									<svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
									</svg>
								</div>
								<h3 className='font-black text-2xl text-gray-900 mb-5 tracking-tight uppercase italic'>Seamless Return</h3>
								<p className='text-gray-400 font-medium leading-relaxed group-hover:text-gray-600 transition-colors duration-500'>
									Sophisticated multi-channel logistics. Shop with confidence and return with <span className="text-blue-400 font-black">absolute ease.</span>
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Customer Reviews */}
			<div className="bg-[#fcfcfc] py-16 px-4 overflow-hidden">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-12 animate-fade-in">
						<span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-4 block">Testimonials</span>
						<h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
							Customer Stories
						</h1>
						<div className="w-48 h-1 bg-gray-200 mx-auto rounded-full"></div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{reviews.map((item, index) => (
							<div
								key={index}
								className="group relative flex flex-col p-8 rounded-[2rem] bg-white border border-gray-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-2"
							>
								<div className="flex gap-1 mb-8">
									{[...Array(item.stars)].map((_, i) => (
										<svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>

								<p className="text-gray-600 text-lg leading-relaxed mb-6 italic font-medium relative z-10">
									"{item.review}"
								</p>

								<div className="mt-auto flex items-center gap-5">
									<div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white font-black text-xl uppercase shadow-lg group-hover:scale-110 transition-transform duration-300">
										{item.name.charAt(0)}
									</div>
									<div>
										<h4 className="font-bold text-gray-900 text-lg leading-none mb-1">{item.name}</h4>
										<span className="text-[10px] text-green-600 font-black uppercase tracking-widest flex items-center gap-1">
											<svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z" /></svg>
											Verified Buyer
										</span>
									</div>
								</div>

								<div className="absolute top-6 right-8 text-black opacity-[0.03] text-8xl font-serif pointer-events-none group-hover:opacity-10 transition-opacity duration-500">
									"
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;