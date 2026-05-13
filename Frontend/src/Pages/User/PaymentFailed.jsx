import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PaymentFailed() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FDFDFB] pt-32 pb-20 px-4 flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full bg-white rounded-[3rem] p-12 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.05)] border border-rose-50 text-center"
            >
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 shadow-inner">
                        <XCircleIcon className="w-10 h-10 text-rose-500" />
                    </div>
                </div>

                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-rose-500 mb-6 block">
                    Transaction Failed
                </span>

                <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-8">
                    Something went <br />
                    <span className="italic text-slate-500">incorrect.</span>
                </h1>

                <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12">
                    We were unable to process your payment. This could be due to insufficient funds, an expired card, or a temporary connection issue.
                </p>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-slate-900 text-white h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-black hover:-translate-y-1 transition-all active:scale-95"
                    >
                        Retry Payment
                    </button>
                    <button 
                        onClick={() => navigate('/cart')}
                        className="w-full bg-white text-slate-900 border border-slate-200 h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 transition-all"
                    >
                        Return to Bag
                    </button>
                </div>

                <div className="mt-12 pt-10 border-t border-slate-100">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-loose">
                        Need assistance? Our concierge is here to help. <br />
                        <span className="text-slate-900 cursor-pointer hover:underline">Contact Support</span> or call <span className="text-slate-900 font-black">1-800-RIVORA</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

const XCircleIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
