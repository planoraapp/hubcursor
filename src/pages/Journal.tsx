import React, { useEffect, useMemo, useState } from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AccentFixedText } from '@/components/AccentFixedText';
import { Newspaper, Send, Users, Calendar, ExternalLink, FileText, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/contexts/I18nContext';

type JournalCategoryKey =
  | 'highlight'
  | 'news'
  | 'event'
  | 'interview'
  | 'opinion'
  | 'analysis'
  | 'classifieds';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  fansite: string;
  image: string;
  category: JournalCategoryKey;
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

interface JournalFormState {
  title: string;
  summary: string;
  content: string;
  category: JournalCategoryKey;
  imageUrl: string;
  fansite: string;
  contact: string;
  authorName: string;
  hotel: string;
}

const DEFAULT_CATEGORY: JournalCategoryKey = 'highlight';

const JOURNAL_CATEGORY_OPTIONS: Array<{ value: JournalCategoryKey; labelKey: string }> = [
  { value: 'highlight', labelKey: 'pages.journal.articles.categories.highlight' },
  { value: 'news', labelKey: 'pages.journal.articles.categories.news' },
  { value: 'event', labelKey: 'pages.journal.articles.categories.event' },
  { value: 'interview', labelKey: 'pages.journal.articles.categories.interview' },
  { value: 'opinion', labelKey: 'pages.journal.articles.categories.opinion' },
  { value: 'analysis', labelKey: 'pages.journal.articles.categories.analysis' },
  { value: 'classifieds', labelKey: 'pages.journal.articles.categories.classifieds' }
];

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

const createInitialFormState = (authorName = '', hotel = 'com.br'): JournalFormState => ({
  title: '',
  summary: '',
  content: '',
  category: DEFAULT_CATEGORY,
  imageUrl: '',
  fansite: '',
  contact: '',
  authorName,
  hotel
});

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

const normalizeHotelDomain = (hotel?: string) => {
  if (!hotel) return 'com.br';
  const normalized = hotel.toLowerCase();
  return normalized === 'br' ? 'com.br' : normalized;
};

const Journal = () => {
  const { habboAccount } = useAuth();
  const { toast } = useToast();
  const { t, language } = useI18n();
  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAd, setSelectedAd] = useState<ClassifiedAd | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [formData, setFormData] = useState<JournalFormState>(() =>
    createInitialFormState(habboAccount?.habbo_name || '', normalizeHotelDomain(habboAccount?.hotel))
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('all');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

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

  const resetForm = () => {
    setFormData(
      createInitialFormState(habboAccount?.habbo_name || '', normalizeHotelDomain(habboAccount?.hotel))
    );
    setFormError(null);
  };

  const handleOpenSubmissionModal = () => {
    resetForm();
    setIsSubmissionFormOpen(true);
  };

  const handleFormChange = (field: keyof JournalFormState, value: string) => {
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
      hotel: normalizeHotelDomain(habboAccount?.hotel)
    }));
  }, [habboAccount]);

  const authorAvatarPreview = useMemo(() => {
    const hotelDomain = normalizeHotelDomain(habboAccount?.hotel || formData.hotel);
    const authorName = habboAccount?.habbo_name || formData.authorName || 'Habbo';
    return `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(authorName)}&size=l&direction=2&head_direction=2&gesture=sml&action=std`;
  }, [habboAccount, formData.authorName, formData.hotel]);

  // Mock data for the journal
  const newsArticles: NewsArticle[] = useMemo(
    () => [
      {
        id: '1',
        title: t('pages.journal.articles.anniversary.title'),
        content: t('pages.journal.articles.anniversary.content'),
        author: 'Beebop',
        authorAvatar:
          'https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-10.ch-3538-67.lg-275-82.sh-295-92.fa-1206-90%2Cs-0.g-1.d-2.h-2.a-0%2C41cb5bfd4dcecf4bf5de00b7ea872714.png',
        fansite: t('pages.journal.articles.anniversary.fansite'),
        image: '/assets/journal/article1.gif',
        category: 'highlight',
        date: '2024-01-15',
        isMain: true
      },
      {
        id: '2',
        title: t('pages.journal.articles.neon.title'),
        content: t('pages.journal.articles.neon.content'),
        author: 'AnalistaPixel',
        authorAvatar:
          'https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-1.ch-255-84.lg-275-1408.sh-295-64%2Cs-0.g-1.d-2.h-2.a-0%2C3565e22f0ecd66108595e64551d13483.png',
        fansite: t('pages.journal.articles.neon.fansite'),
        image: '/assets/journal/PRE.gif',
        category: 'analysis',
        date: '2024-01-12',
        isMain: false
      }
    ],
    [t]
  );

  const classifiedAds: ClassifiedAd[] = useMemo(
    () => [
      {
        id: '1',
        title: t('pages.journal.classifieds.items.room.title'),
        content: t('pages.journal.classifieds.items.room.content'),
        image:
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhFc-LIforDlqYWAxOgNN8-j8N5PaXYuTmuaIeKOOc18IRGfgsi0NkkWaJsjDfyaC_NePhneoS_w7ZvQMbIZy3KuGtSopEh9lwmT2-uTSDTcmpW-jBaPYbCVYFtFQLMd9rZxtlxYJL7dGMg/s1600/feature_cata_hort_jan18bun5.png',
        price: t('pages.journal.classifieds.items.room.price'),
        contact: t('pages.journal.classifieds.items.room.contact')
      },
      {
        id: '2',
        title: t('pages.journal.classifieds.items.ltd.title'),
        content: t('pages.journal.classifieds.items.ltd.content'),
        image:
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKlk9eJDWBDDu1Rvq9b7CBnf15zxxPZ6Rjv311WLfp2gunR5LiYnrLfaf2gHBkbVExK1sWcq30GIIGCQkTTi9RChQ0y5vPx0FZDctPuvu4u4oR1OyaytDvouowrK18pmsHzQrXHnwegz5G/s1600/feature_cata_hort_jan18bun3.png',
        contact: t('pages.journal.classifieds.items.ltd.contact')
      }
    ],
    [t]
  );

  const journalCategoryOptions = useMemo(
    () =>
      JOURNAL_CATEGORY_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey)
      })),
    [t]
  );

  const categoryLabelMap = useMemo(
    () =>
      journalCategoryOptions.reduce(
        (acc, option) => ({
          ...acc,
          [option.value]: option.label
        }),
        {} as Record<JournalCategoryKey, string>
      ),
    [journalCategoryOptions]
  );

  const dateLocale = useMemo(() => {
    if (language === 'pt') return 'pt-BR';
    if (language === 'es') return 'es-ES';
    return 'en-US';
  }, [language]);

  const calendarDays = useMemo(() => t('pages.journal.sections.events.calendarDays').split('|'), [t]);

  // Configuração completa de hotéis com bandeiras
  const hotelOptions = useMemo(() => [
    { code: 'all', name: 'Todos os países', flag: '/flags/flagcom.png' },
    { code: 'br', name: 'Brasil', flag: '/flags/flagbrazil.png' },
    { code: 'com', name: 'Internacional', flag: '/flags/flagcom.png' },
    { code: 'es', name: 'Espanha', flag: '/flags/flagspain.png' },
    { code: 'fr', name: 'França', flag: '/flags/flagfrance.png' },
    { code: 'de', name: 'Alemanha', flag: '/flags/flagdeus.png' },
    { code: 'it', name: 'Itália', flag: '/flags/flagitaly.png' },
    { code: 'nl', name: 'Holanda', flag: '/flags/flagnetl.png' },
    { code: 'tr', name: 'Turquia', flag: '/flags/flagtrky.png' },
    { code: 'fi', name: 'Finlândia', flag: '/flags/flafinland.png' }
  ], []);

  const selectedHotel = useMemo(() => 
    hotelOptions.find(h => h.code === selectedCountryFilter) || hotelOptions[0],
    [hotelOptions, selectedCountryFilter]
  );

  // Eventos do Habbo para novembro 2025
  interface HabboEvent {
    id: string;
    title: string;
    description: string;
    date: number; // dia do mês (1-31)
    countries: string[]; // ['br', 'com', 'it', etc] ou ['all'] para todos
    type: 'official' | 'community' | 'seasonal';
    status: 'upcoming' | 'active' | 'ended';
  }

  const habboEvents: HabboEvent[] = useMemo(() => [
    {
      id: '1',
      title: 'Black Friday Habbo',
      description: 'Descontos especiais em móveis e roupas. Ofertas exclusivas por tempo limitado!',
      date: 1,
      countries: ['all'],
      type: 'official',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Festival de Inverno',
      description: 'Evento sazonal com móveis temáticos de inverno e atividades especiais.',
      date: 5,
      countries: ['br', 'com', 'it', 'es', 'fr', 'de'],
      type: 'seasonal',
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Competição de Quartos Temáticos',
      description: 'Mostre sua criatividade! Prêmios incríveis para os melhores quartos.',
      date: 8,
      countries: ['br', 'com.br'],
      type: 'community',
      status: 'upcoming'
    },
    {
      id: '4',
      title: 'Torneio de BattleBall',
      description: 'Competição oficial de BattleBall com prêmios exclusivos.',
      date: 12,
      countries: ['com', 'it', 'es'],
      type: 'official',
      status: 'upcoming'
    },
    {
      id: '5',
      title: 'Evento de Aniversário',
      description: 'Celebração especial com móveis comemorativos e emblemas únicos.',
      date: 15,
      countries: ['all'],
      type: 'official',
      status: 'upcoming'
    },
    {
      id: '6',
      title: 'Caça ao Tesouro Semanal',
      description: 'Encontre pistas espalhadas pelos quartos públicos e ganhe prêmios!',
      date: 18,
      countries: ['br', 'com'],
      type: 'community',
      status: 'upcoming'
    },
    {
      id: '7',
      title: 'Noite do Pijama Virtual',
      description: 'Evento social relaxante com atividades e prêmios exclusivos.',
      date: 22,
      countries: ['all'],
      type: 'community',
      status: 'upcoming'
    },
    {
      id: '8',
      title: 'Lançamento de Nova Coleção',
      description: 'Nova coleção de móveis e roupas disponível no catálogo.',
      date: 25,
      countries: ['all'],
      type: 'official',
      status: 'upcoming'
    },
    {
      id: '9',
      title: 'Quiz Night Especial',
      description: 'Teste seus conhecimentos sobre o Habbo em nosso quiz especial!',
      date: 28,
      countries: ['br', 'it', 'es'],
      type: 'community',
      status: 'upcoming'
    }
  ], []);

  // Filtrar eventos baseado no país selecionado
  const filteredEvents = useMemo(() => {
    if (selectedCountryFilter === 'all') {
      return habboEvents;
    }
    return habboEvents.filter(event => {
      if (event.countries.includes('all')) {
        return true;
      }
      // Normalizar códigos de país (br e com.br são equivalentes)
      const normalizedFilter = selectedCountryFilter === 'br' ? ['br', 'com.br'] : [selectedCountryFilter];
      return event.countries.some(country => 
        normalizedFilter.includes(country) || 
        (country === 'br' && normalizedFilter.includes('com.br')) ||
        (country === 'com.br' && normalizedFilter.includes('br'))
      );
    });
  }, [habboEvents, selectedCountryFilter]);

  // Criar mapa de eventos por dia
  const eventsByDay = useMemo(() => {
    const map = new Map<number, HabboEvent[]>();
    filteredEvents.forEach(event => {
      const existing = map.get(event.date) || [];
      map.set(event.date, [...existing, event]);
    });
    return map;
  }, [filteredEvents]);

  // Obter primeiro dia da semana de novembro 2025
  // No JavaScript, getDay() retorna: 0=Domingo, 1=Segunda, ..., 6=Sábado
  const firstDayOfMonth = useMemo(() => {
    // Novembro 2025 começa em um sábado
    // Se o calendário começa com domingo (índice 0), então sábado = 6
    const date = new Date(2025, 10, 1); // Mês 10 = Novembro (0-indexed)
    return date.getDay(); // Retorna 6 para sábado
  }, []);

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
      setFormError(t('pages.journal.errors.loginRequired'));
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
      const message = t('pages.journal.rateLimit', { minutes });
      setRateLimitMessage(message);
      setFormError(message);
      return;
    }

    const requiredFields: Array<keyof JournalFormState> = ['title', 'summary', 'content', 'imageUrl'];
    const missingField = requiredFields.find((field) => !formData[field].trim());

    if (missingField) {
      setFormError(t('pages.journal.errors.missingFields'));
      return;
    }

    const authorName = (habboAccount?.habbo_name || formData.authorName || '').trim();

    if (!authorName) {
      setFormError(t('pages.journal.errors.noAuthor'));
      return;
    }

    if (hasMaliciousContent(formData.title) || hasMaliciousContent(formData.summary) || hasMaliciousContent(formData.content) || hasMaliciousContent(formData.contact)) {
      setFormError(t('pages.journal.errors.maliciousContent'));
      return;
    }

    if (!validateImageUrl(formData.imageUrl)) {
      setFormError(t('pages.journal.errors.invalidImage'));
      return;
    }

    const sanitizedTitle = sanitizeText(formData.title, MAX_TITLE_LENGTH);
    const sanitizedSummary = sanitizeText(formData.summary, MAX_SUMMARY_LENGTH);
    const sanitizedContent = sanitizeText(formData.content, MAX_CONTENT_LENGTH);
    const sanitizedContact = sanitizeText(formData.contact, MAX_CONTACT_LENGTH);
    const sanitizedFansite = sanitizeText(formData.fansite, 80);

    if (!sanitizedTitle || !sanitizedSummary || !sanitizedContent) {
      setFormError(t('pages.journal.errors.emptyAfterSanitize'));
      return;
    }

    const normalizedHotel = normalizeHotelDomain(habboAccount?.hotel || formData.hotel);

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

      setSubmissionMessage(t('pages.journal.success.message'));
      setShowSubmissionModal(true);
      setIsSubmissionFormOpen(false);
      resetForm();
      toast({
        title: t('pages.journal.success.toastTitle'),
        description: t('pages.journal.success.toastDescription')
      });
    } catch (error) {
      console.error('Erro ao armazenar submissão:', error);
      setFormError(t('pages.journal.errors.submissionFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1 relative">
          <main 
            className="flex-1 min-h-screen p-4 sm:p-8 relative" 
            style={{ 
              backgroundImage: 'url(/assets/site/bghabbohub.png)',
              backgroundRepeat: 'repeat'
            }}
          >
            <div className="max-w-7xl mx-auto relative" style={{ overflow: 'visible', padding: '20px' }}>
              {/* Overlay para modal de artigo - apenas sobre o conteúdo do jornal */}
              {selectedArticle && (
                <div 
                  className="absolute z-[100] bg-black/80 transition-opacity"
                  style={{
                    inset: '-2rem'
                  }}
                  onClick={() => setSelectedArticle(null)}
                />
              )}
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
                    <h1
                      className="text-4xl sm:text-5xl lg:text-6xl text-black mb-2 font-bold"
                      style={{ fontFamily: 'Press Start 2P, cursive', textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)' }}
                    >
                      {t('pages.journal.header.title').toUpperCase()}
                    </h1>
                  </div>
                  <AccentFixedText className="text-lg sm:text-xl text-gray-700">
                    {t('pages.journal.header.subtitle')}
                  </AccentFixedText>
                </header>

                {/* Navigation Menu */}
                <nav className="mb-8 flex flex-wrap justify-center gap-6 text-sm sm:text-base border-b border-gray-500 pb-4 relative" style={{ zIndex: 5 }}>
                  <button onClick={() => scrollToSection('destaques')} className="text-black hover:text-blue-700 hover:underline transition-all duration-75">
                    {t('pages.journal.nav.highlights')}
                  </button>
                  <button onClick={() => scrollToSection('eventos')} className="text-black hover:text-blue-700 hover:underline transition-all duration-75">
                    {t('pages.journal.nav.events')}
                  </button>
                  <button onClick={() => scrollToSection('entrevistas')} className="text-black hover:text-blue-700 hover:underline transition-all duration-75">
                    {t('pages.journal.nav.interviews')}
                  </button>
                  <button onClick={() => scrollToSection('opiniao')} className="text-black hover:text-blue-700 hover:underline transition-all duration-75">
                    {t('pages.journal.nav.opinion')}
                  </button>
                  <button onClick={() => scrollToSection('fansites')} className="text-black hover:text-blue-700 hover:underline transition-all duration-75">
                    {t('pages.journal.nav.fansites')}
                  </button>
                  <button onClick={() => scrollToSection('classificados')} className="text-black hover:text-blue-700 hover:underline transition-all duration-75">
                    {t('pages.journal.nav.classifieds')}
                  </button>
                  <button onClick={() => scrollToSection('enviar-coluna')} className="text-black hover:text-blue-700 hover:underline transition-all duration-75">
                    {t('pages.journal.nav.submit')}
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
                        <section 
                          id="destaques" 
                          className="mb-8 cursor-pointer"
                          onClick={() => setSelectedArticle(newsArticles[0])}
                        >
                          <h2
                            className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold"
                            style={{
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}
                          >
                            {t('pages.journal.sections.highlights.title', { title: newsArticles[0].title })}
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
                          <div className="mb-3">
                            <Badge className="bg-blue-500 text-white">
                              {categoryLabelMap[newsArticles[0].category]}
                            </Badge>
                          </div>
                          <AccentFixedText className="text-sm sm:text-base mb-4 leading-relaxed">
                            {newsArticles[0].content}
                          </AccentFixedText>
                          <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Volter' }}>
                            {t('pages.journal.metadata.by', {
                              author: newsArticles[0].author,
                              date: new Date(newsArticles[0].date).toLocaleDateString(dateLocale)
                            })}
                          </p>
                        </section>

                        <div className="border-t border-dashed border-gray-500 my-8"></div>

                        {/* Analysis Section */}
                        <section 
                          id="analise-campanhas" 
                          className="mb-8 cursor-pointer"
                          onClick={() => setSelectedArticle(newsArticles[1])}
                        >
                          <h2
                            className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold"
                            style={{
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}
                          >
                            {t('pages.journal.sections.analysis.title', { title: newsArticles[1].title })}
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
                          <div className="mb-3">
                            <Badge className="bg-purple-500 text-white">
                              {categoryLabelMap[newsArticles[1].category]}
                            </Badge>
                          </div>
                          <AccentFixedText className="text-sm sm:text-base mb-4 leading-relaxed">
                            {newsArticles[1].content}
                          </AccentFixedText>
                          <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Volter' }}>
                            {t('pages.journal.metadata.by', {
                              author: newsArticles[1].author,
                              date: new Date(newsArticles[1].date).toLocaleDateString(dateLocale)
                            })}
                          </p>
                        </section>
                      </div>

                      {/* Sidebar (1/3 width) */}
                      <aside className="md:col-span-1 space-y-4">
                        {/* Classifieds */}
                        <div id="classificados" className="border border-black p-4">
                          <h3
                            className="text-xl sm:text-2xl mb-3 font-bold"
                            style={{
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}
                          >
                            {t('pages.journal.classifieds.title')}
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
                                    {ad.price && (
                                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Volter' }}>
                                        {t('pages.journal.classifieds.price', { price: ad.price })}
                                      </p>
                                    )}
                                  </div>
                                </DialogTrigger>
                                <DialogContent
                                  className="max-w-md"
                                  aria-describedby={`classified-dialog-${ad.id}`}
                                >
                                  <DialogHeader>
                                    <DialogTitle>{ad.title}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4" id={`classified-dialog-${ad.id}`}>
                                    <img 
                                      src={ad.image} 
                                      alt={ad.title}
                                      className="w-full h-32 object-cover"
                                      style={{ imageRendering: 'pixelated' }}
                                    />
                                    <p className="text-sm" style={{ fontFamily: 'Volter' }}>{ad.content}</p>
                                    <div className="flex items-center justify-between">
                                      <span style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                        {t('pages.journal.classifieds.dialogContact', { contact: ad.contact })}
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
                          <h3
                            className="text-lg mb-2 font-bold"
                            style={{
                              fontFamily: 'Press Start 2P, cursive',
                              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                            }}
                          >
                            {t('pages.journal.submitBox.title')}
                          </h3>
                          <p className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Volter' }}>
                            {t('pages.journal.submitBox.description')}
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
                            {t('pages.journal.submitBox.button')}
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
                            <h2
                              className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold"
                              style={{
                                fontFamily: 'Press Start 2P, cursive',
                                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {t('pages.journal.sections.events.title')}
                            </h2>
                            
                            {/* Header Image */}
                            <div className="relative w-full h-32 sm:h-48 bg-gray-300 mb-6 rounded-lg overflow-hidden border border-black">
                              <img 
                                src="/assets/journal/web_promo_01.png" 
                                alt="Eventos"
                                className="w-full h-full object-cover"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            </div>

                            {/* Evento Principal */}
                            <div className="border border-black p-4 mb-6 rounded-lg">
                              <div className="flex items-center gap-4 mb-3">
                                <img
                                  src="/assets/journal/JOR.gif"
                                  alt={t('pages.journal.sections.events.featuredTitle')}
                                  className="w-16 h-16 object-cover"
                                  style={{ imageRendering: 'pixelated' }}
                                />
                                <div>
                                  <h3 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    {t('pages.journal.sections.events.featuredTitle')}
                                  </h3>
                                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Volter' }}>
                                    {t('pages.journal.sections.events.featuredDate')}
                                  </p>
                                </div>
                              </div>
                              <AccentFixedText className="text-sm sm:text-base mb-3">
                                {t('pages.journal.sections.events.featuredDescription')}
                              </AccentFixedText>
                              <div className="flex gap-2">
                                <Badge className="bg-red-500 text-white">
                                  {t('pages.journal.sections.events.badgeOfficial')}
                                </Badge>
                                <Badge className="bg-yellow-500 text-black">
                                  {t('pages.journal.sections.events.badgeRewards')}
                                </Badge>
                              </div>
                            </div>

                            {/* Outros Eventos */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="border border-gray-300 p-3 rounded-md">
                                <div className="flex items-center gap-3 mb-2">
                                  <img
                                    src="/assets/journal/article_stickies2.png"
                                    alt={t('pages.journal.sections.events.decorTitle')}
                                    className="w-12 h-12 object-cover"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                  <div>
                                    <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      {t('pages.journal.sections.events.decorTitle')}
                                    </h4>
                                    <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                      {t('pages.journal.sections.events.decorDate')}
                                    </p>
                                  </div>
                                </div>
                                <AccentFixedText className="text-sm sm:text-base">
                                  {t('pages.journal.sections.events.decorDescription')}
                                </AccentFixedText>
                              </div>

                              <div className="border border-gray-300 p-3 rounded-md">
                                <div className="flex items-center gap-3 mb-2">
                                  <img
                                    src="/assets/journal/lpromo_gen15_09.png"
                                    alt={t('pages.journal.sections.events.radioTitle')}
                                    className="w-12 h-12 object-cover"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                  <div>
                                    <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      {t('pages.journal.sections.events.radioTitle')}
                                    </h4>
                                    <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                      {t('pages.journal.sections.events.radioDate')}
                                    </p>
                                  </div>
                                </div>
                                <AccentFixedText className="text-sm sm:text-base">
                                  {t('pages.journal.sections.events.radioDescription')}
                                </AccentFixedText>
                              </div>
                            </div>
                          </section>

                          <div className="border-t border-dashed border-gray-500 my-8"></div>

                          {/* Calendário de Eventos */}
                          <section className="mb-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-gray-500 pb-2">
                              <h2
                                className="text-2xl sm:text-3xl font-bold"
                                style={{
                                  fontFamily: 'Press Start 2P, cursive',
                                  textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                                }}
                              >
                                {t('pages.journal.sections.events.calendarTitle')}
                              </h2>
                              {/* Filtro de País com Dropdown */}
                              <div className="relative flex items-center gap-2">
                                <span className="text-xs text-gray-600 hidden sm:inline" style={{ fontFamily: 'Volter' }}>
                                  Filtrar:
                                </span>
                                <div className="relative">
                                  <button
                                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                    className="p-1 border border-black rounded-lg bg-gray-200 transition-all hover:bg-gray-300 flex items-center justify-center"
                                    title={selectedHotel.name}
                                  >
                                    <img 
                                      src={selectedHotel.flag} 
                                      alt={selectedHotel.name}
                                      className="object-contain rounded-sm"
                                      style={{ imageRendering: 'pixelated' }}
                                    />
                                  </button>
                                  {/* Dropdown */}
                                  {isCountryDropdownOpen && (
                                    <>
                                      {/* Overlay para fechar ao clicar fora */}
                                      <div 
                                        className="fixed inset-0 z-[100]" 
                                        onClick={() => setIsCountryDropdownOpen(false)}
                                      />
                                      {/* Menu dropdown */}
                                      <div 
                                        className="absolute right-0 top-full mt-1 bg-white border-2 border-black shadow-lg z-[101] rounded"
                                        style={{ 
                                          boxShadow: '4px 4px 0px 0px #1f2937',
                                          minWidth: '200px'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {hotelOptions.map((hotel) => (
                                          <button
                                            key={hotel.code}
                                            onClick={() => {
                                              setSelectedCountryFilter(hotel.code);
                                              setIsCountryDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors ${
                                              selectedCountryFilter === hotel.code ? 'bg-gray-200' : ''
                                            } first:rounded-t last:rounded-b`}
                                            style={{ fontFamily: 'Volter' }}
                                          >
                                            <img 
                                              src={hotel.flag} 
                                              alt={hotel.name}
                                              className="object-contain rounded-sm"
                                              style={{ imageRendering: 'pixelated' }}
                                            />
                                            <span className="text-sm text-black">{hotel.name}</span>
                                            {selectedCountryFilter === hotel.code && (
                                              <span className="ml-auto text-xs text-gray-600">✓</span>
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="border border-black p-4 rounded-lg">
                              <div className="grid grid-cols-7 gap-2 mb-4">
                                {calendarDays.map((day) => (
                                  <div key={day} style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    {day}
                                  </div>
                                ))}
                              </div>
                              <div className="grid grid-cols-7 gap-2">
                                {/* Espaços vazios antes do primeiro dia */}
                                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                                  <div key={`empty-${i}`}></div>
                                ))}
                                {/* Dias do mês */}
                                {Array.from({ length: 30 }, (_, i) => {
                                  const day = i + 1;
                                  const dayEvents = eventsByDay.get(day) || [];
                                  const hasEvents = dayEvents.length > 0;
                                  
                                  return (
                                    <div
                                      key={day}
                                      className={`relative ${hasEvents ? 'cursor-pointer group' : ''}`}
                                      style={{ fontFamily: 'Volter' }}
                                    >
                                      {day}
                                      {hasEvents && (
                                        <>
                                          <div className="text-xs text-red-600">🎉</div>
                                          {/* Tooltip no hover */}
                                          <div className="absolute z-50 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white border-2 border-black p-3 shadow-lg"
                                            style={{ 
                                              boxShadow: '4px 4px 0px 0px #1f2937',
                                              fontFamily: 'Volter',
                                              pointerEvents: 'none'
                                            }}>
                                            <div className="space-y-2">
                                              {dayEvents.map((event) => (
                                                <div key={event.id} className="border-b border-gray-300 pb-2 last:border-b-0 last:pb-0">
                                                  <h4 className="font-bold text-sm text-black mb-1">
                                                    {event.title}
                                                  </h4>
                                                  <p className="text-xs text-gray-700 mb-1">
                                                    {event.description}
                                                  </p>
                                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                                      event.type === 'official' 
                                                        ? 'bg-red-500 text-white' 
                                                        : event.type === 'seasonal'
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-purple-500 text-white'
                                                    }`}>
                                                      {event.type === 'official' ? 'Oficial' : event.type === 'seasonal' ? 'Sazonal' : 'Comunidade'}
                                                    </span>
                                                    {event.countries.length === 1 && event.countries[0] !== 'all' && (
                                                      <img 
                                                        src={`/flags/flag${event.countries[0] === 'br' ? 'brazil' : event.countries[0] === 'com' ? 'com' : event.countries[0] === 'it' ? 'italy' : event.countries[0] === 'es' ? 'spain' : event.countries[0] === 'fr' ? 'france' : event.countries[0] === 'de' ? 'deus' : event.countries[0] === 'nl' ? 'netl' : 'com'}.png`}
                                                        alt={event.countries[0]}
                                                        className="object-contain rounded-sm"
                                                        style={{ imageRendering: 'pixelated' }}
                                                      />
                                                    )}
                                                    {event.countries.includes('all') && (
                                                      <img 
                                                        src="/flags/flagcom.png"
                                                        alt="Todos"
                                                        className="object-contain rounded-sm"
                                                        style={{ imageRendering: 'pixelated' }}
                                                      />
                                                    )}
                                                    {event.countries.length > 1 && !event.countries.includes('all') && (
                                                      <div className="flex gap-1">
                                                        {event.countries.slice(0, 3).map((country) => (
                                                          <img 
                                                            key={country}
                                                            src={`/flags/flag${country === 'br' ? 'brazil' : country === 'com' ? 'com' : country === 'it' ? 'italy' : country === 'es' ? 'spain' : country === 'fr' ? 'france' : country === 'de' ? 'deus' : country === 'nl' ? 'netl' : 'com'}.png`}
                                                            alt={country}
                                                            className="object-contain rounded-sm"
                                                            style={{ imageRendering: 'pixelated' }}
                                                          />
                                                        ))}
                                                        {event.countries.length > 3 && (
                                                          <span className="text-xs text-gray-500">+{event.countries.length - 3}</span>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                            {/* Seta do tooltip */}
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-gray-600 mt-2" style={{ fontFamily: 'Volter' }}>
                                {t('pages.journal.sections.events.calendarNote')}
                              </p>
                            </div>
                          </section>
                        </div>

                        {/* Sidebar (1/3 width) */}
                        <aside className="md:col-span-1 space-y-4">
                          {/* Próximos Eventos */}
                          <div className="border border-black p-4 rounded-lg">
                            <h3
                              className="text-xl sm:text-2xl mb-3 font-bold"
                              style={{
                                fontFamily: 'Press Start 2P, cursive',
                                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {t('pages.journal.sections.events.upcomingTitle')}
                            </h3>
                            <div className="space-y-3">
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.events.pixelArtTitle')}
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  {t('pages.journal.sections.events.pixelArtDate')}
                                </p>
                              </div>
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.events.vipsTitle')}
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  {t('pages.journal.sections.events.vipsDate')}
                                </p>
                              </div>
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.events.tournamentTitle')}
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  {t('pages.journal.sections.events.tournamentDate')}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Eventos Especiais */}
                          <div className="border border-black p-4 rounded-lg">
                            <h3
                              className="text-lg mb-2 font-bold"
                              style={{
                                fontFamily: 'Press Start 2P, cursive',
                                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {t('pages.journal.sections.events.specialTitle')}
                            </h3>
                            <div className="space-y-2">
                              <div className="p-2 border border-gray-300">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.events.anniversaryTitle')}
                                </h4>
                                <AccentFixedText className="text-sm sm:text-base">
                                  {t('pages.journal.sections.events.anniversaryDescription')}
                                </AccentFixedText>
                              </div>
                              <div className="p-2 border border-gray-300">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.events.summerTitle')}
                                </h4>
                                <AccentFixedText className="text-sm sm:text-base">
                                  {t('pages.journal.sections.events.summerDescription')}
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
                            <h2
                              className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold"
                              style={{
                                fontFamily: 'Press Start 2P, cursive',
                                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {t('pages.journal.sections.interviews.title')}
                            </h2>
                            
                            {/* Header Image */}
                            <div className="relative w-full h-32 sm:h-48 bg-gray-300 mb-6 rounded-lg overflow-hidden border border-black">
                              <img 
                                src="/assets/journal/Article_Sabatina_530x300.png" 
                                alt="Entrevistas"
                                className="w-full h-full object-cover"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            </div>

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
                                    {t('pages.journal.sections.interviews.mainTitle')}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Volter' }}>
                                    {t('pages.journal.sections.interviews.conducted')}
                                  </p>
                                  <div className="flex gap-2 mb-3">
                                    <Badge className="bg-purple-500 text-white">{t('pages.journal.badges.staff')}</Badge>
                                    <Badge className="bg-blue-500 text-white">{t('pages.journal.badges.dev')}</Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="p-4 border border-gray-300">
                                  <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    {t('pages.journal.sections.interviews.question1')}
                                  </h4>
                                  <AccentFixedText className="text-sm sm:text-base">
                                    {t('pages.journal.sections.interviews.answer1')}
                                  </AccentFixedText>
                                </div>

                                <div className="p-4 border border-gray-300">
                                  <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    {t('pages.journal.sections.interviews.question2')}
                                  </h4>
                                  <AccentFixedText className="text-sm sm:text-base">
                                    {t('pages.journal.sections.interviews.answer2')}
                                  </AccentFixedText>
                                </div>

                                <div className="p-4 border border-gray-300">
                                  <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    {t('pages.journal.sections.interviews.question3')}
                                  </h4>
                                  <AccentFixedText className="text-sm sm:text-base">
                                    {t('pages.journal.sections.interviews.answer3')}
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
                            <h3
                              className="text-xl sm:text-2xl mb-3 font-bold"
                              style={{
                                fontFamily: 'Press Start 2P, cursive',
                                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {t('pages.journal.sections.interviews.upcomingTitle')}
                            </h3>
                            <div className="space-y-3">
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.interviews.upcomingDjTitle')}
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  {t('pages.journal.sections.interviews.upcomingDjDescription')}
                                </p>
                              </div>
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.interviews.upcomingTraderTitle')}
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  {t('pages.journal.sections.interviews.upcomingTraderDescription')}
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
                            <h2
                              className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold"
                              style={{
                                fontFamily: 'Press Start 2P, cursive',
                                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {t('pages.journal.sections.opinion.title')}
                            </h2>
                            
                            {/* Header Image */}
                            <div className="relative w-full h-32 sm:h-48 bg-gray-300 mb-6 rounded-lg overflow-hidden border border-black">
                              <img 
                                src="/assets/journal/article_habboreport3.png" 
                                alt="Opinião"
                                className="w-full h-full object-cover"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            </div>

                            <div className="border-2 border-black p-6">
                              <div className="flex items-start gap-4 mb-4">
                                <img
                                  src="https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-1.ch-255-84.lg-275-1408.sh-295-64%2Cs-0.g-1.d-2.h-2.a-0%2C3565e22f0ecd66108595e64551d13483.png"
                                  alt="TraderExpert"
                                  className="w-16 h-16 object-cover"
                                  style={{ imageRendering: 'pixelated' }}
                                />
                                <div>
                                  <h3 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    {t('pages.journal.sections.opinion.author')}
                                  </h3>
                                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Volter' }}>
                                    {t('pages.journal.sections.opinion.published')}
                                  </p>
                                  <div className="flex gap-2 mt-2">
                                    <Badge className="bg-orange-500 text-white">{t('pages.journal.badges.analysis')}</Badge>
                                    <Badge className="bg-blue-500 text-white">{t('pages.journal.badges.trading')}</Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <AccentFixedText className="text-sm sm:text-base leading-relaxed">
                                  {t('pages.journal.sections.opinion.paragraph1')}
                                </AccentFixedText>

                                <AccentFixedText className="text-sm sm:text-base leading-relaxed">
                                  {t('pages.journal.sections.opinion.paragraph2')}
                                </AccentFixedText>

                                <div className="p-4 border border-gray-300">
                                  <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                    {t('pages.journal.sections.opinion.recommendationTitle')}
                                  </h4>
                                  <AccentFixedText className="text-sm sm:text-base">
                                    {t('pages.journal.sections.opinion.recommendationContent')}
                                  </AccentFixedText>
                                </div>
                              </div>
                            </div>
                          </section>

                          <div className="border-t border-dashed border-gray-500 my-8"></div>

                          {/* Outros Artigos */}
                          <section className="mb-8">
                            <h2
                              className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold"
                              style={{
                                fontFamily: 'Press Start 2P, cursive',
                                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {t('pages.journal.sections.otherOpinions.title')}
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="border border-gray-300 p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <img
                                    src="https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-10.ch-3538-67.lg-275-82.sh-295-92.fa-1206-90%2Cs-0.g-1.d-2.h-2.a-0%2C41cb5bfd4dcecf4bf5de00b7ea872714.png"
                                    alt={t('pages.journal.sections.otherOpinions.pixelTitle')}
                                    className="w-12 h-12 object-cover"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                  <div>
                                    <h3 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      {t('pages.journal.sections.otherOpinions.pixelTitle')}
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                      {t('pages.journal.sections.otherOpinions.pixelSubtitle')}
                                    </p>
                                  </div>
                                </div>
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.otherOpinions.pixelArticle')}
                                </h4>
                                <p className="text-sm sm:text-base mb-2" style={{ fontFamily: 'Volter' }}>
                                  {t('pages.journal.sections.otherOpinions.pixelSnippet')}
                                </p>
                                <Button size="sm" className="text-xs bg-purple-500 hover:bg-purple-600 text-white">
                                  {t('pages.journal.sections.otherOpinions.pixelButton')}
                                </Button>
                              </div>

                              <div className="border border-gray-300 p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <img
                                    src="https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-1.ch-255-84.lg-275-1408.sh-295-64%2Cs-0.g-1.d-2.h-2.a-0%2C3565e22f0ecd66108595e64551d13483.png"
                                    alt={t('pages.journal.sections.otherOpinions.homeTitle')}
                                    className="w-12 h-12 object-cover"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                  <div>
                                    <h3 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      {t('pages.journal.sections.otherOpinions.homeTitle')}
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                      {t('pages.journal.sections.otherOpinions.homeSubtitle')}
                                    </p>
                                  </div>
                                </div>
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.otherOpinions.homeArticle')}
                                </h4>
                                <p className="text-sm sm:text-base mb-2" style={{ fontFamily: 'Volter' }}>
                                  {t('pages.journal.sections.otherOpinions.homeSnippet')}
                                </p>
                                <Button size="sm" className="text-xs bg-green-500 hover:bg-green-600 text-white">
                                  {t('pages.journal.sections.otherOpinions.homeButton')}
                                </Button>
                              </div>
                            </div>
                          </section>
                        </div>

                        {/* Sidebar (1/3 width) */}
                        <aside className="md:col-span-1 space-y-4">
                          {/* Colunas de Leitores */}
                          <div className="border border-black p-4">
                            <h3
                              className="text-xl sm:text-2xl mb-3 font-bold"
                              style={{
                                fontFamily: 'Press Start 2P, cursive',
                                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {t('pages.journal.sections.readersColumns.title')}
                            </h3>
                            <div className="space-y-3">
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.readersColumns.debateTitle')}
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  {t('pages.journal.sections.readersColumns.debateDescription')}
                                </p>
                              </div>
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.readersColumns.lettersTitle')}
                                </h4>
                                <AccentFixedText className="text-sm sm:text-base text-gray-600">
                                  {t('pages.journal.sections.readersColumns.lettersDescription')}
                                </AccentFixedText>
                              </div>
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.readersColumns.pollTitle')}
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  {t('pages.journal.sections.readersColumns.pollDescription')}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Envie Sua Opinião */}
                          <div className="border border-black p-4">
                            <h3
                              className="text-lg mb-2 font-bold"
                              style={{
                                fontFamily: 'Press Start 2P, cursive',
                                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {t('pages.journal.sections.sendOpinion.title')}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-700 mb-2" style={{ fontFamily: 'Volter' }}>
                              {t('pages.journal.sections.sendOpinion.description')}
                            </p>
                            <Button
                              size="sm"
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs"
                            >
                              {t('pages.journal.sections.sendOpinion.button')}
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
                            <h2
                              className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold"
                              style={{
                                fontFamily: 'Press Start 2P, cursive',
                                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {t('pages.journal.sections.fansites.title')}
                            </h2>
                            
                            {/* Header Image */}
                            <div className="relative w-full h-32 sm:h-48 bg-gray-300 mb-6 rounded-lg overflow-hidden border border-black">
                              <img 
                                src="/assets/journal/biblioteca2.png" 
                                alt="Fansites"
                                className="w-full h-full object-cover"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            </div>

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
                                    {t('pages.journal.sections.fansites.mainTitle')}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Volter' }}>
                                    {t('pages.journal.sections.fansites.launchInfo')}
                                  </p>
                                  <div className="flex gap-2 mb-3">
                                    <Badge className="bg-green-500 text-white">{t('pages.journal.sections.fansites.badgeOfficial')}</Badge>
                                    <Badge className="bg-blue-500 text-white">{t('pages.journal.sections.fansites.badgeTools')}</Badge>
                                    <Badge className="bg-purple-500 text-white">{t('pages.journal.sections.fansites.badgeCommunity')}</Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <AccentFixedText className="text-sm sm:text-base leading-relaxed">
                                  {t('pages.journal.sections.fansites.paragraph')}
                                </AccentFixedText>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="p-3 border border-gray-300">
                                    <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      {t('pages.journal.sections.fansites.toolsTitle')}
                                    </h4>
                                    <ul className="text-xs space-y-1" style={{ fontFamily: 'Volter' }}>
                                      <li>{t('pages.journal.sections.fansites.toolsItem1')}</li>
                                      <li>{t('pages.journal.sections.fansites.toolsItem2')}</li>
                                      <li>{t('pages.journal.sections.fansites.toolsItem3')}</li>
                                      <li>{t('pages.journal.sections.fansites.toolsItem4')}</li>
                                    </ul>
                                  </div>

                                  <div className="p-3 border border-gray-300">
                                    <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                      {t('pages.journal.sections.fansites.statsTitle')}
                                    </h4>
                                    <ul className="text-xs space-y-1" style={{ fontFamily: 'Volter' }}>
                                      <li>{t('pages.journal.sections.fansites.statsItem1')}</li>
                                      <li>{t('pages.journal.sections.fansites.statsItem2')}</li>
                                      <li>{t('pages.journal.sections.fansites.statsItem3')}</li>
                                      <li>{t('pages.journal.sections.fansites.statsItem4')}</li>
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
                            <h3
                              className="text-xl sm:text-2xl mb-3 font-bold"
                              style={{
                                fontFamily: 'Press Start 2P, cursive',
                                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {t('pages.journal.sections.communityNews.title')}
                            </h3>
                            <div className="space-y-3">
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.communityNews.newSiteTitle')}
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  {t('pages.journal.sections.communityNews.newSiteDescription')}
                                </p>
                              </div>
                              <div className="border border-gray-300 p-2">
                                <h4 style={{ fontFamily: 'Volter', fontWeight: 'bold' }}>
                                  {t('pages.journal.sections.communityNews.partnershipTitle')}
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Volter' }}>
                                  {t('pages.journal.sections.communityNews.partnershipDescription')}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Seja Nosso Parceiro */}
                          <div className="border border-black p-4">
                            <h3
                              className="text-lg mb-2 font-bold"
                              style={{
                                fontFamily: 'Press Start 2P, cursive',
                                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {t('pages.journal.sections.partner.title')}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-700 mb-2" style={{ fontFamily: 'Volter' }}>
                              {t('pages.journal.sections.partner.description')}
                            </p>
                            <Button
                              size="sm"
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              {t('pages.journal.sections.partner.button')}
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
                        {t('pages.journal.pagination.previous')}
                      </Button>
                    )}
                    
                    <span className="text-sm font-bold px-4 py-2 bg-gray-100 border-2 border-black" style={{ 
                      fontFamily: 'VT323, monospace',
                      boxShadow: '2px 2px 0px 0px #1f2937'
                    }}>
                      {t('pages.journal.pagination.status', { current: currentPage, total: totalPages })}
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
                        {t('pages.journal.pagination.next')}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <footer className="text-center mt-6 pt-6 border-t-2 border-black text-gray-700 text-sm relative" style={{ fontFamily: 'Volter', zIndex: 5 }}>
                  <p>{t('pages.journal.footer.text1')}</p>
                  <p className="mt-2">{t('pages.journal.footer.text2')}</p>
                  {isPrimaryAdmin && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="text-black border-black hover:bg-black hover:text-white"
                      onClick={() => window.open('/admin-panel', '_blank')}
                      style={{ fontFamily: 'Volter' }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                        {t('pages.journal.footer.adminButton')}
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
        <DialogContent
          className="max-w-5xl w-full p-0 border-4 border-black bg-gray-100 overflow-hidden"
          aria-describedby="journal-submission-form-description"
        >
          <div
            className="bg-gray-200 border-b-2 border-black px-6 py-5"
            id="journal-submission-form-description"
          >
            <DialogHeader className="p-0">
              <DialogTitle
                className="text-2xl sm:text-3xl font-bold"
                style={{ fontFamily: 'Press Start 2P, cursive', textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)' }}
              >
                {t('pages.journal.modal.title')}
              </DialogTitle>
            </DialogHeader>
            <p className="mt-2 text-sm sm:text-base text-gray-700" style={{ fontFamily: 'Volter' }}>
              {t('pages.journal.modal.description')}
            </p>
          </div>
          <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
            <aside className="hidden md:flex flex-col gap-4 border-r-2 border-black bg-gray-50 px-5 py-6" style={{ minHeight: '100%' }}>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 border-2 border-black bg-white flex items-center justify-center overflow-hidden" style={{ boxShadow: '4px 4px 0px 0px #1f2937' }}>
                  <img
                    src={authorAvatarPreview}
                    alt={habboAccount?.habbo_name || t('pages.journal.modal.authorAvatarAlt')}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div className="mt-4">
                  <p className="text-xs uppercase text-gray-600 tracking-wide" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                    {t('pages.journal.modal.authorLinked')}
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
                    {habboAccount ? habboAccount.habbo_name : t('pages.journal.modal.goToLogin')}
                  </button>
                  <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Volter' }}>
                    {t('pages.journal.modal.loginRestriction')}
                  </p>
                </div>
              </div>

              <div className="border-2 border-black bg-white p-4 space-y-3" style={{ boxShadow: '3px 3px 0px 0px #1f2937' }}>
                <h3 className="text-sm font-bold text-black" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                  {t('pages.journal.modal.tipsTitle')}
                </h3>
                <ul className="space-y-2 text-xs text-gray-700" style={{ fontFamily: 'Volter' }}>
                  <li>{t('pages.journal.modal.tip1')}</li>
                  <li>{t('pages.journal.modal.tip2')}</li>
                  <li>{t('pages.journal.modal.tip3')}</li>
                  <li>{t('pages.journal.modal.tip4')}</li>
                </ul>
              </div>

              <div className="border-2 border-black bg-white p-4 space-y-2" style={{ boxShadow: '3px 3px 0px 0px #1f2937' }}>
                <h4 className="text-sm font-bold text-black" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                  {t('pages.journal.modal.imagePreviewTitle')}
                </h4>
                <div className="w-full aspect-video bg-gray-200 border border-dashed border-gray-400 flex items-center justify-center overflow-hidden">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt={t('pages.journal.modal.imagePreviewAlt')} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500" style={{ fontFamily: 'Volter' }}>{t('pages.journal.modal.imagePreviewPlaceholder')}</span>
                  )}
                </div>
              </div>

              {!isLoggedIn && (
                <Button
                  className="border-2 border-black bg-blue-600 hover:bg-blue-700 text-white rounded-none"
                  style={{ boxShadow: '3px 3px 0px 0px #1f2937', fontFamily: 'VT323, monospace' }}
                  onClick={() => window.open('/login', '_self')}
                >
                  {t('pages.journal.modal.loginButton')}
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
                  {t('pages.journal.loginPrompt')}
                </div>
              )}
              <div className="md:hidden border-2 border-black bg-white p-4 mb-6" style={{ boxShadow: '3px 3px 0px 0px #1f2937' }}>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-black bg-gray-200 overflow-hidden">
                    <img
                      src={authorAvatarPreview}
                      alt={habboAccount?.habbo_name || t('pages.journal.modal.authorAvatarAlt')}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-600 tracking-wide" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      {t('pages.journal.modal.mobileAuthorTitle')}
                    </p>
                    <p className="text-sm text-black" style={{ fontFamily: 'Volter' }}>
                      {habboAccount ? habboAccount.habbo_name : t('pages.journal.modal.mobileGoToLogin')}
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
                      {habboAccount ? t('pages.journal.modal.mobileViewProfile') : t('pages.journal.modal.mobileGoToLogin')}
                    </button>
                    <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Volter' }}>
                      {t('pages.journal.modal.mobileLoginRestriction')}
                    </p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmission} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="authorName" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      {t('pages.journal.form.authorLabel')}
                    </Label>
                    <Input
                      id="authorName"
                      value={formData.authorName}
                      readOnly
                      disabled={!isLoggedIn}
                      className="mt-2 border-2 border-black rounded-none bg-white"
                      style={{ fontFamily: 'Volter' }}
                      placeholder={t('pages.journal.modal.goToLogin')}
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      {t('pages.journal.form.hotelLabel')}
                    </Label>
                    <Select value={formData.hotel} onValueChange={(value) => handleFormChange('hotel', value)} disabled={!isLoggedIn}>
                      <SelectTrigger className="mt-2 border-2 border-black rounded-none bg-white" style={{ fontFamily: 'Volter' }}>
                        <SelectValue placeholder={t('pages.journal.form.hotelPlaceholder')} />
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
                    {t('pages.journal.form.titleLabel')}
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(event) => handleFormChange('title', event.target.value)}
                    disabled={!isLoggedIn}
                    className="mt-2 border-2 border-black rounded-none bg-white"
                    style={{ fontFamily: 'Volter' }}
                    placeholder={t('pages.journal.form.titlePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      {t('pages.journal.form.categoryLabel')}
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleFormChange('category', value as JournalCategoryKey)}
                      disabled={!isLoggedIn}
                    >
                      <SelectTrigger className="mt-2 border-2 border-black rounded-none bg-white" style={{ fontFamily: 'Volter' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black bg-white">
                        {journalCategoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="font-normal" style={{ fontFamily: 'Volter' }}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fansite" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      {t('pages.journal.form.fansiteLabel')}
                    </Label>
                    <Input
                      id="fansite"
                      value={formData.fansite}
                      onChange={(event) => handleFormChange('fansite', event.target.value)}
                      disabled={!isLoggedIn}
                      className="mt-2 border-2 border-black rounded-none bg-white"
                      style={{ fontFamily: 'Volter' }}
                      placeholder={t('pages.journal.form.fansitePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imageUrl" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                    {t('pages.journal.form.imageLabel')}
                  </Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(event) => handleFormChange('imageUrl', event.target.value)}
                    disabled={!isLoggedIn}
                    className="mt-2 border-2 border-black rounded-none bg-white"
                    style={{ fontFamily: 'Volter' }}
                    placeholder={t('pages.journal.form.imagePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="summary" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      {t('pages.journal.form.summaryLabel')}
                    </Label>
                    <Textarea
                      id="summary"
                      value={formData.summary}
                      onChange={(event) => handleFormChange('summary', event.target.value)}
                      disabled={!isLoggedIn}
                      className="mt-2 border-2 border-black rounded-none bg-white"
                      style={{ fontFamily: 'Volter' }}
                      placeholder={t('pages.journal.form.summaryPlaceholder')}
                      rows={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                      {t('pages.journal.form.contactLabel')}
                    </Label>
                    <Textarea
                      id="contact"
                      value={formData.contact}
                      onChange={(event) => handleFormChange('contact', event.target.value)}
                      disabled={!isLoggedIn}
                      className="mt-2 border-2 border-black rounded-none bg-white"
                      style={{ fontFamily: 'Volter' }}
                      placeholder={t('pages.journal.form.contactPlaceholder')}
                      rows={5}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content" className="text-xs uppercase tracking-wide text-gray-700" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                    {t('pages.journal.form.contentLabel')}
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(event) => handleFormChange('content', event.target.value)}
                    disabled={!isLoggedIn}
                    className="mt-2 border-2 border-black rounded-none bg-white"
                    style={{ fontFamily: 'Volter', minHeight: '160px' }}
                    placeholder={t('pages.journal.form.contentPlaceholder')}
                    rows={10}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Volter' }}>
                    {t('pages.journal.form.disclaimer')}
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
                      {t('pages.journal.form.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isLoggedIn || isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white border-2 border-black rounded-none disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ boxShadow: '3px 3px 0px 0px #1f2937', fontFamily: 'VT323, monospace' }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? t('pages.journal.form.submitting') : t('pages.journal.form.submit')}
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
        <DialogContent
          className="max-w-md"
          aria-describedby="journal-submission-success-description"
        >
          <DialogHeader>
            <DialogTitle>{t('pages.journal.success.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4" id="journal-submission-success-description">
            <p className="text-sm" style={{ fontFamily: 'Volter' }}>
              {submissionMessage || t('pages.journal.success.description')}
            </p>
            <Button 
              onClick={() => setShowSubmissionModal(false)}
              className="w-full"
            >
              {t('pages.journal.success.button')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Article Reading Modal */}
      {selectedArticle && (
        <>
          {/* Modal */}
          <div
            className="fixed left-[50%] top-[50%] z-[101] grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border-2 border-black bg-gray-200 p-0 shadow-lg"
            style={{ 
              boxShadow: '4px 4px 0px 0px #1f2937',
              pointerEvents: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby={`article-title-${selectedArticle.id}`}
            aria-describedby={`article-dialog-${selectedArticle.id}`}
          >
            <div className="flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-4">
              <h2
                id={`article-title-${selectedArticle.id}`}
                className="text-xl sm:text-2xl font-bold"
                style={{ fontFamily: 'Press Start 2P, cursive', textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)' }}
              >
                {selectedArticle.title}
              </h2>
            </div>
            <div className="space-y-4 px-6 pb-6" id={`article-dialog-${selectedArticle.id}`}>
              <div className="relative w-full h-48 sm:h-64 bg-gray-300 rounded-lg overflow-hidden border border-black">
                <img 
                  src={selectedArticle.image} 
                  alt={selectedArticle.title}
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
                    src={selectedArticle.authorAvatar}
                    alt={selectedArticle.author}
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
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 text-white">
                  {categoryLabelMap[selectedArticle.category]}
                </Badge>
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Volter' }}>
                  {selectedArticle.fansite}
                </span>
              </div>
              <AccentFixedText className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {selectedArticle.content}
              </AccentFixedText>
              <div className="flex items-center justify-between pt-4 border-t border-gray-300">
                <div>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Volter' }}>
                    {t('pages.journal.metadata.by', {
                      author: selectedArticle.author,
                      date: new Date(selectedArticle.date).toLocaleDateString(dateLocale)
                    })}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedArticle(null)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </>
      )}
    </SidebarProvider>
  );
};

export default Journal;