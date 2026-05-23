import React from "react";
import { Bell, Check, Trash2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";

export default function Notification() {
    const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotification();

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 mt-20">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-neutral-200 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                                <Bell size={24} />
                            </div>
                            <h1 className="text-2xl font-semibold text-neutral-900">Notifications</h1>
                        </div>
                        {notifications.length > 0 && (
                            <div className="flex gap-3">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    Mark all as read
                                </button>
                                <button
                                    onClick={clearNotifications}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
                                >
                                    <Trash2 size={16} /> Clear
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="divide-y divide-neutral-100">
                        <AnimatePresence>
                            {notifications.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-12 text-center text-neutral-500"
                                >
                                    <Bell size={48} className="mx-auto mb-4 text-neutral-300 opacity-50" />
                                    <p className="text-lg font-medium text-neutral-700">No notifications yet</p>
                                    <p className="text-sm mt-1">When you get notifications, they'll show up here.</p>
                                </motion.div>
                            ) : (
                                notifications.map((notif) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className={`p-6 transition-colors hover:bg-neutral-50 flex items-start gap-4 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${!notif.read ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-base ${!notif.read ? 'text-neutral-900 font-medium' : 'text-neutral-700'}`}>
                                                {notif.message}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                                                <Clock size={14} />
                                                <span>{new Date(notif.date).toLocaleString(undefined, {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}</span>
                                            </div>
                                        </div>
                                        {!notif.read && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="flex-shrink-0 p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                                title="Mark as read"
                                            >
                                                <Check size={18} />
                                            </button>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
