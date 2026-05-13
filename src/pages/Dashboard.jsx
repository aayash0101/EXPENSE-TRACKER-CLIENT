import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { useAuth } from '../context/AuthContext'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const StatCard = ({ label, value, sub, icon, color }) => (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 hover:border-gray-700 transition-all">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
                <p className="text-gray-500 text-xs mt-1">{sub}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-lg`}>
                {icon}
            </div>
        </div>
    </div>
)

const SkeletonCard = () => (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-800 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-20" />
    </div>
)

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { user } = useAuth()
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const { data } = await api.get(`/stats?month=${currentMonth}&year=${currentYear}`)
            setStats(data)
        } catch (err) {
            setError('Failed to load stats')
        } finally {
            setLoading(false)
        }
    }

    if (error) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <p className="text-red-400 text-lg mb-2">Failed to load dashboard</p>
                <button onClick={fetchStats} className="text-indigo-400 text-sm hover:underline">Try again</button>
            </div>
        </div>
    )

    const monthlyData = stats?.monthlySpending.map((item) => ({
        name: MONTHS[item._id.month - 1],
        total: item.total
    })) || []

    const pieData = stats?.spendingByCategory.map((item) => ({
        name: item._id,
        value: item.total
    })) || []

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm">Welcome back,</p>
                    <h1 className="text-2xl font-bold text-white">{user?.name} 👋</h1>
                    <p className="text-gray-500 text-sm mt-1">{MONTHS[currentMonth - 1]} {currentYear} overview</p>
                </div>
                <Link
                    to="/expenses"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/20"
                >
                    + Add Expense
                </Link>
            </div>

            {/* Stat cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        label="Total Spent"
                        value={`$${stats.totalSpent.toFixed(2)}`}
                        sub="This month"
                        icon="💸"
                        color="bg-indigo-500/10"
                    />
                    <StatCard
                        label="Categories"
                        value={stats.spendingByCategory.length}
                        sub="Active this month"
                        icon="📊"
                        color="bg-purple-500/10"
                    />
                    <StatCard
                        label="Budgets Tracked"
                        value={stats.budgetVsActual.length}
                        sub="This month"
                        icon="🎯"
                        color="bg-emerald-500/10"
                    />
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie chart */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50">
                    <h2 className="text-white font-semibold mb-1">Spending by Category</h2>
                    <p className="text-gray-500 text-xs mb-4">{MONTHS[currentMonth - 1]} {currentYear}</p>
                    {loading ? (
                        <div className="h-64 bg-gray-800 rounded-xl animate-pulse" />
                    ) : pieData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-4xl mb-2">📭</p>
                                <p className="text-gray-500 text-sm">No expenses this month</p>
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={40}
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => `$${value.toFixed(2)}`}
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', color: '#fff' }}
                                />
                                <Legend
                                    formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '12px' }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Bar chart */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50">
                    <h2 className="text-white font-semibold mb-1">Monthly Spending</h2>
                    <p className="text-gray-500 text-xs mb-4">Last 6 months</p>
                    {loading ? (
                        <div className="h-64 bg-gray-800 rounded-xl animate-pulse" />
                    ) : monthlyData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-4xl mb-2">📭</p>
                                <p className="text-gray-500 text-sm">No data yet</p>
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="name" stroke="#4b5563" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <YAxis stroke="#4b5563" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <Tooltip
                                    formatter={(value) => `$${value.toFixed(2)}`}
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', color: '#fff' }}
                                />
                                <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Budget vs Actual */}
            {!loading && stats?.budgetVsActual.length > 0 && (
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50">
                    <h2 className="text-white font-semibold mb-1">Budget vs Actual</h2>
                    <p className="text-gray-500 text-xs mb-5">{MONTHS[currentMonth - 1]} {currentYear}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stats.budgetVsActual.map((item) => (
                            <div key={item.category}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-300">{item.category}</span>
                                        {item.percentage > 100 && (
                                            <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">Over budget</span>
                                        )}
                                        {item.percentage > 75 && item.percentage <= 100 && (
                                            <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/20">Almost full</span>
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium ${item.percentage > 100 ? 'text-red-400' : 'text-gray-400'}`}>
                                        ${item.spent.toFixed(2)} / ${item.budget.toFixed(2)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${item.percentage > 100 ? 'bg-red-500' : item.percentage > 75 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <p className="text-xs text-gray-600">{item.percentage}% used</p>
                                    <p className="text-xs text-gray-600">${item.remaining.toFixed(2)} left</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick actions */}
            {!loading && stats?.budgetVsActual.length === 0 && (
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 border-dashed text-center">
                    <p className="text-4xl mb-2">🎯</p>
                    <p className="text-white font-medium mb-1">No budgets set for this month</p>
                    <p className="text-gray-500 text-sm mb-4">Set budgets to track your spending limits</p>
                    <Link to="/budgets" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
                        Set Budgets
                    </Link>
                </div>
            )}
        </div>
    )
}