import React, { useEffect, useMemo, useState } from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AccentFixedText } from '@/components/AccentFixedText';
import { Newspaper, Send, Users, Calendar, ExternalLink, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  fansite: string;
  image: string;
  category: string;
  date: string;
  isMain: boolean;
}

type ArticleOrigin = 'seed' | 'user';

interface JournalSubmission {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  authorAvatar: string;
  hotel: string;
  fansite?: string;
  image: string;
  category: string;
  submittedAt: string;
  date: string;
  contact?: string;
  origin: ArticleOrigin;
  status: 'pending';
}

const JOURNAL_CATEGORIES = [
  'Destaque',
  'Notícia',
  'Evento',
  'Entrevista',
  'Opinião',
  'Análise',
  'Classificados'
] as const;

const HOTEL_OPTIONS = [
  { value: 'com.br', label: 'Habbo.com.br (Brasil/Portugal)' },
  { value: 'com', label: 'Habbo.com (Global)' },
  { value: 'es', label: 'Habbo.es (Espanha)' },
  { value: 'fr', label: 'Habbo.fr (França)' },
  { value: 'de', label: 'Habbo.de (Alemanha)' },
  { value: 'it', label: 'Habbo.it (Itália)' },
  { value: 'nl', label: 'Habbo.nl (Holanda)' },
  { value: 'com.tr', label: 'Habbo.com.tr (Turquia)' },
  { value: 'fi', label: 'Habbo.fi (Finlândia)' }
];

const INITIAL_FORM_STATE = {
  title: '',
  summary: '',
  content: '',
  category: JOURNAL_CATEGORIES[0],
  imageUrl: '',
  fansite: '',
  contact: '',
  authorName: '',
  hotel: 'com.br'
};

const MAX_TITLE_LENGTH = 90;
const MAX_SUMMARY_LENGTH = 480;
const MAX_CONTACT_LENGTH = 280;
const MAX_CONTENT_LENGTH = 4000;
const MAX_SUBMISSIONS_PER_HOUR = 3;
const SUBMISSION_WINDOW_MS = 1000 * 60 * 60; // 1 hour
const SUBMISSION_HISTORY_KEY = 'journal_submission_history';
const IMAGE_URL_PATTERN = /^https:\/\/[\w\-./?=&%]+\.(png|gif|jpg|jpeg)$/i;
const MALICIOUS_PATTERNS = [
  /<script/gi,
  /onerror\s*=/gi,
  /onload\s*=/gi,
  /javascript:/gi,
  /data:text\/html/gi
];

interface ClassifiedAd {
  id: string;
  title: string;
  content: string;
  image: string;
  price?: string;
  contact: string;
}

