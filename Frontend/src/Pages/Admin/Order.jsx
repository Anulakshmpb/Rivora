import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../Toast/ToastContext';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    Eye,
    CheckCircle2,
    Clock,
    XCircle,
    Calendar,
    MoreVertical,
    RefreshCw,
    X,
    MapPin,
    User,
    Mail,
    Phone,
    Package,
} from 'lucide-react';
import SideBar from './Layouts/SideBar';
import Header from './Layouts/Header';

export default function Order() {
    const [orders, setOrders] = useState([]);
    const [returns, setReturns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { showToast } = useToast();
    const [returnModal, setReturnModal] = useState(false);
    const [viewMode, setViewMode] = useState('orders');
    const [returnReason, setReturnReason] = useState('');

    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        cancelled: 0,
        inProcess: 0
    });

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const [ordersRes, returnsRes] = await Promise.all([
                axiosInstance.get('/api/admin/orders'),
                axiosInstance.get('/api/admin/returns')
            ]);

            if (ordersRes.success) {
                setOrders(ordersRes.data);
                calculateStats(ordersRes.data);
            }

            if (returnsRes.success) {
                setReturns(returnsRes.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            showToast('Failed to load data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (data) => {
        const total = data.length;
        const completed = data.filter(o => o.orderStatus === 'Delivered').length;
        const cancelled = data.filter(o => o.orderStatus === 'Cancelled').length;
        const inProcess = data.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.orderStatus)).length;
        setStats({ total, completed, cancelled, inProcess });
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const res = await axiosInstance.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus });
            if (res.success) {
                showToast(`Order status updated to ${newStatus}`, 'success');
                fetchOrders();
            }
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleApproveReturn = async (returnId) => {
        try {
            const res = await axiosInstance.post(`/api/admin/returns/${returnId}/approve-return`);
            if (res.success) {
                showToast('Return request approved', 'success');
                fetchOrders();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to approve return', 'error');
        }
    };

    const handleRejectReturn = async (returnId) => {
        const reason = window.prompt('Please enter a reason for rejection:');
        if (reason === null) return; // User cancelled the prompt

        try {
            const res = await axiosInstance.post(`/api/admin/returns/${returnId}/reject-return`, { reason });
            if (res.success) {
                showToast('Return request rejected', 'success');
                fetchOrders();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to reject return', 'error');
        }
    };

    // Filtering and Sorting logic
    const getFilteredData = () => {
        const sourceData = viewMode === 'returns' ? returns : orders;

        return sourceData.filter(item => {
            const user = item.user;
            const orderId = viewMode === 'returns' ? item.order?._id : item._id;

            const matchesSearch =
                (orderId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user?.mobile?.includes(searchTerm));

            const matchesStatus = viewMode === 'returns'
                ? (statusFilter === 'All' ? true : item.status === statusFilter)
                : (statusFilter === 'All' ? true : item.orderStatus === statusFilter);

            const itemDate = new Date(item.createdAt);
            const matchesDate =
                (!dateFilter.start || itemDate >= new Date(dateFilter.start)) &&
                (!dateFilter.end || itemDate <= new Date(dateFilter.end + 'T23:59:59'));

            return matchesSearch && matchesStatus && matchesDate;
        }).sort((a, b) => {
            if (sortConfig.key === 'totalAmount') {
                const valA = viewMode === 'returns' ? a.product?.price : a.totalAmount;
                const valB = viewMode === 'returns' ? b.product?.price : b.totalAmount;
                return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
            }
            if (sortConfig.key === 'createdAt') {
                return sortConfig.direction === 'asc'
                    ? new Date(a.createdAt) - new Date(b.createdAt)
                    : new Date(b.createdAt) - new Date(a.createdAt);
            }
            return 0;
        });
    };

    const filteredData = getFilteredData();
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentItems = filteredData.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredData.length / ordersPerPage);

    const exportToCSV = () => {
        const isReturns = viewMode === 'returns';
        const headers = isReturns
            ? ['Return ID', 'Order ID', 'Date', 'User', 'Email', 'Product', 'Price', 'Reason', 'Status']
            : ['Order ID', 'Date', 'User', 'Email', 'Mobile', 'Items', 'Total Amount', 'Status'];

        const rows = filteredData.map(o => isReturns ? [
            o._id,
            o.order?._id,
            new Date(o.createdAt).toLocaleDateString(),
            o.user?.name || 'N/A',
            o.user?.email || 'N/A',
            o.product?.name || 'N/A',
            o.product?.price || 0,
            o.reason || 'N/A',
            o.status
        ] : [
            o._id,
            new Date(o.createdAt).toLocaleDateString(),
            o.user?.name || 'N/A',
            o.user?.email || 'N/A',
            o.user?.mobile || 'N/A',
            o.items.length,
            o.totalAmount,
            o.orderStatus
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleReturnOrders = () => {
        setReturnModal(true);
    }
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('All');
        setDateFilter({ start: '', end: '' });
        setCurrentPage(1);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Returned': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Return Requested': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Processing': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Pending': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-inter">
            <SideBar />

            <div className="flex-1 lg:ml-72 bg-slate-50 min-h-screen">
                <Header title="Order Management" />

                <main className="flex-1 overflow-y-auto p-8">
                    {/* Stats  */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Orders"
                            value={stats.total}
                            icon={<MoreVertical className="w-6 h-6" />}
                            color="blue"
                        />
                        <StatCard
                            title="In-Process"
                            value={stats.inProcess}
                            icon={<Clock className="w-6 h-6" />}
                            color="amber"
                        />
                        <StatCard
                            title="Completed"
                            value={stats.completed}
                            icon={<CheckCircle2 className="w-6 h-6" />}
                            color="emerald"
                        />
                        <StatCard
                            title="Cancelled"
                            value={stats.cancelled}
                            icon={<XCircle className="w-6 h-6" />}
                            color="red"
                        />
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8">
                        <div className="flex flex-wrap items-center justify-between">
                            <div className="flex flex-wrap items-center gap-4 flex-1">
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                    <button
                                        onClick={() => setViewMode('orders')}
                                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        All Orders
                                    </button>
                                    <button
                                        onClick={() => setViewMode('returns')}
                                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'returns' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Return Requests
                                    </button>
                                </div>
                                {/* Search */}
                                <div className="relative min-w-[350px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Search by ID, User, or Email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    />
                                </div>
                                {/* Date Filter */}
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                                    <Calendar className="w-4 h-4 text-slate-600" />
                                    <input
                                        type="date"
                                        value={dateFilter.start}
                                        onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                                        className="bg-transparent text-sm outline-none"
                                    />
                                    <span className="text-slate-500 mx-2">to</span>
                                    <input
                                        type="date"
                                        value={dateFilter.end}
                                        onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                                        className="bg-transparent text-sm outline-none"
                                    />
                                </div>
                                {/* Status Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="pl-11 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Returned">Returned</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={clearFilters}
                                    className="p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                                    title="Clear Filters"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={exportToCSV}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10"
                                >
                                    <Download className="w-4 h-4" />
                                    Export Data
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Sl No</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Order ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">User Details</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Mobile</th>
                                        {viewMode === 'returns' ? (
                                            <>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Reason</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Items</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                            </>
                                        )}
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="9" className="px-6 py-20 text-center">
                                                <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-slate-500 text-sm font-medium">Fetching data...</p>
                                            </td>
                                        </tr>
                                    ) : currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="px-6 py-20 text-center text-slate-500">
                                                No {viewMode === 'returns' ? 'return requests' : 'orders'} found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((item, idx) => (
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                key={item._id}
                                                className="hover:bg-slate-50/50 transition-colors group"
                                            >
                                                <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                                    {indexOfFirstOrder + idx + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                                        #{viewMode === 'returns' ? item.order?._id.slice(-8).toUpperCase() : item._id.slice(-8).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-900 block">
                                                        {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">
                                                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                                                            {item.user?.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 leading-none mb-1">{item.user?.name || 'Guest User'}</p>
                                                            <p className="text-[10px] text-slate-500 font-medium">{item.user?.email || 'No Email'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                                    {item.user?.mobile || (viewMode === 'orders' && item.shippingAddress?.phone) || 'N/A'}
                                                </td>
                                                {viewMode === 'returns' ? (
                                                    <>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-10 h-12 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                                                                    <img
                                                                        src={item.product?.image?.[0] ? `http://localhost:5000${item.product.image[0]}` : '/placeholder.png'}
                                                                        className="w-full h-full object-cover"
                                                                        alt=""
                                                                    />
                                                                </div>
                                                                <div className="max-w-[150px]">
                                                                    <p className="text-xs font-bold text-slate-900 truncate">{item.product?.name}</p>
                                                                    <p className="text-[10px] text-slate-500">${item.product?.price}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-black text-slate-900">${item.product?.price.toFixed(2)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-xs font-medium text-slate-600 italic line-clamp-2 max-w-[200px]" title={item.reason}>
                                                                "{item.reason || 'No reason provided'}"
                                                            </p>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full w-fit">
                                                                    {item.items.length} items
                                                                </span>
                                                                {item.items.some(i => i.status === 'Cancelled') && (
                                                                    <span className="text-[9px] font-bold text-rose-500 uppercase tracking-tight">
                                                                        {item.items.filter(i => i.status === 'Cancelled').length} Cancelled
                                                                    </span>
                                                                )}
                                                                {item.items.some(i => i.status === 'Returned' || i.status === 'Return Requested') && (
                                                                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tight">
                                                                        {item.items.filter(i => i.status === 'Returned' || i.status === 'Return Requested').length} Return/Req
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-black text-slate-900">${item.totalAmount.toFixed(2)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(item.orderStatus)}`}>
                                                                {item.orderStatus}
                                                            </span>
                                                        </td>
                                                    </>
                                                )}
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        {viewMode === 'returns' ? (
                                                            <>
                                                                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(item.status)}`}>
                                                                    {item.status}
                                                                </span>
                                                                {item.status === 'Pending' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleApproveReturn(item._id)}
                                                                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                                                            title="Accept Return"
                                                                        >
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRejectReturn(item._id)}
                                                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                                            title="Reject Return"
                                                                        >
                                                                            <XCircle className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <select
                                                                    onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                                                                    className="text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-indigo-600 transition-all"
                                                                    value={item.orderStatus}
                                                                >
                                                                    <option value="Pending">Pending</option>
                                                                    <option value="Processing">Processing</option>
                                                                    <option value="Delivered">Delivered</option>
                                                                    <option value="Cancelled">Cancelled</option>
                                                                    <option value="Returned">Returned</option>
                                                                    <option value="Return Requested">Return Requested</option>
                                                                </select>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedOrder(item);
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                    className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-6 bg-slate-50/30 flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredData.length)} of {filteredData.length} items
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl bg-white border border-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl bg-white border border-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                    >
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                    Order Details
                                    <span className={`px-3 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusStyle(selectedOrder.orderStatus)}`}>
                                        {selectedOrder.orderStatus}
                                    </span>

                                </h2>
                                <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                                    #{selectedOrder._id.toUpperCase()}
                                </span>
                                <p className="text-slate-500 text-sm font-medium flex items-center gap-2 mt-2">
                                    <Calendar className="w-4 h-4" />
                                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-3 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-500 rounded-2xl transition-all shadow-sm border border-slate-100"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-8">
                                    {/* Customer Info */}
                                    <section>
                                        <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            Customer Information
                                        </h3>
                                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-lg font-black text-white">
                                                    {selectedOrder.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-slate-900">{selectedOrder.user?.name || 'Guest User'}</p>
                                                    <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {selectedOrder.user?.email || 'No Email'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-200/60">
                                                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-indigo-500" />
                                                    {selectedOrder.user?.mobile || 'No Phone'}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Shipping Address */}
                                    <section>
                                        <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            Shipping Address
                                        </h3>
                                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                            {selectedOrder.shippingAddress ? (
                                                <div className="space-y-1">
                                                    <p className="text-slate-900 font-bold leading-relaxed">
                                                        {selectedOrder.shippingAddress.address}
                                                    </p>
                                                    <p className="text-slate-600 font-medium text-sm">
                                                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                                                    </p>
                                                    {/* <div className="pt-3 flex items-center gap-2 text-slate-700">
                                                        <Phone className="w-4 h-4 text-indigo-500" />
                                                        <span className="text-sm font-bold">{selectedOrder.shippingAddress.phone || 'N/A'}</span>
                                                    </div> */}
                                                </div>
                                            ) : (
                                                <p className="text-slate-500 italic text-sm">No shipping address provided</p>
                                            )}
                                        </div>

                                    </section>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-8">
                                    {/* Order Items */}
                                    <section>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Package className="w-3 h-3" />
                                                Order Items ({selectedOrder.items.length})
                                            </h3>
                                        </div>

                                        <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100/80 overflow-hidden">
                                            <div className="divide-y divide-slate-100/50 max-h-[400px] overflow-y-auto custom-scrollbar">
                                                {selectedOrder.items.map((item, idx) => (
                                                    <div key={idx} className="p-5 flex items-center gap-5 hover:bg-white transition-all group">
                                                        {/* Product Image */}
                                                        <div className="relative w-20 h-20 rounded-2xl bg-white border border-slate-100 overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
                                                            <img
                                                                src={item.product?.image?.[0] ? `http://localhost:5000${item.product.image[0]}` : '/placeholder.png'}
                                                                alt={item.product?.name}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />

                                                        </div>

                                                        {/* Product Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className='flex justify-between items-start'>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-900 truncate mb-1 group-hover:text-indigo-600 transition-colors">
                                                                        {item.product?.name || 'Unknown Product'}
                                                                    </p>
                                                                    {item.status && item.status !== 'Ordered' && (
                                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(item.status)}`}>
                                                                            {item.status}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className=" bg-slate-100 text-black text-[10px] font-black w-5 h-5 rounded-lg flex items-center justify-center">
                                                                    {item.quantity}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2 mb-2">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-100">
                                                                    {item.product?.code || 'SKU-N/A'}
                                                                </span>
                                                                {(item.size || item.color) && (
                                                                    <div className="flex gap-1.5">
                                                                        {item.size && <span className="text-[10px] font-bold text-slate-500">Size: {item.size}</span>}
                                                                        {item.color && <span className="text-[10px] font-bold text-slate-500">Color: {item.color}</span>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-bold text-slate-500">
                                                                    ${item.price.toFixed(2)} × {item.quantity}
                                                                </p>
                                                                <p className="text-sm font-black text-slate-900">
                                                                    ${(item.price * item.quantity).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Summary Section */}
                                            <div className="p-8 bg-slate-900 relative overflow-hidden">
                                                {/* Decorative background elements */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>

                                                {(() => {
                                                    const activeItems = selectedOrder.items.filter(item => !['Cancelled', 'Returned'].includes(item.status));
                                                    const subtotal = activeItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                                                    const shipping = selectedOrder.shippingCost || 0;
                                                    const tax = selectedOrder.taxAmount || 0;
                                                    const discount = selectedOrder.discountAmount || 0;
                                                    const total = Math.max(0, subtotal + shipping + tax - discount);

                                                    return (
                                                        <div className="relative space-y-4">
                                                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                                                                <span>Subtotal (Active)</span>
                                                                <span className="text-white">${subtotal.toFixed(2)}</span>
                                                            </div>
                                                            {discount > 0 && (
                                                                <div className="flex justify-between items-center text-xs font-bold text-emerald-400 uppercase tracking-[0.2em]">
                                                                    <span>Discount</span>
                                                                    <span>-${discount.toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                                                                <span>Shipping</span>
                                                                <span className={shipping === 0 ? "text-emerald-400" : "text-white"}>
                                                                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                                                                </span>
                                                            </div>

                                                            <div className="pt-6 mt-6 border-t border-slate-800 flex justify-between items-end">
                                                                <div>
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Total Payable</p>
                                                                    <h4 className="text-3xl font-black text-white tracking-tight">
                                                                        ${total.toFixed(2)}
                                                                    </h4>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Payment Method</p>
                                                                    <span className="text-xs font-bold text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                                                                        {selectedOrder.paymentMethod || 'Credit Card'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        {/* <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusStyle(selectedOrder.orderStatus)}`}>
                                    {selectedOrder.orderStatus}
                                </span>
                                
                            </div>
                            
                            
                        </div> */}
                    </motion.div>
                </div>
            )}

            {/* Return Modal */}
            {returnModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-serif italic text-slate-500 mb-6">Return Order</h2>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Return Reason</label>
                                <textarea
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none h-32"
                                    placeholder="Enter return reason..."
                                ></textarea>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setReturnModal(false)}
                                    className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReturnOrders}
                                    className="flex-1 bg-amber-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-amber-700 transition-all shadow-amber-600/20"
                                >
                                    Return
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


function StatCard({ title, value, icon, color }) {
    const colorMap = {
        blue: 'border-blue-500 bg-blue-50 text-blue-600',
        red: 'border-red-500 bg-red-50 text-red-600',
        amber: 'border-amber-500 bg-amber-50 text-amber-600',
        emerald: 'border-emerald-500 bg-emerald-50 text-emerald-600',
    };

    const selectedColor = colorMap[color] || colorMap.blue;
    const bgColor = selectedColor.split(' ')[1];

    return (
        <div className={`relative bg-white p-6 rounded-2xl border-l-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${selectedColor}`}>
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</span>
                <div className={`p-2 rounded-lg ${bgColor}`}>
                    {React.isValidElement(icon) ? React.cloneElement(icon, { className: "w-5 h-5" }) : icon}
                </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
        </div>
    );
}