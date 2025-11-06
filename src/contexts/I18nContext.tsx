import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Traduções completas do site
const translations = {
  pt: {
    // Navegação
    'nav.home': 'Inicio',
    'nav.console': 'Console',
    'nav.homes': 'Homes',
    'nav.journal': 'Jornal',
    'nav.tools': 'Ferramentas',
    'nav.marketplace': 'Marketplace',
    'nav.photos': 'Fotos',
    'nav.friends': 'Amigos',
    'nav.profile': 'Perfil',
    'nav.login': 'Conectar Conta Habbo',
    'nav.logout': 'Sair',
    'nav.register': 'Registrar',
    'nav.admin': 'Admin',
    'nav.accounts': 'Contas',
    
    // Sidebar
    'sidebar.userPanel.monthlyXP': 'XP Mensal',
    'sidebar.userPanel.hubHome': 'Perfil',
    'sidebar.userPanel.settings': 'Configurações',
    'sidebar.userPanel.logout': 'Sair',
    'sidebar.userPanel.status': 'Status no Site',
    'sidebar.userPanel.notifications': 'Notificações',
    'sidebar.userPanel.language': 'Idioma',
    'sidebar.userPanel.online': 'Online',
    'sidebar.userPanel.offline': 'Offline',
    'sidebar.userPanel.portuguese': 'Português',
    'sidebar.userPanel.english': 'Inglês',
    'sidebar.userPanel.spanish': 'Espanhol',
    'sidebar.userPanel.enable': 'Ativar',
    'sidebar.userPanel.disable': 'Desativar',
    'sidebar.userPanel.back': 'Voltar',
    
    // Páginas
    'pages.home.title': 'Bem-vindo ao Habbo Hub',
    'pages.home.subtitle': 'A plataforma definitiva para a comunidade Habbo. Conecte-se, explore e compartilhe sua paixão pelo Habbo Hotel.',
    'pages.home.console.title': 'Console Social',
    'pages.home.console.description': 'Acesse o console para ver fotos de amigos, curtir, comentar, buscar usuários e interagir com a comunidade do mundo inteiro!',
    'pages.home.console.button': 'Acessar Console',
    'pages.home.homes.title': 'Habbo Homes',
    'pages.home.homes.description': 'Crie e Explore as homes dos habbos e edite sua página como quiser',
    'pages.home.homes.button': 'Ver Homes',
    'pages.home.tools.title': 'Ferramentas',
    'pages.home.tools.description': 'Acesse ferramentas exclusivas para personalizar seu Habbo e facilitar sua experiência.',
    'pages.home.tools.button': 'Ver Ferramentas',
    'pages.marketplace.title': 'Marketplace',
    'pages.marketplace.subtitle': 'Compre e venda itens do Habbo',
    'pages.photos.title': 'Fotos',
    'pages.photos.subtitle': 'Veja fotos dos usuários',
    'pages.friends.title': 'Amigos',
    'pages.friends.subtitle': 'Gerencie sua lista de amigos',
    'pages.profile.title': 'Perfil',
    'pages.profile.subtitle': 'Visualize e edite seu perfil',
    'pages.login.title': 'Entrar',
    'pages.login.subtitle': 'Faça login em sua conta',
    'pages.register.title': 'Registrar',
    'pages.register.subtitle': 'Crie uma nova conta',
    'pages.homes.title': 'Habbo Homes',
    'pages.homes.subtitle': 'Explore homes de usuários',
    'pages.homes.searchPlaceholder': 'Buscar usuários...',
    'pages.homes.searchButton': 'Buscar Usuários com Homes',
    'pages.homes.onlineUsers': 'Usuários Online Agora',
    'pages.homes.popularHomes': 'Homes Populares',
    'pages.homes.recentHomes': 'Homes Recentes',
    'pages.console.title': 'Console Social',
    'pages.console.subtitle': 'Interaja com a comunidade Habbo',
    'pages.console.searchUser': 'Digite o nome do usuário...',
    'pages.console.feedTitle': '📸 Feed de Fotos dos Amigos',
    'pages.console.addComment': 'Adicione um comentário...',
    'pages.console.selectCountry': 'Selecionar pais',
    'pages.console.likes': 'curtida',
    'pages.console.likesPlural': 'curtidas',
    'pages.console.myInfo': 'Perfil',
    'pages.console.createdAt': 'Criado em:',
    'pages.console.lastAccess': 'Último acesso:',
    'pages.console.friends': 'Amigos',
    'pages.console.rooms': 'Quartos',
    'pages.console.badges': 'Emblemas',
    'pages.console.groups': 'Grupos',
    'pages.console.friendsFeed': 'Feed de Amigos',
    'pages.console.loadingPhotos': 'Carregando fotos dos amigos...',
    'pages.console.errorLoadingPhotos': 'Erro ao carregar fotos dos amigos',
    'pages.console.tryAgain': 'Tentar novamente',
    'pages.console.noPhotos': 'Nenhuma foto encontrada',
    'pages.console.noPhotosDescription': 'Seus amigos ainda não postaram fotos',
    'pages.console.loginRequired': 'Você precisa estar logado',
    'pages.console.loginRequiredDescription': 'Conecte sua conta do Habbo para ver as fotos dos seus amigos',
    'pages.console.loadingUser': 'Carregando informações do usuário...',
    'pages.console.loadingFeed': 'Carregando feed de fotos...',
    'pages.console.loadingGlobalFeed': 'Carregando feed global...',
    'pages.console.loadingFriends': 'Carregando amigos...',
    'pages.console.searchUsers': '🔍 Buscar Usuários',
    'pages.console.friendsCount': '{count} amigos',
    'pages.console.noFriends': 'Voce ainda nao tem amigos adicionados ou seus amigos nao estao visiveis.',
    'pages.console.photos': 'Fotos',
           'pages.console.photosWithCount': 'Fotos ({count})',
           'pages.console.followers': 'Seguidores',
           'pages.console.following': 'Seguindo',
           'pages.console.editProfile': 'Editar Perfil',
           'pages.console.saveChanges': 'Salvar Alterações',
           'pages.console.chat': 'Chat',
           'pages.console.sendComment': 'Enviar comentário',
           'pages.console.restorePhoto': 'Restaurar Foto',
           'pages.console.hidePhoto': 'Ocultar Foto',
           'pages.console.showPhoto': 'Mostrar Foto',
           'pages.console.enlargedPhoto': 'Foto ampliada',
           'pages.console.habboTicker': 'Habbo Ticker',
           'pages.console.follow': 'Seguir',
           'pages.console.message': 'Mensagem',
           'pages.console.followFunctionComingSoon': '🚀 Função "Seguir" será implementada em breve! Por enquanto, adicione {username} aos seus amigos no Habbo Hotel.',
           'pages.console.friendsOf': 'Amigos de {username} ({count})',
           'pages.console.badgesOf': 'Emblemas de {username} ({count})',
           'pages.console.groupsOf': 'Grupos de {username} ({count})',
           'pages.console.roomsOf': 'Quartos de {username} ({count})',
           'pages.console.noPhotoSelected': 'Nenhuma foto selecionada',
           'pages.console.userHasNoPhotos': 'O usuário não tem fotos :(',
           'pages.console.noCommunityPhotos': 'Ainda não há fotos da comunidade',
           'pages.console.noPhotoAvailable': 'Nenhuma foto disponivel',
           'pages.console.noLikesYet': 'Ainda não há curtidas nesta foto',
    'pages.tools.title': 'Ferramentas',
    'pages.tools.subtitle': 'Ferramentas úteis para o Habbo',
    
    // Modal de Agradecimentos
    'pages.home.credits.title': '🏆 Agradecimentos',
    'pages.home.credits.intro': 'O HabboHub foi criado com a intencao de unir toda a comunidade de jogadores, com algumas funcoes extras. Ele foi criado por um unico usuario, sem experiencia em programacao. So que esse projeto nunca seria possivel se uma grande e incrivel comunidade nao tivesse ja feito um grande trabalho, e que me ensinou como construir esse pedaco do Habbo, fora do Habbo.',
    'pages.home.credits.learned': 'Eu posso ter esquecido muitos, mas aprendi diversas ferramentas sociais investigando grandes fã-sites como Puhekupla, HabboEmotion, HabboAssets, Habborator, uma grande coleção (basicamente tudo) de imagens veio graças aos arquivos de ViaJovem, e entendi um pouco mais de visuais com a Habbo Templarios.',
    'pages.home.credits.eonu': '(E obrigado à eonu pelas fontes Volter)',
    'pages.home.credits.conclusion': 'Sem o trabalho desses e tantos outros, o HabboHub era só uma imaginação.',
    'pages.home.credits.final': 'Espero que se divirtam com o site, e me perdoem por todos os bugs que ainda restam ^^',
    
    // Botões e ações
    'buttons.save': 'Salvar',
    'buttons.cancel': 'Cancelar',
    'buttons.edit': 'Editar',
    'buttons.delete': 'Excluir',
    'buttons.confirm': 'Confirmar',
    'buttons.close': 'Fechar',
    'buttons.back': 'Voltar',
    'buttons.next': 'Próximo',
    'buttons.previous': 'Anterior',
    'buttons.loading': 'Carregando...',
    'buttons.search': 'Pesquisar',
    'buttons.searching': 'Buscando...',
    'buttons.filter': 'Filtrar',
    'buttons.sort': 'Ordenar',
    'buttons.viewHomes': 'Ver Homes',
    'buttons.viewDetails': 'Ver Detalhes',
    'buttons.openPopup': 'Abrir em Nova Janela',
    'buttons.openConsolePopup': 'Abrir Console em Pop-up',
    'buttons.openConsole': 'Abrir Console',
    'buttons.focusConsole': 'Focar Console',
    
    // Mensagens
    'messages.loading': 'Carregando...',
    'messages.loadingConsole': 'Carregando console...',
    'messages.loadingHome': 'Carregando dados da Hub Home...',
    'messages.error': 'Erro ao carregar dados',
    'messages.errorSearch': 'Erro ao buscar usuários',
    'messages.errorSearchDescription': 'Ocorreu um erro na busca',
    'messages.success': 'Operação realizada com sucesso',
    'messages.noData': 'Nenhum dado encontrado',
    'messages.noResults': 'Nenhum resultado encontrado',
    'messages.noResultsDescription': 'Tente buscar por um nome diferente ou deixe o campo vazio para ver usuários online',
    'messages.confirmDelete': 'Tem certeza que deseja excluir?',
    'messages.loginRequired': 'Você precisa estar logado para acessar esta página',
    'messages.popupBlocked': 'Popup bloqueado! Por favor, permita popups para este site.',
    'messages.searchTip': '💡 Dica: Digite pelo menos 2 caracteres para buscar automaticamente. A busca mostra homes cadastradas e perfis descobertos.',
    
    // Toast Notifications
    'toast.loginRequired': 'Voce precisa estar logado para comentar',
    'toast.commentingTooFast': 'Voce esta comentando muito rapido',
    'toast.invalidComment': 'Comentario invalido',
    'toast.commentSent': 'Comentario enviado!',
    'toast.commentError': 'Erro ao enviar comentario',
    'toast.commentAdded': 'Comentario adicionado!',
    'toast.commentAddError': 'Erro ao adicionar comentario',
    'toast.commentDeleted': 'Comentario excluido!',
    'toast.commentDeleteError': 'Erro ao excluir comentario',
    'toast.commentReported': 'Comentario denunciado! Nossa equipe ira analisar.',
    'toast.commentReportError': 'Erro ao denunciar comentario',
    'toast.likeError': 'Erro ao curtir foto',
    'toast.likeRemoved': 'Curtida removida',
    'toast.unlikeError': 'Erro ao remover curtida',
    'toast.followError': 'Erro ao seguir usuario',
    'toast.unfollowError': 'Erro ao deixar de seguir usuario',
    'toast.updatingBadges': 'Atualizando badges...',
    'toast.downloadStarted': 'Download iniciado!',
    'toast.nowFollowing': 'Agora voce esta seguindo {username}!',
    'toast.stoppedFollowing': 'Voce parou de seguir {username}',
    'toast.languageChanged': 'Idioma alterado',
    'toast.languageChangedTo': 'O idioma foi alterado para {language}',
    
    // Mensagens de erro de autenticação
    'auth.loginError': 'Erro no login',
    'auth.invalidCredentials': 'Usuário não encontrado ou senha incorreta',
    'auth.unexpectedError': 'Erro inesperado ao fazer login',
    
    // Instruções de login por motto
    'auth.mottoInstructions.copyCode': 'Copie o código acima',
    'auth.mottoInstructions.goToHotel': 'Vá para o Hotel Habbo',
    'auth.mottoInstructions.changeMotto': 'Mude seu motto/missão para',
    'auth.mottoInstructions.clickVerify': 'Clique em "Verificar Login" abaixo',
    
    // Mensagens de verificação
    'auth.verification.enterCode': 'Digite o código de verificação',
    'auth.verification.error': 'Erro na Verificação',
    
    // Formulários
    'forms.username': 'Nome de usuário',
    'forms.password': 'Senha',
    'forms.email': 'E-mail',
    'forms.confirmPassword': 'Confirmar senha',
    'forms.motto': 'Motto',
    'forms.hotel': 'Hotel',
    'forms.language': 'Idioma',
    
    // Validações
    'validation.required': 'Este campo é obrigatório',
    'validation.email': 'E-mail inválido',
    'validation.passwordMatch': 'As senhas não coincidem',
    'validation.minLength': 'Minimo de {min} caracteres',
    'validation.maxLength': 'Máximo de {max} caracteres',
    
    // Status
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.busy': 'Ocupado',
    'status.away': 'Ausente',
    
    // Tempo
    'time.now': 'Agora',
    'time.minutesAgo': '{minutes} minutos atrás',
    'time.hoursAgo': '{hours} horas atrás',
    'time.daysAgo': '{days} dias atrás',
    'time.weeksAgo': '{weeks} semanas atrás',
    'time.monthsAgo': '{months} meses atrás',
    'time.yearsAgo': '{years} anos atrás',
    
    // Footer Disclaimer
    'footer.disclaimer': 'Habbo Hub nao esta afiliada a, respaldada, promocionada ou aprovada especificamente por Sulake Oy ou seus Afiliados. De acordo com a Politica de webs fans de Habbo, Habbo Hub pode utilizar as marcas comerciais e outras propriedades intelectuais de Habbo.',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.console': 'Console',
    'nav.homes': 'Homes',
    'nav.journal': 'Journal',
    'nav.tools': 'Tools',
    'nav.marketplace': 'Marketplace',
    'nav.photos': 'Photos',
    'nav.friends': 'Friends',
    'nav.profile': 'Profile',
    'nav.login': 'Connect Habbo Account',
    'nav.logout': 'Logout',
    'nav.register': 'Register',
    'nav.admin': 'Admin',
    'nav.accounts': 'Accounts',
    
    // Sidebar
    'sidebar.userPanel.monthlyXP': 'Monthly XP',
    'sidebar.userPanel.hubHome': 'Profile',
    'sidebar.userPanel.settings': 'Settings',
    'sidebar.userPanel.logout': 'Logout',
    'sidebar.userPanel.status': 'Site Status',
    'sidebar.userPanel.notifications': 'Notifications',
    'sidebar.userPanel.language': 'Language',
    'sidebar.userPanel.online': 'Online',
    'sidebar.userPanel.offline': 'Offline',
    'sidebar.userPanel.portuguese': 'Portuguese',
    'sidebar.userPanel.english': 'English',
    'sidebar.userPanel.spanish': 'Spanish',
    'sidebar.userPanel.enable': 'Enable',
    'sidebar.userPanel.disable': 'Disable',
    'sidebar.userPanel.back': 'Back',
    
    // Pages
    'pages.home.title': 'Welcome to Habbo Hub',
    'pages.home.subtitle': 'The ultimate platform for the Habbo community. Connect, explore and share your passion for Habbo Hotel.',
    'pages.home.console.title': 'Social Console',
    'pages.home.console.description': 'Access the console to see friends photos, like, comment, search users and interact with the community from around the world!',
    'pages.home.console.button': 'Access Console',
    'pages.home.homes.title': 'Habbo Homes',
    'pages.home.homes.description': 'Create and Explore habbo homes and edit your page however you want',
    'pages.home.homes.button': 'View Homes',
    'pages.home.tools.title': 'Tools',
    'pages.home.tools.description': 'Access exclusive tools to customize your Habbo and enhance your experience.',
    'pages.home.tools.button': 'View Tools',
    'pages.marketplace.title': 'Marketplace',
    'pages.marketplace.subtitle': 'Buy and sell Habbo items',
    'pages.photos.title': 'Photos',
    'pages.photos.subtitle': 'View user photos',
    'pages.friends.title': 'Friends',
    'pages.friends.subtitle': 'Manage your friends list',
    'pages.profile.title': 'Profile',
    'pages.profile.subtitle': 'View and edit your profile',
    'pages.login.title': 'Login',
    'pages.login.subtitle': 'Sign in to your account',
    'pages.register.title': 'Register',
    'pages.register.subtitle': 'Create a new account',
    'pages.homes.title': 'Habbo Homes',
    'pages.homes.subtitle': 'Explore user homes',
    'pages.homes.searchPlaceholder': 'Search users...',
    'pages.homes.searchButton': 'Search Users with Homes',
    'pages.homes.onlineUsers': 'Users Online Now',
    'pages.homes.popularHomes': 'Popular Homes',
    'pages.homes.recentHomes': 'Recent Homes',
    'pages.console.title': 'Social Console',
    'pages.console.subtitle': 'Interact with Habbo community',
    'pages.console.searchUser': 'Type the username...',
    'pages.console.feedTitle': '📸 Friends Photo Feed',
    'pages.console.addComment': 'Add a comment...',
    'pages.console.selectCountry': 'Select country',
    'pages.console.likes': 'like',
    'pages.console.likesPlural': 'likes',
    'pages.console.myInfo': 'Profile',
    'pages.console.createdAt': 'Created at:',
    'pages.console.lastAccess': 'Last access:',
    'pages.console.friends': 'Friends',
    'pages.console.rooms': 'Rooms',
    'pages.console.badges': 'Badges',
    'pages.console.groups': 'Groups',
    'pages.console.friendsFeed': 'Friends Feed',
    'pages.console.loadingPhotos': 'Loading friends photos...',
    'pages.console.errorLoadingPhotos': 'Error loading friends photos',
    'pages.console.tryAgain': 'Try again',
    'pages.console.noPhotos': 'No photos found',
    'pages.console.noPhotosDescription': 'Your friends haven\'t posted photos yet',
    'pages.console.loginRequired': 'Login required',
    'pages.console.loginRequiredDescription': 'Connect your Habbo account to see your friends photos',
    'pages.console.loadingUser': 'Loading user information...',
    'pages.console.loadingFeed': 'Loading photo feed...',
    'pages.console.loadingGlobalFeed': 'Loading global feed...',
    'pages.console.loadingFriends': 'Loading friends...',
    'pages.console.searchUsers': '🔍 Search Users',
    'pages.console.friendsCount': '{count} friends',
    'pages.console.noFriends': 'You don\'t have any friends added yet or your friends are not visible.',
    'pages.console.photos': 'Photos',
           'pages.console.photosWithCount': 'Photos ({count})',
           'pages.console.followers': 'Followers',
           'pages.console.following': 'Following',
           'pages.console.editProfile': 'Edit Profile',
           'pages.console.saveChanges': 'Save Changes',
           'pages.console.chat': 'Chat',
           'pages.console.sendComment': 'Send comment',
           'pages.console.restorePhoto': 'Restore Photo',
           'pages.console.hidePhoto': 'Hide Photo',
           'pages.console.showPhoto': 'Show Photo',
           'pages.console.enlargedPhoto': 'Enlarged Photo',
           'pages.console.habboTicker': 'Habbo Ticker',
           'pages.console.follow': 'Follow',
           'pages.console.message': 'Message',
           'pages.console.followFunctionComingSoon': '🚀 "Follow" function will be implemented soon! For now, add {username} to your friends in Habbo Hotel.',
           'pages.console.friendsOf': 'Friends of {username} ({count})',
           'pages.console.badgesOf': 'Badges of {username} ({count})',
           'pages.console.groupsOf': 'Groups of {username} ({count})',
           'pages.console.roomsOf': 'Rooms of {username} ({count})',
           'pages.console.noPhotoSelected': 'No photo selected',
           'pages.console.userHasNoPhotos': 'User has no photos :(',
           'pages.console.noCommunityPhotos': 'No community photos yet',
           'pages.console.noPhotoAvailable': 'No photo available',
           'pages.console.noLikesYet': 'No likes on this photo yet',
           'pages.tools.title': 'Tools',
    'pages.tools.subtitle': 'Useful Habbo tools',
    
    // Credits Modal
    'pages.home.credits.title': '🏆 Credits',
    'pages.home.credits.intro': 'HabboHub was created with the intention of uniting the entire community of players, with some extra features. It was created by a single user, with no programming experience. But this project would never be possible if a great and incredible community had not already done great work, and taught me how to build this piece of Habbo, outside of Habbo.',
    'pages.home.credits.learned': 'I may have forgotten many, but I learned various social tools by investigating great fan sites like Puhekupla, HabboEmotion, HabboAssets, Habborator, a large collection (basically everything) of images came thanks to ViaJovem files, and I understood a bit more about visuals with Habbo Templarios.',
    'pages.home.credits.eonu': '(And thanks to eonu for the Volter fonts)',
    'pages.home.credits.conclusion': 'Without the work of these and so many others, HabboHub was just an imagination.',
    'pages.home.credits.final': 'I hope you enjoy the site, and forgive me for all the bugs that still remain ^^',
    
    // Buttons and actions
    'buttons.save': 'Save',
    'buttons.cancel': 'Cancel',
    'buttons.edit': 'Edit',
    'buttons.delete': 'Delete',
    'buttons.confirm': 'Confirm',
    'buttons.close': 'Close',
    'buttons.back': 'Back',
    'buttons.next': 'Next',
    'buttons.previous': 'Previous',
    'buttons.loading': 'Loading...',
    'buttons.search': 'Search',
    'buttons.searching': 'Searching...',
    'buttons.filter': 'Filter',
    'buttons.sort': 'Sort',
    'buttons.viewHomes': 'View Homes',
    'buttons.viewDetails': 'View Details',
    'buttons.openPopup': 'Open in New Window',
    'buttons.openConsolePopup': 'Open Console in Pop-up',
    'buttons.openConsole': 'Open Console',
    'buttons.focusConsole': 'Focus Console',
    
    // Messages
    'messages.loading': 'Loading...',
    'messages.loadingConsole': 'Loading console...',
    'messages.loadingHome': 'Loading Hub Home data...',
    'messages.error': 'Error loading data',
    'messages.errorSearch': 'Error searching users',
    'messages.errorSearchDescription': 'An error occurred during search',
    'messages.success': 'Operation completed successfully',
    'messages.noData': 'No data found',
    'messages.noResults': 'No results found',
    'messages.noResultsDescription': 'Try searching for a different name or leave the field empty to see online users',
    'messages.confirmDelete': 'Are you sure you want to delete?',
    'messages.loginRequired': 'You need to be logged in to access this page',
    'messages.popupBlocked': 'Popup blocked! Please allow popups for this site.',
    'messages.searchTip': '💡 Tip: Type at least 2 characters to search automatically. The search shows registered homes and discovered profiles.',
    
    // Toast Notifications
    'toast.loginRequired': 'You need to be logged in to comment',
    'toast.commentingTooFast': 'You are commenting too fast',
    'toast.invalidComment': 'Invalid comment',
    'toast.commentSent': 'Comment sent!',
    'toast.commentError': 'Error sending comment',
    'toast.commentAdded': 'Comment added!',
    'toast.commentAddError': 'Error adding comment',
    'toast.commentDeleted': 'Comment deleted!',
    'toast.commentDeleteError': 'Error deleting comment',
    'toast.commentReported': 'Comment reported! Our team will review it.',
    'toast.commentReportError': 'Error reporting comment',
    'toast.likeError': 'Error liking photo',
    'toast.likeRemoved': 'Like removed',
    'toast.unlikeError': 'Error removing like',
    'toast.followError': 'Error following user',
    'toast.unfollowError': 'Error unfollowing user',
    'toast.updatingBadges': 'Updating badges...',
    'toast.downloadStarted': 'Download started!',
    'toast.nowFollowing': 'You are now following {username}!',
    'toast.stoppedFollowing': 'You stopped following {username}',
    'toast.languageChanged': 'Language changed',
    'toast.languageChangedTo': 'Language has been changed to {language}',
    
    // Authentication error messages
    'auth.loginError': 'Login Error',
    'auth.invalidCredentials': 'User not found or incorrect password',
    'auth.unexpectedError': 'Unexpected error during login',
    
    // Motto login instructions
    'auth.mottoInstructions.copyCode': 'Copy the code above',
    'auth.mottoInstructions.goToHotel': 'Go to Habbo Hotel',
    'auth.mottoInstructions.changeMotto': 'Change your motto/mission to',
    'auth.mottoInstructions.clickVerify': 'Click "Verify Login" below',
    
    // Verification messages
    'auth.verification.enterCode': 'Enter the verification code',
    'auth.verification.error': 'Verification Error',
    
    // Forms
    'forms.username': 'Username',
    'forms.password': 'Password',
    'forms.email': 'Email',
    'forms.confirmPassword': 'Confirm password',
    'forms.motto': 'Motto',
    'forms.hotel': 'Hotel',
    'forms.language': 'Language',
    
    // Validations
    'validation.required': 'This field is required',
    'validation.email': 'Invalid email',
    'validation.passwordMatch': 'Passwords do not match',
    'validation.minLength': 'Minimum {min} characters',
    'validation.maxLength': 'Maximum {max} characters',
    
    // Status
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.busy': 'Busy',
    'status.away': 'Away',
    
    // Time
    'time.now': 'Now',
    'time.minutesAgo': '{minutes} minutes ago',
    'time.hoursAgo': '{hours} hours ago',
    'time.daysAgo': '{days} days ago',
    'time.weeksAgo': '{weeks} weeks ago',
    'time.monthsAgo': '{months} months ago',
    'time.yearsAgo': '{years} years ago',
    
    // Footer Disclaimer
    'footer.disclaimer': 'Habbo Hub is not affiliated with, endorsed, promoted or specifically approved by Sulake Oy or its Affiliates. According to Habbo\'s Fan Site Policy, Habbo Hub may use Habbo\'s trademarks and other intellectual properties.',
  },
  es: {
    // Navegación
    'nav.home': 'Inicio',
    'nav.console': 'Consola',
    'nav.homes': 'Homes',
    'nav.journal': 'Periódico',
    'nav.tools': 'Herramientas',
    'nav.marketplace': 'Marketplace',
    'nav.photos': 'Fotos',
    'nav.friends': 'Amigos',
    'nav.profile': 'Perfil',
    'nav.login': 'Conectar Cuenta Habbo',
    'nav.logout': 'Cerrar Sesión',
    'nav.register': 'Registrar',
    'nav.admin': 'Admin',
    'nav.accounts': 'Cuentas',
    
    // Sidebar
    'sidebar.userPanel.monthlyXP': 'XP Mensual',
    'sidebar.userPanel.hubHome': 'Perfil',
    'sidebar.userPanel.settings': 'Configuración',
    'sidebar.userPanel.logout': 'Salir',
    'sidebar.userPanel.status': 'Estado del Sitio',
    'sidebar.userPanel.notifications': 'Notificaciones',
    'sidebar.userPanel.language': 'Idioma',
    'sidebar.userPanel.online': 'En Linea',
    'sidebar.userPanel.offline': 'Desconectado',
    'sidebar.userPanel.portuguese': 'Portugués',
    'sidebar.userPanel.english': 'Inglés',
    'sidebar.userPanel.spanish': 'Español',
    'sidebar.userPanel.enable': 'Activar',
    'sidebar.userPanel.disable': 'Desactivar',
    'sidebar.userPanel.back': 'Volver',
    
    // Páginas
    'pages.home.title': 'Bienvenido a Habbo Hub',
    'pages.home.subtitle': 'La plataforma definitiva para la comunidad Habbo. Conéctate, explora y comparte tu pasión por Habbo Hotel.',
    'pages.home.console.title': 'Consola Social',
    'pages.home.console.description': 'Accede a la consola para ver fotos de amigos, dar me gusta, comentar, buscar usuarios e interactuar con la comunidad de todo el mundo!',
    'pages.home.console.button': 'Acceder a Consola',
    'pages.home.homes.title': 'Habbo Homes',
    'pages.home.homes.description': 'Crea y Explora las homes de los habbos y edita tu página como quieras',
    'pages.home.homes.button': 'Ver Homes',
    'pages.home.tools.title': 'Herramientas',
    'pages.home.tools.description': 'Accede a herramientas exclusivas para personalizar tu Habbo y mejorar tu experiencia.',
    'pages.home.tools.button': 'Ver Herramientas',
    'pages.marketplace.title': 'Marketplace',
    'pages.marketplace.subtitle': 'Compra y vende articulos de Habbo',
    'pages.photos.title': 'Fotos',
    'pages.photos.subtitle': 'Ver fotos de usuarios',
    'pages.friends.title': 'Amigos',
    'pages.friends.subtitle': 'Gestiona tu lista de amigos',
    'pages.profile.title': 'Perfil',
    'pages.profile.subtitle': 'Ver y editar tu perfil',
    'pages.login.title': 'Iniciar Sesión',
    'pages.login.subtitle': 'Inicia sesión en tu cuenta',
    'pages.register.title': 'Registrar',
    'pages.register.subtitle': 'Crear una nueva cuenta',
    'pages.homes.title': 'Habbo Homes',
    'pages.homes.subtitle': 'Explora homes de usuarios',
    'pages.homes.searchPlaceholder': 'Buscar usuarios...',
    'pages.homes.searchButton': 'Buscar Usuarios con Homes',
    'pages.homes.onlineUsers': 'Usuarios En Linea Ahora',
    'pages.homes.popularHomes': 'Homes Populares',
    'pages.homes.recentHomes': 'Homes Recientes',
    'pages.console.title': 'Consola Social',
    'pages.console.subtitle': 'Interactúa con la comunidad Habbo',
    'pages.console.searchUser': 'Escribe el nombre del usuario...',
    'pages.console.feedTitle': '📸 Feed de Fotos de Amigos',
    'pages.console.addComment': 'Añade un comentario...',
    'pages.console.selectCountry': 'Seleccionar pais',
    'pages.console.likes': 'me gusta',
    'pages.console.likesPlural': 'me gusta',
    'pages.console.myInfo': 'Perfil',
    'pages.console.createdAt': 'Creado en:',
    'pages.console.lastAccess': 'Último acceso:',
    'pages.console.friends': 'Amigos',
    'pages.console.rooms': 'Salas',
    'pages.console.badges': 'Emblemas',
    'pages.console.groups': 'Grupos',
    'pages.console.friendsFeed': 'Feed de Amigos',
    'pages.console.loadingPhotos': 'Cargando fotos de amigos...',
    'pages.console.errorLoadingPhotos': 'Error al cargar fotos de amigos',
    'pages.console.tryAgain': 'Intentar de nuevo',
    'pages.console.noPhotos': 'No se encontraron fotos',
    'pages.console.noPhotosDescription': 'Tus amigos aún no han publicado fotos',
    'pages.console.loginRequired': 'Inicio de sesión requerido',
    'pages.console.loginRequiredDescription': 'Conecta tu cuenta de Habbo para ver las fotos de tus amigos',
    'pages.console.loadingUser': 'Cargando información del usuario...',
    'pages.console.loadingFeed': 'Cargando feed de fotos...',
    'pages.console.loadingGlobalFeed': 'Cargando feed global...',
    'pages.console.loadingFriends': 'Cargando amigos...',
    'pages.console.searchUsers': '🔍 Buscar Usuarios',
    'pages.console.friendsCount': '{count} amigos',
    'pages.console.noFriends': 'Aún no tienes amigos agregados o tus amigos no están visibles.',
    'pages.console.photos': 'Fotos',
           'pages.console.photosWithCount': 'Fotos ({count})',
           'pages.console.followers': 'Seguidores',
           'pages.console.following': 'Siguiendo',
           'pages.console.editProfile': 'Editar Perfil',
           'pages.console.saveChanges': 'Guardar Cambios',
           'pages.console.chat': 'Chat',
           'pages.console.sendComment': 'Enviar comentario',
           'pages.console.restorePhoto': 'Restaurar Foto',
           'pages.console.hidePhoto': 'Ocultar Foto',
           'pages.console.showPhoto': 'Mostrar Foto',
           'pages.console.enlargedPhoto': 'Foto ampliada',
           'pages.console.habboTicker': 'Habbo Ticker',
           'pages.console.follow': 'Seguir',
           'pages.console.message': 'Mensaje',
           'pages.console.followFunctionComingSoon': '🚀 La función "Seguir" se implementará pronto! Por ahora, agrega {username} a tus amigos en Habbo Hotel.',
           'pages.console.friendsOf': 'Amigos de {username} ({count})',
           'pages.console.badgesOf': 'Emblemas de {username} ({count})',
           'pages.console.groupsOf': 'Grupos de {username} ({count})',
           'pages.console.roomsOf': 'Salas de {username} ({count})',
           'pages.console.noPhotoSelected': 'Ninguna foto seleccionada',
           'pages.console.userHasNoPhotos': 'El usuario no tiene fotos :(',
           'pages.console.noCommunityPhotos': 'Aún no hay fotos de la comunidad',
           'pages.console.noPhotoAvailable': 'Ninguna foto disponible',
           'pages.console.noLikesYet': 'Aún no hay me gusta en esta foto',
           'pages.tools.title': 'Herramientas',
    'pages.tools.subtitle': 'Herramientas útiles de Habbo',
    
    // Modal de Agradecimientos
    'pages.home.credits.title': '🏆 Agradecimientos',
    'pages.home.credits.intro': 'HabboHub fue creado con la intencion de unir a toda la comunidad de jugadores, con algunas funciones extra. Fue creado por un unico usuario, sin experiencia en programacion. Pero este proyecto nunca seria posible si una gran e increible comunidad no hubiera ya hecho un gran trabajo, y me enseno como construir esta pieza de Habbo, fuera de Habbo.',
    'pages.home.credits.learned': 'Puedo haber olvidado muchos, pero aprendi diversas herramientas sociales investigando grandes fan sites como Puhekupla, HabboEmotion, HabboAssets, Habborator, una gran coleccion (basicamente todo) de imagenes vino gracias a los archivos de ViaJovem, y entendi un poco mas sobre visuales con Habbo Templarios.',
    'pages.home.credits.eonu': '(Y gracias a eonu por las fuentes Volter)',
    'pages.home.credits.conclusion': 'Sin el trabajo de estos y tantos otros, HabboHub era solo una imaginación.',
    'pages.home.credits.final': 'Espero que disfruten el sitio, y me perdonen por todos los bugs que aún quedan ^^',
    
    // Botones y acciones
    'buttons.save': 'Guardar',
    'buttons.cancel': 'Cancelar',
    'buttons.edit': 'Editar',
    'buttons.delete': 'Eliminar',
    'buttons.confirm': 'Confirmar',
    'buttons.close': 'Cerrar',
    'buttons.back': 'Volver',
    'buttons.next': 'Siguiente',
    'buttons.previous': 'Anterior',
    'buttons.loading': 'Cargando...',
    'buttons.search': 'Buscar',
    'buttons.filter': 'Filtrar',
    'buttons.sort': 'Ordenar',
    'buttons.openConsolePopup': 'Abrir Consola en Pop-up',
    'buttons.openConsole': 'Abrir Consola',
    'buttons.focusConsole': 'Enfocar Consola',
    
    // Mensajes
    'messages.loading': 'Cargando...',
    'messages.error': 'Error al cargar datos',
    'messages.success': 'Operación completada con éxito',
    'messages.noData': 'No se encontraron datos',
    'messages.confirmDelete': '¿Estás seguro de que quieres eliminar?',
    'messages.loginRequired': 'Necesitas estar conectado para acceder a esta página',
    
    // Toast Notifications
    'toast.loginRequired': 'Necesitas estar conectado para comentar',
    'toast.commentingTooFast': 'Estas comentando muy rapido',
    'toast.invalidComment': 'Comentario invalido',
    'toast.commentSent': 'Comentario enviado!',
    'toast.commentError': 'Error al enviar comentario',
    'toast.commentAdded': 'Comentario agregado!',
    'toast.commentAddError': 'Error al agregar comentario',
    'toast.commentDeleted': 'Comentario eliminado!',
    'toast.commentDeleteError': 'Error al eliminar comentario',
    'toast.commentReported': 'Comentario denunciado! Nuestro equipo lo revisara.',
    'toast.commentReportError': 'Error al denunciar comentario',
    'toast.likeError': 'Error al dar me gusta a la foto',
    'toast.likeRemoved': 'Me gusta removido',
    'toast.unlikeError': 'Error al remover me gusta',
    'toast.followError': 'Error al seguir usuario',
    'toast.unfollowError': 'Error al dejar de seguir usuario',
    'toast.updatingBadges': 'Actualizando badges...',
    'toast.downloadStarted': 'Descarga iniciada!',
    'toast.nowFollowing': 'Ahora estas siguiendo a {username}!',
    'toast.stoppedFollowing': 'Dejaste de seguir a {username}',
    'toast.languageChanged': 'Idioma cambiado',
    'toast.languageChangedTo': 'El idioma ha sido cambiado a {language}',
    
    // Mensajes de error de autenticación
    'auth.loginError': 'Error en el login',
    'auth.invalidCredentials': 'Usuario no encontrado o contraseña incorrecta',
    'auth.unexpectedError': 'Error inesperado al hacer login',
    
    // Instrucciones de login por motto
    'auth.mottoInstructions.copyCode': 'Copia el código de arriba',
    'auth.mottoInstructions.goToHotel': 'Ve al Hotel Habbo',
    'auth.mottoInstructions.changeMotto': 'Cambia tu motto/misión a',
    'auth.mottoInstructions.clickVerify': 'Haz clic en "Verificar Login" abajo',
    
    // Mensajes de verificación
    'auth.verification.enterCode': 'Ingresa el código de verificación',
    'auth.verification.error': 'Error en la Verificación',
    
    // Formularios
    'forms.username': 'Nombre de usuario',
    'forms.password': 'Contraseña',
    'forms.email': 'Correo electrónico',
    'forms.confirmPassword': 'Confirmar contraseña',
    'forms.motto': 'Lema',
    'forms.hotel': 'Hotel',
    'forms.language': 'Idioma',
    
    // Validaciones
    'validation.required': 'Este campo es obligatorio',
    'validation.email': 'Correo electrónico inválido',
    'validation.passwordMatch': 'Las contraseñas no coinciden',
    'validation.minLength': 'Minimo {min} caracteres',
    'validation.maxLength': 'Máximo {max} caracteres',
    
    // Estado
    'status.online': 'En Linea',
    'status.offline': 'Desconectado',
    'status.busy': 'Ocupado',
    'status.away': 'Ausente',
    
    // Tiempo
    'time.now': 'Ahora',
    'time.minutesAgo': 'Hace {minutes} minutos',
    'time.hoursAgo': 'Hace {hours} horas',
    'time.daysAgo': 'Hace {days} dias',
    'time.weeksAgo': 'Hace {weeks} semanas',
    'time.monthsAgo': 'Hace {months} meses',
    'time.yearsAgo': 'Hace {years} años',
    
    // Footer Disclaimer
    'footer.disclaimer': 'Habbo Hub no esta afiliada a, respaldada, promocionada o aprobada especificamente por Sulake Oy o sus Afiliados. De acuerdo a la Politica de webs fans de Habbo, Habbo Hub puede utilizar las marcas comerciales y otras propiedades intelectuales de Habbo.',
  }
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  // Carregar idioma do localStorage IMEDIATAMENTE (síncrono)
  const getInitialLanguage = (): Language => {
    try {
      const savedLanguage = localStorage.getItem('habbo-hub-language') as Language;
      if (savedLanguage && ['pt', 'en', 'es'].includes(savedLanguage)) {
        return savedLanguage;
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
    return 'en'; // Fallback padrão
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage());
  const [isLoading, setIsLoading] = useState(false); // Mudado para false

  // Função para salvar idioma no localStorage (síncrono e rápido)
  const setLanguage = (lang: Language) => {
    try {
      // Salvar no localStorage (operação síncrona)
      localStorage.setItem('habbo-hub-language', lang);
      
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Função de tradução com suporte a parâmetros (memoizada)
  const t = React.useCallback((key: string, params?: Record<string, string | number>): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]];
    
    if (!translation) {
      // Removido console.warn para melhor performance
      return key;
    }

    // Substituir parâmetros se fornecidos
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(`{${paramKey}}`, String(paramValue));
      }, translation);
    }

    return translation;
  }, [language]);

  // Detectar idioma baseado no hotel (apenas se não houver preferência salva)
  // Remover useEffect que dependia do habboAccount

  const value: I18nContextType = React.useMemo(() => ({
    language,
    setLanguage,
    t,
    isLoading
  }), [language, t, isLoading]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
