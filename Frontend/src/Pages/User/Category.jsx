import React from 'react';
import women from '../../Images/womencat.png';
import men from '../../Images/mencat.png';
import kids from '../../Images/kidcat.png';
import summer from '../../Images/summercat.png';
import trend from '../../Images/trendingcat.png';
import old from '../../Images/oldcat.png';
import traditional from '../../Images/traditionalcat.png';
import western from '../../Images/westerncat.png';
export default function Category() {

	const categories = [
		{
			img: women,
			title: "Women's Collection",
			desc: "Discover modern styles designed for ultimate comfort and breathability.",
			btn: "Shop Now"
		},
		{
			img: men,
			title: "Men's Collection",
			desc: "Discover modern styles designed for ultimate comfort and breathability.",
			btn: "Shop Now"
		},
		{
			img: kids,
			title: "Kids Collection",
			desc: "Discover modern styles designed for ultimate comfort and breathability.",
			btn: "Shop Now"
		},
		{
			img: summer,
			title: "Summer Collection",
			desc: "Discover modern styles designed for ultimate comfort and breathability.",
			btn: "Shop Now"
		},
		{
			img: trend,
			title: "Trending Collection",
			desc: "Discover modern styles designed for ultimate comfort and breathability.",
			btn: "Shop Now"
		},
		{
			img: old,
			title: "Old Collection",
			desc: "Discover modern styles designed for ultimate comfort and breathability.",
			btn: "Shop Now"
		},
		{
			img: traditional,
			title: "Traditional Collection",
			desc: "Discover modern styles designed for ultimate comfort and breathability.",
			btn: "Shop Now"
		},
		{
			img: western,
			title: "Western Collection",
			desc: "Discover modern styles designed for ultimate comfort and breathability.",
			btn: "Shop Now"
		}

	]
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