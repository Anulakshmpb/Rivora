import React, { useState, useEffect } from 'react';
import adminService from '../../api/adminService';
import { useToast } from '../../Toast/ToastContext';
import SideBar from './Layouts/SideBar';
import Loader from '../../Components/Loader';

export default function CustomerMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const { showToast } = useToast();

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await adminService.getMessages();
            setMessages(data.messages);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            showToast('Failed to load messages', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (messageId) => {
        try {
            await adminService.markMessageAsRead(messageId);
            setMessages(messages.map(msg => 
                msg._id === messageId ? { ...msg, isRead: true } : msg
            ));
            showToast('Message marked as read', 'success');
        } catch (error) {
            console.error('Failed to mark message as read:', error);
            showToast('Failed to update message', 'error');
        }
    };

    const handleReplyClick = (msg) => {
        setSelectedMessage(msg);
        setReplyText('');
        setReplyModalOpen(true);
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setIsReplying(true);
        try {
            await adminService.replyMessage(selectedMessage._id, replyText);
            
            if (!selectedMessage.isRead) {
                setMessages(messages.map(msg => 
                    msg._id === selectedMessage._id ? { ...msg, isRead: true } : msg
                ));
            }
            
            showToast('Reply sent successfully', 'success');
            setReplyModalOpen(false);
            setSelectedMessage(null);
        } catch (error) {
            console.error('Failed to send reply:', error);
            showToast('Failed to send reply', 'error');
        } finally {
            setIsReplying(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-inter">
            <SideBar />
            
            <main className="flex-1 lg:ml-72 p-8 h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Messages</h1>
                        <p className="text-slate-500 font-medium mt-2">View and manage messages sent from the contact form</p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader size="sm" variant="admin" text="Fetching messages..." />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                No messages found.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map((msg) => (
                                    <div 
                                        key={msg._id} 
                                        className={`p-6 rounded-2xl border transition-all ${
                                            msg.isRead 
                                                ? 'bg-slate-50 border-slate-200' 
                                                : 'bg-indigo-50/30 border-indigo-100 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-slate-900">{msg.name}</h3>
                                                    {!msg.isRead && (
                                                        <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">New</span>
                                                    )}
                                                </div>
                                                <a href={`mailto:${msg.email}`} className="text-indigo-600 font-medium hover:underline text-sm">{msg.email}</a>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                                <button 
                                                    onClick={() => handleReplyClick(msg)}
                                                    className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                                                >
                                                    Reply
                                                </button>
                                                {!msg.isRead && (
                                                    <button 
                                                        onClick={() => handleMarkAsRead(msg._id)}
                                                        className="text-emerald-600 font-bold hover:text-emerald-900 transition-colors"
                                                    >
                                                        Mark as Read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-slate-200/60">
                                            <h4 className="text-sm font-bold text-slate-900 mb-2">Subject: {msg.subject}</h4>
                                            <p className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Reply Modal */}
            {replyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-900">Reply to Message</h2>
                                <button 
                                    onClick={() => setReplyModalOpen(false)}
                                    className="p-2 text-slate-500 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            
                            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-sm font-bold text-slate-900 mb-1">Replying to: {selectedMessage?.name} ({selectedMessage?.email})</p>
                                <p className="text-xs text-slate-500">Subject: Re: {selectedMessage?.subject}</p>
                            </div>

                            <form onSubmit={handleReplySubmit}>
                                <div className="space-y-2 mb-6">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Your Reply</label>
                                    <textarea 
                                        rows="6" 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        required 
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 resize-none" 
                                        placeholder="Type your reply here..."
                                    ></textarea>
                                </div>
                                
                                <div className="flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setReplyModalOpen(false)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isReplying}
                                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isReplying ? <Loader size="xs" variant="white" inline text="Sending..." /> : 'Send Reply'}
                                        {!isReplying && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
