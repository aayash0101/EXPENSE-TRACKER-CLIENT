import { useState, useEffect } from 'react'
import api from '../api/axios'

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Other']

const CATEGORY_ICONS = {
    Food: '🍔',
    Transport: '🚗',
    Housing: '🏠',
    Entertainment: '🎬',
    Health: '💊',
    Shopping: '🛍️',
    Education: '📚',
    Other: '📦',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const emptyForm = {
    amount: '',
    category: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
}

const SkeletonBudget = () => (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-xl" />
                <div>
                    <div className="h-4 bg-gray-800 rounded w-24 mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-16" />
                </div>
            </div>
            <div className="h-5 bg-gray-800 rounded w-28" />
        </div>
        <div className="h-2 bg-gray-800 rounded-full" />
    </div>
)

export default function Budgets() {
    const [budgets, setBudgets] = useState([])
    const [form, setForm] = useState(emptyForm)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState(null)
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
    const [filterYear, setFilterYear] = useState(new Date().getFullYear())

    useEffect(() => {
        fetchBudgets()
    }, [filterMonth, filterYear])

    const fetchBudgets = async () => {
        setLoading(true)
        try {
            const { data } = await api.get(`/budgets?month=${filterMonth}&year=${filterYear}`)
            setBudgets(data.budgets)
        } catch (err) {
            setError('Failed to load budgets')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            if (editId) {
                await api.put(`/budgets/${editId}`, form)
            } else {
                await api.post('/budgets', form)
            }
            setForm(emptyForm)
            setEditId(null)
            setShowForm(false)
            fetchBudgets()
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (budget) => {
        setForm({
            amount: budget.amount,
            category: budget.category,
            month: budget.month,
            year: budget.year
        })
        setEditId(budget._id)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this budget?')) return
        try {
            await api.delete(`/budgets/${id}`)
            fetchBudgets()
        } catch (err) {
            setError('Failed to delete budget')
        }
    }

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0)
    const overBudget = budgets.filter(b => b.percentage > 100).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Budgets</h1>
                    <p className="text-gray-400 text-sm mt-1">Set and track your monthly spending limits</p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null) }}
                    className={`text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-lg ${showForm ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'}`}
                >
                    {showForm ? 'Cancel' : '+ Add Budget'}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Summary cards */}
            {!loading && budgets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800/50">
                        <p className="text-gray-400 text-xs uppercase tracking-wide font-medium">Total Budget</p>
                        <p className="text-2xl font-bold text-white mt-1">${totalBudget.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800/50">
                        <p className="text-gray-400 text-xs uppercase tracking-wide font-medium">Total Spent</p>
                        <p className="text-2xl font-bold text-white mt-1">${totalSpent.toFixed(2)}</p>
                    </div>
                    <div className={`rounded-2xl p-5 border ${overBudget > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                        <p className="text-gray-400 text-xs uppercase tracking-wide font-medium">Over Budget</p>
                        <p className={`text-2xl font-bold mt-1 ${overBudget > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {overBudget > 0 ? `${overBudget} categor${overBudget !== 1 ? 'ies' : 'y'}` : 'All good ✓'}
                        </p>
                    </div>
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50">
                    <h2 className="text-white font-semibold mb-5">{editId ? '✏️ Edit Budget' : '➕ New Budget'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition"
                                required
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Budget Amount ($)</label>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition placeholder-gray-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Month</label>
                            <select
                                value={form.month}
                                onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition"
                                required
                            >
                                {MONTHS.map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Year</label>
                            <input
                                type="number"
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                                placeholder="2026"
                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition placeholder-gray-600"
                                required
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                            >
                                {submitting ? 'Saving...' : editId ? 'Update Budget' : 'Add Budget'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null) }}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-6 py-2.5 rounded-xl transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-3 items-center">
                <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                    className="bg-gray-900 text-gray-300 rounded-xl px-3 py-2 text-sm border border-gray-800 focus:outline-none focus:border-indigo-500 transition"
                >
                    {MONTHS.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                    ))}
                </select>
                <input
                    type="number"
                    value={filterYear}
                    onChange={(e) => setFilterYear(parseInt(e.target.value))}
                    className="bg-gray-900 text-gray-300 rounded-xl px-3 py-2 text-sm border border-gray-800 focus:outline-none focus:border-indigo-500 transition w-24"
                />
                <span className="text-gray-500 text-sm">
                    {budgets.length} budget{budgets.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Budget list */}
            {loading ? (
                <div className="space-y-4">
                    <SkeletonBudget /><SkeletonBudget /><SkeletonBudget />
                </div>
            ) : budgets.length === 0 ? (
                <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800/50 border-dashed text-center">
                    <p className="text-4xl mb-3">🎯</p>
                    <p className="text-white font-medium mb-1">No budgets for {MONTHS[filterMonth - 1]} {filterYear}</p>
                    <p className="text-gray-500 text-sm mb-4">Set a budget to start tracking your spending limits</p>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
                        >
                            + Add Budget
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {budgets.map((budget) => (
                        <div
                            key={budget._id}
                            className={`bg-gray-900 rounded-2xl p-6 border transition-all hover:border-gray-700 group
                                ${budget.percentage > 100 ? 'border-red-500/30' : 'border-gray-800/50'}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-xl">
                                        {CATEGORY_ICONS[budget.category] || '📦'}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{budget.category}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">{MONTHS[budget.month - 1]} {budget.year}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {budget.percentage > 100 && (
                                        <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-lg border border-red-500/20">Over budget</span>
                                    )}
                                    {budget.percentage > 75 && budget.percentage <= 100 && (
                                        <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-lg border border-yellow-500/20">Almost full</span>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${budget.percentage > 100 ? 'bg-red-500' : budget.percentage > 75 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Spent</p>
                                        <p className={`text-sm font-semibold ${budget.percentage > 100 ? 'text-red-400' : 'text-white'}`}>
                                            ${budget.spent?.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Budget</p>
                                        <p className="text-sm font-semibold text-white">${budget.amount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Remaining</p>
                                        <p className={`text-sm font-semibold ${budget.remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            ${budget.remaining?.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(budget)}
                                        className="text-xs text-gray-400 hover:text-indigo-400 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(budget._id)}
                                        className="text-xs text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}