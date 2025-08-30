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
