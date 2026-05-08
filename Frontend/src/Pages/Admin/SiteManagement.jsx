import React from 'react';
import { Link } from 'react-router-dom';
import SideBar from './Layouts/SideBar';
import Header from './Layouts/Header';

const managementPages = [
    {
        title: 'Home Category',
        description: 'Manage hero banners, featured sections, and homepage layout',
        path: '/site/home-category',
        color: 'from-indigo-500 to-blue-600',
        bgLight: 'bg-indigo-50',
        textColor: 'text-indigo-600',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
    },
    {
        title: 'About',
        description: 'Edit company story, mission, team members, and values',
        path: '/site/about',
        color: 'from-violet-500 to-purple-600',
        bgLight: 'bg-violet-50',
        textColor: 'text-violet-600',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        title: 'Contact',
        description: 'Update contact info, social links, and support channels',
        path: '/site/contact',
        color: 'from-emerald-500 to-teal-600',
        bgLight: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        title: 'Coupons',
        description: 'Create and manage discount codes, promotions, and offers',
        path: '/site/coupons',
        color: 'from-amber-500 to-orange-600',
        bgLight: 'bg-amber-50',
        textColor: 'text-amber-600',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
        ),
    },
    {
        title: 'Reviews',
        description: 'Moderate customer reviews, ratings, and testimonials',
        path: '/site/reviews',
        color: 'from-rose-500 to-pink-600',
        bgLight: 'bg-rose-50',
        textColor: 'text-rose-600',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
    },
];

export default function SiteManagement() {
    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
            <SideBar />

            <main className="flex-1 lg:ml-72 bg-slate-50 min-h-screen">
                <Header title="Site Management" subtitle="Manage your website pages and content" />

                <div className="p-8 max-w-7xl mx-auto">
                    {/* Page Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {managementPages.map((page) => (
                            <Link
                                key={page.title}
                                to={page.path}
                                className="group relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgb(0,0,0,0.1)] hover:-translate-y-1"
                                style={{ textDecoration: 'none' }}
                            >
                                {/* Gradient accent bar */}
                                <div className={`h-1.5 bg-gradient-to-r ${page.color}`} />

                                <div className="p-6">
                                    {/* Icon & Arrow */}
                                    <div className="flex justify-between items-start mb-5">
                                        <div className={`p-3.5 rounded-2xl ${page.bgLight} ${page.textColor} group-hover:scale-110 transition-transform duration-300`}>
                                            {page.icon}
                                        </div>
                                        <div className="p-2 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all duration-300">
                                            <svg className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17L17 7M17 7H7M17 7v10" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1.5 group-hover:text-indigo-600 transition-colors duration-300">
                                        {page.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                        {page.description}
                                    </p>

                                    {/* Bottom label */}
                                    <div className="mt-5 pt-4 border-t border-slate-50">
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors duration-300">
                                            Manage →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}


