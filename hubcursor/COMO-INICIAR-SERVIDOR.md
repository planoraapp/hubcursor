# 🚀 Como Iniciar o Servidor Local

## ❌ **Problema:** Não consigo acessar localhost:8080

## ✅ **Solução Passo a Passo:**

### **1. Abrir PowerShell**
- Pressione `Windows + R`
- Digite `powershell`
- Pressione `Enter`

### **2. Navegar para a pasta do projeto**
```powershell
cd "C:\Users\matheus.roque\Pictures\HabboHub\flash-assets-PRODUCTION-202508202352-144965391\hubcursor"
```

### **3. Verificar se Node.js está instalado**
```powershell
node --version
npm --version
```

**Se não estiver instalado:**
- Baixe em: https://nodejs.org/
- Instale a versão LTS (recomendada)

### **4. Instalar dependências (se necessário)**
```powershell
npm install
```

### **5. Iniciar o servidor**
```powershell
npm run dev
```

### **6. Acessar o site**
- Abra o navegador
- Acesse: `http://localhost:8080`
- Editor: `http://localhost:8080/ferramentas/avatar-editor`

---

## 🔧 **Scripts Automáticos:**

### **Opção 1: Script Completo**
```powershell
.\diagnostico-servidor.ps1
```

### **Opção 2: Script Simples**
```powershell
.\iniciar-servidor-simples.ps1
```

---

## 🚨 **Problemas Comuns:**

### **Erro: "npm não é reconhecido"**
- Instale Node.js: https://nodejs.org/
- Reinicie o PowerShell

### **Erro: "Porta 8080 em uso"**
- Feche outros programas que usam a porta 8080
- Ou mude a porta no `vite.config.ts`

### **Erro: "package.json não encontrado"**
- Execute o comando na pasta `hubcursor`
- Verifique se está na pasta correta

### **Erro: "Dependências não instaladas"**
```powershell
npm install
```

---

## 📱 **URLs Importantes:**

- **Site Principal:** http://localhost:8080
- **Editor de Avatar:** http://localhost:8080/ferramentas/avatar-editor
- **Ferramentas:** http://localhost:8080/ferramentas

---

## ✅ **Resultado Esperado:**

```
  VITE v5.4.10  ready in 1234 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.0.19:8080/
  ➜  press h + enter to show help
```

**Quando aparecer essa mensagem, o servidor está funcionando!** 🎉
