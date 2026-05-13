import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
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

    if (loading) return <div className="text-gray-400">Loading...</div>
    if (error) return <div className="text-red-400">{error}</div>

    const monthlyData = stats.monthlySpending.map((item) => ({
        name: MONTHS[item._id.month - 1],
        total: item.total
    }))

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Your spending overview for {MONTHS[currentMonth - 1]} {currentYear}</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <p className="text-gray-400 text-sm">Total Spent</p>
                    <p className="text-3xl font-bold text-white mt-1">${stats.totalSpent.toFixed(2)}</p>
                    <p className="text-gray-500 text-xs mt-1">This month</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <p className="text-gray-400 text-sm">Categories</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.spendingByCategory.length}</p>
                    <p className="text-gray-500 text-xs mt-1">Active this month</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <p className="text-gray-400 text-sm">Budgets Tracked</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.budgetVsActual.length}</p>
                    <p className="text-gray-500 text-xs mt-1">This month</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie chart */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <h2 className="text-white font-semibold mb-4">Spending by Category</h2>
                    {stats.spendingByCategory.length === 0 ? (
                        <p className="text-gray-500 text-sm">No expenses this month</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={stats.spendingByCategory}
                                    dataKey="total"
                                    nameKey="_id"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                >
                                    {stats.spendingByCategory.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => `$${value.toFixed(2)}`}
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Bar chart */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <h2 className="text-white font-semibold mb-4">Monthly Spending</h2>
                    {monthlyData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value) => `$${value.toFixed(2)}`}
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Budget vs Actual */}
            {stats.budgetVsActual.length > 0 && (
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <h2 className="text-white font-semibold mb-4">Budget vs Actual</h2>
                    <div className="space-y-4">
                        {stats.budgetVsActual.map((item) => (
                            <div key={item.category}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">{item.category}</span>
                                    <span className={item.percentage > 100 ? 'text-red-400' : 'text-gray-400'}>
                                        ${item.spent.toFixed(2)} / ${item.budget.toFixed(2)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${item.percentage > 100 ? 'bg-red-500' : item.percentage > 75 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{item.percentage}% used</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick links */}
            <div className="flex gap-4">
                <Link to="/expenses" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                    + Add Expense
                </Link>
                <Link to="/budgets" className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                    Manage Budgets
                </Link>
            </div>
        </div>
    )
}