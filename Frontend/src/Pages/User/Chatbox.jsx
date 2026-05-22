import React, { useState, useRef, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { MessageSquareText, X, Send, Sparkles, CircleUserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatBox = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi there! 👋 I'm your shopping assistant. How can I help you today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, open]);

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userInput = message;
        setMessage("");

        // Add user message to history
        const newMessages = [...messages, { role: "user", content: userInput }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Send entire history (excluding initial greeting if needed, but it's fine to include)
            const res = await axiosInstance.post("/api/chatbox", {
                messages: newMessages.map(msg => ({ role: msg.role, content: msg.content }))
            });

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: res.reply },
            ]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Oops! I'm having trouble connecting right now. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 bg-neutral-900 text-white p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] z-50 flex items-center justify-center border border-neutral-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:bg-black transition-all"
            >
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <MessageSquareText size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 w-96 h-[32rem] bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col border border-neutral-200"
                    >
                        <div className="bg-neutral-900 text-white p-5 flex items-center gap-4 rounded-t-2xl relative overflow-hidden border-b border-neutral-800">
                            {/* Decorative minimalist pattern */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12"></div>
                            
                            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div className="z-10">
                                <h3 className="font-semibold tracking-wide text-base">Shopping Assistant</h3>
                                <p className="text-xs text-neutral-400 font-medium mt-0.5">Always here to help</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="ml-auto bg-white/5 hover:bg-white/20 p-2 rounded-full text-neutral-300 hover:text-white transition-all z-10">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-neutral-50/80">
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${msg.role === "user" ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"}`}>
                                        {msg.role === "user" ? <CircleUserRound size={18} /> : <Sparkles size={16} />}
                                    </div>
                                    
                                    {/* Message Bubble */}
                                    <div
                                        className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm ${
                                            msg.role === "user"
                                                ? "bg-neutral-900 text-white rounded-tr-sm"
                                                : "bg-white border border-neutral-200 text-neutral-800 rounded-tl-sm"
                                        }`}
                                    >
                                        {msg.content.split('\n').map((line, lIndex) => {
                                            if (!line.trim()) return null;
                                            const parts = line.split(/(\*\*.*?\*\*)/g);
                                            return (
                                                <p key={lIndex} className="mb-1.5 last:mb-0">
                                                    {parts.map((part, pIndex) => {
                                                        if (part.startsWith('**') && part.endsWith('**')) {
                                                            return <strong key={pIndex} className={msg.role === "user" ? "font-semibold text-white" : "font-semibold text-neutral-900"}>{part.slice(2, -2)}</strong>;
                                                        }
                                                        return <span key={pIndex}>{part}</span>;
                                                    })}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-9 h-9 rounded-full bg-white border border-neutral-200 text-neutral-900 flex items-center justify-center shadow-sm">
                                        <Sparkles size={16} />
                                    </div>
                                    <div className="bg-white border border-neutral-200 p-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center shadow-sm">
                                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-2 h-2 bg-neutral-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 h-2 bg-neutral-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2 h-2 bg-neutral-400 rounded-full" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-neutral-200">
                            <div className="relative flex items-center">
                                <input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-400 focus:ring-4 focus:ring-neutral-900/5 transition-all rounded-full pl-5 pr-14 py-3.5 text-sm outline-none text-neutral-800 placeholder-neutral-400 shadow-inner"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!message.trim() || isLoading}
                                    className="absolute right-1.5 p-2.5 bg-neutral-900 text-white rounded-full shadow-sm hover:bg-black disabled:opacity-40 disabled:hover:bg-neutral-900 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={18} className={message.trim() && !isLoading ? "translate-x-[-1px] translate-y-[1px]" : ""} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBox;