import { useState, useEffect } from 'react'
import api from '../api/axios'

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Other']

const emptyForm = { amount: '', category: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() }

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

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Budgets</h1>
                    <p className="text-gray-400 text-sm mt-1">Set and track your spending limits</p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null) }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                    {showForm ? 'Cancel' : '+ Add Budget'}
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
                    <h2 className="text-white font-semibold mb-4">{editId ? 'Edit Budget' : 'New Budget'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <label className="text-sm text-gray-400 mb-1 block">Budget Amount ($)</label>
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
                            <label className="text-sm text-gray-400 mb-1 block">Month</label>
                            <select
                                value={form.month}
                                onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
                                required
                            >
                                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Year</label>
                            <input
                                type="number"
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                                placeholder="2026"
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : editId ? 'Update Budget' : 'Add Budget'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-3">
                <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                    className="bg-gray-900 text-gray-300 rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500"
                >
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <input
                    type="number"
                    value={filterYear}
                    onChange={(e) => setFilterYear(parseInt(e.target.value))}
                    className="bg-gray-900 text-gray-300 rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 w-24"
                />
            </div>

            {/* Budget list */}
            {loading ? (
                <p className="text-gray-400">Loading...</p>
            ) : budgets.length === 0 ? (
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
                    <p className="text-gray-500">No budgets for this month. Add one!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {budgets.map((budget) => (
                        <div key={budget._id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-white font-medium">{budget.category}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">{MONTHS[budget.month - 1]} {budget.year}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-white font-semibold">${budget.spent?.toFixed(2)} <span className="text-gray-500 font-normal">/ ${budget.amount.toFixed(2)}</span></p>
                                        <p className="text-xs text-gray-500 mt-0.5">${budget.remaining?.toFixed(2)} remaining</p>
                                    </div>
                                    <button onClick={() => handleEdit(budget)} className="text-gray-500 hover:text-indigo-400 text-xs transition">Edit</button>
                                    <button onClick={() => handleDelete(budget._id)} className="text-gray-500 hover:text-red-400 text-xs transition">Delete</button>
                                </div>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${budget.percentage > 100 ? 'bg-red-500' : budget.percentage > 75 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{budget.percentage}% used</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}