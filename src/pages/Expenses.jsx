import { useState, useEffect } from 'react'
import api from '../api/axios'

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Other']

const emptyForm = { title: '', amount: '', category: '', date: '', notes: '' }

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
                    <p className="text-gray-400 text-sm mt-1">Total: ${totalSpent.toFixed(2)}</p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null) }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                    {showForm ? 'Cancel' : '+ Add Expense'}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <h2 className="text-white font-semibold mb-4">{editId ? 'Edit Expense' : 'New Expense'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Grocery Shopping"
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Amount ($)</label>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
                                required
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm text-gray-400 mb-1 block">Notes</label>
                            <input
                                type="text"
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                placeholder="Optional notes"
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : editId ? 'Update Expense' : 'Add Expense'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-gray-900 text-gray-300 rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-900 text-gray-300 rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Amount</option>
                    <option value="lowest">Lowest Amount</option>
                </select>
            </div>

            {/* Expense list */}
            {loading ? (
                <p className="text-gray-400">Loading...</p>
            ) : expenses.length === 0 ? (
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
                    <p className="text-gray-500">No expenses yet. Add your first one!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {expenses.map((expense) => (
                        <div key={expense._id} className="bg-gray-900 rounded-xl px-5 py-4 border border-gray-800 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                    <p className="text-white font-medium text-sm">{expense.title}</p>
                                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{expense.category}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-gray-500 text-xs">{new Date(expense.date).toLocaleDateString()}</p>
                                    {expense.notes && <p className="text-gray-600 text-xs truncate">{expense.notes}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                                <p className="text-white font-semibold">${expense.amount.toFixed(2)}</p>
                                <button onClick={() => handleEdit(expense)} className="text-gray-500 hover:text-indigo-400 text-xs transition">Edit</button>
                                <button onClick={() => handleDelete(expense._id)} className="text-gray-500 hover:text-red-400 text-xs transition">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}