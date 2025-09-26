# 🏨 HabboHub - Teste Local

## 🚀 Como executar o site localmente

### 1. **Iniciar o servidor local**

Execute o script PowerShell na pasta do projeto:

```powershell
# Navegar para a pasta do projeto
cd habbo-hub

# Executar o servidor local
.\servidor-local.ps1
```

### 2. **Acessar o site**

O site estará disponível em: **http://localhost:8080**

### 3. **Funcionalidades disponíveis para teste**

- ✅ **Sidebar colapsável** - Clique no botão ▶️ para colapsar/expandir
- ✅ **Navegação entre seções** - Todas as páginas funcionam
- ✅ **Design responsivo** - Teste em diferentes tamanhos de tela
- ✅ **Animações CSS** - Hover effects e transições
- ✅ **Sistema de rotas** - URLs funcionais para cada seção

### 4. **Estrutura do projeto**

```
habbo-hub/
├── site-completo.html          # Site principal com todas as funcionalidades
├── servidor-local.ps1          # Script do servidor local
├── config/
│   └── apis-habbo.js          # Configuração das APIs do Habbo
├── public/
│   └── assets/                 # Imagens e recursos
└── README-LOCAL.md             # Este arquivo
```

## 🔧 **Próximos passos para implementação**

### **Sistema de Login**
- Implementar autenticação com APIs do Habbo
- Sistema de sessão e cookies
- Validação de credenciais

### **Console Social (/console)**
- Busca de usuários em tempo real
- Exibição de avatares e status
- Sistema de amigos e grupos
- Chat e mensagens

### **Homes (/homes)**
- Listagem de quartos populares
- Busca e filtros avançados
- Visualização de móveis e decoração
- Sistema de avaliações

### **Emblemas (/emblemas)**
- Catálogo completo de emblemas
- Rankings e conquistas
- Sistema de coleção
- Estatísticas de usuários

### **Ferramentas (/ferramentas)**
- Calculadora de preços
- Editor de looks
- Gerador de códigos
- Utilitários para desenvolvedores

## 📱 **APIs do Habbo implementadas**

O arquivo `config/apis-habbo.js` contém todas as APIs oficiais:

- **Avatar Imaging** - Geração de avatares
- **User Info** - Informações de usuários
- **Rooms** - Quartos e homes
- **Badges** - Emblemas e conquistas
- **News** - Notícias e atualizações
- **Catalog** - Itens e móveis
- **Groups** - Grupos e comunidades
- **Events** - Eventos e atividades
- **Marketplace** - Mercado de itens
- **Stats** - Estatísticas do hotel

## 🎯 **Para implementar funcionalidades**

1. **Teste o site atual** - Use o servidor local
2. **Verifique o sistema de login** - Teste a autenticação
3. **Implemente as APIs** - Use o arquivo de configuração
4. **Teste cada funcionalidade** - Valide o comportamento
5. **Deploy** - Publique as mudanças

## 🛠️ **Tecnologias utilizadas**

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos e animações
- **JavaScript ES6+** - Funcionalidades interativas
- **APIs REST** - Integração com Habbo
- **PowerShell** - Servidor local

## 📞 **Suporte**

Para dúvidas ou problemas:
1. Verifique se o PowerShell está executando como administrador
2. Confirme se a porta 8080 não está sendo usada
3. Teste o site em diferentes navegadores
4. Verifique o console do navegador para erros

---

**🎉 Agora você pode testar o HabboHub localmente e implementar as funcionalidades reais!**

## 🚀 Como Acessar a Versão de 12 Horas Atrás

Para acessar a versão atualizada há 12 horas, você precisa iniciar o servidor de desenvolvimento. Aqui estão as opções:

### **Opção 1: Via Terminal/PowerShell**

1. **Abra o PowerShell como Administrador**
2. **Navegue para a pasta do projeto:**
   ```powershell
   cd C:\Users\roque\dev\habbo-hub
   ```

3. **Instale as dependências (se necessário):**
   ```powershell
   npm install
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```powershell
   npm run dev
   ```

5. **Acesse no navegador:**
   - **URL:** `http://localhost:5173`
   - **URL alternativa:** `http://127.0.0.1:5173`

### **Opção 2: Via Script PowerShell (se disponível)**

Se existir o script `servidor-local.ps1`:
```powershell
cd C:\Users\roque\dev\habbo-hub
.\servidor-local.ps1
```

### **Opção 3: Via VS Code/Cursor**

1. **Abra o terminal integrado** no VS Code/Cursor
2. **Execute os comandos:**
   ```bash
   npm install
   npm run dev
   ```

## 🌐 URLs de Acesso

- **Página Principal:** `http://localhost:5173/`
- **Homes Hub:** `http://localhost:5173/homes`
- **Console:** `http://localhost:5173/console`
- **Ferramentas:** `http://localhost:5173/tools`

## ⚠️ Se o Servidor Não Iniciar

Se houver problemas, tente:

1. **Verificar se a porta 5173 está livre:**
   ```powershell
   netstat -an | findstr :5173
   ```

2. **Usar uma porta diferente:**
   ```powershell
   npm run dev -- --port 3000
   ```

3. **Limpar cache:**
   ```powershell
   npm run dev -- --force
   ```

A versão que você tem é a mais recente (atualizada há 12 horas) e contém todas as funcionalidades de badges, sistema de homes e melhorias que foram implementadas!
