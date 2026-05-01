import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
	Home,
	RefreshCcw,
	ServerCrash,
	AlertCircle,
	FileQuestion,
	ArrowLeft,
	PackageSearch,
} from "lucide-react";

/* -------------------- ANIMATIONS -------------------- */

const containerVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 10 },
	visible: { opacity: 1, y: 0 },
};

/* -------------------- 404 NOT FOUND -------------------- */

export function NotFound404() {
	const navigate = useNavigate();

	return (
		<div className="min-h-[70vh] flex items-center justify-center px-6 pt-[100px] pb-20">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-2xl w-full text-center"
			>
				<motion.div variants={itemVariants} className="relative mb-8">
					<div className="text-[150px] md:text-[200px] font-black text-gray-100 leading-none select-none">
						404
					</div>
					<div className="absolute inset-0 flex items-center justify-center">
						<motion.div
							animate={{ rotate: [0, 10, -10, 0] }}
							transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
						>
							<FileQuestion className="w-24 h-24 text-blue-600" />
						</motion.div>
					</div>
				</motion.div>

				<motion.h1
					variants={itemVariants}
					className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tighter"
				>
					Beyond the Collection.
				</motion.h1>


				<motion.p
					variants={itemVariants}
					className="text-gray-500 text-lg mb-10 max-w-md mx-auto font-medium"
				>
					The page you're looking for has drifted beyond our current collection.
					Let's get you back to where style begins.
				</motion.p>

				<motion.div
					variants={itemVariants}
					className="flex flex-col sm:flex-row items-center justify-center gap-4"
				>
					<button
						onClick={() => navigate("/")}
						className="group flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 active:scale-95 shadow-xl shadow-gray-200"
					>
						<Home className="w-5 h-5" />
						Return Home
					</button>
					<button
						onClick={() => navigate(-1)}
						className="flex items-center gap-3 bg-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all duration-300 active:scale-95"
					>
						<ArrowLeft className="w-5 h-5" />
						Go Back
					</button>
				</motion.div>
			</motion.div>
		</div>
	);
}

/* --------------------400 BAD REQUEST -------------------- */

export default function BadRequest400() {
	const navigate = useNavigate();

	return (
		<div className="min-h-[70vh] flex items-center justify-center px-6 pt-[100px] pb-20">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-2xl w-full text-center"
			>
				<motion.div variants={itemVariants} className="mb-8">
					<div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-100/50">
						<AlertCircle className="w-12 h-12" />
					</div>
					<h1 className="text-8xl font-black text-gray-100 leading-none mb-2">
						400
					</h1>
				</motion.div>

				<motion.h2
					variants={itemVariants}
					className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tighter"
				>
					Something's Not Right.
				</motion.h2>

				<motion.p
					variants={itemVariants}
					className="text-gray-500 text-lg mb-10 max-w-md mx-auto font-medium"
				>
					The request seems a bit out of place. It might be a broken link or an
					expired session. Let's try again from the start.
				</motion.p>

				<motion.div variants={itemVariants} className="space-y-6">
					{/* <div className="relative max-w-sm mx-auto">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder="Search Rivora..."
							className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-blue-600 transition-all outline-none"
						/>
					</div> */}

					<button
						onClick={() => navigate("/")}
						className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 active:scale-95 shadow-xl shadow-gray-200"
					>
						Back to Homepage
					</button>
				</motion.div>
			</motion.div>
		</div>
	);
}

/* --------------------  500 INTERNAL ERROR -------------------- */

export function InternalServer500() {
	const handleReload = () => window.location.reload();

	return (
		<div className="min-h-[70vh] flex items-center justify-center px-6 pt-[100px] pb-20">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-2xl w-full text-center"
			>
				<motion.div variants={itemVariants} className="mb-8">
					<motion.div
						animate={{
							scale: [1, 1.05, 1],
							opacity: [1, 0.8, 1],
						}}
						transition={{ repeat: Infinity, duration: 3 }}
						className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6"
					>
						<ServerCrash className="w-12 h-12" />
					</motion.div>
					<h1 className="text-8xl font-black text-gray-100 leading-none">
						500
					</h1>
				</motion.div>

				<motion.h2
					variants={itemVariants}
					className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tighter"
				>
					Maintenance in Progress.
				</motion.h2>

				<motion.p
					variants={itemVariants}
					className="text-gray-500 text-lg mb-10 max-w-md mx-auto font-medium"
				>
					Our servers are currently undergoing a style update. We'll be back
					momentarily to serve your needs.
				</motion.p>

				<motion.div
					variants={itemVariants}
					className="flex flex-col sm:flex-row items-center justify-center gap-4"
				>
					<button
						onClick={handleReload}
						className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all duration-300 active:scale-95 shadow-xl shadow-blue-100"
					>
						<RefreshCcw className="w-5 h-5" />
						Retry Page
					</button>
					<Link
						to="/"
						className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all duration-300 active:scale-95"
					>
						Back Home
					</Link>
				</motion.div>
			</motion.div>
		</div>
	);
}

/* --------------------  NO SEARCH RESULTS -------------------- */

export function NoSearchResults({ query = "" }) {
	return (
		<div className="min-h-[60vh] flex items-center justify-center px-6 pt-[100px] pb-20">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-2xl w-full text-center"
			>
				<motion.div variants={itemVariants} className="mb-8">
					<div className="w-24 h-24 bg-gray-50 text-gray-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
						<PackageSearch className="w-12 h-12" />
					</div>
				</motion.div>

				<motion.h2
					variants={itemVariants}
					className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tighter"
				>
					{query ? `No results for "${query}"` : "Nothing found here."}
				</motion.h2>

				<motion.p
					variants={itemVariants}
					className="text-gray-500 text-lg mb-10 max-w-md mx-auto font-medium"
				>
					We couldn't find any matches in our current collection. Try adjusting
					your search terms or exploring our new arrivals.
				</motion.p>

				<motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3">
					<Link
						to="/product-list"
						className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 active:scale-95"
					>
						Browse All
					</Link>
					<Link
						to="/"
						className="bg-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all duration-300 active:scale-95"
					>
						Latest Drops
					</Link>
				</motion.div>
			</motion.div>
		</div>
	);
}