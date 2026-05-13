import { useState, useEffect } from 'react'
import api from '../api/axios'

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Other']

const CATEGORY_COLORS = {
    Food: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Transport: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Housing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Entertainment: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Health: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Shopping: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Education: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

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

const emptyForm = { title: '', amount: '', category: '', date: '', notes: '' }

const SkeletonRow = () => (
    <div className="bg-gray-900 rounded-xl px-5 py-4 border border-gray-800/50 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-800 rounded-xl" />
                <div>
                    <div className="h-4 bg-gray-800 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-20" />
                </div>
            </div>
            <div className="h-5 bg-gray-800 rounded w-16" />
        </div>
    </div>
)

export default function Expenses() {
    const [expenses, setExpenses] = useState([])
    const [form, setForm] = useState(emptyForm)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState(null)
    const [filterCategory, setFilterCategory] = useState('')
    const [sortBy, setSortBy] = useState('newest')

    useEffect(() => {
        fetchExpenses()
    }, [filterCategory, sortBy])

    const fetchExpenses = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filterCategory) params.append('category', filterCategory)
            if (sortBy) params.append('sortBy', sortBy)
            const { data } = await api.get(`/expenses?${params.toString()}`)
            setExpenses(data.expenses)
        } catch (err) {
            setError('Failed to load expenses')
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
                await api.put(`/expenses/${editId}`, form)
            } else {
                await api.post('/expenses', form)
            }
            setForm(emptyForm)
            setEditId(null)
            setShowForm(false)
            fetchExpenses()
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (expense) => {
        setForm({
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: expense.date?.split('T')[0],
            notes: expense.notes || ''
        })
        setEditId(expense._id)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return
        try {
            await api.delete(`/expenses/${id}`)
            fetchExpenses()
        } catch (err) {
            setError('Failed to delete expense')
        }
    }

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Expenses</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {expenses.length} expense{expenses.length !== 1 ? 's' : ''} —
                        <span className="text-white font-medium"> ${totalSpent.toFixed(2)}</span> total
                    </p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null) }}
                    className={`text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-lg ${showForm ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'}`}
                >
                    {showForm ? 'Cancel' : '+ Add Expense'}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50">
                    <h2 className="text-white font-semibold mb-5">{editId ? '✏️ Edit Expense' : '➕ New Expense'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Grocery Shopping"
                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition placeholder-gray-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Amount ($)</label>
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
                            <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Notes (optional)</label>
                            <input
                                type="text"
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                placeholder="Add a note..."
                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition placeholder-gray-600"
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                            >
                                {submitting ? 'Saving...' : editId ? 'Update Expense' : 'Add Expense'}
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

            {/* Filters */}
            <div className="flex gap-3 flex-wrap items-center">
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-gray-900 text-gray-300 rounded-xl px-3 py-2 text-sm border border-gray-800 focus:outline-none focus:border-indigo-500 transition"
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                    ))}
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-900 text-gray-300 rounded-xl px-3 py-2 text-sm border border-gray-800 focus:outline-none focus:border-indigo-500 transition"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Amount</option>
                    <option value="lowest">Lowest Amount</option>
                </select>
                {filterCategory && (
                    <button
                        onClick={() => setFilterCategory('')}
                        className="text-xs text-gray-400 hover:text-white bg-gray-800 px-3 py-2 rounded-xl transition"
                    >
                        Clear filter ✕
                    </button>
                )}
            </div>

            {/* Expense list */}
            {loading ? (
                <div className="space-y-3">
                    <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
                </div>
            ) : expenses.length === 0 ? (
                <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800/50 border-dashed text-center">
                    <p className="text-4xl mb-3">💸</p>
                    <p className="text-white font-medium mb-1">No expenses found</p>
                    <p className="text-gray-500 text-sm mb-4">
                        {filterCategory ? `No expenses in ${filterCategory}` : 'Add your first expense to get started'}
                    </p>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
                        >
                            + Add Expense
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {expenses.map((expense) => (
                        <div
                            key={expense._id}
                            className="bg-gray-900 rounded-xl px-5 py-4 border border-gray-800/50 hover:border-gray-700 transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-lg shrink-0">
                                        {CATEGORY_ICONS[expense.category] || '📦'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium text-sm">{expense.title}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[expense.category]}`}>
                                                {expense.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-gray-500 text-xs">{new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            {expense.notes && (
                                                <>
                                                    <span className="text-gray-700">·</span>
                                                    <p className="text-gray-600 text-xs truncate max-w-xs">{expense.notes}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-white font-semibold">${expense.amount.toFixed(2)}</p>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(expense)}
                                            className="text-xs text-gray-400 hover:text-indigo-400 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(expense._id)}
                                            className="text-xs text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}