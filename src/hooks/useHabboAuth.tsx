import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface HabboUser {
  id: string
  habbo_username: string
  habbo_motto: string
  habbo_avatar: string
  is_admin: boolean
  is_verified: boolean
  last_login: string
  created_at: string
}

interface AuthContextType {
  user: HabboUser | null
  isLoading: boolean
  loginWithPassword: (username: string, password: string) => Promise<boolean>
  verifyMottoAndCreateAccount: (username: string, motto: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useHabboAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useHabboAuth deve ser usado dentro de HabboAuthProvider')
  }
  return context
}

interface HabboAuthProviderProps {
  children: ReactNode
}

export const HabboAuthProvider = ({ children }: HabboAuthProviderProps) => {
  const [user, setUser] = useState<HabboUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('habbo_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        localStorage.removeItem('habbo_user')
      }
    }
    setIsLoading(false)
  }, [])

  // Login com senha
  const loginWithPassword = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/habbo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habboUsername: username,
          password: password
        })
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        localStorage.setItem('habbo_user', JSON.stringify(data.user))
        return true
      } else {
        console.error('Erro no login:', data.error)
        return false
      }
    } catch (error) {
      console.error('Erro na requisição de login:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar motto e criar conta
  const verifyMottoAndCreateAccount = async (username: string, motto: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/verify-motto-and-create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habboName: username,
          motto: motto,
          password: password
        })
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        localStorage.setItem('habbo_user', JSON.stringify(data.user))
        return true
      } else {
        console.error('Erro na verificação:', data.error)
        return false
      }
    } catch (error) {
      console.error('Erro na requisição de verificação:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem('habbo_user')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    loginWithPassword,
    verifyMottoAndCreateAccount,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
