import React from 'react';
import Forgot from '../Images/forgot.png';

const ForgotPW = () => {
	return (
		<div className="flex h-[calc(100vh-2.5rem)] w-[calc(100vw-2.5rem)] overflow-hidden font-inter m-5 rounded-3xl bg-white shadow-2xl">
			{/* Left Side */}
			<div className="relative hidden w-1/2 lg:flex flex-col h-full bg-gray-50 p-8 shadow-inner">
				<div className="relative flex-1 overflow-hidden rounded-2xl mb-6 shadow-lg">
					<img
						className="h-full w-full object-cover"
						src={Forgot}
						alt="Security & Access Hero"
					/>
					{/* Quote Overlay */}
					<div className="absolute inset-0 bg-black/10 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-12 text-white">
						<div className="space-y-2">
							<p className="text-4xl lg:text-2xl font-['Playfair_Display'] italic text-white leading-[1.1]">Elegance is <br />not being noticed, it's being remembered.</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl">
					<div className="space-y-4">
						<div>
							<p className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-1">Need Assistance?</p>
							<p className="text-xs text-gray-700 leading-snug">
								Our team is available 24/7 for account security, inquiries, and premium member support.
							</p>
						</div>
						<div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[11px] font-medium text-gray-600">
							<p>Email: <span className="text-blue-900 font-semibold">support@rivora.com</span></p>
							<p>Call: <span className="text-blue-900 font-semibold">+1 (123) 456-7890</span></p>
						</div>
					</div>
				</div>
			</div>

			{/* Right Side */}
			<div className="flex w-full flex-col items-center justify-center bg-white p-8 lg:w-1/2 overflow-y-auto">
				<div className="w-full max-w-md space-y-10">
					<div className="flex justify-end">
						<button className="text-xs font-medium tracking-wide text-gray-500 hover:text-black transition-all flex items-center gap-2">
							<span className="text-lg">←</span> RETURN TO COLLECTIONS
						</button>
					</div>

					<div className="space-y-2 text-center lg:text-left">
						<p className="text-xs font-bold uppercase tracking-widest text-gray-500">Security & Access</p>
						<h1 className="text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
							Restore Your Access
						</h1>
						<p className="text-gray-500 text-sm max-w-sm">
							Please enter the email address associated with your account to receive a secure reset link.
						</p>
					</div>

					<form className="space-y-6">
						<div className="space-y-2">
							<label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
								Email Address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								className="block w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:ring-0 transition-all outline-none shadow-sm"
								placeholder="name@example.com"
							/>
						</div>

						<button
							type="submit"
							className="w-full rounded-2xl bg-black py-4 text-sm font-bold text-white shadow-xl hover:translate-y-1 hover:shadow-2xl transition-all active:scale-[0.98] tracking-widest uppercase"
						>
							Request Reset Link
						</button>
					</form>

					<button className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-700 transition-all uppercase tracking-widest py-4">
						← Back to Login
					</button>
				</div>
			</div>
		</div>
	);
};

export default ForgotPW;
