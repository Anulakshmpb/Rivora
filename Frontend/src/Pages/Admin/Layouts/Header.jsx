import React from 'react';

export default function Header ({ title = "System Overview", subtitle = "Monitoring Rivora infrastructure in real-time" }){

	return(
		<header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 lg:px-8 py-4 flex justify-between items-center">
			<div className="flex items-center gap-3">
				<button
					onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
					className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
					aria-label="Toggle Sidebar"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
				<div>
					<h1 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight">{title}</h1>
					<p className="text-slate-500 text-[10px] lg:text-xs font-medium">{subtitle}</p>
				</div>
			</div>
			<div className="flex items-center gap-4">
				<div className="hidden sm:flex flex-col items-end">
					<span className="text-sm font-bold text-slate-900">Administrator</span>
					<span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Now</span>
				</div>
				<div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
					<svg className="w-6 h-6 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
				</div>
			</div>
		</header>
	)
}