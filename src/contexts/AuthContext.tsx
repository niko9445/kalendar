import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Profile } from '../types/database.types'

// Типы
interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  loading: boolean
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Провайдер
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Функция для загрузки профиля пользователя
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Ошибка при загрузке профиля:', error)
        return null
      }

      setProfile(data)
      return data
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error)
      return null
    }
  }

  // Функция для обновления профиля
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Ошибка при обновлении профиля:', error)
        throw error
      }

      setProfile(data)
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error)
      throw error
    }
  }

  // Проверяем текущую сессию при загрузке
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Получаем текущую сессию
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Ошибка при получении сессии:', sessionError)
          return
        }

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          await fetchProfile(currentSession.user.id)
        }
      } catch (error) {
        console.error('Ошибка при инициализации аутентификации:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Слушаем изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth event:', event)
        
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Функция входа
  const login = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { 
          success: false, 
          message: error.message 
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Ошибка при входе:', error)
      return { 
        success: false, 
        message: error.message || 'Произошла ошибка при входе' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Функция регистрации
  const signup = async (email: string, password: string, name?: string) => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          }
        }
      })

      if (error) {
        return { 
          success: false, 
          message: error.message 
        }
      }

      return { 
        success: true, 
        message: 'Регистрация успешна! Проверьте вашу почту для подтверждения.' 
      }
    } catch (error: any) {
      console.error('Ошибка при регистрации:', error)
      return { 
        success: false, 
        message: error.message || 'Произошла ошибка при регистрации' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Функция выхода
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Ошибка при выходе:', error)
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}