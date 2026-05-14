import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Joi from 'joi';
import { useToast } from '../Toast/ToastContext';
import axiosInstance from '../api/axiosInstance';

const reviewSchema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 3 characters',
        'any.required': 'Name is required'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email',
        'any.required': 'Email is required'
    }),
    rating: Joi.number().min(1).max(5).required().messages({
        'number.min': 'Please select a rating',
        'any.required': 'Rating is required'
    }),
    review: Joi.string().min(10).max(500).required().messages({
        'string.empty': 'Review is required',
        'string.min': 'Review must be at least 10 characters',
        'string.max': 'Review cannot exceed 500 characters',
        'any.required': 'Review is required'
    }),
    img: Joi.any().optional()
});

const ReviewModal = ({ isOpen, onClose, productId = null, type = 'site' }) => {
    const [form, setForm] = useState({ name: '', email: '', rating: 0, review: '' });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleRating = (stars) => {
        setForm(prev => ({ ...prev, rating: stars }));
        if (errors.rating) {
            setErrors(prev => ({ ...prev, rating: '' }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { error } = reviewSchema.validate(form, { abortEarly: false });
        if (error) {
            const newErrors = {};
            error.details.forEach(detail => {
                newErrors[detail.path[0]] = detail.message;
            });
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('email', form.email);
            formData.append('rating', form.rating);
            formData.append('review', form.review);
            formData.append('type', type);
            if (productId) formData.append('productId', productId);
            if (image) formData.append('img', image);

            await axiosInstance.post('/api/reviews', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Thank you!', 'Your review has been submitted successfully.', 'success');
            setForm({ name: '', email: '', rating: 0, review: '' });
            setImage(null);
            setImagePreview(null);
            onClose();
        } catch (err) {
            showToast('Error', err.response?.data?.message || 'Failed to submit review', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden"
                    >
                        <div className="h-2 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 absolute top-0 left-0 right-0" />

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                                {type === 'site' ? 'Share Your Experience' : 'Review This Product'}
                            </h2>
                            <p className="text-slate-500 font-medium text-sm">
                                Your feedback helps us improve and helps others make better choices.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Your Rating</span>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-125 active:scale-95"
                                        >
                                            <svg
                                                className={`w-8 h-8 ${form.rating >= star ? 'text-yellow-400 fill-current shadow-yellow-200' : 'text-slate-200'}`}
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                                {errors.rating && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider">{errors.rating}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter Name"
                                        className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none ${errors.name ? 'border-rose-500' : 'border-slate-100'}`}
                                    />
                                    {errors.name && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="Enter your Email"
                                        className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none ${errors.email ? 'border-rose-500' : 'border-slate-100'}`}
                                    />
                                    {errors.email && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-1">Your Review <span className="text-red-500">*</span></label>
                                <textarea
                                    name="review"
                                    value={form.review}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Tell us what you liked (or didn't like)..."
                                    className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none ${errors.review ? 'border-rose-500' : 'border-slate-100'}`}
                                />
                                {errors.review && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.review}</p>}
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-4">
                                <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-1">Add Photo (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer group flex flex-col items-center justify-center w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:bg-slate-100 hover:border-indigo-300 transition-all duration-300">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        {imagePreview ? (
                                            <img src={imagePreview} className="w-full h-full object-cover rounded-[1.8rem]" alt="Preview" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Upload</span>
                                            </div>
                                        )}
                                    </label>
                                    {image && (
                                        <button
                                            type="button"
                                            onClick={() => { setImage(null); setImagePreview(null); }}
                                            className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-sm font-black hover:bg-red-200 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-200 hover:bg-black hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Submit Review'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReviewModal;
