import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

// Demo users for development (remove when Supabase is configured)
const DEMO_USERS = {
  'admin@lapelukeria.cl':        { id: 'u1', role: 'admin',        name: 'Admin Dueño'     },
  'ely@lapelukeria.cl':          { id: 'u2', role: 'peluquero',    name: 'Ely Cortamelpelo', peluquero_id: 'p1' },
  'recepcion@lapelukeria.cl':    { id: 'u3', role: 'recepcionista', name: 'Recepción'       },
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try real Supabase session first
    const useSupabase = isSupabaseConfigured

    if (useSupabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) loadProfile(session.user)
        else setLoading(false)
      })
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session) loadProfile(session.user)
        else { setUser(null); setProfile(null); setLoading(false) }
      })
      return () => subscription.unsubscribe()
    } else {
      // Demo mode: restore from sessionStorage
      const saved = sessionStorage.getItem('demo_user')
      if (saved) {
        const parsed = JSON.parse(saved)
        setUser(parsed)
        setProfile(parsed)
      }
      setLoading(false)
    }
  }, [])

  async function loadProfile(authUser) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    setUser(authUser)
    setProfile(data)
    setLoading(false)
  }

  async function login(email, password) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } else {
      // Demo mode
      const demo = DEMO_USERS[email]
      if (!demo || password !== 'demo1234') throw new Error('Credenciales incorrectas')
      const u = { ...demo, email }
      sessionStorage.setItem('demo_user', JSON.stringify(u))
      setUser(u)
      setProfile(u)
    }
  }

  async function logout() {
    sessionStorage.removeItem('demo_user')
    if (isSupabaseConfigured && supabase) await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const isAdmin        = profile?.role === 'admin'
  const isRecepcionista = profile?.role === 'recepcionista'
  const isPeluquero    = profile?.role === 'peluquero'
  const canViewCaja    = isAdmin || isRecepcionista

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, isAdmin, isRecepcionista, isPeluquero, canViewCaja }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
