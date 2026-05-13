import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../Toast/ToastContext';
import { motion } from 'framer-motion';

const CreditCardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
);

const WalletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
);

const ArrowUpRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
);

const ArrowDownLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>
);

export default function ProfileWallet() {
    const [wallet, setWallet] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const res = await axiosInstance.get('/api/wallet');
                if (res.success) {
                    setWallet(res.data);
                }
            } catch (err) {
                console.error('Error fetching wallet:', err);
                showToast('Error', 'Failed to load wallet data', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchWallet();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-slate-500 mt-4 font-medium">Synchronizing Wallet...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Wallet Balance Card */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                {/* Background Patterns */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-12">
                        <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                            <WalletIcon />
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Rivora Credits</span>
                            <p className="text-xs font-medium text-slate-500 mt-1 italic">Exclusive Rewards Program</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <span className="text-sm font-medium text-slate-500">Available Balance</span>
                        <h2 className="text-6xl font-serif tracking-tighter">${wallet?.balance.toFixed(2)}</h2>
                    </div>
                    
                    <div className="mt-12 flex items-center gap-6">
                        <button className="bg-white text-slate-900 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">
                            Top Up Wallet
                        </button>
                        <button className="text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                            Redeem Vouchers <ArrowUpRightIcon />
                        </button>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-2xl font-serif font-medium">Transaction History</h3>
                        <p className="text-slate-500 text-sm mt-1">Recent activity and rewards</p>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">View All</button>
                </div>

                {wallet?.transactions.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <CreditCardIcon />
                        </div>
                        <p className="text-slate-500 text-sm font-medium italic">No transactions found in your history.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {wallet.transactions.slice().reverse().map((tx, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx} 
                                className="flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 border border-transparent hover:border-slate-100 rounded-3xl transition-all duration-500 group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-2xl ${tx.type === 'Credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} group-hover:scale-110 transition-transform duration-500`}>
                                        {tx.type === 'Credit' ? <ArrowDownLeftIcon /> : <ArrowUpRightIcon />}
                                    </div>
                                    <div>
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-900">{tx.description || 'Wallet Transaction'}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">
                                            {new Date(tx.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xl font-light tracking-tighter ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {tx.type === 'Credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                                    </span>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Completed</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
