import React, { useState, useEffect } from 'react';
import Logo from '../../Images/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function NavBar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const { cartTotalItems } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/login');
        }
    };

    const SearchIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    );

    const UserIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    );

    const HeartIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5L12 21l7-7Z" /></svg>
    );

    const CartIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
    );

    const BellIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    );

    const MenuIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
    );

    const XIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    );

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Collections', href: '/product-list', hasBadge: 'New' },
        { name: 'About', href: '#' },
        { name: 'Contact', href: '#' },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 font-inter mb-[50px] ${isScrolled ? 'py-0' : 'py-4'
            }`}>
            <div className={`mx-auto transition-all duration-500 ${isScrolled
                ? 'max-w-full bg-white/80 backdrop-blur-2xl border-b border-gray-200/50 shadow-md px-10 py-3'
                : 'max-w-[2000px] bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-[1.5rem] mx-6 px-8 py-4'
                } flex justify-between items-center`}>
                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden text-gray-700 hover:text-black transition-colors"
                >
                    {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
                </button>

                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                    <img src={Logo} alt="LOGO" className="h-8 lg:h-10 w-auto object-contain cursor-pointer" />
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="relative group text-sm font-semibold text-gray-600 hover:text-black transition-colors tracking-wide"
                        >
                            {link.name}
                            {link.hasBadge && (
                                <span className="absolute -top-3 -right-7 bg-gray-400 text-[8px] text-black px-1 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                                    {link.hasBadge}
                                </span>
                            )}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 lg:gap-7">
                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex relative items-center">
                        <div className={`overflow-hidden transition-all duration-300 flex items-center ${isSearchOpen ? 'w-48 lg:w-64 opacity-100 mr-2' : 'w-0 opacity-0'}`}>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-gray-100 border-none rounded-full px-4 py-1.5 text-sm w-full focus:ring-1 focus:ring-black/10 outline-none"
                            />
                        </div>
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                        >
                            <SearchIcon />
                        </button>
                    </div>

                    <button onClick={() => navigate('/profile')}
                        className="hidden sm:block p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                        <UserIcon />
                    </button>

                    <button className="relative p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                        <HeartIcon />
                        <span className="absolute top-1 right-1 bg-black text-[8px] text-white w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                            0
                        </span>
                    </button>

                    <button onClick={() => navigate('/cart')} className="relative p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                        <CartIcon />
                        {cartTotalItems > 0 && (
                            <span className="absolute top-1 right-1 bg-black text-[8px] text-white w-4 h-4 flex items-center justify-center rounded-full border-2 border-white font-bold">
                                {cartTotalItems}
                            </span>
                        )}
                    </button>

                    <button className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                        <BellIcon />
                    </button>

                    {isAuthenticated ? (
                        <button onClick={handleLogout}
                            className="hidden lg:block ml-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors">
                            Logout
                        </button>
                    ) : (
                        <button onClick={() => navigate('/login')}
                            className="hidden lg:block ml-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                            Login
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[51] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Sidebar */}
            <div className={`fixed top-0 left-0 h-screen w-[280px] bg-white z-[52] shadow-2xl transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full p-8">
                    <div className="flex justify-between items-center mb-12">
                        <img src={Logo} alt="LOGO" className="h-8 w-auto" />
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                            <XIcon />
                        </button>
                    </div>
                    <div className="flex flex-col gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-2 flex justify-between items-center group"
                            >
                                {link.name}
                                <span className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">→</span>
                            </a>
                        ))}
                    </div>
                    <div className="mt-auto pt-8 border-t border-gray-100 space-y-6">
                        <button className="flex items-center gap-4 text-gray-700 font-semibold w-full text-left p-2 hover:bg-gray-50 rounded-xl transition-all">
                            <UserIcon /> Profile
                        </button>
                        {isAuthenticated ? (
                            <button onClick={handleLogout} className="flex items-center gap-4 text-red-600 font-bold w-full text-left p-2 hover:bg-red-50 rounded-xl transition-all">
                                Logout
                            </button>
                        ) : (
                            <button onClick={() => navigate('/login')} className="flex items-center gap-4 text-gray-700 font-bold w-full text-left p-2 hover:bg-gray-50 rounded-xl transition-all">
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}