import React from 'react';
import best from '../Images/best.png';
import women from '../Images/women.png';
import Banner from './Banner';
import Category from './Category';
function Home() {
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
	return (
		<div className='mt-[90px]'>
			<Banner />
			<Category />

			{/* Sub-Banner Section */}
			<div className="max-w-7xl mx-auto px-6 py-28 flex flex-col lg:flex-row items-center gap-20">
				{/* Left */}
				<div className="relative w-fit group">
					<div className="overflow-hidden rounded-md shadow-[0_30px_80px_-20px_rgba(0,0,0,0.2)]">
						<img 
							src={best} 
							alt="Premium Collection" 
							className="h-[300px] md:h-[450px] w-fit object-cover transition-transform duration-[1500ms] group-hover:scale-105" 
						/>
					</div>
					
					{/* Overlapping*/}
					<div className="absolute -bottom-0 -right-8 bg-white/90 backdrop-blur-xl p-4 rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 max-w-[260px] transform transition-all duration-700 hover:-translate-y-3">
						<h3 className="text-xl font-black text-gray-900 mb-2 tracking-tighter">Est. 2012</h3>
						<p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] leading-loose">
							A decade of redefining the silhouette of modern luxury.
						</p>
					</div>
				</div>

				{/* Right */}
				<div className="w-full lg:w-1/2 space-y-10 ms-5">
					<div className="space-y-5">
						<span className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em] block animate-pulse">
							THE RIVORA PHILOSOPHY
						</span>
						<h2 className="text-xl md:text-3xl font-black text-gray-900 leading-[1.05] tracking-tight">
							Crafting <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">Permanence</span> in a Transient World.
						</h2>
					</div>
					
					<p className="text-gray-500 text-md font-medium leading-relaxed max-w-xl">
						Rivora is more than a boutique—it is a sanctuary of style. We believe garments should tell a story of intentionality, utilizing sustainable fibers and timeless draping that reject the cycle of fast fashion.
					</p>

					<div className="space-y-6 pt-2">
						<div className="flex items-center gap-6 group/feature">
							<div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 transition-all duration-500 group-hover/feature:bg-blue-600 group-hover/feature:text-white group-hover/feature:rotate-6">
								<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
							</div>
							<span className="text-gray-800 font-extrabold text-lg md:text-xl tracking-tight">Sustainably sourced natural fibers</span>
						</div>
						
						<div className="flex items-center gap-6 group/feature">
							<div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 transition-all duration-500 group-hover/feature:bg-blue-600 group-hover/feature:text-white group-hover/feature:-rotate-6">
								<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
							</div>
							<span className="text-gray-800 font-extrabold text-lg md:text-xl tracking-tight">Bespoke lifetime fit guarantee</span>
						</div>
					</div>

					<div className="pt-6">
						<button className="group flex items-center gap-4 text-blue-600 font-black text-lg md:text-xl uppercase tracking-[0.2em] hover:gap-6 transition-all duration-500 underline underline-offset-8">
							Discover Our Process 
							<span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
						</button>
					</div>
				</div>
			</div>

			{/* Customer Reviews */}
			<div className="bg-[#fcfcfc] py-24 px-4 overflow-hidden">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-20 animate-fade-in">
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
								className="group relative flex flex-col p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-2"
							>
								{/* Star Rating */}
								<div className="flex gap-1 mb-8">
									{[...Array(item.stars)].map((_, i) => (
										<svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>

								{/* Review Text */}
								<p className="text-gray-600 text-lg leading-relaxed mb-10 italic font-medium relative z-10">
									"{item.review}"
								</p>

								{/* User */}
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