import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
export default function Category() {
	const [categories, setCategories] = useState([]);
	const [products, setProducts] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const [catRes, prodRes] = await Promise.all([
					axiosInstance.get("/api/categories"),
					axiosInstance.get("/api/products")
				]);

				const catData = catRes.data?.categories || catRes.categories || [];
				const mainCategories = catData
					.filter(cat => cat.main === true)
					.map(cat => ({
						...cat,
						title: cat.name,
						img: (() => {
							const imgPath = cat.images?.[0] || '';
							if (!imgPath) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600&h=800';
							return imgPath.startsWith('http') || imgPath.startsWith('/uploads') || imgPath.startsWith('data:') ? (imgPath.startsWith('http') || imgPath.startsWith('data:') ? imgPath : `http://localhost:5000${imgPath}`) : imgPath;
						})(),
					}));

				setCategories(mainCategories);
				if (prodRes.success || prodRes.data?.products) {
					setProducts(prodRes.data.products || prodRes.products);
				}
				if (mainCategories.length > 0 && !selectedCategory) {
					setSelectedCategory(mainCategories[0].name);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	const filteredProducts = products.filter(p => {
		if (!selectedCategory) return false;
				const getCatName = (cat) => {
			if (!cat) return null;
			if (typeof cat === 'string') return cat;
			if (typeof cat === 'object' && cat.name) return cat.name;
			return null;
		};

		if (Array.isArray(p.category)) {
			return p.category.some(cat => getCatName(cat) === selectedCategory);
		}
		
		return getCatName(p.category) === selectedCategory;
	});
	return (
		<div className="max-w-screen-4xl mx-auto px-6 py-16">
			<div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mb-20">
				{categories.map((item, index) => (
					<div
						key={index}
						onClick={() => setSelectedCategory(item.name)}
						className={`group flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ${selectedCategory === item.name ? 'scale-110' : 'opacity-89 hover:opacity-100'}`}
					>
						<div className={`relative overflow-hidden rounded-full mb-6 transition-all duration-700 ${selectedCategory === item.name ? 'ring-4 ring-black ring-offset-4 shadow-2xl' : 'shadow-sm group-hover:shadow-xl'}`}>
							<img
								className="h-20 w-20 md:h-32 md:w-32 object-cover transition-transform duration-700 group-hover:scale-105"
								src={item.img}
								alt={item.title}
							/>
							<div className={`absolute inset-0 bg-black/0 transition-colors duration-300 ${selectedCategory === item.name ? '' : 'group-hover:bg-black/5'}`}></div>
						</div>

						<h2 className={`text-xs font-bold uppercase tracking-[0.2em] text-center transition-colors duration-300 ${selectedCategory === item.name ? 'text-black' : 'text-gray-500 group-hover:text-black'}`}>
							{item.title}
						</h2>

						<div className={`h-0.5 bg-black mt-2 transition-all duration-500 rounded-full ${selectedCategory === item.name ? 'w-full' : 'w-0 group-hover:w-8'}`}></div>
					</div>
				))}
			</div>

			{/* Products Section */}
			<div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ms-16 me-16">
				<div className="flex items-center justify-between border-b border-gray-100 pb-8">
					<h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
						{selectedCategory}
					</h3>
					<span className="text-gray-500 font-bold text-xs uppercase tracking-widest">
						{filteredProducts.length} Pieces Found
					</span>
				</div>

				{isLoading ? (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
						{[1, 2, 3, 4].map(i => (
							<div key={i} className="animate-pulse space-y-4">
								<div className="aspect-[3/4] bg-gray-100 rounded-[2rem]"></div>
								<div className="h-4 bg-gray-100 rounded-full w-3/4 mx-auto"></div>
								<div className="h-3 bg-gray-100 rounded-full w-1/2 mx-auto"></div>
							</div>
						))}
					</div>
				) : filteredProducts.length > 0 ? (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
						{filteredProducts.map(product => (
							<div 
								key={product._id}
								onClick={() => navigate(`/product-list/${product._id}`, { state: { product } })}
								className="group cursor-pointer flex flex-col"
							>
								<div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-gray-50 mb-4 shadow-sm group-hover:shadow-2xl transition-all duration-700">
									<img 
										src={(() => {
											const imgPath = Array.isArray(product.image) ? product.image[0] : (product.image || '');
											if (!imgPath) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600&h=800';
											return imgPath.startsWith('http') || imgPath.startsWith('/uploads') 
												? (imgPath.startsWith('http') ? imgPath : `http://localhost:5000${imgPath}`) 
												: imgPath;
										})()}
										alt={product.name}
										className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-110"
									/>
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700"></div>
									<div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
										<button className="w-full py-3.5 bg-white/90 backdrop-blur-md text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
											Shop Now — ${product.price}
										</button>
									</div>
								</div>
								<div className="space-y-1 text-center px-4">
									<h4 className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
										{product.name}
									</h4>
									<p className="text-gray-500 font-medium">${product.price}</p>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="py-32 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
						<h4 className="text-2xl font-bold text-gray-500 italic">No pieces in this collection yet.</h4>
						<p className="text-gray-500 text-sm mt-2">Discover our other collections above.</p>
					</div>
				)}
			</div>
		</div>
	);
}