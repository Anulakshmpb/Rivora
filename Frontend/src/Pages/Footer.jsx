import React from 'react';
import Logo from '../Images/logo.png';

const Footer = () => {
    // SVG Icons
    const InstagramIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
    );

    const FacebookIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
    );

    const TwitterIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
    );

    return (
        <footer className="footer bg-white text-gray-900 pt-8 border-t border-gray-100 font-inter">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 py-2 lg:gap-8 border-b border-gray-100">
                {/* Brand Section */}
                <div className="space-y-6">
                    <img src={Logo} alt="LOGO" className="h-10 w-auto object-contain" />
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                        Defining Luxury Through the lens of timeless elegance and modern sophistication. Modern fashion for modern life.
                    </p>
                    <div className="flex gap-4">
                        <button className="p-2 bg-gray-50 hover:bg-black hover:text-white rounded-full transition-all duration-300">
                            <InstagramIcon />
                        </button>
                        <button className="p-2 bg-gray-50 hover:bg-black hover:text-white rounded-full transition-all duration-300">
                            <FacebookIcon />
                        </button>
                        <button className="p-2 bg-gray-50 hover:bg-black hover:text-white rounded-full transition-all duration-300">
                            <TwitterIcon />
                        </button>
                    </div>
                </div>

                {/* Shop Categories */}
                <div className="space-y-6">
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Collections</h4>
                    <ul className="space-y-4">
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">New Arrivals</button></li>
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Best Sellers</button></li>
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Seasonal Edits</button></li>
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Men's Modern Style</button></li>
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Women's Collection</button></li>
                    </ul>
                </div>

                {/* Customer Support */}
                <div className="space-y-6">
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Customer Support</h4>
                    <ul className="space-y-4">
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Contact Us</button></li>
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Shipping & Delivery</button></li>
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Returns & Exchanges</button></li>
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Track Order</button></li>
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">FAQ</button></li>
                    </ul>
                </div>

                {/* Account & Info */}
                <div className="space-y-6">
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Account & Info</h4>
                    <ul className="space-y-4">
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">My Account</button></li>
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Sustainability</button></li>
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Our Story</button></li>
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Careers</button></li>
                        <li><button className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Store Locator</button></li>
                    </ul>
                </div>

                {/* Newsletter Section */}
                <div className="space-y-6">
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Newsletter</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Join our newsletter and receive 10% off your first order.
                    </p>
                    <div className="flex flex-col gap-3">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 text-sm focus:bg-white focus:border-black transition-all outline-none"
                        />
                        <button className="w-full bg-black text-white text-xs font-black uppercase tracking-widest py-4 rounded-xl hover:translate-y-[-2px] transition-all active:scale-[0.98]">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-[1440px] mx-auto px-3 lg:px-6 pt-5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2">
                    <p className="text-xs text-gray-400">© 2026. All rights reserved.</p>
                    <button className="text-xs text-gray-500 hover:text-black transition-colors">Privacy Policy</button>
                    <button className="text-xs text-gray-500 hover:text-black transition-colors">Terms of Service</button>
                    <button className="text-xs text-gray-500 hover:text-black transition-colors">Refund Policy</button>
                </div>
                
                <div className="flex items-center gap-4 grayscale opacity-100 hover:grayscale-0 transition-all duration-500">
                    <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Secure Checkout</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;