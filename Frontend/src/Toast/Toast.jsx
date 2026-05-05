import React from 'react';
import {
	CheckCircle2,
	AlertCircle,
	Info,
	AlertTriangle,
	X,
} from 'lucide-react';


const Toast = ({ id, message, type, onClose }) => {
	const typeConfig = {
		success: {
			icon: <CheckCircle2 size={20} />,
			borderClass: 'border-emerald-500',
			iconClass: 'text-emerald-500',
		},
		error: {
			icon: <AlertCircle size={20} />,
			borderClass: 'border-rose-500',
			iconClass: 'text-rose-500',
		},
		info: {
			icon: <Info size={20} />,
			borderClass: 'border-blue-500',
			iconClass: 'text-blue-500',
		},
		warning: {
			icon: <AlertTriangle size={20} />,
			borderClass: 'border-amber-500',
			iconClass: 'text-amber-500',
		},
	};

	const config = typeConfig[type] || typeConfig.info;

	return (
		<div className={`flex items-center gap-3 p-4 rounded-xl shadow-lg bg-white min-w-[300px] max-md:min-w-0 border-l-4 animate-in slide-in-from-right duration-300 ${config.borderClass}`}>
			<div className={`shrink-0 ${config.iconClass}`}>{config.icon}</div>
			<div className="flex-1 text-sm font-medium text-slate-800">{message}</div>
			<button className="bg-transparent p-1 text-slate-500 cursor-pointer flex items-center justify-center rounded transition-colors duration-200 hover:bg-slate-100" onClick={() => onClose(id)}>
				<X size={18} />
			</button>
		</div>
	);
};

export default Toast;
