import React, { useState, useEffect } from 'react';
import SideBar from '../Layouts/SideBar';
import Header from '../Layouts/Header';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../../api/axiosInstance';
import Joi from 'joi';
import { useToast } from '../../../Toast/ToastContext';

const schema = Joi.object({
	name: Joi.string().min(3).max(50).required().messages({
		'string.empty': 'Product name is required',
		'string.min': 'At least 3 characters',
		'any.required': 'Product name is required'
	}),
	code: Joi.string().required().messages({
		'string.empty': 'Product Code is required',
		'any.required': 'Product Code is required'
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Description is required',
		'any.required': 'Description is required'
	}),
	return: Joi.boolean().required(),
	category: Joi.array().min(1).required().messages({
		'array.min': 'Please select at least one category',
		'any.required': 'Category is required'
	}),
	price: Joi.number().positive().required().messages({
		'number.base': 'Price must be a number',
		'number.positive': 'Price must be positive',
		'any.required': 'Price is required'
	}),
	quantity: Joi.number().integer().min(0).required().messages({
		'number.base': 'Quantity must be a number',
		'number.min': 'Quantity cannot be negative',
		'any.required': 'Quantity is required'
	}),
	isVisible: Joi.boolean().required(),
	size: Joi.array().min(1).required().messages({
		'array.min': 'Please select at least one size',
		'any.required': 'Size is required'
	}),
	color: Joi.array().min(1).required().messages({
		'array.min': 'Please select at least one color',
		'any.required': 'Color is required'
	}),
	image: Joi.boolean().invalid(false).required().messages({
		'any.invalid': 'Please upload at least one image'
	})
});
export default function AddProduct() {
	const navigate = useNavigate();
	const location = useLocation();
	const { product, mode } = location.state || {};
	const isViewMode = mode === 'view';
	const isEditMode = mode === 'edit';
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const { showToast } = useToast();
	const [isProcessingImages, setIsProcessingImages] = useState(false);
	const [name, setName] = useState('');
	const [code, setCode] = useState('');
	const [description, setDescription] = useState('');
	const [price, setPrice] = useState('');
	const [quantity, setQuantity] = useState('');
	const [isVisible, setIsVisible] = useState(false);
	const [isReturnable, setIsReturnable] = useState(true);
	const [selectedSizes, setSelectedSizes] = useState(['M', 'L']);
	const [selectedColors, setSelectedColors] = useState(['black']);
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [categories, setCategories] = useState([]);
	const clearError = (field) => {
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/categories', {
					withCredentials: true
				});
				if (response.data.success) {
					setCategories(response.data.data.categories);
				}
			} catch (error) {
				console.error('Failed to fetch categories:', error);
			}
		};
		fetchCategories();
	}, []);

	useEffect(() => {
		if (product) {
			setName(product.name || '');
			setCode(product.code || '');
			setDescription(product.description || '');
			setPrice(product.price || '');
			setQuantity(product.stock !== undefined ? product.stock : (product.quantity || ''));
			setIsVisible(product.isVisible !== undefined ? product.isVisible : (product.stock_visibility || false));
			setIsReturnable(product.return !== undefined ? product.return : true);
			setSelectedSizes(product.size || []);
			setSelectedColors(product.color || []);

			if (product.color && Array.isArray(product.color)) {
				const colorsToAdd = product.color.map(colorId => {
					let value = colorId;
					if (colorId.startsWith('custom-')) {
						value = '#' + colorId.replace('custom-', '');
					}
					return { id: colorId, value: value };
				});
				setAvailableColors(colorsToAdd);
			}

			const productCategory = product.category;
			if (Array.isArray(productCategory)) {
				setSelectedCategories(productCategory);
			} else if (productCategory && productCategory !== 'Uncategorized') {
				setSelectedCategories([productCategory]);
			}

			const productImages = product.image;
			if (Array.isArray(productImages)) {
				setImages(productImages.filter(img => img !== '').map((img, idx) => ({ url: img, file: null, id: `existing-${idx}` })));
			} else if (productImages) {
				setImages([{ url: productImages, file: null, id: 'existing-0' }]);
			}

		}
	}, [product]);
	const [images, setImages] = useState([]);
	const [availableColors, setAvailableColors] = useState([]);
	const [isPickingColor, setIsPickingColor] = useState(false);
	const [newColor, setNewColor] = useState('#6366f1');

	const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];


	const handleImageUpload = (e) => {
		const files = Array.from(e.target.files);
		if (files.length === 0) return;

		const newImages = files.map(file => ({
			file,
			url: URL.createObjectURL(file),
			id: Math.random().toString(36).substr(2, 9)
		}));
		setImages(prev => [...prev, ...newImages]);
		clearError('image');
	};


	const handleSubmit = async (e) => {
		e.preventDefault();
		const validationData = {
			name,
			code,
			description,
			price: parseFloat(price),
			quantity: parseInt(quantity),
			return: isReturnable,
			isVisible: isVisible,
			category: selectedCategories,
			size: selectedSizes,
			color: selectedColors,
			image: images.length > 0
		};

		const { error } = schema.validate(validationData, { abortEarly: false });
		if (error) {
			const newErrors = {};
			error.details.forEach(detail => {
				newErrors[detail.path[0]] = detail.message;
			});
			setErrors(newErrors);
			// Scroll to first error
			const firstError = Object.keys(newErrors)[0];
			const element = document.getElementsByName(firstError)[0] || document.getElementById(firstError);
			if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			return;
		}

		setErrors({});
		setIsLoading(true);

		const formData = new FormData();
		formData.append('name', name);
		formData.append('code', code);
		formData.append('description', description);
		formData.append('price', price);
		formData.append('quantity', quantity);
		formData.append('return', isReturnable);
		formData.append('isVisible', isVisible);

		// Send arrays as JSON strings
		formData.append('category', JSON.stringify(selectedCategories));
		formData.append('size', JSON.stringify(selectedSizes));
		formData.append('color', JSON.stringify(selectedColors));

		// Handle images
		const existingImages = images.filter(img => !img.file).map(img => img.url);
		formData.append('image', JSON.stringify(existingImages));

		images.forEach(img => {
			if (img.file) {
				formData.append('image', img.file);
			}
		});

		console.log('Attempting to publish product via FormData');



		try {
			let response;
			if (isEditMode && product) {
				response = await axiosInstance.put(`/api/products/${product.id || product._id}`, formData, {
					headers: { 'Content-Type': 'multipart/form-data' }
				});
			} else {
				response = await axiosInstance.post('/api/products', formData, {
					headers: { 'Content-Type': 'multipart/form-data' }
				});
			}

			if (response.success || (response.data && response.data.success)) {
				showToast(isEditMode ? 'Product updated successfully!' : 'Product published successfully!', 'success');
				navigate('/products');
			}
		} catch (error) {
			const errorMessage = error.message || error.response?.data?.error?.message || error.response?.data?.message || 'Failed to publish product';
			showToast(errorMessage, 'error');
		} finally {
			setIsLoading(false);
		}
	};


	return (
		<div className="min-h-screen bg-slate-100 flex font-inter">
			<SideBar />

			<main className="flex-1 lg:ml-72 bg-slate-100 min-h-screen">
				<Header title={isViewMode ? 'View Product' : isEditMode ? 'Edit Product' : 'Add Product'} subtitle={isViewMode ? 'Product details' : isEditMode ? 'Update your product details' : 'Create a new luxury item for your catalog'} />

				<form onSubmit={handleSubmit} className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
					{/* Page Header */}
					<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
						<div>
							<span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-2 block">{isViewMode ? 'View' : isEditMode ? 'Edit' : 'New Arrival'}</span>
							<h1 className="text-4xl font-black text-slate-900 tracking-tight">{isViewMode ? 'View Product' : isEditMode ? 'Edit Product' : 'Add Product'}</h1>
						</div>

						<div className="flex items-center gap-4 w-full md:w-auto">
							<div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
								<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Return & Delivery</span>
								<button
									type="button"
									disabled={isViewMode}
									onClick={() => setIsReturnable(!isReturnable)}
									className={`w-10 h-5 rounded-full transition-all duration-300 relative ${isReturnable ? 'bg-indigo-600' : 'bg-slate-200'} ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
								>
									<div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isReturnable ? 'left-6' : 'left-1'}`} />
								</button>
							</div>
							{!isViewMode && (
								<button
									type="submit"
									disabled={isLoading || isProcessingImages}
									className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
								>
									{isLoading || isProcessingImages ? (
										<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									) : (
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
									)}
									{isLoading ? (isEditMode ? 'Updating...' : 'Publishing...') : (isProcessingImages ? 'Processing Images...' : (isEditMode ? 'Update Product' : 'Publish Product'))}
								</button>
							)}
						</div>
					</div>

					<fieldset disabled={isViewMode} className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-none p-0 m-0 min-w-0">
						<div className="lg:col-span-2 space-y-8">
							<div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-1">Product Name</label>
										<input
											type="text"
											name="name"
											value={name}
											onChange={(e) => { setName(e.target.value); clearError('name'); }}
											placeholder="e.g. Silk Drape Evening Gown"
											className={`w-full px-5 py-4 bg-slate-100 border-none rounded-2xl text-sm font-semibold placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none ${errors.name ? 'ring-2 ring-rose-500/50' : ''}`}
										/>
										{errors.name && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.name}</p>}
									</div>
									<div className="space-y-2">
										<label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-1">Product Code</label>
										<input
											type="text"
											name="code"
											value={code}
											onChange={(e) => { setCode(e.target.value); clearError('code'); }}
											placeholder="LAT-2026-BLK-01"
											className={`w-full px-5 py-4 bg-slate-100 border-none rounded-2xl text-sm font-mono font-bold text-indigo-600 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none ${errors.code ? 'ring-2 ring-rose-500/50' : ''}`}
										/>
										{errors.code && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.code}</p>}
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-1">Description</label>
									<div className="bg-slate-100 rounded-3xl overflow-hidden border border-transparent focus-within:border-indigo-100 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
										<div className="flex gap-4 p-4 border-b border-gray-50 bg-white/30 backdrop-blur-sm">
											<button type="button" className="p-2 hover:bg-white rounded-lg transition-colors"><svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg></button>
											<button type="button" className="p-2 hover:bg-white rounded-lg transition-colors"><svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg></button>
										</div>
										<textarea
											rows="8"
											name="description"
											value={description}
											onChange={(e) => { setDescription(e.target.value); clearError('description'); }}
											placeholder="Craft a compelling story for this luxury piece..."
											className={`w-full p-6 bg-transparent border-none text-sm font-medium leading-relaxed placeholder:text-slate-500 outline-none resize-none ${errors.description ? 'ring-2 ring-rose-500/50' : ''}`}
										/>
									</div>
									{errors.description && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.description}</p>}
								</div>
							</div>

							<div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
								<div className="flex justify-between items-center">
									<h3 className="text-lg font-black text-slate-900 tracking-tight">Product Media</h3>
									{!isViewMode && (
										<label className="cursor-pointer text-[12px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2 hover:translate-x-1 transition-transform">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
											Add Image
											<input type="file" onChange={handleImageUpload} className="hidden" multiple accept="image/*" />
										</label>
									)}
								</div>

								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									{images.map((img, idx) => (
										<div key={img.id || idx} className="aspect-[3/4] rounded-2xl bg-slate-100 relative overflow-hidden group border border-slate-100 shadow-sm">
											<img
												src={img.url.startsWith('http') || img.url.startsWith('/uploads') ? (img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`) : img.url}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
												alt="Preview"
											/>
											{idx === 0 && <div className="absolute top-3 left-3 bg-indigo-600 text-[8px] font-black text-white px-2 py-1 rounded-md uppercase tracking-widest">Main</div>}
											{!isViewMode && (
												<button
													type="button"
													onClick={() => {
														const newImages = images.filter((_, i) => i !== idx);
														setImages(newImages);
														if (newImages.length === 0) {
															// Optional: trigger error if all images removed after submission
														} else {
															clearError('image');
														}
													}}
													className="absolute top-3 right-3 w-6 h-6 bg-white/90 backdrop-blur shadow-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:bg-rose-50"
												>
													<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
												</button>
											)}
										</div>
									))}

									{!isViewMode && (
										<label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 hover:bg-slate-100 transition-colors cursor-pointer group">
											<input type="file" onChange={handleImageUpload} className="hidden" multiple accept="image/*" />
											<div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
												<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
											</div>
											<span className="text-[12px] font-black uppercase tracking-widest text-slate-500">Upload</span>
										</label>
									)}
								</div>

								<div className="p-4 bg-slate-100 rounded-2xl border border-slate-100 text-center">
									<p className="text-[12px]font-bold text-slate-500 uppercase tracking-[0.1em]">Recommended: 2400 × 3200px</p>
									<p className="text-[12px]font-medium text-slate-500 mt-1 uppercase tracking-widest">Max 15MB per file • JPEG, PNG, WEBP</p>
								</div>
								{errors.image && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider text-center mt-2">{errors.image}</p>}
							</div>
						</div>


						{/* Sidebar Column */}
						<div className="space-y-8">
							<div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
								<h3 className="text-lg font-black text-slate-900 tracking-tight">Specifications</h3>

								<div className="space-y-4">
									<label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-1">Categories</label>

									{/* Category  */}
									<div className="flex flex-wrap gap-2 min-h-[1.5rem]">
										{selectedCategories.map(cat => (
											<div key={cat} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-wider border border-indigo-100 animate-in zoom-in-95 duration-200 group/badge">
												{cat}
												{!isViewMode && (
													<button
														type="button"
														onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))}
														className="text-indigo-300 hover:text-indigo-600 transition-colors"
													>
														<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
													</button>
												)}
											</div>
										))}
									</div>

									{/* Dropdown */}
									{!isViewMode && (
										<div className="relative group">
											<select
												id="category"
												onChange={(e) => {
													if (e.target.value && !selectedCategories.includes(e.target.value)) {
														setSelectedCategories([...selectedCategories, e.target.value]);
														clearError('category');
													}
													e.target.value = "";
												}}
												className={`w-full px-5 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none appearance-none cursor-pointer disabled:opacity-50 ${errors.category ? 'ring-2 ring-rose-500/50' : ''}`}
											// disabled={fetchingCategories}
											>
												<option value="" disabled selected>+ Add Category</option>
												{categories.map(category => (
													<option key={category._id} value={category.name}>
														{category.name}
													</option>
												))}
											</select>
											<div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-indigo-500 transition-colors">
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
											</div>
										</div>
									)}
									{errors.category && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.category}</p>}
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-3">
										<label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-1">Price ($)</label>
										<input
											type="number"
											name="price"
											value={price}
											onChange={(e) => { setPrice(e.target.value); clearError('price'); }}
											placeholder="0.00"
											className={`w-full px-5 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none ${errors.price ? 'ring-2 ring-rose-500/50' : ''}`}
										/>
										{errors.price && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.price}</p>}
									</div>
									<div className="space-y-3">
										<label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-1">Stock Quantity</label>
										<input
											type="number"
											name="quantity"
											value={quantity}
											onChange={(e) => { setQuantity(e.target.value); clearError('quantity'); }}
											placeholder="0"
											className={`w-full px-5 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none ${errors.quantity ? 'ring-2 ring-rose-500/50' : ''}`}
										/>
										{errors.quantity && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.quantity}</p>}
									</div>
								</div>

								<div className="flex items-center justify-between p-4 bg-slate-100 rounded-2xl">
									<div>
										<p className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Product Visibility</p>
										<p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Show product on user side</p>
									</div>
									<button
										type="button"
										onClick={() => setIsVisible(!isVisible)}
										className={`w-10 h-5 rounded-full transition-all duration-300 relative ${isVisible ? 'bg-indigo-600' : 'bg-slate-200'}`}
									>
										<div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isVisible ? 'left-6' : 'left-1'}`} />
									</button>                      
						          </div>
							</div>

							{/* Attributes Card */}
							<div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
								<h3 className="text-lg font-black text-slate-900 tracking-tight">Attributes</h3>

								<div className="space-y-4">
									<label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-1">Available Sizes</label>
									<div className="flex flex-wrap gap-2">
										{sizes.map(size => (
											<button
												key={size}
												type="button"
												id="size"
												onClick={() => {
													if (selectedSizes.includes(size)) {
														setSelectedSizes(selectedSizes.filter(s => s !== size));
													} else {
														setSelectedSizes([...selectedSizes, size]);
														clearError('size');
													}
												}}
												className={`w-11 h-11 flex items-center justify-center rounded-xl text-xs font-black transition-all ${selectedSizes.includes(size) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-100'} ${errors.size ? 'ring-2 ring-rose-500/50' : ''}`}
											>
												{size}
											</button>
										))}
									</div>
									{errors.size && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.size}</p>}
								</div>

								<div className="space-y-4">
									<label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-1">Color Palette</label>
									<div className="flex flex-wrap gap-3 items-center">
										{availableColors.map(color => (
											<div key={color.id} className="relative group">
												<button
													type="button"
													onClick={() => {
														if (selectedColors.includes(color.id)) {
															setSelectedColors(selectedColors.filter(c => c !== color.id));
														} else {
															setSelectedColors([...selectedColors, color.id]);
															clearError('color');
														}
													}}
													className={`w-8 h-8 rounded-full transition-all relative ${selectedColors.includes(color.id) ? 'ring-2 ring-indigo-500 ring-offset-4 scale-110' : ''}`}
													style={color.value ? { backgroundColor: color.value } : {}}
												/>
												{!isViewMode && (
													<button
														type="button"
														onClick={() => {
															setAvailableColors(availableColors.filter(c => c.id !== color.id));
															setSelectedColors(selectedColors.filter(c => c !== color.id));
														}}
														className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white hover:border-rose-500 shadow-sm z-10"
													>
														<svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
													</button>
												)}
											</div>
										))}

										{!isViewMode && (!isPickingColor ? (
											<button
												type="button"
												onClick={() => setIsPickingColor(true)}
												className="w-8 h-8 rounded-full bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all active:scale-90"
											>
												<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
											</button>
										) : (
											<div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
												<input
													type="color"
													value={newColor}
													onChange={(e) => setNewColor(e.target.value)}
													className="w-8 h-8 rounded-full border-none p-0 bg-transparent cursor-pointer overflow-hidden"
												/>
												<button
													type="button"
													onClick={() => {
														const id = `custom-${newColor.replace('#', '')}`;
														if (!availableColors.find(c => c.id === id)) {
															setAvailableColors([...availableColors, { id, value: newColor }]);
															setSelectedColors([...selectedColors, id]);
														}
														setIsPickingColor(false);
													}}
													className="text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white px-3 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
												>
													Add
												</button>
												<button
													type="button"
													onClick={() => setIsPickingColor(false)}
													className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 py-2 hover:text-slate-600 transition-all"
												>
													Cancel
												</button>
											</div>
										))}
									</div>
									{errors.color && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.color}</p>}
								</div>
							</div>
						</div>
					</fieldset>
				</form>
			</main>
		</div>
	);
}
