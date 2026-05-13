import React, { useState, useEffect } from 'react';
import SideBar from './Layouts/SideBar';
import Header from './Layouts/Header';
import axiosInstance from '../../api/axiosInstance';

export default function HomeCategory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', buttonText: '', link: '', image: null });
    const [preview, setPreview] = useState(null);
    const [editId, setEditId] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const fetchItems = async () => {
        try {
            const res = await axiosInstance.get('/api/home-categories');
            setItems(res.data?.items || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(); }, []);

    const handleChange = (e) => {
        if (e.target.name === 'image') {
            const file = e.target.files[0];
            setForm({ ...form, image: file });
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(file);
            }
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const resetForm = () => {
        setForm({ title: '', description: '', buttonText: '', link: '', image: null });
        setPreview(null);
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.buttonText || !form.link || (!editId && !form.image)) {
            return alert('All fields are required');
        }

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('buttonText', form.buttonText);
        formData.append('link', form.link);
        if (form.image) {
            formData.append('image', form.image);
        }

        setSaving(true);
        try {
            if (editId) {
                await axiosInstance.put(`/api/home-categories/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axiosInstance.post('/api/home-categories', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            resetForm();
            fetchItems();
        } catch (err) { alert(err.error?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const handleEdit = (item) => {
        setEditId(item._id);
        setForm({ title: item.title, description: item.description, buttonText: item.buttonText, link: item.link, image: null });
        setPreview(item.image ? `${API_URL}${item.image}` : null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await axiosInstance.delete(`/api/home-categories/${id}`);
            fetchItems();
        } catch (err) { alert('Delete failed'); }
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '12px',
        fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#1e293b',
        background: '#f8fafc', outline: 'none', transition: 'all 0.2s',
    };

    const labelStyle = { fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' };

    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
            <SideBar />
            <main className="flex-1 lg:ml-72 min-h-screen bg-slate-50">
                <Header title="Home Category" subtitle="Manage homepage category banners and sections" />

                <div className="p-8 max-w-7xl mx-auto">
                    {/* Form Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8 relative overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-400 absolute top-0 left-0 right-0" />

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={editId ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 leading-none mb-1">
                                    {editId ? 'Edit Category Item' : 'Add New Category Item'}
                                </h2>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {editId ? 'Update the details below' : 'Fill in all fields to create a new entry'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Title</label>
                                    <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Summer Collection"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Button Text</label>
                                    <input name="buttonText" value={form.buttonText} onChange={handleChange} placeholder="e.g. Shop Now"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Link URL</label>
                                    <input name="link" value={form.link} onChange={handleChange} placeholder="e.g. /product-list?category=summer"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Category Image</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="relative flex-1">
                                            <input type="file" name="image" onChange={handleChange} accept="image/*" id="image-upload" className="hidden" />
                                            <label htmlFor="image-upload" className="flex items-center justify-center gap-3 px-4 py-3.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 group">
                                                <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 truncate">
                                                    {form.image ? form.image.name : 'Choose Image File'}
                                                </span>
                                            </label>
                                        </div>
                                        {preview && (
                                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief description of the category..."
                                    rows={3} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 resize-none" />
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" disabled={saving} className={`px-8 py-3.5 rounded-2xl text-sm font-black text-white shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${editId ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-orange-200' : 'bg-gradient-to-r from-indigo-500 to-blue-600 shadow-indigo-200'}`}>
                                    {saving ? 'Saving...' : editId ? 'Update Item' : 'Add Item'}
                                </button>
                                {editId && (
                                    <button type="button" onClick={resetForm} className="px-8 py-3.5 bg-slate-100 text-slate-500 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all duration-300">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 absolute top-0 left-0 right-0" />

                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 leading-none mb-1">Category Items</h2>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{items.length} item{items.length !== 1 ? 's' : ''} total</p>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center">
                                <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin mb-4" />
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading...</p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="py-20 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                                    <span className="text-4xl">📭</span>
                                </div>
                                <h3 className="text-base font-black text-slate-900 mb-1">No items yet</h3>
                                <p className="text-sm font-medium text-slate-500">Add your first home category item using the form above</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-separate border-spacing-y-3">
                                    <thead>
                                        <tr>
                                            {['#', 'Image', 'Title', 'Description', 'Button', 'Actions'].map(h => (
                                                <th key={h} className="px-4 py-2 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={item._id} className="bg-slate-50/50 hover:bg-indigo-50/50 transition-all duration-300 group">
                                                <td className="px-4 py-4 rounded-l-2xl text-xs font-black text-slate-500">{idx + 1}</td>
                                                <td className="px-4 py-4">
                                                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                                        <img src={`${API_URL}${item.image}`} alt={item.title} className="w-full h-full object-cover"
                                                            onError={e => { e.target.src = 'https://via.placeholder.com/56?text=No+Img'; }} />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</span>
                                                </td>
                                                <td className="px-4 py-4 max-w-xs">
                                                    <p className="text-xs font-bold text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-wider shadow-sm">
                                                        {item.buttonText}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 rounded-r-2xl">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(item)} className="p-2 bg-white text-amber-500 rounded-xl shadow-sm border border-slate-100 hover:bg-amber-50 transition-all duration-300">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(item._id)} className="p-2 bg-white text-rose-500 rounded-xl shadow-sm border border-slate-100 hover:bg-rose-50 transition-all duration-300">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
