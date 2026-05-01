import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';

const ToastContext = createContext();

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within ToastProvider');
	}
	return context;
};

export const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);

	const showToast = useCallback((message, type = 'info') => {
		const id = Date.now();
		const newToast = { id, message, type };

		setToasts((prev) => [...prev, newToast]);

		// Auto-dismiss after 3 seconds
		setTimeout(() => {
			setToasts((prev) => prev.filter((toast) => toast.id !== id));
		}, 3000);
	}, []);

	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<div className="fixed top-[80px] right-5 z-[9999] flex flex-col gap-3 max-w-[400px] max-md:right-3 max-md:left-3 max-md:max-w-none">
				{toasts.map((toast) => (
					<Toast
						key={toast.id}
						id={toast.id}
						message={toast.message}
						type={toast.type}
						onClose={removeToast}
					/>
				))}
			</div>
		</ToastContext.Provider>
	);
};
