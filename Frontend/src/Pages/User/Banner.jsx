import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import best from '../../Images/best.png';
import women from '../../Images/womens.png';
import men from '../../Images/men.png';
import Season from '../../Images/season.png';
import summer from '../../Images/summer.png';
import trend from '../../Images/trending.png';
import kids from '../../Images/kids.png';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Banner = () => {
	const navigate = useNavigate();

	const banners = [
		{
			img: summer,
			title: "Summer Collection 2026",
			desc: "Discover modern styles designed for ultimate comfort and breathability.",
			btn: "Shop Now",
			category: "Summer Collections"
		},
		{
			img: trend,
			title: "Trending Fashion",
			desc: "Upgrade your wardrobe with the latest global trends and styles.",
			btn: "Explore",
			category: "Trending Collections"
		},
		{
			img: Season,
			title: "Premium Collection",
			desc: "Style that defines your unique personality and elegance.",
			btn: "View Collection",
			category: "Ethnic Wear"
		},
		{
			img: men,
			title: "Men's Essentials",
			desc: "Classic and contemporary pieces for every occasion.",
			btn: "Shop Men",
			category: "Men's Cllections"
		},
		{
			img: women,
			title: "Women's Elegance",
			desc: "Sophisticated designs that celebrate modern femininity.",
			btn: "Shop Women",
			category: "Women's Collections"
		},
		{
			img: best,
			title: "Best Sellers",
			desc: "Explore our most-loved pieces across all categories.",
			btn: "Shop All",
			category: ""
		},
		{
			img: kids,
			title: "Kids Collection",
			desc: "Discover the latest trends and styles for your little ones.",
			btn: "Shop Kids",
			category: "Kid's Collections"
		}
	];

	return (
		<div className="w-full h-[400px] md:h-[500px] bg-gray-100">
			<Swiper
				modules={[Navigation, Pagination, Autoplay]}
				navigation={true}
				pagination={{
					clickable: true,
					dynamicBullets: true
				}}
				autoplay={{
					delay: 5000,
					disableOnInteraction: false
				}}
				loop={true}
				className="h-full group"
			>
				{banners.map((item, index) => (
					<SwiperSlide key={index}>
						<div className="relative w-full h-full overflow-hidden">
							<img
								src={item.img}
								alt={item.title}
								className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-105"
							/>

							<div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
							<div className="absolute top-2/3 left-8 md:left-24 -translate-y-1/2 max-w-sm">
								<div className="backdrop-blur-md bg-white/10 p-4 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-1 transform transition-all duration-500 hover:bg-white/15">
									<h1 className="text-xl md:text-2xl font-bold text-white leading-tight tracking-tight">
										{item.title}
									</h1>

									<p className="text-base md:text-lg text-gray-100 leading-relaxed font-light">
										{item.desc}
									</p>

									<div className="pt-4">
										<button 
											onClick={() => {
												const path = item.category 
													? `/product-list?category=${encodeURIComponent(item.category)}` 
													: '/product-list';
												navigate(path);
											}}
											className="group relative overflow-hidden bg-white text-black px-6 py-2 rounded-full font-bold text-md hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300"
										>
											<span className="relative z-10 transition-colors duration-300 group-hover:text-white">
												{item.btn}
											</span>
											<div className="absolute inset-0 bg-black translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
										</button>
									</div>
								</div>
							</div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>

			<style jsx="true">{`

.swiper-button-next,
.swiper-button-prev{

width:40px !important;
height:40px !important;
border-radius:14px;
color:white !important;
opacity:0;
transform:translateY(-50%) scale(.8);
transition:all .35s cubic-bezier(.4,0,.2,1);

}

/* Show on hover */

.group:hover .swiper-button-next,
.group:hover .swiper-button-prev{

opacity:1;
transform:translateY(-50%) scale(1);

}

/* Arrow icon */

.swiper-button-next:after,
.swiper-button-prev:after{

font-size:14px !important;
font-weight:700;

}

/* Hover effect */

.swiper-button-next:hover,
.swiper-button-prev:hover{

transform:translateY(-50%) scale(1.08);
box-shadow:0 15px 35px rgba(0,0,0,0.25);

}

/* Position adjustment */

.swiper-button-prev{
left:25px !important;

}

.swiper-button-next{

right:25px !important;

}

/* Pagination */

.swiper-pagination-bullet{

width:10px;
height:10px;
background:rgba(255,255,255,.6) !important;
border-radius:20px;
transition:all .3s ease;

}

/* Active bullet */

.swiper-pagination-bullet-active{

width:30px;
background:white !important;
border-radius:20px;
box-shadow:0 5px 15px rgba(255,255,255,.5);

}

/* Bullet hover */

.swiper-pagination-bullet:hover{

background:white !important;
opacity:1;

}

`}</style>
		</div>
	);
};

export default Banner;