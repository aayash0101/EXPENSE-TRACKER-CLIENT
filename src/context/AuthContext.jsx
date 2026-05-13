import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            fetchMe()
        } else {
            setLoading(false)
        }
    }, [])

    const fetchMe = async () => {
        try {
            const { data } = await api.get('/auth/me')
            setUser(data.user)
        } catch (err) {
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password })
        localStorage.setItem('token', data.token)
        setUser(data.user)
    }

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('token', data.token)
        setUser(data.user)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)