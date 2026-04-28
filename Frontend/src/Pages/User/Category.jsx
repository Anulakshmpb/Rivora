import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
export default function Category() {
	const [categories, setCategories] = useState([])
	useEffect(() => {
		const fetchCategory = async () => {
			try {
				const res = await axiosInstance.get("/api/categories")
				const data = res.data?.categories || res.categories || res.data?.data?.categories || []
				const mainCategories = data
					.filter(cat => cat.main === true)
					.map(cat => ({
						...cat,
						title: cat.name,
						img: cat.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600&h=800',
					}))

				console.log("Filtered Categories:", mainCategories)
				setCategories(mainCategories)
			} catch (error) {
				console.error("Error fetching categories:", error)
			}
		}
		fetchCategory()
	}, [])
	return (
		<div className="max-w-screen-3xl mx-auto px-2 py-10">
			<div className="flex flex-wrap items-center justify-center gap-2">
				{categories.map((item, index) => (
					<div
						key={index}
						className="group flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
					>
						{/* Image Container with Hover Effect */}
						<div className="relative overflow-hidden rounded-lg bg-gray-50 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
							<img
								className="h-[100px] w-[100px] md:h-[230px] md:w-[200px] object-cover transition-transform duration-700 group-hover:scale-105"
								src={item.img}
								alt={item.title}
							/>
							{/* Subtle Overlay on Hover */}
							<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
						</div>

						{/* Title */}
						<h2 className="text-sm md:text-md font-bold text-gray-700 text-center leading-tight group-hover:text-black tracking-tight transition-colors duration-300">
							{item.title}
						</h2>

						{/* Active Indicator Line */}
						<div className="w-0 h-0.5 bg-black mt-1 group-hover:w-full transition-all duration-300 rounded-full"></div>
					</div>
				))}
			</div>
		</div>
	);
}