const Journal = () => {
  const { habboAccount } = useAuth();
  const { toast } = useToast();
  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAd, setSelectedAd] = useState<ClassifiedAd | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  const isPrimaryAdmin = Boolean(
    habboAccount?.habbo_name?.toLowerCase() === 'habbohub' &&
    ['br', 'com.br'].includes((habboAccount?.hotel || '').toLowerCase()) &&
    habboAccount?.is_admin
  );

  const isLoggedIn = Boolean(habboAccount);

  const sanitizeText = (input: string, maxLength: number) => {
    const trimmed = input.trim().slice(0, maxLength);
    let sanitized = trimmed;
    MALICIOUS_PATTERNS.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '');
    });
    sanitized = sanitized.replace(/</g, '').replace(/>/g, '');
    return sanitized;
  };

  const hasMaliciousContent = (input: string) =>
    MALICIOUS_PATTERNS.some((pattern) => {
      const flags = pattern.flags.replace('g', '');
      const tester = new RegExp(pattern.source, flags);
      return tester.test(input);
    });

  const validateImageUrl = (url: string) => IMAGE_URL_PATTERN.test(url.trim());

  const getSubmissionHistory = () => {
    if (typeof window === 'undefined') return [] as number[];
    try {
      const raw = localStorage.getItem(SUBMISSION_HISTORY_KEY);
      if (!raw) return [] as number[];
      const parsed = JSON.parse(raw) as number[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Erro ao carregar histórico de submissões:', error);
      return [] as number[];
    }
  };

  const updateSubmissionHistory = (timestamps: number[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SUBMISSION_HISTORY_KEY, JSON.stringify(timestamps));
  };

  const getAuthorHotelDomain = (hotel: string) => {
    if (!hotel) return 'com.br';
    const normalized = hotel.toLowerCase();
    if (normalized === 'br') return 'com.br';
    return normalized;
  };

  const resetForm = () => {
    setFormData({
      ...INITIAL_FORM_STATE,
      authorName: habboAccount?.habbo_name || '',
      hotel: getAuthorHotelDomain(habboAccount?.hotel || 'com.br')
    });
    setFormError(null);
  };

  const handleOpenSubmissionModal = () => {
    resetForm();
    setIsSubmissionFormOpen(true);
  };

  const handleFormChange = (field: keyof typeof INITIAL_FORM_STATE, value: string) => {
    if (!isLoggedIn) return;
    let nextValue = value;
    switch (field) {
      case 'title':
        nextValue = value.slice(0, MAX_TITLE_LENGTH);
        break;
      case 'summary':
        nextValue = value.slice(0, MAX_SUMMARY_LENGTH);
        break;
      case 'contact':
        nextValue = value.slice(0, MAX_CONTACT_LENGTH);
        break;
      case 'content':
        nextValue = value.slice(0, MAX_CONTENT_LENGTH);
        break;
      default:
        break;
    }
    setFormData((prev) => ({
      ...prev,
      [field]: nextValue
    }));
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      authorName: habboAccount?.habbo_name || '',
      hotel: getAuthorHotelDomain(habboAccount?.hotel || 'com.br')
    }));
  }, [habboAccount]);

  const authorAvatarPreview = useMemo(() => {
    const hotelDomain = getAuthorHotelDomain(habboAccount?.hotel || formData.hotel || 'com.br');
    const authorName = habboAccount?.habbo_name || formData.authorName || 'Habbo';
    return `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(authorName)}&size=l&direction=2&head_direction=2&gesture=sml&action=std`;
  }, [habboAccount, formData.authorName, formData.hotel]);

  // Mock data for the journal
  const newsArticles: NewsArticle[] = [
    {
      id: '1',
      title: '25 Anos de Habbo Hotel: Uma Celebração Épica Cheia de Nostalgia e Novidades!',
      content: 'O Habbo Hotel está em festa! Completando 25 anos de existência, o icônico mundo pixelado convida todos os Habbos para uma celebração inesquecível. Prepare-se para uma onda de nostalgia com o retorno de mobis clássicos através do Furni-Matic e Collecti-Matic, além de novas Coroas de Fidelidade para os veteranos que acompanham o Hotel há 15, 20 e até 25 anos! A equipe Staff está organizando festas na Piscina com brindes e uma nova sala pública que promete agitar o Hotel dia e noite. Não perca a chance de compartilhar suas memórias com a hashtag #Habbo25 nas redes sociais e concorrer a prêmios ultra raros. O Diretor de Produto, Muumiopappa, deixou uma carta emocionante para a comunidade. Este aniversário é uma homenagem a todos os Habbos que construíram essa história!',
      author: 'Beebop',
      authorAvatar: 'https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-10.ch-3538-67.lg-275-82.sh-295-92.fa-1206-90%2Cs-0.g-1.d-2.h-2.a-0%2C41cb5bfd4dcecf4bf5de00b7ea872714.png',
      fansite: 'HabboHub',
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjDhGLvOEcU_FGqcBTve1JyAoNt4ddcqAqfBMrvY4SF2YhRPDTBZOjReNooP8907PJAViP3-0XmR-_hdbwhRvBt-8h6UCYEnERTxbJgQaqWhGECue1XiP2EsQXuO-s0GN6_8XthY9OmNNM/s1600/ts_fire.gif',
      category: 'Destaque',
      date: '2024-01-15',
      isMain: true
    },
    {
      id: '2',
      title: 'Análise: Campanha "Verão Neon" - Sucesso ou Fracasso?',
      content: 'Nossa equipe analisou a recente campanha "Verão Neon", que trouxe novos visuais e mobis vibrantes ao Hotel. Avaliamos o feedback da comunidade, a participação nos eventos e o impacto na economia. Foi um sucesso estrondoso ou deixou a desejar? Confira nossa análise completa e deixe sua opinião!',
      author: 'AnalistaPixel',
      authorAvatar: 'https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-1.ch-255-84.lg-275-1408.sh-295-64%2Cs-0.g-1.d-2.h-2.a-0%2C3565e22f0ecd66108595e64551d13483.png',
      fansite: 'Habblindados',
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1ZQwexYD0dHL62sDM9haQACJeCZED1qCMXRVzABKDEhi9X5lUeQCaqerPziBsggI2JI1RRNqLffWln3xPZaoEijGkebyJQ7AdK0PYuaLdAT8pC_tUisNMgFJE99YP8fS54F5hg24s0g/s1600/BR_ts_elections_anarchist.gif',
      category: 'Análise',
      date: '2024-01-12',
      isMain: false
    }
  ];

  const classifiedAds: ClassifiedAd[] = [
    {
      id: '1',
      title: 'Vendo Quarto de Eventos',
      content: 'Vendo quarto grande e decorado, ideal para eventos de rádio ou festas. Capacidade para 50 Habbos, com Wireds de teleporte e palco. Preço negociável. Contato: [Nick do Vendedor].',
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhFc-LIforDlqYWAxOgNN8-j8N5PaXYuTmuaIeKOOc18IRGfgsi0NkkWaJsjDfyaC_NePhneoS_w7ZvQMbIZy3KuGtSopEh9lwmT2-uTSDTcmpW-jBaPYbCVYFtFQLMd9rZxtlxYJL7dGMg/s1600/feature_cata_hort_jan18bun5.png',
      price: '50 HC',
      contact: 'Beebop'
    },
    {
      id: '2',
      title: 'Procuro Mobis LTD Antigos',
      content: 'Colecionador busca mobis LTD das campanhas de 2010 a 2015. Pago bem em moedas ou troco por raros atuais. Tenho interesse em Tronos, Sofás e Estátuas. Envie propostas para [Nick do Comprador].',
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKlk9eJDWBDDu1Rvq9b7CBnf15zxxPZ6Rjv311WLfp2gunR5LiYnrLfaf2gHBkbVExK1sWcq30GIIGCQkTTi9RChQ0y5vPx0FZDctPuvu4u4oR1OyaytDvouowrK18pmsHzQrXHnwegz5G/s1600/feature_cata_hort_jan18bun3.png',
      contact: 'HabboHotel'
    }
  ];

  const totalPages = 5;

  const scrollToSection = (sectionId: string) => {
    // Mapear seções para páginas
    const sectionToPage: { [key: string]: number } = {
      'destaques': 1,
      'eventos': 2,
      'entrevistas': 3,
      'opiniao': 4,
      'fansites': 5,
      'classificados': 1,
      'enviar-coluna': 1
    };
    
    const targetPage = sectionToPage[sectionId];
    if (targetPage) {
      setCurrentPage(targetPage);
    }
  };


  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setRateLimitMessage(null);

    if (!habboAccount) {
      setFormError('Você precisa estar logado para enviar uma coluna.');
      return;
    }

    if (isSubmitting) {
      return;
    }

    const now = Date.now();
    const history = getSubmissionHistory().filter((timestamp) => now - timestamp < SUBMISSION_WINDOW_MS);

    if (history.length >= MAX_SUBMISSIONS_PER_HOUR) {
      const timeUntilReset = SUBMISSION_WINDOW_MS - (now - history[0]);
      const minutes = Math.ceil(timeUntilReset / 60000);
      const message = `Limite de envios atingido. Tente novamente em aproximadamente ${minutes} minuto(s).`;
      setRateLimitMessage(message);
      setFormError(message);
      return;
    }

    const requiredFields: Array<keyof typeof INITIAL_FORM_STATE> = ['title', 'summary', 'content', 'imageUrl'];
    const missingField = requiredFields.find((field) => !formData[field].trim());

    if (missingField) {
      setFormError('Preencha todos os campos obrigatórios marcados com *.');
      return;
    }

    const authorName = (habboAccount?.habbo_name || formData.authorName || '').trim();

    if (!authorName) {
      setFormError('Informe seu nick Habbo para enviarmos sua coluna.');
      return;
    }

    if (hasMaliciousContent(formData.title) || hasMaliciousContent(formData.summary) || hasMaliciousContent(formData.content) || hasMaliciousContent(formData.contact)) {
      setFormError('Detectamos conteúdo potencialmente malicioso. Revise seu texto antes de enviar.');
      return;
    }

    if (!validateImageUrl(formData.imageUrl)) {
      setFormError('Informe uma URL de imagem HTTPS válida (extensões aceitas: PNG, GIF, JPG).');
      return;
    }

    const sanitizedTitle = sanitizeText(formData.title, MAX_TITLE_LENGTH);
    const sanitizedSummary = sanitizeText(formData.summary, MAX_SUMMARY_LENGTH);
    const sanitizedContent = sanitizeText(formData.content, MAX_CONTENT_LENGTH);
    const sanitizedContact = sanitizeText(formData.contact, MAX_CONTACT_LENGTH);
    const sanitizedFansite = sanitizeText(formData.fansite, 80);

    if (!sanitizedTitle || !sanitizedSummary || !sanitizedContent) {
      setFormError('Seus campos ficaram vazios após saneamento. Revise o conteúdo e tente novamente.');
      return;
    }

    const normalizedHotel = getAuthorHotelDomain(habboAccount?.hotel || formData.hotel || 'com.br');

    const submissionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `submission-${Date.now()}`;

    const timestamp = new Date().toISOString();

    const newSubmission: JournalSubmission = {
      id: submissionId,
      title: sanitizedTitle,
      summary: sanitizedSummary,
      content: sanitizedContent,
      category: formData.category,
      image: formData.imageUrl.trim(),
      fansite: sanitizedFansite || undefined,
      contact: sanitizedContact || undefined,
      author: authorName,
      hotel: normalizedHotel,
      authorAvatar: `https://www.habbo.${normalizedHotel}/habbo-imaging/avatarimage?user=${encodeURIComponent(authorName)}&size=l&direction=2&head_direction=2&gesture=sml&action=std`,
      submittedAt: timestamp,
      date: timestamp,
      origin: 'user',
      status: 'pending'
    };

    try {
      setIsSubmitting(true);
      const existingRaw = typeof window !== 'undefined' ? localStorage.getItem('journal_submissions') : null;
      const existingSubmissions: JournalSubmission[] = existingRaw ? JSON.parse(existingRaw) : [];

      const updatedSubmissions = [newSubmission, ...existingSubmissions];

      if (typeof window !== 'undefined') {
        localStorage.setItem('journal_submissions', JSON.stringify(updatedSubmissions));
        history.push(now);
        updateSubmissionHistory(history);
      }

      setSubmissionMessage('Sua coluna foi enviada para análise! Assim que aprovada, ela aparecerá no Journal Hub.');
      setShowSubmissionModal(true);
      setIsSubmissionFormOpen(false);
      resetForm();
      toast({
        title: 'Coluna enviada!',
        description: 'Obrigado pela contribuição. Nossa equipe irá revisar e aprovar pelo Painel de Administração.'
      });
    } catch (error) {
      console.error('Erro ao armazenar submissão:', error);
      setFormError('Não foi possível enviar sua coluna agora. Tente novamente em instantes.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main 
            className="flex-1 min-h-screen p-4 sm:p-8" 
            style={{ 
              backgroundImage: 'url(/assets/site/bghabbohub.png)',
              backgroundRepeat: 'repeat'
            }}
          >
            <div className="max-w-7xl mx-auto relative" style={{ overflow: 'visible', padding: '20px' }}>
              {/* Newspaper Background Effect */}
              <div className="relative bg-gray-200 border-2 border-black p-6 sm:p-10 shadow-lg" style={{ 
                boxShadow: '4px 4px 0px 0px #1f2937',
                position: 'relative',
                zIndex: 1
              }}>
                {/* Second page - slightly offset to the right and down */}
                <div className="absolute bg-gray-300 border-2 border-gray-600" style={{ 
                  top: '6px',
                  left: '8px',
                  right: '-8px',
                  bottom: '-6px',
                  zIndex: 2
                }}></div>
                {/* Third page - more offset to the right and down */}
                <div className="absolute bg-gray-400 border-2 border-gray-700" style={{ 
                  top: '12px',
                  left: '16px',
                  right: '-16px',
                  bottom: '-12px',
                  zIndex: 1
                }}></div>
                
                {/* Header */}
                <header className="text-center mb-8 pb-4 border-b-2 border-black relative" style={{ zIndex: 5 }}>
                  <div className="flex items-center justify-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl text-black mb-2 font-bold" style={{ 
                      fontFamily: 'Press Start 2P, cursive',
                      textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                    }}>
                      JOURNAL HUB
                    </h1>
                  </div>
                  <AccentFixedText className="text-lg sm:text-xl text-gray-700">
                    As últimas notícias direto do Hotel, pelos próprios Habbos!
                  </AccentFixedText>
                </header>

                {/* Navigation Menu */}
                <nav className="mb-8 flex flex-wrap justify-center gap-6 text-sm sm:text-base border-b border-gray-500 pb-4 relative" style={{ zIndex: 5 }}>
                  <button 
                    onClick={() => scrollToSection('destaques')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Destaques do Hotel
                  </button>
                  <button 
                    onClick={() => scrollToSection('eventos')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Eventos
                  </button>
                  <button 
                    onClick={() => scrollToSection('entrevistas')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Entrevistas
                  </button>
                  <button 
                    onClick={() => scrollToSection('opiniao')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Opinião
                  </button>
                  <button 
                    onClick={() => scrollToSection('fansites')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Fã Sites
                  </button>
                  <button 
                    onClick={() => scrollToSection('classificados')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Classificados Habbo
                  </button>
                  <button 
                    onClick={() => scrollToSection('enviar-coluna')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Envie Sua Coluna
                  </button>
                </nav>


                {/* Journal Content */}
                <div 
                  className="relative"
                  style={{ zIndex: 5 }}
                >
                  {/* Page 1 - Cover */}
                  {currentPage === 1 && (
                    <div className="p-8" style={{ minHeight: '80vh' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Main Content (2/3 width) */}
                      <div className="md:col-span-2 space-y-6">
                        {/* Main Article */}
                        <section id="destaques" className="mb-8">
                          <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                            fontFamily: 'Press Start 2P, cursive',
                            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                          }}>
                            Notícia em Destaque: {newsArticles[0].title}
                          </h2>
                          <div className="relative w-full h-48 sm:h-72 bg-gray-300 mb-4">
                            <img 
                              src={newsArticles[0].image} 
                              alt={newsArticles[0].title}
                              className="w-full h-full object-cover"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            {/* Author Avatar Overlay */}
                            <div className="absolute bottom-0 left-0" style={{ 
                              height: '110px',
                              width: '96px',
                              overflow: 'hidden',
                              pointerEvents: 'none'
                            }}>
                              <img 
                                src={newsArticles[0].authorAvatar}
                                alt={newsArticles[0].author}
                                className="absolute bottom-0 left-0"
                                style={{ 
                                  height: '165px',
                                  width: '96px',
                                  bottom: '-55px',
                                  objectFit: 'none',
                                  filter: 'drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.5))',
                                  imageRendering: 'pixelated'
                                }}
                              />
                            </div>
                            
                          </div>
                          <AccentFixedText className="text-sm sm:text-base mb-4 leading-relaxed">
                            {newsArticles[0].content}
                          </AccentFixedText>
                          <a href="#" className="text-blue-700 hover:underline text-sm sm:text-base">
                            Leia o artigo completo...
                          </a>
                          <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Volter' }}>
                            Por: {newsArticles[0].author} - {new Date(newsArticles[0].date).toLocaleDateString('pt-BR')}
                          </p>
                        </section>

                        <div className="border-t border-dashed border-gray-500 my-8"></div>

                        {/* Analysis Section */}
                        <section id="analise-campanhas" className="mb-8">
                          <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                            fontFamily: 'Press Start 2P, cursive',
                            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                          }}>
                            Análise: {newsArticles[1].title}
                          </h2>
                          <div className="relative w-full h-48 sm:h-64 bg-gray-300 mb-4">
                            <img 
                              src={newsArticles[1].image} 
                              alt={newsArticles[1].title}
                              className="w-full h-full object-cover"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            {/* Author Avatar Overlay */}
                            <div className="absolute bottom-0 left-0" style={{ 
                              height: '110px',
                              width: '96px',
                              overflow: 'hidden',
                              pointerEvents: 'none'
                            }}>
                              <img 
                                src={newsArticles[1].authorAvatar}
                                alt={newsArticles[1].author}
                                className="absolute bottom-0 left-0"
                                style={{ 
                                  height: '165px',
                                  width: '96px',
                                  bottom: '-55px',
                                  objectFit: 'none',
                                  filter: 'drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.5))',
                                  imageRendering: 'pixelated'
                                }}
                              />
                            </div>
                            
                          </div>
                          <AccentFixedText className="text-sm sm:text-base mb-4 leading-relaxed">
                            {newsArticles[1].content}
                          </AccentFixedText>
                          <a href="#" className="text-blue-700 hover:underline text-sm sm:text-base">
                            Leia a análise completa...
                          </a>
                          <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Volter' }}>
                            Por: {newsArticles[1].author} - {new Date(newsArticles[1].date).toLocaleDateString('pt-BR')}
                          </p>
                        </section>
                      </div>

                      {/* Sidebar (1/3 width) */}
                      <aside className="md:col-span-1 space-y-4">
                        {/* Classifieds */}
                        <div id="classificados" className="border border-black p-4">
                          <h3 className="text-xl sm:text-2xl mb-3 font-bold" style={{ 
                            fontFamily: 'Press Start 2P, cursive',
                            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                          }}>
                            Classificados
                          </h3>
                          <div className="space-y-3">
                            {classifiedAds.map((ad) => (
                              <Dialog key={ad.id}>
                                <DialogTrigger asChild>
                                  <div className="border border-gray-300 p-2 cursor-pointer hover:bg-gray-50" style={{ 
                                    borderBottom: '1px dashed #4b5563',
                                    paddingBottom: '0.5rem',
                                    marginBottom: '0.5rem'
                                  }}>
                                    <img 
                                      src={ad.image} 
                                      alt={ad.title}
                                      className="w-full h-20 object-cover mb-2"
                                      style={{ imageRendering: 'pixelated' }}
                                    />
                                    <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      {ad.title}
                                    </h4>
                                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Volter' }}>
                                      {ad.price && `Preço: ${ad.price}`}
                                    </p>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>{ad.title}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <img 
                                      src={ad.image} 
                                      alt={ad.title}
                                      className="w-full h-32 object-cover"
                                      style={{ imageRendering: 'pixelated' }}
                                    />
                                    <p className="text-sm" style={{ fontFamily: 'Volter' }}>{ad.content}</p>
                                    <div className="flex items-center justify-between">
                                      <span style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                        Contato: {ad.contact}
                                      </span>
                                      {ad.price && (
                                        <span className="text-sm font-bold text-green-600" style={{ fontFamily: 'Volter' }}>
                                          {ad.price}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ))}
                          </div>
                        </div>

                        {/* Submit Column - Compact Version */}
                        <div id="enviar-coluna" className="border-2 border-black p-3">
                          <h3 className="text-lg mb-2 font-bold" style={{ 
                            fontFamily: 'Press Start 2P, cursive',
                            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                          }}>
                            Envie Sua Coluna
                          </h3>
                          <p className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Volter' }}>
                            Quer ver sua coluna publicada?
                          </p>
                          <Button 
                            onClick={handleOpenSubmissionModal}
                            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-none border-2 border-black text-sm py-1"
                            style={{ 
                              boxShadow: '2px 2px 0px 0px #1f2937',
                              fontFamily: 'VT323, monospace'
                            }}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Enviar
                          </Button>
                        </div>
                      </aside>
                    </div>
                    </div>
                  )}

                  {/* Page 2 - Eventos */}
                  {currentPage === 2 && (
                    <div className="p-8" style={{ minHeight: '80vh' }}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content (2/3 width) */}
                        <div className="md:col-span-2 space-y-6">
                          {/* Eventos em Destaque */}
                          <section id="eventos" className="mb-8">
                      <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                        fontFamily: 'Press Start 2P, cursive',
                        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                      }}>
                              Eventos em Destaque
                      </h2>
                            
                            {/* Evento Principal */}
                            <div className="border border-black p-4 mb-6 rounded-lg">
                              <div className="flex items-center gap-4 mb-3">
                                <img 
                                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjDhGLvOEcU_FGqcBTve1JyAoNt4ddcqAqfBMrvY4SF2YhRPDTBZOjReNooP8907PJAViP3-0XmR-_hdbwhRvBt-8h6UCYEnERTxbJgQaqWhGECue1XiP2EsQXuO-s0GN6_8XthY9OmNNM/s1600/ts_fire.gif"
                                  alt="Evento Principal"
                                  className="w-16 h-16 object-cover"
                                  style={{ imageRendering: 'pixelated' }}
                                />
                                <div>
                                  <h3 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    🎉 Festa dos 25 Anos do Habbo Hotel
                                  </h3>
                                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Volter' }}>
                                    Data: 15/01/2025 - 20/01/2025
                                  </p>
                                </div>
                              </div>
                              <AccentFixedText className="text-sm sm:text-base mb-3">
                                Celebre conosco os 25 anos do Habbo Hotel! Festa épica na Piscina com brindes exclusivos, 
                                mobis raros do Furni-Matic e Coroas de Fidelidade para veteranos. Não perca!
                              </AccentFixedText>
                              <div className="flex gap-2">
                                <Badge className="bg-red-500 text-white">Evento Oficial</Badge>
                                <Badge className="bg-yellow-500 text-black">Brindes Exclusivos</Badge>
                              </div>
                            </div>

                            {/* Outros Eventos */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="border border-gray-300 p-3 rounded-md">
                                <div className="flex items-center gap-3 mb-2">
                                  <img 
                                    src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1ZQwexYD0dHL62sDM9haQACJeCZED1qCMXRVzABKDEhi9X5lUeQCaqerPziBsggI2JI1RRNqLffWln3xPZaoEijGkebyJQ7AdK0PYuaLdAT8pC_tUisNMgFJE99YP8fS54F5hg24s0g/s1600/BR_ts_elections_anarchist.gif"
                                    alt="Competição"
                                    className="w-12 h-12 object-cover"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                  <div>
                                    <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      🏆 Competição de Decoração
                                    </h4>
                                    <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                      18/01/2025
                                    </p>
                                  </div>
                                </div>
                                <AccentFixedText className="text-sm sm:text-base">
                                  Mostre sua criatividade e concorra a prêmios incríveis!
                                </AccentFixedText>
                              </div>

                              <div className="border border-gray-300 p-3 rounded-md">
                                <div className="flex items-center gap-3 mb-2">
                                  <img 
                                    src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhFc-LIforDlqYWAxOgNN8-j8N5PaXYuTmuaIeKOOc18IRGfgsi0NkkWaJsjDfyaC_NePhneoS_w7ZvQMbIZy3KuGtSopEh9lwmT2-uTSDTcmpW-jBaPYbCVYFtFQLMd9rZxtlxYJL7dGMg/s1600/feature_cata_hort_jan18bun5.png"
                                    alt="Festa"
                                    className="w-12 h-12 object-cover"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                  <div>
                                    <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      🎵 Festa na Rádio
                                    </h4>
                                    <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                      22/01/2025
                                    </p>
                                  </div>
                                </div>
                                <AccentFixedText className="text-sm sm:text-base">
                                  Venha dançar e se divertir com a melhor música do Hotel!
                                </AccentFixedText>
                              </div>
                            </div>
                          </section>

                          <div className="border-t border-dashed border-gray-500 my-8"></div>

                          {/* Calendário de Eventos */}
                          <section className="mb-8">
                            <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}>
                              Calendário de Eventos
                            </h2>
                            <div className="border border-black p-4 rounded-lg">
                              <div className="grid grid-cols-7 gap-2 mb-4">
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                  <div key={day} style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    {day}
                                  </div>
                                ))}
                              </div>
                              <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                  <div key={day} style={{ fontFamily: 'Volter' }}>
                                    {day}
                                    {day === 15 && <div className="text-xs text-red-600">🎉</div>}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-600 mt-2" style={{ fontFamily: 'Volter' }}>
                                Janeiro 2025 - Eventos marcados em vermelho
                              </p>
                            </div>
                          </section>
                        </div>

                        {/* Sidebar (1/3 width) */}
                        <aside className="md:col-span-1 space-y-4">
                          {/* Próximos Eventos */}
                          <div className="border border-black p-4 rounded-lg">
                            <h3 className="text-xl sm:text-2xl mb-3 font-bold" style={{ 
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}>
                              Próximos Eventos
                            </h3>
                            <div className="space-y-3">
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  🎨 Workshop de Pixel Art
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  25/01/2025 - 14:00
                                </p>
                              </div>
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  🏠 Tour das Homes VIP
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  28/01/2025 - 16:00
                                </p>
                              </div>
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  🎲 Torneio de Jogos
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  30/01/2025 - 18:00
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Eventos Especiais */}
                          <div className="border border-black p-4 rounded-lg">
                            <h3 className="text-lg mb-2 font-bold" style={{ 
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}>
                              Eventos Especiais
                            </h3>
                            <div className="space-y-2">
                              <div className="p-2 border border-gray-300">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  🌟 Aniversário do Hotel
                                </h4>
                                <AccentFixedText className="text-sm sm:text-base">
                                  Celebração especial com brindes únicos!
                                </AccentFixedText>
                              </div>
                              <div className="p-2 border border-gray-300">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  🎁 Campanha de Verão
                                </h4>
                                <AccentFixedText className="text-sm sm:text-base">
                                  Novos mobis e decorações temáticas.
                                </AccentFixedText>
                              </div>
                            </div>
                          </div>
                        </aside>
                      </div>
                    </div>
                  )}

                  {/* Page 3 - Entrevistas */}
                  {currentPage === 3 && (
                    <div className="p-8" style={{ minHeight: '80vh' }}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content (2/3 width) */}
                        <div className="md:col-span-2 space-y-6">
                          {/* Entrevista Principal */}
                          <section id="entrevistas" className="mb-8">
                      <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                        fontFamily: 'Press Start 2P, cursive',
                        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                      }}>
                              Entrevista Exclusiva: Muumiopappa
                      </h2>
                            
                            <div className="border-2 border-black p-6">
                              <div className="flex items-start gap-6 mb-4">
                                <img 
                                  src="https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-10.ch-3538-67.lg-275-82.sh-295-92.fa-1206-90%2Cs-0.g-1.d-2.h-2.a-0%2C41cb5bfd4dcecf4bf5de00b7ea872714.png"
                                  alt="Muumiopappa"
                                  className="w-24 h-24 object-cover"
                                  style={{ imageRendering: 'pixelated' }}
                                />
                                <div className="flex-1">
                                  <h3 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    🎯 Muumiopappa - Diretor de Produto
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Volter' }}>
                                    Entrevista realizada em 10/01/2025
                                  </p>
                                  <div className="flex gap-2 mb-3">
                                    <Badge className="bg-purple-500 text-white">Staff Oficial</Badge>
                                    <Badge className="bg-blue-500 text-white">Desenvolvimento</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="p-4 border border-gray-300">
                                  <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    Journal Hub: Como você vê o futuro do Habbo Hotel?
                                  </h4>
                                  <AccentFixedText className="text-sm sm:text-base">
                                    "Estamos muito animados com os próximos anos. O Habbo Hotel tem uma comunidade incrível e estamos 
                                    trabalhando em novas funcionalidades que vão surpreender todos os Habbos. O futuro é brilhante!"
                                  </AccentFixedText>
                                </div>
                                
                                <div className="p-4 border border-gray-300">
                                  <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    Journal Hub: Qual foi o momento mais marcante dos 25 anos?
                                  </h4>
                                  <AccentFixedText className="text-sm sm:text-base">
                                    "Ver a comunidade crescer e se conectar através do Hotel é algo mágico. Cada evento, cada amizade 
                                    formada aqui representa o que torna o Habbo especial."
                                  </AccentFixedText>
                                </div>
                                
                                <div className="p-4 border border-gray-300">
                                  <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    Journal Hub: Que mensagem você gostaria de deixar para os Habbos?
                                  </h4>
                                  <AccentFixedText className="text-sm sm:text-base">
                                    "Obrigado por fazerem parte dessa jornada incrível! Continuem sendo criativos, amigáveis e 
                                    apaixonados pelo Hotel. Vocês são o coração do Habbo!"
                                  </AccentFixedText>
                                </div>
                              </div>
                            </div>
                          </section>
                        </div>

                        {/* Sidebar (1/3 width) */}
                        <aside className="md:col-span-1 space-y-4">
                          {/* Próximas Entrevistas */}
                          <div className="border border-black p-4">
                            <h3 className="text-xl sm:text-2xl mb-3 font-bold" style={{ 
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}>
                              Próximas Entrevistas
                            </h3>
                            <div className="space-y-3">
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  🎵 DJ Habbo
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  Sobre música e eventos
                                </p>
                              </div>
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  🏆 Campeão de Trading
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  Estratégias de mercado
                                </p>
                              </div>
                            </div>
                          </div>
                        </aside>
                      </div>
                    </div>
                  )}

                  {/* Page 4 - Opinião */}
                  {currentPage === 4 && (
                    <div className="p-8" style={{ minHeight: '80vh' }}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content (2/3 width) */}
                        <div className="md:col-span-2 space-y-6">
                          {/* Artigo Principal */}
                          <section id="opiniao" className="mb-8">
                      <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                        fontFamily: 'Press Start 2P, cursive',
                        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                      }}>
                              Opinião: O Futuro do Trading no Habbo
                      </h2>
                            
                            <div className="border-2 border-black p-6">
                              <div className="flex items-start gap-4 mb-4">
                                <img 
                                  src="https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-1.ch-255-84.lg-275-1408.sh-295-64%2Cs-0.g-1.d-2.h-2.a-0%2C3565e22f0ecd66108595e64551d13483.png"
                                  alt="Autor"
                                  className="w-16 h-16 object-cover"
                                  style={{ imageRendering: 'pixelated' }}
                                />
                                <div>
                                  <h3 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    📊 Por: TraderExpert
                                  </h3>
                                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Volter' }}>
                                    Publicado em 12/01/2025
                                  </p>
                                  <div className="flex gap-2 mt-2">
                                    <Badge className="bg-orange-500 text-white">Análise</Badge>
                                    <Badge className="bg-blue-500 text-white">Trading</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <AccentFixedText className="text-sm sm:text-base leading-relaxed">
                                  O mercado de trading no Habbo Hotel está passando por uma transformação significativa. 
                                  Com a introdução de novos sistemas de economia e a crescente popularidade dos NFTs, 
                                  vemos uma evolução que pode mudar completamente como os Habbos interagem com o mercado.
                                </AccentFixedText>
                                
                                <AccentFixedText className="text-sm sm:text-base leading-relaxed">
                                  A questão central é: estamos preparados para essa mudança? A comunidade precisa se adaptar 
                                  aos novos tempos, mas sem perder a essência do que torna o trading no Habbo especial - 
                                  a interação humana e a criatividade.
                                </AccentFixedText>
                                
                                <div className="p-4 border border-gray-300">
                                  <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    💡 Minha Recomendação:
                                  </h4>
                                  <AccentFixedText className="text-sm sm:text-base">
                                    "Devemos abraçar as mudanças, mas sempre manter o foco na comunidade. 
                                    O futuro do trading está na colaboração, não na competição."
                                  </AccentFixedText>
                                </div>
                              </div>
                            </div>
                          </section>

                          <div className="border-t border-dashed border-gray-500 my-8"></div>

                          {/* Outros Artigos */}
                          <section className="mb-8">
                            <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}>
                              Mais Opiniões
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="border border-gray-300 p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <img 
                                    src="https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-10.ch-3538-67.lg-275-82.sh-295-92.fa-1206-90%2Cs-0.g-1.d-2.h-2.a-0%2C41cb5bfd4dcecf4bf5de00b7ea872714.png"
                                    alt="Autor"
                                    className="w-12 h-12 object-cover"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                  <div>
                                    <h3 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      🎨 PixelArtLover
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                      Sobre Arte Digital
                                    </p>
                                  </div>
                                </div>
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  A Arte Pixelada Nunca Morre
                                </h4>
                                <p className="text-sm sm:text-base mb-2" style={{ fontFamily: 'Volter' }}>
                                  "Em um mundo de gráficos ultra-realistas, a simplicidade do pixel art continua..."
                                </p>
                                <Button size="sm" className="text-xs bg-purple-500 hover:bg-purple-600 text-white">
                                  Ler Artigo Completo
                                </Button>
                              </div>

                              <div className="border border-gray-300 p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <img 
                                    src="https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-1.ch-255-84.lg-275-1408.sh-295-64%2Cs-0.g-1.d-2.h-2.a-0%2C3565e22f0ecd66108595e64551d13483.png"
                                    alt="Autor"
                                    className="w-12 h-12 object-cover"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                  <div>
                                    <h3 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      🏠 HomeDesigner
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                      Sobre Decoração
                                    </p>
                                  </div>
                                </div>
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  Tendências de Decoração 2025
                                </h4>
                                <p className="text-sm sm:text-base mb-2" style={{ fontFamily: 'Volter' }}>
                                  "Os novos mobis estão revolucionando a forma como decoramos nossas homes..."
                                </p>
                                <Button size="sm" className="text-xs bg-green-500 hover:bg-green-600 text-white">
                                  Ler Artigo Completo
                                </Button>
                              </div>
                            </div>
                          </section>
                        </div>

                        {/* Sidebar (1/3 width) */}
                        <aside className="md:col-span-1 space-y-4">
                          {/* Colunas de Leitores */}
                          <div className="border border-black p-4">
                            <h3 className="text-xl sm:text-2xl mb-3 font-bold" style={{ 
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}>
                              Colunas de Leitores
                            </h3>
                            <div className="space-y-3">
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  💬 Debate da Semana
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  "Qual é o melhor hotel do Habbo?"
                                </p>
                              </div>
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  📝 Cartas dos Leitores
                                </h4>
                                <AccentFixedText className="text-sm sm:text-base text-gray-600">
                                  Suas opiniões sobre o Hotel
                                </AccentFixedText>
                              </div>
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  🎯 Enquete da Semana
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  Vote na sua campanha favorita
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Envie Sua Opinião */}
                          <div className="border border-black p-4">
                            <h3 className="text-lg mb-2 font-bold" style={{ 
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}>
                              Envie Sua Opinião
                            </h3>
                            <p className="text-sm sm:text-base text-gray-700 mb-2" style={{ fontFamily: 'Volter' }}>
                              Quer compartilhar sua visão sobre o Hotel?
                            </p>
                            <Button 
                              size="sm"
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs"
                            >
                              Escrever Artigo
                            </Button>
                          </div>
                        </aside>
                      </div>
                    </div>
                  )}

                  {/* Page 5 - Fã Sites */}
                  {currentPage === 5 && (
                    <div className="p-8" style={{ minHeight: '80vh' }}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content (2/3 width) */}
                        <div className="md:col-span-2 space-y-6">
                          {/* Destaque Principal */}
                          <section id="fansites" className="mb-8">
                      <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                        fontFamily: 'Press Start 2P, cursive',
                        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                      }}>
                              Destaque: HabboHub - O Portal da Comunidade
                      </h2>
                            
                            <div className="border-2 border-black p-6">
                              <div className="flex items-start gap-6 mb-4">
                                <img 
                                  src="/assets/site/bghabbohub.png"
                                  alt="HabboHub"
                                  className="w-24 h-24 object-cover"
                                  style={{ imageRendering: 'pixelated' }}
                                />
                                <div className="flex-1">
                                  <h3 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    🌟 HabboHub - Portal Oficial
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Volter' }}>
                                    Lançado em Janeiro 2025
                                  </p>
                                  <div className="flex gap-2 mb-3">
                                    <Badge className="bg-green-500 text-white">Portal Oficial</Badge>
                                    <Badge className="bg-blue-500 text-white">Ferramentas</Badge>
                                    <Badge className="bg-purple-500 text-white">Comunidade</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <AccentFixedText className="text-sm sm:text-base leading-relaxed">
                                  O HabboHub revolucionou a forma como os Habbos interagem com o Hotel. Com ferramentas exclusivas, 
                                  sistema de homes personalizadas e integração completa com a comunidade, tornou-se o destino 
                                  número um para todos os fãs do Habbo Hotel.
                                </AccentFixedText>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="p-3 border border-gray-300">
                                    <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      🛠️ Ferramentas Exclusivas
                                    </h4>
                                    <ul className="text-xs space-y-1" style={{ fontFamily: 'Volter' }}>
                                      <li>• Editor de Avatar</li>
                                      <li>• Catálogo de Hand Items</li>
                                      <li>• Sistema de Homes</li>
                                      <li>• Console de Desenvolvimento</li>
                                    </ul>
                                  </div>
                                  
                                  <div className="p-3 border border-gray-300">
                                    <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      📊 Estatísticas
                                    </h4>
                                    <ul className="text-xs space-y-1" style={{ fontFamily: 'Volter' }}>
                                      <li>• 10.000+ Usuários Ativos</li>
                                      <li>• 5.000+ Homes Criadas</li>
                                      <li>• 50+ Ferramentas</li>
                                      <li>• 100% Gratuito</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </section>
                        </div>

                        {/* Sidebar (1/3 width) */}
                        <aside className="md:col-span-1 space-y-4">
                          {/* Novidades da Comunidade */}
                          <div className="border border-black p-4">
                            <h3 className="text-xl sm:text-2xl mb-3 font-bold" style={{ 
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}>
                              Novidades da Comunidade
                            </h3>
                            <div className="space-y-3">
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  🆕 Novo Fã Site Lançado
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  TradingHub - Especializado em economia
                                </p>
                              </div>
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  🤝 Parceria Oficial
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  HabboHub + Habblindados
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Seja Nosso Parceiro */}
                          <div className="border border-black p-4">
                            <h3 className="text-lg mb-2 font-bold" style={{ 
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}>
                              Seja Nosso Parceiro
                            </h3>
                            <p className="text-sm sm:text-base text-gray-700 mb-2" style={{ fontFamily: 'Volter' }}>
                              Tem um fã site? Quer fazer parte da nossa rede?
                            </p>
                            <Button 
                              size="sm"
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              Solicitar Parceria
                            </Button>
                          </div>
                        </aside>
                      </div>
                    </div>
                  )}
                </div>



                {/* Page Navigation - Footer */}
                <div className="mt-8 flex justify-center items-center border-t-2 border-black pt-4 relative" style={{ zIndex: 5 }}>
                  <div className="flex items-center gap-4">
                    {currentPage > 1 && (
                      <Button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-none border-2 border-black"
                        style={{ 
                          boxShadow: '2px 2px 0px 0px #1f2937',
                          fontFamily: 'VT323, monospace'
                        }}
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Página Anterior
                      </Button>
                    )}
                    
                    <span className="text-sm font-bold px-4 py-2 bg-gray-100 border-2 border-black" style={{ 
                      fontFamily: 'VT323, monospace',
                      boxShadow: '2px 2px 0px 0px #1f2937'
                    }}>
                      Página {currentPage} de {totalPages}
                    </span>
                    
                    {currentPage < totalPages && (
                      <Button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-none border-2 border-black"
                        style={{ 
                          boxShadow: '2px 2px 0px 0px #1f2937',
                          fontFamily: 'VT323, monospace'
                        }}
                      >
                        Próxima Página
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <footer className="text-center mt-6 pt-6 border-t-2 border-black text-gray-700 text-sm relative" style={{ fontFamily: 'Volter', zIndex: 5 }}>
                  <p>&copy; 2025 Journal Hub. Todos os direitos reservados. Feito com pixel art.</p>
                  <p className="mt-2">Contato: jornal@habbohub.com | Siga-nos nas redes sociais do Habbo!</p>
                  {isPrimaryAdmin && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="text-black border-black hover:bg-black hover:text-white"
                      onClick={() => window.open('/admin-panel', '_blank')}
                      style={{ fontFamily: 'Volter' }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Painel de Administração
                    </Button>
                  </div>
                  )}
                </footer>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Submission Form Modal */}
      <Dialog open={isSubmissionFormOpen} onOpenChange={(open) => {
        setIsSubmissionFormOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="max-w-5xl w-full p-0 border-4 border-black bg-gray-100 overflow-hidden">
          <div className="bg-gray-200 border-b-2 border-black px-6 py-5">
            <DialogHeader className="p-0">
              <DialogTitle className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Press Start 2P, cursive', textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)' }}>
                Escreva artigos para nosso jornal, exiba suas histórias, opiniões discussões, seja criativo e respeitoso!
              </DialogTitle>
            </DialogHeader>
            <p className="mt-2 text-sm sm:text-base text-gray-700" style={{ fontFamily: 'Volter' }}>
              A equipe Habbo Hub selecionará artigos para a próxima edição do jornal, aguarde!
            </p>
          </div>
          <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
            <aside className="hidden md:flex flex-col gap-4 border-r-2 border-black bg-gray-50 px-5 py-6" style={{ minHeight: '100%' }}>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 border-2 border-black bg-white flex items-center justify-center overflow-hidden" style={{ boxShadow: '4px 4px 0px 0px #1f2937' }}>
                  <img
                    src={authorAvatarPreview}
                    alt={habboAccount?.habbo_name || 'Avatar exemplo'}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div className="mt-4">
                  <p className="text-xs uppercase text-gray-600 tracking-wide" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                    Autor vinculado
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-sm text-blue-700 hover:underline"
                    style={{ fontFamily: 'Volter' }}
                    onClick={() => {
                      if (habboAccount) {
                        window.open(`/profile/${habboAccount.habbo_name}`, '_blank');
                      } else {
                        window.open('/login', '_self');
                      }
                    }}
                  >
                    {habboAccount ? habboAccount.habbo_name : 'Faça login para vincular' }
                  </button>
                  <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Volter' }}>
                    Envio disponível apenas para usuários logados.
                  </p>
                </div>
              </div>

              <div className="border-2 border-black bg-white p-4 space-y-3" style={{ boxShadow: '3px 3px 0px 0px #1f2937' }}>
                <h3 className="text-sm font-bold text-black" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                  Dicas para o envio
                </h3>
                <ul className="space-y-2 text-xs text-gray-700" style={{ fontFamily: 'Volter' }}>
                  <li>• Use imagens hospedadas em sites confiáveis (PNG/GIF).</li>
                  <li>• Resumo curto na esquerda, história completa na direita.</li>
                  <li>• Revise ortografia e credite os envolvidos.</li>
                  <li>• O time aprova no Painel antes de publicar.</li>
                </ul>
              </div>

              <div className="border-2 border-black bg-white p-4 space-y-2" style={{ boxShadow: '3px 3px 0px 0px #1f2937' }}>
                <h4 className="text-sm font-bold text-black" style={{ fontFamily: 'Press Start 2P, cursive' }}>Pré-visualização da imagem</h4>
                <div className="w-full aspect-video bg-gray-200 border border-dashed border-gray-400 flex items-center justify-center overflow-hidden">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Prévia do artigo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500" style={{ fontFamily: 'Volter' }}>Cole uma URL para visualizar</span>
                  )}
                </div>
              </div>

              {!isLoggedIn && (
                <Button
                  className="border-2 border-black bg-blue-600 hover:bg-blue-700 text-white rounded-none"
                  style={{ boxShadow: '3px 3px 0px 0px #1f2937', fontFamily: 'VT323, monospace' }}
                  onClick={() => window.open('/login', '_self')}
                >
                  Fazer login e enviar
                </Button>
              )}
            </aside>

            <div className="px-6 py-6 bg-gray-100 max-h-[70vh] overflow-y-auto">
              {formError && (
                <div className="mb-4 border-2 border-red-500 bg-red-100 px-4 py-3 text-sm text-red-800" style={{ fontFamily: 'Volter' }}>
                  {formError}
                </div>
              )}
              {rateLimitMessage && (
                <div className="mb-4 border-2 border-blue-500 bg-blue-100 px-4 py-3 text-sm text-blue-800" style={{ fontFamily: 'Volter' }}>
                  {rateLimitMessage}
                </div>
              )}
              {!isLoggedIn && (
                <div className="mb-6 border-2 border-yellow-400 bg-yellow-100 px-4 py-3 text-sm text-yellow-800" style={{ fontFamily: 'Volter' }}>
                  Faça login com sua conta Habbo para preencher e enviar uma coluna.
                </div>
              )}
              <div className="md:hidden border-2 border-black bg-white p-4 mb-6" style={{ boxShadow: '3px 3px 0px 0px #1f2937' }}>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-black bg-gray-200 overflow-hidden">
                    <img
                      src={authorAvatarPreview}
                      alt={habboAccount?.habbo_name || 'Avatar exemplo'}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-600 tracking-wide" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      Autor vinculado
                    </p>
                    <p className="text-sm text-black" style={{ fontFamily: 'Volter' }}>
                      {habboAccount ? habboAccount.habbo_name : 'Faça login para vincular'}
                    </p>
                    <button
                      type="button"
                      className="text-xs text-blue-700 underline mt-1"
                      style={{ fontFamily: 'Volter' }}
                      onClick={() => {
                        if (habboAccount) {
                          window.open(`/profile/${habboAccount.habbo_name}`, '_blank');
                        } else {
                          window.open('/login', '_self');
                        }
                      }}
                    >
                      {habboAccount ? 'Ver meu perfil' : 'Ir para o login'}
                    </button>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmission} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="authorName" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      Seu Nick Habbo *
                    </Label>
                    <Input
                      id="authorName"
                      value={formData.authorName}
                      readOnly
                      disabled={!isLoggedIn}
                      className="mt-2 border-2 border-black rounded-none bg-white"
                      style={{ fontFamily: 'Volter' }}
                      placeholder="Faça login para vincular"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      Hotel
                    </Label>
                    <Select value={formData.hotel} onValueChange={(value) => handleFormChange('hotel', value)} disabled={!isLoggedIn}>
                      <SelectTrigger className="mt-2 border-2 border-black rounded-none bg-white" style={{ fontFamily: 'Volter' }}>
                        <SelectValue placeholder="Selecione o hotel" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black bg-white">
                        {HOTEL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="font-normal" style={{ fontFamily: 'Volter' }}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                    Título do Artigo *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(event) => handleFormChange('title', event.target.value)}
                    disabled={!isLoggedIn}
                    className="mt-2 border-2 border-black rounded-none bg-white"
                    style={{ fontFamily: 'Volter' }}
                    placeholder="Digite um título chamativo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      Categoria *
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)} disabled={!isLoggedIn}>
                      <SelectTrigger className="mt-2 border-2 border-black rounded-none bg-white" style={{ fontFamily: 'Volter' }}>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black bg-white">
                        {JOURNAL_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category} className="font-normal" style={{ fontFamily: 'Volter' }}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fansite" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      Fã site ou equipe (opcional)
                    </Label>
                    <Input
                      id="fansite"
                      value={formData.fansite}
                      onChange={(event) => handleFormChange('fansite', event.target.value)}
                      disabled={!isLoggedIn}
                      className="mt-2 border-2 border-black rounded-none bg-white"
                      style={{ fontFamily: 'Volter' }}
                      placeholder="Ex.: HabboHub, Rádio Pixel"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imageUrl" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                    Imagem de Destaque (URL) *
                  </Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(event) => handleFormChange('imageUrl', event.target.value)}
                    disabled={!isLoggedIn}
                    className="mt-2 border-2 border-black rounded-none bg-white"
                    style={{ fontFamily: 'Volter' }}
                    placeholder="Cole a URL de uma imagem .png ou .gif"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="summary" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      Resumo *
                    </Label>
                    <Textarea
                      id="summary"
                      value={formData.summary}
                      onChange={(event) => handleFormChange('summary', event.target.value)}
                      disabled={!isLoggedIn}
                      className="mt-2 border-2 border-black rounded-none bg-white"
                      style={{ fontFamily: 'Volter' }}
                      placeholder="Faça um resumo curto para destacar sua coluna"
                      rows={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      Contato ou Link (opcional)
                    </Label>
                    <Textarea
                      id="contact"
                      value={formData.contact}
                      onChange={(event) => handleFormChange('contact', event.target.value)}
                      disabled={!isLoggedIn}
                      className="mt-2 border-2 border-black rounded-none bg-white"
                      style={{ fontFamily: 'Volter' }}
                      placeholder="Discord, redes sociais ou link para referência"
                      rows={5}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                    Conteúdo Completo *
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(event) => handleFormChange('content', event.target.value)}
                    disabled={!isLoggedIn}
                    className="mt-2 border-2 border-black rounded-none bg-white"
                    style={{ fontFamily: 'Volter', minHeight: '160px' }}
                    placeholder="Escreva o conteúdo completo da sua coluna"
                    rows={10}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Volter' }}>
                    Ao enviar, você autoriza a publicação do conteúdo no Journal Hub.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-2 border-black rounded-none"
                      style={{ boxShadow: '2px 2px 0px 0px #1f2937', fontFamily: 'VT323, monospace' }}
                      onClick={() => {
                        setIsSubmissionFormOpen(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isLoggedIn || isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white border-2 border-black rounded-none disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ boxShadow: '3px 3px 0px 0px #1f2937', fontFamily: 'VT323, monospace' }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Enviando...' : 'Enviar Coluna'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submission Success Modal */}
      <Dialog open={showSubmissionModal} onOpenChange={setShowSubmissionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Coluna Enviada!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ fontFamily: 'Volter' }}>
              {submissionMessage}
            </p>
            <Button 
              onClick={() => setShowSubmissionModal(false)}
              className="w-full"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Journal;