import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { motion } from "framer-motion";
import { useToast } from "../../Toast/ToastContext";
import Loader from '../../Components/Loader';

export default function Contact() {
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await axiosInstance.get('/api/contact');
                if (res.data?.contact) {
                    setContact(res.data.contact);
                }
            } catch (err) {
                console.error('Failed to fetch contact info', err);
            } finally {
                setLoading(false);
            }
        };
        fetchContact();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axiosInstance.post('/api/messages', formData);
            showToast('Message sent successfully! We will get back to you soon.', 'success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            console.error('Failed to send message', err);
            showToast(err.response?.data?.message || 'Failed to send message. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader size="md" variant="user" text="Connecting..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-inter overflow-hidden pt-20">
            {/* Hero Section */}
            <section className="relative py-12 sm:py-24 bg-slate-50">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <motion.span 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-indigo-600 text-[12px] font-black uppercase tracking-[0.4em] block mb-4"
                    >
                        Connect With Us
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8"
                    >
                        We're Here to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 shadow-sm">Help.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
                    >
                        Have a question about our collections or need assistance with an order? Our team is dedicated to providing you with a seamless experience.
                    </motion.p>
                </div>
            </section>

            {/* Contact Grid */}
            <section className="py-10 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
                    {/* Contact Info Cards */}
                    <div className="space-y-8 sm:space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className="p-6 sm:p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group transition-all duration-500"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Email Us</h3>
                                <p className="text-slate-500 font-medium mb-4">Our support team is here for you.</p>
                                <a href={`mailto:${contact?.email}`} className="text-indigo-600 font-bold hover:underline">{contact?.email}</a>
                            </motion.div>

                            <motion.div 
                                whileHover={{ y: -5 }}
                                className="p-6 sm:p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group transition-all duration-500"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Call Us</h3>
                                <p className="text-slate-500 font-medium mb-4">Mon-Fri from 9am to 6pm.</p>
                                <a href={`tel:${contact?.phone}`} className="text-indigo-600 font-bold hover:underline">{contact?.phone}</a>
                            </motion.div>
                        </div>

                        <div className="p-6 sm:p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <h3 className="text-3xl font-black mb-4 tracking-tight">Visit Our Boutique</h3>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8 max-w-md">
                                    {contact?.address}
                                </p>
                                <div className="flex gap-4">
                                    {contact?.socialLinks?.filter(s => s.url).map(social => {
                                        const icons = {
                                            instagram: (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                            ),
                                            facebook: (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                                            ),
                                            twitter: (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                                            ),
                                        };
                                        const icon = icons[social.platform.toLowerCase()];
                                        return (
                                            <a
                                                key={social.platform}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors"
                                            >
                                                {icon ?? <span className="text-xs font-black uppercase tracking-widest">{social.platform.charAt(0)}</span>}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-[3rem] p-6 sm:p-10 md:p-12 shadow-[0_30px_70px_rgba(0,0,0,0.06)] border border-slate-50 relative">
                        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Send a Message</h2>
                        <p className="text-slate-500 font-medium mb-10">We'll get back to you within 24 hours.</p>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300" placeholder="Enter Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300" placeholder="Enter Email" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300" placeholder="How can we help?" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                                <textarea rows="4" name="message" value={formData.message} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 resize-none" placeholder="Your message here..."></textarea>
                            </div>
                            <button disabled={isSubmitting} className="w-full py-5 bg-black text-white rounded-2xl text-sm font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? (
                                    <Loader size="xs" variant="white" inline text="Sending..." />
                                ) : (
                                    <>
                                        <span>Send Message</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Google Maps Embed */}
            {contact?.googleMapsUrl && (
                <section className="py-10 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
                    <div className="rounded-[3rem] overflow-hidden shadow-2xl h-[320px] sm:h-[500px] border-4 sm:border-8 border-white">
                        <iframe 
                            src={contact.googleMapsUrl}
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Rivora Boutique Location"
                        ></iframe>
                    </div>
                </section>
            )}
        </div>
    );
}