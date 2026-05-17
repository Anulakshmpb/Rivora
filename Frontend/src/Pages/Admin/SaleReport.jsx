import React, { useState, useEffect, useMemo } from 'react';
import SideBar from './Layouts/SideBar';
import Header from './Layouts/Header';
import adminService from '../../api/adminService';
import { Download, Search, X, ArrowUpDown, DollarSign, Package, ShoppingCart, Users, Activity, Tag, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4 relative overflow-hidden group`}
    >
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${colorClass.bg}`}></div>
        <div className="flex justify-between items-start z-10">
            <div className={`p-3 rounded-2xl ${colorClass.bg} ${colorClass.text} bg-opacity-20`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
        <div className="z-10">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
    </motion.div>
);

const TabButton = ({ active, label, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap
            ${active 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'}`}
    >
        <Icon size={18} />
        {label}
    </button>
);

export default function SaleReport() {
    const [activeTab, setActiveTab] = useState('revenue');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Separate states for each data source
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersRes, productsRes, usersRes, couponsRes] = await Promise.all([
                adminService.getAllOrders().catch(() => ({ data: [] })),
                adminService.getProducts().catch(() => ({ products: [] })),
                adminService.getUsers().catch(() => ({ users: [] })),
                adminService.getCoupons().catch(() => ({ coupons: [] }))
            ]);

            // Assume responses might be unwrapped based on typical patterns in this codebase
            const oData = ordersRes?.data || ordersRes || [];
            const pData = productsRes?.products || productsRes?.data?.products || productsRes || [];
            const cData = usersRes?.users || usersRes?.data?.users || usersRes || [];
            const cpData = couponsRes?.coupons || couponsRes?.data?.coupons || couponsRes || [];

            setOrders(Array.isArray(oData) ? oData : []);
            setProducts(Array.isArray(pData) ? pData : []);
            setCustomers(Array.isArray(cData) ? cData : []);
            setCoupons(Array.isArray(cpData) ? cpData : []);
        } catch (error) {
            console.error('Error fetching data for sales report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper to filter array by date
    const filterByDate = (dataArray, dateKey = 'createdAt') => {
        if (!Array.isArray(dataArray)) return [];
        return dataArray.filter(item => {
            if (!dateRange.start && !dateRange.end) return true;
            if (!item[dateKey]) return true;
            
            const itemDate = new Date(item[dateKey]);
            const start = dateRange.start ? new Date(dateRange.start) : new Date(0);
            const end = dateRange.end ? new Date(dateRange.end) : new Date();
            end.setHours(23, 59, 59, 999);
            return itemDate >= start && itemDate <= end;
        });
    };

    const filteredOrders = useMemo(() => filterByDate(orders), [orders, dateRange]);
    const filteredProducts = useMemo(() => filterByDate(products), [products, dateRange]);
    const filteredCustomers = useMemo(() => filterByDate(customers), [customers, dateRange]);
    const filteredCoupons = useMemo(() => filterByDate(coupons), [coupons, dateRange]);

    const aggregations = useMemo(() => {
        const stats = {
            totalRevenue: 0,
            totalOrders: filteredOrders.length,
            totalProductsSold: 0,
            couponsUsed: 0,
            totalDiscountGiven: 0
        };

        filteredOrders.forEach(order => {
            if (order.paymentStatus === 'Paid' || order.paymentMethod === 'cod') {
                stats.totalRevenue += (order.totalAmount || 0);
            }
            if (order.appliedCoupon) stats.couponsUsed++;
            stats.totalDiscountGiven += (order.discountAmount || 0);
            
            if (order.items) {
                order.items.forEach(item => {
                    if (item.status !== 'Cancelled' && item.status !== 'Returned') {
                        stats.totalProductsSold += (item.quantity || 1);
                    }
                });
            }
        });

        return stats;
    }, [filteredOrders]);

    // Generate table columns and data based on active tab
    const getTabData = () => {
        let rawData = [];
        let columns = [];

        switch (activeTab) {
            case 'revenue':
                columns = [
                    { key: '_id', label: 'Order ID', render: (val) => val ? `#${val.slice(-6).toUpperCase()}` : 'N/A' },
                    { key: 'date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
                    { key: 'customer', label: 'Customer', render: (_, row) => row.user?.name || 'Guest' },
                    { key: 'paymentMethod', label: 'Method', render: (val) => val?.toUpperCase() || 'N/A' },
                    { key: 'totalAmount', label: 'Revenue', render: (val) => `₹${(val || 0).toFixed(2)}` }
                ];
                rawData = filteredOrders.map(o => ({ ...o, date: o.createdAt }));
                break;
            case 'products':
                columns = [
                    { key: 'name', label: 'Product Name' },
                    { key: 'category', label: 'Category', render: (val) => Array.isArray(val) ? val[0] : (val || 'Uncategorized') },
                    { key: 'price', label: 'Price', render: (val) => `₹${(val || 0).toFixed(2)}` },
                    { key: 'quantity', label: 'Stock Status', render: (val) => val > 0 ? `${val} in stock` : 'Out of stock' }
                ];
                rawData = filteredProducts.map(p => ({ ...p, date: p.createdAt }));
                break;
            case 'orders':
                columns = [
                    { key: '_id', label: 'Order ID', render: (val) => val ? `#${val.slice(-6).toUpperCase()}` : 'N/A' },
                    { key: 'date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
                    { key: 'customer', label: 'Customer', render: (_, row) => row.user?.name || 'Guest' },
                    { key: 'orderStatus', label: 'Status' },
                    { key: 'itemsCount', label: 'Items', render: (_, row) => row.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0 },
                    { key: 'totalAmount', label: 'Total', render: (val) => `₹${(val || 0).toFixed(2)}` }
                ];
                rawData = filteredOrders.map(o => ({ ...o, date: o.createdAt }));
                break;
            case 'customers':
                columns = [
                    { key: 'name', label: 'Customer Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone', render: (val) => val || 'N/A' },
                    { key: 'isVerified', label: 'Status', render: (val) => val ? 'Verified' : 'Pending' },
                    { key: 'joined', label: 'Joined', render: (_, row) => new Date(row.createdAt).toLocaleDateString() }
                ];
                rawData = filteredCustomers.map(c => ({ ...c, date: c.createdAt }));
                break;
            case 'coupons':
                columns = [
                    { key: 'code', label: 'Coupon Code' },
                    { key: 'name', label: 'Campaign Name' },
                    { key: 'discount', label: 'Discount', render: (val) => `${val || 0}% OFF` },
                    { key: 'minAmount', label: 'Min Purchase', render: (val) => `₹${(val || 0).toFixed(2)}` },
                    { key: 'expiryDate', label: 'Expiry', render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
                    { key: 'status', label: 'Status', render: (_, row) => new Date(row.expiryDate) > new Date() ? 'Active' : 'Expired' }
                ];
                rawData = filteredCoupons.map(c => ({ ...c, date: c.createdAt }));
                break;
            default:
                break;
        }

        // Apply Search
        let processedData = rawData;
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            processedData = processedData.filter(row => 
                Object.values(row).some(val => 
                    String(val).toLowerCase().includes(lowerSearch)
                ) || (row.user && row.user.name && row.user.name.toLowerCase().includes(lowerSearch))
            );
        }

        // Apply Sort
        if (sortConfig.key) {
            processedData.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'customer') {
                    aVal = a.user?.name || '';
                    bVal = b.user?.name || '';
                } else if (sortConfig.key === 'itemsCount') {
                    aVal = a.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0;
                    bVal = b.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0;
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return { columns, data: processedData };
    };

    const { columns, data: tableData } = getTabData();

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDateRange({ start: '', end: '' });
        setSortConfig({ key: null, direction: 'asc' });
    };

    const handleExport = () => {
        if (tableData.length === 0) return;
        
        const headers = columns.map(c => c.label).join(',');
        const rows = tableData.map(row => {
            return columns.map(c => {
                let val = row[c.key];
                if (c.render) val = c.render(val, row);
                // Escape commas
                if (typeof val === 'string' && val.includes(',')) {
                    val = `"${val}"`;
                }
                return val;
            }).join(',');
        });
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales_report_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Tab Definitions ---
    const tabs = [
        { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign },
        { id: 'products', label: 'Product Analytics', icon: Package },
        { id: 'orders', label: 'Orders Analytics', icon: ShoppingCart },
        { id: 'customers', label: 'Customer Analytics', icon: Users },
        { id: 'coupons', label: 'Coupons Report', icon: Tag },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
            <SideBar />
            <main className="flex-1 lg:ml-72 bg-slate-50 min-h-screen pb-20">
                <Header title="Sales Report & Analytics" subtitle="Comprehensive overview of business performance" />
                
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    
                    {/* Header & Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Report Generator</h2>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                                <Download size={16} />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {activeTab === 'revenue' && (
                            <>
                                <StatCard title="Total Revenue" value={`₹${aggregations.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={DollarSign} colorClass={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} />
                                <StatCard title="Paid Orders" value={filteredOrders.filter(o => o.paymentStatus === 'Paid' || o.paymentMethod === 'cod').length} icon={ShoppingCart} colorClass={{ bg: 'bg-indigo-500', text: 'text-indigo-500' }} />
                                <StatCard title="Avg Order Value" value={`₹${(aggregations.totalOrders > 0 ? aggregations.totalRevenue / aggregations.totalOrders : 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={Activity} colorClass={{ bg: 'bg-amber-500', text: 'text-amber-500' }} />
                                <StatCard title="Total Refunds" value={`₹${filteredOrders.filter(o => o.paymentStatus === 'Refunded').reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={TrendingDown} colorClass={{ bg: 'bg-rose-500', text: 'text-rose-500' }} />
                            </>
                        )}
                        {activeTab === 'products' && (
                            <>
                                <StatCard title="Total Catalog Products" value={filteredProducts.length} icon={Package} colorClass={{ bg: 'bg-indigo-500', text: 'text-indigo-500' }} />
                                <StatCard title="Products Sold" value={aggregations.totalProductsSold} icon={TrendingUp} colorClass={{ bg: 'bg-amber-500', text: 'text-amber-500' }} />
                                <StatCard title="Out of Stock" value={filteredProducts.filter(p => p.quantity === 0).length} icon={AlertCircle} colorClass={{ bg: 'bg-rose-500', text: 'text-rose-500' }} />
                                <StatCard title="Categories" value={new Set(filteredProducts.map(p => Array.isArray(p.category) ? p.category[0] : p.category)).size} icon={Tag} colorClass={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} />
                            </>
                        )}
                        {activeTab === 'orders' && (
                            <>
                                <StatCard title="Total Orders" value={aggregations.totalOrders} icon={ShoppingCart} colorClass={{ bg: 'bg-indigo-500', text: 'text-indigo-500' }} />
                                <StatCard title="Delivered Orders" value={filteredOrders.filter(o => o.orderStatus === 'Delivered').length} icon={Package} colorClass={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} />
                                <StatCard title="Cancelled Orders" value={filteredOrders.filter(o => o.orderStatus === 'Cancelled').length} icon={X} colorClass={{ bg: 'bg-rose-500', text: 'text-rose-500' }} />
                                <StatCard title="Pending Orders" value={filteredOrders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length} icon={Activity} colorClass={{ bg: 'bg-amber-500', text: 'text-amber-500' }} />
                            </>
                        )}
                        {activeTab === 'customers' && (
                            <>
                                <StatCard title="Registered Customers" value={filteredCustomers.length} icon={Users} colorClass={{ bg: 'bg-indigo-500', text: 'text-indigo-500' }} />
                                <StatCard title="Active Buyers" value={new Set(filteredOrders.filter(o => o.user).map(o => o.user._id)).size} icon={Activity} colorClass={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} />
                                <StatCard title="Verified Users" value={filteredCustomers.filter(c => c.isVerified).length} icon={CheckCircle} colorClass={{ bg: 'bg-amber-500', text: 'text-amber-500' }} />
                                <StatCard title="Banned Users" value={filteredCustomers.filter(c => c.isBanned).length} icon={X} colorClass={{ bg: 'bg-rose-500', text: 'text-rose-500' }} />
                            </>
                        )}
                        {activeTab === 'coupons' && (
                            <>
                                <StatCard title="Available Coupons" value={filteredCoupons.length} icon={Tag} colorClass={{ bg: 'bg-indigo-500', text: 'text-indigo-500' }} />
                                <StatCard title="Active Coupons" value={filteredCoupons.filter(c => new Date(c.expiryDate) > new Date()).length} icon={CheckCircle} colorClass={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} />
                                <StatCard title="Coupons Used in Orders" value={aggregations.couponsUsed} icon={Activity} colorClass={{ bg: 'bg-amber-500', text: 'text-amber-500' }} />
                                <StatCard title="Total Discount Given" value={`₹${aggregations.totalDiscountGiven.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={TrendingDown} colorClass={{ bg: 'bg-rose-500', text: 'text-rose-500' }} />
                            </>
                        )}
                    </div>

                    {/* Report Content */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                        
                        {/* Tabs */}
                        <div className="p-6 border-b border-slate-100 overflow-x-auto no-scrollbar">
                            <div className="flex gap-3">
                                {tabs.map(tab => (
                                    <TabButton 
                                        key={tab.id}
                                        active={activeTab === tab.id}
                                        label={tab.label}
                                        icon={tab.icon}
                                        onClick={() => setActiveTab(tab.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Activity className="text-indigo-600" />
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h3>

                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 lg:w-64">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Search records..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                        className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <span className="text-slate-400 text-sm">to</span>
                                    <input 
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                        className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                {(searchTerm || dateRange.start || dateRange.end) && (
                                    <button onClick={clearFilters} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white border border-slate-200 rounded-xl">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-12 flex justify-center items-center">
                                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                </div>
                            ) : tableData.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-slate-100">
                                            {columns.map(col => (
                                                <th 
                                                    key={col.key}
                                                    onClick={() => handleSort(col.key)}
                                                    className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors select-none group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {col.label}
                                                        <ArrowUpDown size={12} className={`text-slate-300 group-hover:text-slate-500 ${sortConfig.key === col.key ? 'text-indigo-500' : ''}`} />
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <AnimatePresence>
                                            {tableData.map((row, idx) => (
                                                <motion.tr 
                                                    key={row._id || idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ delay: idx * 0.02 }}
                                                    className="hover:bg-slate-50/50 transition-colors"
                                                >
                                                    {columns.map(col => (
                                                        <td key={col.key} className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                                        </td>
                                                    ))}
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-16 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                        <Search size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-1">No Records Found</h4>
                                    <p className="text-slate-500 text-sm max-w-sm">We couldn't find any data matching your current filters. Try adjusting your search criteria.</p>
                                    <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-lg hover:bg-indigo-100 transition-colors">
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs font-bold text-slate-400 text-center uppercase tracking-widest">
                            Showing {tableData.length} records
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}