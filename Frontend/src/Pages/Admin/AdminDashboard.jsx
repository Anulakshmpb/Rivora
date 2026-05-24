import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, ShoppingCart, DollarSign, Activity, CheckCircle, Clock, AlertCircle, TrendingUp
} from 'lucide-react';
import SideBar from './Layouts/SideBar';
import Header from './Layouts/Header';
import adminService from '../../api/adminService';

const getSvgPath = (points) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 3;
        const cpY1 = p0.y;
        const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
        const cpY2 = p1.y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
};



const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [timeframe, setTimeframe] = useState(7);
    const [chartMetric, setChartMetric] = useState('revenue');
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [channelTab, setChannelTab] = useState('payment');

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                const [ordersRes, usersRes] = await Promise.all([
                    adminService.getAllOrders().catch(err => {
                        console.error('Error fetching orders:', err);
                        return null;
                    }),
                    adminService.getUsers().catch(err => {
                        console.error('Error fetching users:', err);
                        return null;
                    })
                ]);

                const fetchedOrders = ordersRes?.data || ordersRes || [];
                const fetchedUsers = usersRes?.users || usersRes?.data?.users || usersRes || [];

                setOrders(fetchedOrders);
                setUsers(fetchedUsers);
            } catch (error) {
                console.error('Error loading dashboard stats:', error);
                setOrders([]);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Total Net Revenue calculation
    const totalRevenue = useMemo(() => {
        return orders.reduce((acc, order) => {
            return acc + (order.totalAmount || 0);
        }, 0);
    }, [orders]);

    // Data aggregation for timeframe charts
    const chartData = useMemo(() => {
        const dates = Array.from({ length: timeframe }, (_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0); // Normalize to midnight
            d.setDate(d.getDate() - (timeframe - 1 - i));
            return d;
        });

        const revenueMap = {};
        const countMap = {};

        dates.forEach(d => {
            const dateKey = d.toISOString().split('T')[0];
            revenueMap[dateKey] = 0;
            countMap[dateKey] = 0;
        });

        orders.forEach(order => {
            if (!order.createdAt) return;
            const orderDate = new Date(order.createdAt);
            const dateKey = orderDate.toISOString().split('T')[0];

            if (revenueMap[dateKey] !== undefined) {
                revenueMap[dateKey] += (order.totalAmount || 0);
                countMap[dateKey] += 1;
            }
        });

        return dates.map(d => {
            const dateKey = d.toISOString().split('T')[0];
            const displayDate = timeframe === 7
                ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return {
                date: displayDate,
                revenue: Math.round(revenueMap[dateKey] || 0),
                orders: countMap[dateKey] || 0
            };
        });
    }, [orders, timeframe]);

    // Payment stats calculation
    const paymentStats = useMemo(() => {
        const stats = { razorpay: 0, cod: 0, wallet: 0 };
        orders.forEach(order => {
            const method = order.paymentMethod?.toLowerCase();
            const status = order.orderStatus?.toLowerCase();
            const payStatus = order.paymentStatus?.toLowerCase();

            if (method && stats[method] !== undefined && status !== 'cancelled' && payStatus !== 'refunded') {
                stats[method] += (order.totalAmount || 0);
            }
        });

        const totalPaid = Object.values(stats).reduce((a, b) => a + b, 0);
        if (totalPaid === 0) {
            return [
                { name: 'Razorpay', value: 65, color: '#6366f1', percentage: '65%' },
                { name: 'Cash on Delivery', value: 20, color: '#f59e0b', percentage: '20%' },
                { name: 'Wallet', value: 15, color: '#10b981', percentage: '15%' }
            ];
        }

        return [
            { name: 'Razorpay', value: stats.razorpay, color: '#6366f1', percentage: `${Math.round((stats.razorpay / totalPaid) * 100)}%` },
            { name: 'Cash on Delivery', value: stats.cod, color: '#f59e0b', percentage: `${Math.round((stats.cod / totalPaid) * 100)}%` },
            { name: 'Wallet', value: stats.wallet, color: '#10b981', percentage: `${Math.round((stats.wallet / totalPaid) * 100)}%` }
        ];
    }, [orders]);

    // Order status calculations
    const orderStatusStats = useMemo(() => {
        const counts = { delivered: 0, processing: 0, pending: 0, canceled: 0, returned: 0 };
        orders.forEach(order => {
            const status = order.orderStatus?.toLowerCase();
            if (status === 'cancelled' || status === 'canceled') counts.canceled++;
            else if (status === 'returned' || status === 'return requested') counts.returned++;
            else if (status === 'delivered') counts.delivered++;
            else if (status === 'processing' || status === 'shipped') counts.processing++;
            else if (status === 'pending') counts.pending++;
        });

        const totalOrders = orders.length || 1;

        return [
            { name: 'Delivered', count: counts.delivered, color: 'bg-emerald-500', pct: (counts.delivered / totalOrders) * 100 },
            { name: 'Processing', count: counts.processing, color: 'bg-sky-500', pct: (counts.processing / totalOrders) * 100 },
            { name: 'Pending', count: counts.pending, color: 'bg-amber-500', pct: (counts.pending / totalOrders) * 100 },
            { name: 'Canceled', count: counts.canceled, color: 'bg-rose-500', pct: (counts.canceled / totalOrders) * 100 },
            { name: 'Returned', count: counts.returned, color: 'bg-indigo-500', pct: (counts.returned / totalOrders) * 100 }
        ];
    }, [orders]);



    // Sales Performance KPI calculations
    const performanceInsights = useMemo(() => {
        const totalPaidOrders = orders.filter(o => {
            const status = o.orderStatus?.toLowerCase();
            const payStatus = o.paymentStatus?.toLowerCase();
            return status !== 'cancelled' && payStatus !== 'refunded';
        });
        const activeCount = totalPaidOrders.length;
        const totalSales = totalPaidOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

        const aov = activeCount > 0 ? Math.round(totalSales / activeCount) : 0;

        const deliveredOrders = orders.filter(o => o.orderStatus?.toLowerCase() === 'delivered').length;
        const totalOrders = orders.length || 1;
        const completionRate = Math.round((deliveredOrders / totalOrders) * 100);

        let totalItems = 0;
        orders.forEach(o => {
            if (o.items) {
                totalItems += o.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
            }
        });
        const avgItems = totalOrders > 0 ? (totalItems / totalOrders).toFixed(1) : '0';

        return {
            aov,
            completionRate,
            avgItems
        };
    }, [orders]);

    // SVG coordinates calculation for Daily Revenue Area Chart
    const paddingLeft = 55;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 35;
    const width = 600;
    const height = 260;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const values = chartData.map(d => chartMetric === 'revenue' ? d.revenue : d.orders);
    const maxValue = Math.max(...values, chartMetric === 'revenue' ? 5000 : 5);
    const chartMax = maxValue * 1.15; // Top padding

    const points = useMemo(() => {
        return chartData.map((d, i) => {
            const val = chartMetric === 'revenue' ? d.revenue : d.orders;
            const x = paddingLeft + (chartData.length > 1 ? (i / (chartData.length - 1)) * chartWidth : 0);
            const y = height - paddingBottom - (val / chartMax) * chartHeight;
            return { x, y, value: val, date: d.date };
        });
    }, [chartData, chartMetric, chartMax, chartWidth, chartHeight]);

    const linePath = useMemo(() => getSvgPath(points), [points]);
    const areaPath = useMemo(() => {
        return points.length > 0
            ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
            : '';
    }, [points, linePath]);

    const gridLines = useMemo(() => {
        return Array.from({ length: 4 }, (_, i) => {
            const val = (i / 3) * chartMax;
            const yPos = height - paddingBottom - (val / chartMax) * chartHeight;
            return { yPos, value: val };
        }).reverse();
    }, [chartMax, chartHeight]);

    const shouldShowXLabel = (index) => {
        if (timeframe === 7) return true;
        return index % 5 === 0 || index === points.length - 1;
    };

    const formatYValue = (val) => {
        if (chartMetric === 'orders') return Math.round(val).toString();
        if (val >= 100000) return `₹${(val / 1000).toFixed(0)}K`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${Math.round(val)}`;
    };

    const svgRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!svgRef.current || points.length === 0) return;
        const rect = svgRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const svgX = (clientX / rect.width) * width;

        const relativeX = svgX - paddingLeft;
        if (relativeX < 0) {
            setHoveredIdx(0);
            return;
        }
        if (relativeX > chartWidth) {
            setHoveredIdx(points.length - 1);
            return;
        }

        const percentage = relativeX / chartWidth;
        const idx = Math.round(percentage * (points.length - 1));
        setHoveredIdx(Math.max(0, Math.min(points.length - 1, idx)));
    };

    const handleMouseLeave = () => {
        setHoveredIdx(null);
    };

    // Donut chart stroke attributes
    const donutTotal = paymentStats.reduce((acc, curr) => acc + curr.value, 0);
    let accumulatedPercent = 0;
    const donutSegments = paymentStats.map((seg) => {
        const percentage = donutTotal > 0 ? seg.value / donutTotal : 0;
        const strokeDasharray = `${percentage * 251.2} 251.2`;
        const strokeDashoffset = -accumulatedPercent * 251.2;
        accumulatedPercent += percentage;
        return {
            ...seg,
            strokeDasharray,
            strokeDashoffset,
            percentNum: Math.round(percentage * 100)
        };
    });

    const StatCard = ({ label, value, trend, icon, color }) => (
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                {trend && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-600">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex font-inter">
                <SideBar />
                <main className="flex-1 lg:ml-72 bg-slate-50 min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Analytics Dashboard...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
            {/* Sidebar */}
            <SideBar />

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 bg-slate-50 min-h-screen pb-12">
                <Header title="Dashboard Overview" subtitle="Monitoring your business performance" />

                <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">


                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            label="Total Customers"
                            value={users.length.toLocaleString()}
                            trend="+12.5%"
                            color="text-indigo-600"
                            icon={<Users className="w-6 h-6 text-indigo-600" />}
                        />
                        <StatCard
                            label="Net Revenue"
                            value={`₹${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            trend="+24.1%"
                            color="text-emerald-600"
                            icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
                        />
                        <StatCard
                            label="Total Orders"
                            value={orders.length.toLocaleString()}
                            trend="+18.7%"
                            color="text-amber-600"
                            icon={<ShoppingCart className="w-6 h-6 text-amber-600" />}
                        />
                    </div>

                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Area Line Chart Panel (Span 2) */}
                        <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col gap-6 relative overflow-hidden">

                            {/* Chart Controls Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 pb-5">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                        <Activity className="text-indigo-600 w-5 h-5" />
                                        Performance Chart
                                    </h3>
                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-[0.12em] mt-0.5">
                                        Daily {chartMetric} trends
                                    </p>
                                </div>

                                {/* Action Pills */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Metric Toggles */}
                                    <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1">
                                        <button
                                            onClick={() => setChartMetric('revenue')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMetric === 'revenue' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}
                                        >
                                            Revenue
                                        </button>
                                        <button
                                            onClick={() => setChartMetric('orders')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMetric === 'orders' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}
                                        >
                                            Orders
                                        </button>
                                    </div>

                                    {/* Timeframe Toggles */}
                                    <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1">
                                        <button
                                            onClick={() => { setTimeframe(7); setHoveredIdx(null); }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeframe === 7 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}
                                        >
                                            7 Days
                                        </button>
                                        <button
                                            onClick={() => { setTimeframe(30); setHoveredIdx(null); }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeframe === 30 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}
                                        >
                                            30 Days
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Aggregation Value Box */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900 tracking-tight">
                                    {chartMetric === 'revenue'
                                        ? `₹${chartData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}`
                                        : `${chartData.reduce((sum, d) => sum + d.orders, 0)} orders`}
                                </span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Total in selected {timeframe} days
                                </span>
                            </div>

                            {/* SVG Chart Graphic */}
                            <div className="relative w-full overflow-hidden select-none">
                                <svg
                                    ref={svgRef}
                                    viewBox={`0 0 ${width} ${height}`}
                                    className="w-full h-auto"
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {/* Definitions for Gradient Masking */}
                                    <defs>
                                        <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Y Gridlines */}
                                    {gridLines.map((line, idx) => (
                                        <g key={idx}>
                                            <line
                                                x1={paddingLeft}
                                                y1={line.yPos}
                                                x2={width - paddingRight}
                                                y2={line.yPos}
                                                stroke="#f1f5f9"
                                                strokeWidth="1.2"
                                                strokeDasharray="4 4"
                                            />
                                            <text
                                                x={paddingLeft - 10}
                                                y={line.yPos + 4}
                                                textAnchor="end"
                                                className="text-[10px] fill-slate-400 font-bold font-mono"
                                            >
                                                {formatYValue(line.value)}
                                            </text>
                                        </g>
                                    ))}

                                    {/* Line Graph Area Fill */}
                                    {areaPath && (
                                        <motion.path
                                            d={areaPath}
                                            fill="url(#indigoGrad)"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.2, duration: 0.6 }}
                                        />
                                    )}

                                    {/* Line Path */}
                                    {linePath && (
                                        <motion.path
                                            d={linePath}
                                            fill="none"
                                            stroke="#6366f1"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        />
                                    )}

                                    {/* Interactive Hover Vertical Guide Line */}
                                    {hoveredIdx !== null && points[hoveredIdx] && (
                                        <line
                                            x1={points[hoveredIdx].x}
                                            y1={paddingTop}
                                            x2={points[hoveredIdx].x}
                                            y2={height - paddingBottom}
                                            stroke="#6366f1"
                                            strokeWidth="1.5"
                                            strokeDasharray="2 2"
                                        />
                                    )}

                                    {/* Axis Bottom Line */}
                                    <line
                                        x1={paddingLeft}
                                        y1={height - paddingBottom}
                                        x2={width - paddingRight}
                                        y2={height - paddingBottom}
                                        stroke="#f1f5f9"
                                        strokeWidth="1.5"
                                    />

                                    {/* X labels */}
                                    {points.map((pt, idx) => {
                                        if (!shouldShowXLabel(idx)) return null;
                                        return (
                                            <text
                                                key={idx}
                                                x={pt.x}
                                                y={height - paddingBottom + 16}
                                                textAnchor="middle"
                                                className="text-[9px] fill-slate-400 font-bold font-mono uppercase tracking-wider"
                                            >
                                                {pt.date.split(',')[0]}
                                            </text>
                                        );
                                    })}

                                    {/* Active Interactive Dot */}
                                    {hoveredIdx !== null && points[hoveredIdx] && (
                                        <circle
                                            cx={points[hoveredIdx].x}
                                            cy={points[hoveredIdx].y}
                                            r="6"
                                            fill="#6366f1"
                                            stroke="#ffffff"
                                            strokeWidth="2.5"
                                            className="drop-shadow-md"
                                        />
                                    )}
                                </svg>

                                {/* HTML Hover Tooltip Inside SVG Overlay */}
                                {hoveredIdx !== null && points[hoveredIdx] && (
                                    <div
                                        className="absolute bg-slate-900 text-white px-3 py-2 rounded-xl shadow-xl text-xs flex flex-col gap-0.5 border border-slate-800 pointer-events-none z-30 transition-all duration-75"
                                        style={{
                                            left: `${(points[hoveredIdx].x / width) * 100}%`,
                                            top: `${(points[hoveredIdx].y / height) * 100 - 15}%`,
                                            transform: 'translate(-50%, -100%)'
                                        }}
                                    >
                                        <span className="font-semibold text-slate-500">{points[hoveredIdx].date}</span>
                                        <span className="font-extrabold text-white text-sm">
                                            {chartMetric === 'revenue' ? `₹${points[hoveredIdx].value.toLocaleString()}` : `${points[hoveredIdx].value} Orders`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Breakdown Panel (Span 1) */}
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col gap-6">

                            {/* Panel Tab Controls */}
                            <div className="flex border-b border-slate-100 pb-3 justify-between items-center">
                                <h3 className="text-base font-black text-slate-900 tracking-tight">
                                    Breakdown
                                </h3>
                                <div className="flex bg-slate-100/80 p-0.5 rounded-lg">
                                    <button
                                        onClick={() => setChannelTab('payment')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${channelTab === 'payment' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Channels
                                    </button>
                                    <button
                                        onClick={() => setChannelTab('status')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${channelTab === 'status' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Statuses
                                    </button>
                                </div>
                            </div>

                            {/* Render Tab Contents */}
                            <div className="flex-1 flex flex-col justify-center">
                                <AnimatePresence mode="wait">
                                    {channelTab === 'payment' ? (
                                        <motion.div
                                            key="paymentTab"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-6"
                                        >
                                            {/* Donut Graphic representation */}
                                            <div className="flex justify-center items-center relative py-2">
                                                <svg width="150" height="150" viewBox="0 0 100 100" className="transform -rotate-90">
                                                    <circle cx="50" cy="50" r="40" stroke="#f8fafc" strokeWidth="12" fill="transparent" />
                                                    {donutSegments.map((seg, idx) => (
                                                        <circle
                                                            key={idx}
                                                            cx="50"
                                                            cy="50"
                                                            r="40"
                                                            stroke={seg.color}
                                                            strokeWidth="12"
                                                            fill="transparent"
                                                            strokeDasharray={seg.strokeDasharray}
                                                            strokeDashoffset={seg.strokeDashoffset}
                                                            className="transition-all duration-300 hover:stroke-[14px] cursor-pointer"
                                                        />
                                                    ))}
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Share</span>
                                                    <span className="text-xl font-black text-slate-900">100%</span>
                                                </div>
                                            </div>

                                            {/* Custom Legend */}
                                            <div className="space-y-3">
                                                {donutSegments.map((seg, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-xs">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></div>
                                                            <span className="font-bold text-slate-800">{seg.name}</span>
                                                        </div>
                                                        <span className="font-bold font-mono text-slate-900 bg-slate-50 px-2 py-0.5 rounded text-[11px] border border-slate-100">
                                                            {seg.percentage}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="statusTab"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4"
                                        >
                                            {orderStatusStats.map((item, idx) => (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="font-bold text-slate-800">{item.name}</span>
                                                        <span className="font-bold font-mono text-slate-500">
                                                            {item.count} ({Math.round(item.pct)}%)
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={`h-full ${item.color}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.pct}%` }}
                                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Row - Categories & Sales Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Recent Orders Widget */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 flex flex-col">
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">Recent Orders</h3>
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Latest transactions</p>
                            </div>

                            <div className="space-y-3 flex-1">
                                {orders.slice(0, 4).map((order, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100/80">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-800">
                                                Order #{order._id?.slice(-6).toUpperCase()}
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-500">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs font-black text-slate-900">
                                                ₹{order.totalAmount?.toLocaleString()}
                                            </span>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                                order.orderStatus?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                order.orderStatus?.toLowerCase() === 'cancelled' || order.orderStatus?.toLowerCase() === 'canceled' ? 'bg-rose-100 text-rose-700' :
                                                order.orderStatus?.toLowerCase() === 'returned' || order.orderStatus?.toLowerCase() === 'return requested' ? 'bg-indigo-100 text-indigo-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {order.orderStatus || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {(!orders || orders.length === 0) && (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-xs text-slate-400 font-medium">No recent orders</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Insights Widget */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">Sales Quality Metrics</h3>
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Performance diagnostic insights</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* AOV Metric */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex flex-col gap-1 text-center sm:text-left">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Avg Order Value</span>
                                    <span className="text-xl font-black text-slate-900">₹{performanceInsights.aov.toLocaleString()}</span>
                                    <span className="text-[9px] font-bold text-emerald-600 flex items-center justify-center sm:justify-start gap-0.5 mt-1">
                                        <TrendingUp className="w-3.5 h-3.5" /> High average
                                    </span>
                                </div>

                                {/* Order Fulfilled Rate */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex flex-col gap-1 text-center sm:text-left">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Completion Rate</span>
                                    <span className="text-xl font-black text-slate-900">{performanceInsights.completionRate}%</span>
                                    <span className="text-[9px] font-bold text-emerald-600 flex items-center justify-center sm:justify-start gap-0.5 mt-1">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Optimal
                                    </span>
                                </div>

                                {/* Basket Size */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex flex-col gap-1 text-center sm:text-left">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Items Per Order</span>
                                    <span className="text-xl font-black text-slate-900">{performanceInsights.avgItems} items</span>
                                    <span className="text-[9px] font-bold text-indigo-600 flex items-center justify-center sm:justify-start gap-0.5 mt-1">
                                        <Clock className="w-3.5 h-3.5" /> Steady index
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
