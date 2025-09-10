import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useHabboAuth } from '@/hooks/useHabboAuth'
import { useNavigate } from 'react-router-dom'

export const LoginNew: React.FC = () => {
  const navigate = useNavigate()
  const { loginWithPassword, verifyMottoAndCreateAccount, isLoading } = useHabboAuth()
  
  // Estados para login por senha
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  // Estados para verificação via motto
  const [mottoUsername, setMottoUsername] = useState('')
  const [motto, setMotto] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Estados para feedback
  const [loginError, setLoginError] = useState('')
  const [mottoError, setMottoError] = useState('')
  const [mottoSuccess, setMottoSuccess] = useState('')

  // Login com senha
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    
    if (!loginUsername || !loginPassword) {
      setLoginError('Preencha todos os campos')
      return
    }

    const success = await loginWithPassword(loginUsername, loginPassword)
    if (success) {
      navigate('/')
    } else {
      setLoginError('Usuário ou senha incorretos')
    }
  }

  // Verificação via motto
  const handleMottoVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setMottoError('')
    setMottoSuccess('')
    
    if (!mottoUsername || !motto || !newPassword || !confirmPassword) {
      setMottoError('Preencha todos os campos')
      return
    }

    if (newPassword !== confirmPassword) {
      setMottoError('As senhas não coincidem')
      return
    }

    if (newPassword.length < 6) {
      setMottoError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    const success = await verifyMottoAndCreateAccount(mottoUsername, motto, newPassword)
    if (success) {
      setMottoSuccess('Conta criada com sucesso! Redirecionando...')
      setTimeout(() => navigate('/'), 2000)
    } else {
      setMottoError('Erro ao criar conta. Verifique se a motto está correta.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            🔐 HabboHub - Login
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Faça login ou crie sua conta
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login por Senha</TabsTrigger>
              <TabsTrigger value="motto">Primeiro Login</TabsTrigger>
            </TabsList>
            
            {/* Aba de Login por Senha */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome de Usuário
                  </label>
                  <Input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Digite seu nome do Habbo"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <Input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full"
                  />
                </div>
                
                {loginError && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                    {loginError}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Fazer Login'}
                </Button>
              </form>
              
              <div className="text-center text-sm text-gray-600">
                <p>Contas de teste:</p>
                <p><strong>habbohub</strong> / 151092</p>
                <p><strong>beebop</strong> / 290684</p>
              </div>
            </TabsContent>
            
            {/* Aba de Primeiro Login via Motto */}
            <TabsContent value="motto" className="space-y-4">
              <form onSubmit={handleMottoVerification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome de Usuário do Habbo
                  </label>
                  <Input
                    type="text"
                    value={mottoUsername}
                    onChange={(e) => setMottoUsername(e.target.value)}
                    placeholder="Digite seu nome do Habbo"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motto Atual
                  </label>
                  <Input
                    type="text"
                    value={motto}
                    onChange={(e) => setMotto(e.target.value)}
                    placeholder="Digite sua motto atual do Habbo"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite uma senha (mín. 6 caracteres)"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua senha"
                    className="w-full"
                  />
                </div>
                
                {mottoError && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                    {mottoError}
                  </div>
                )}
                
                {mottoSuccess && (
                  <div className="text-green-600 text-sm bg-green-50 p-2 rounded">
                    {mottoSuccess}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Verificar e Criar Conta'}
                </Button>
              </form>
              
              <div className="text-center text-sm text-gray-600">
                <p className="font-medium">Como funciona:</p>
                <p>1. Digite seu nome do Habbo</p>
                <p>2. Digite sua motto atual</p>
                <p>3. Crie uma senha para login futuro</p>
                <p>4. Sua conta será criada automaticamente</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
