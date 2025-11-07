import React, { useEffect, useState } from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Plus, 
  Trash2, 
  RotateCcw,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import PageBanner from '@/components/ui/PageBanner';
import { useAuth } from '@/hooks/useAuth';

type ArticleOrigin = 'seed' | 'user';

interface PendingArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author: string;
  authorAvatar: string;
  fansite: string;
  fansiteLogo?: string;
  image: string;
  category: string;
  date: string;
  status: 'pending';
  submittedAt?: string;
  contact?: string;
  origin?: ArticleOrigin;
  hotel?: string;
}

interface SelectedArticle extends Omit<PendingArticle, 'status'> {
  status: 'selected';
}

interface ApprovedArticle extends Omit<PendingArticle, 'status'> {
  status: 'approved';
  approvedDate: string;
}

interface RejectedArticle extends Omit<PendingArticle, 'status'> {
  status: 'rejected';
  rejectedDate: string;
  reason: string;
}

type Article = PendingArticle | SelectedArticle | ApprovedArticle | RejectedArticle;

const SEED_PENDING_ARTICLES: PendingArticle[] = [
  {
    id: '1',
    title: 'Nova Atualização do Habbo Hotel Brasil',
    content: 'O Habbo Hotel Brasil anunciou hoje uma grande atualização que inclui novos mobis exclusivos...',
    author: 'Beebop',
    authorAvatar: 'https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-10.ch-3538-67.lg-275-82.sh-295-92.fa-1206-90%2Cs-0.g-1.d-2.h-2.a-0%2C41cb5bfd4dcecf4bf5de00b7ea872714.png',
    fansite: 'HabboHub',
    fansiteLogo: '/assets/site/bghabbohub.png',
    image: 'https://www.habbo.com.br/habbo-imaging/badge/b05114s36135s99999.gif',
    category: 'Atualização',
    date: '2024-01-15',
    status: 'pending',
    origin: 'seed'
  },
  {
    id: '2',
    title: 'Evento Especial de Inverno',
    content: 'O evento especial de inverno começou hoje no Habbo Hotel Brasil...',
    author: 'HabboHotel',
    authorAvatar: 'https://www.habbo.com.br/habbo-imaging/avatar/hd-6002.ch-3971-73-73.lg-3407-73-66.sh-300-64%2Cs-0.g-1.d-2.h-2.a-0%2C33af513aeef3cbf0985b18796b5b75f5.png',
    fansite: 'Habblindados',
    fansiteLogo: '/assets/habblindados.png',
    image: 'https://www.habbo.com.br/habbo-imaging/badge/b05114s36135s99999.gif',
    category: 'Evento',
    date: '2024-01-10',
    status: 'pending',
    origin: 'seed'
  }
];

const loadStoredSubmissions = (): PendingArticle[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedRaw = localStorage.getItem('journal_submissions');
    if (!storedRaw) return [];

    const parsed = JSON.parse(storedRaw) as PendingArticle[];

    return Array.isArray(parsed)
      ? parsed
          .filter((article) => article && article.status === 'pending')
          .map((article) => ({ ...article, origin: 'user', status: 'pending' }))
      : [];
  } catch (error) {
    console.error('Erro ao carregar submissões armazenadas:', error);
    return [];
  }
};

const AdminRestrictedView = ({ title, description }: { title: string; description: string }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <CollapsibleAppSidebar />
      <SidebarInset className="flex-1">
        <main
          className="flex-1 p-8 bg-repeat min-h-screen"
          style={{
            backgroundImage: 'url(/assets/site/bghabbohub.png)',
            backgroundRepeat: 'repeat'
          }}
        >
          <div className="max-w-3xl mx-auto mt-16">
            <div
              className="bg-gray-100 border-4 border-black shadow-lg px-8 py-10 text-center"
              style={{ boxShadow: '6px 6px 0px 0px #1f2937' }}
            >
              <h1
                className="text-2xl sm:text-3xl font-bold text-black mb-4"
                style={{ fontFamily: 'Press Start 2P, cursive', textShadow: '3px 3px 0px rgba(0,0,0,0.2)' }}
              >
                {title}
              </h1>
              <p className="text-sm sm:text-base text-gray-700" style={{ fontFamily: 'Volter' }}>
                {description}
              </p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  </SidebarProvider>
);

const AdminPanel = () => {
  const { habboAccount, loading } = useAuth();

  const isPrimaryAdmin = Boolean(
    habboAccount?.habbo_name?.toLowerCase() === 'habbohub' &&
    ['br', 'com.br'].includes((habboAccount?.hotel || '').toLowerCase()) &&
    habboAccount?.is_admin
  );

  const [pendingArticles, setPendingArticles] = useState<PendingArticle[]>(() => {
    const stored = loadStoredSubmissions();
    return [...stored, ...SEED_PENDING_ARTICLES];
  });

  const [selectedArticles, setSelectedArticles] = useState<SelectedArticle[]>([]);
  const [approvedArticles, setApprovedArticles] = useState<ApprovedArticle[]>([]);
  const [rejectedArticles, setRejectedArticles] = useState<RejectedArticle[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const userPending = pendingArticles.filter(
      (article) => article.origin === 'user' && article.status === 'pending'
    );

    localStorage.setItem('journal_submissions', JSON.stringify(userPending));
  }, [pendingArticles]);

  if (loading) {
    return (
      <AdminRestrictedView
        title="Carregando credenciais..."
        description="Validando permissões do administrador."
      />
    );
  }

  if (!isPrimaryAdmin) {
    return (
      <AdminRestrictedView
        title="Acesso restrito"
        description="Somente o HabboHub do hotel com.br pode acessar este painel."
      />
    );
  }

  const addToEdition = (article: PendingArticle) => {
    const selectedArticle: SelectedArticle = {
      ...article,
      status: 'selected'
    };
    
    setSelectedArticles(prev => [...prev, selectedArticle]);
    setPendingArticles(prev => prev.filter(a => a.id !== article.id));
  };

  const rejectArticle = (article: PendingArticle, reason: string) => {
    const rejectedArticle: RejectedArticle = {
      ...article,
      status: 'rejected',
      rejectedDate: new Date().toISOString(),
      reason
    };
    
    setRejectedArticles(prev => [...prev, rejectedArticle]);
    setPendingArticles(prev => prev.filter(a => a.id !== article.id));
  };

  const approveAndLaunch = () => {
    const approvedArticles = selectedArticles.map(article => ({
      ...article,
      status: 'approved' as const,
      approvedDate: new Date().toISOString()
    }));
    
    setApprovedArticles(prev => [...prev, ...approvedArticles]);
    setSelectedArticles([]);
  };

  const moveBackToPending = (article: ApprovedArticle | RejectedArticle) => {
    const pendingArticle: PendingArticle = {
      ...article,
      status: 'pending'
    };
    
    setPendingArticles(prev => [...prev, pendingArticle]);
    
    if (article.status === 'approved') {
      setApprovedArticles(prev => prev.filter(a => a.id !== article.id));
    } else {
      setRejectedArticles(prev => prev.filter(a => a.id !== article.id));
    }
  };

  const removeFromSelected = (articleId: string) => {
    const article = selectedArticles.find(a => a.id === articleId);
    if (article) {
      const pendingArticle: PendingArticle = {
        ...article,
        status: 'pending'
      };
      setPendingArticles(prev => [...prev, pendingArticle]);
      setSelectedArticles(prev => prev.filter(a => a.id !== articleId));
    }
  };

  const canLaunch = selectedArticles.length >= 3;
  const canPreview = selectedArticles.length > 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main 
            className="flex-1 p-8 bg-repeat min-h-screen" 
            style={{ 
              backgroundImage: 'url(/assets/site/bghabbohub.png)',
              backgroundRepeat: 'repeat'
            }}
          >
            <div className="max-w-7xl mx-auto">
              <PageBanner 
                title="Painel de Administração"
                subtitle="Gerencie o conteúdo do Habbo Hub Journal"
              />

              <Tabs defaultValue="pending" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="pending">
                    Pendente ({pendingArticles.length})
                  </TabsTrigger>
                  <TabsTrigger value="selected">
                    Próxima Edição ({selectedArticles.length}/3)
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    Aprovados ({approvedArticles.length})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Rejeitados ({rejectedArticles.length})
                  </TabsTrigger>
                </TabsList>

                {/* Pending Articles */}
                <TabsContent value="pending">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Conteúdo Pendente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingArticles.map((article) => (
                          <Card key={article.id} className="border-2 border-gray-200">
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                <div className="relative">
                                  <img 
                                    src={article.image} 
                                    alt={article.title}
                                    className="w-full h-32 object-cover rounded"
                                  />
                                  {article.origin === 'user' && (
                                    <div className="absolute top-2 left-2">
                                      <Badge className="bg-blue-600 text-white border border-white text-xs py-1 px-2">
                                        Envio da Comunidade
                                      </Badge>
                                    </div>
                                  )}
                                  <div className="absolute bottom-2 left-2">
                                    <img 
                                      src={article.authorAvatar}
                                      alt={article.author}
                                      className="w-12 h-16 object-cover border-2 border-white rounded"
                                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)' }}
                                    />
                                  </div>
                                  {article.fansiteLogo ? (
                                    <div className="absolute bottom-2 right-2">
                                      <img 
                                        src={article.fansiteLogo}
                                        alt={article.fansite}
                                        className="w-8 h-8 object-contain"
                                      />
                                    </div>
                                  ) : article.fansite ? (
                                    <div className="absolute bottom-2 right-2 bg-black text-white text-[10px] px-2 py-1 border border-white" style={{ fontFamily: 'Volter' }}>
                                      {article.fansite}
                                    </div>
                                  ) : null}
                                </div>
                                
                                <div>
                                  <h3 className="font-bold text-lg mb-2">{article.title}</h3>
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                                    {article.summary || article.content}
                                  </p>
                                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      <span>{article.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>{new Date(article.date).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="mb-4">
                                    {article.category}
                                  </Badge>
                                  {article.contact && (
                                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Volter' }}>
                                      Contato: {article.contact}
                                    </p>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => addToEdition(article)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar à Edição
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="destructive" className="flex-1">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Rejeitar
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Rejeitar Artigo</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <p className="text-sm text-gray-600">
                                          Tem certeza que deseja rejeitar este artigo?
                                        </p>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium">
                                            Motivo da rejeição:
                                          </label>
                                          <textarea 
                                            className="w-full p-2 border rounded"
                                            placeholder="Digite o motivo da rejeição..."
                                            rows={3}
                                          />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                          <Button variant="outline">Cancelar</Button>
                                          <Button 
                                            variant="destructive"
                                            onClick={() => rejectArticle(article, 'Motivo não especificado')}
                                          >
                                            Rejeitar
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Selected Articles */}
                <TabsContent value="selected">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Próxima Edição
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setPreviewOpen(true)}
                            disabled={!canPreview}
                            variant="outline"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Gerar Prévia
                          </Button>
                          <Button 
                            onClick={approveAndLaunch}
                            disabled={!canLaunch}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar e Lançar Edição
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Status:</strong> {selectedArticles.length}/3 artigos selecionados
                          {!canLaunch && ' (mínimo de 3 artigos necessário para lançar)'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedArticles.map((article) => (
                          <Card key={article.id} className="border-2 border-green-200">
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                <div className="relative">
                                  <img 
                                    src={article.image} 
                                    alt={article.title}
                                    className="w-full h-32 object-cover rounded"
                                  />
                                  {article.origin === 'user' && (
                                    <div className="absolute top-2 left-2">
                                      <Badge className="bg-blue-600 text-white border border-white text-xs py-1 px-2">
                                        Envio da Comunidade
                                      </Badge>
                                    </div>
                                  )}
                                  <div className="absolute bottom-2 left-2">
                                    <img 
                                      src={article.authorAvatar}
                                      alt={article.author}
                                      className="w-12 h-16 object-cover border-2 border-white rounded"
                                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)' }}
                                    />
                                  </div>
                                  {article.fansiteLogo ? (
                                    <div className="absolute bottom-2 right-2">
                                      <img 
                                        src={article.fansiteLogo}
                                        alt={article.fansite}
                                        className="w-8 h-8 object-contain"
                                      />
                                    </div>
                                  ) : article.fansite ? (
                                    <div className="absolute bottom-2 right-2 bg-black text-white text-[10px] px-2 py-1 border border-white" style={{ fontFamily: 'Volter' }}>
                                      {article.fansite}
                                    </div>
                                  ) : null}
                                </div>
                                
                                <div>
                                  <h3 className="font-bold text-lg mb-2">{article.title}</h3>
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                                    {article.summary || article.content}
                                  </p>
                                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      <span>{article.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>{new Date(article.date).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="mb-4">
                                    {article.category}
                                  </Badge>
                                  {article.contact && (
                                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Volter' }}>
                                      Contato: {article.contact}
                                    </p>
                                  )}
                                </div>

                                <Button 
                                  onClick={() => removeFromSelected(article.id)}
                                  variant="outline"
                                  className="w-full"
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Remover da Edição
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Approved Articles */}
                <TabsContent value="approved">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Artigos Aprovados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {approvedArticles.map((article) => (
                          <Card key={article.id} className="border-2 border-green-200">
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                <div className="relative">
                                  <img 
                                    src={article.image} 
                                    alt={article.title}
                                    className="w-full h-32 object-cover rounded"
                                  />
                                  {article.origin === 'user' && (
                                    <div className="absolute top-2 left-2">
                                      <Badge className="bg-blue-600 text-white border border-white text-xs py-1 px-2">
                                        Envio da Comunidade
                                      </Badge>
                                    </div>
                                  )}
                                  <div className="absolute bottom-2 left-2">
                                    <img 
                                      src={article.authorAvatar}
                                      alt={article.author}
                                      className="w-12 h-16 object-cover border-2 border-white rounded"
                                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)' }}
                                    />
                                  </div>
                                  {article.fansiteLogo ? (
                                    <div className="absolute bottom-2 right-2">
                                      <img 
                                        src={article.fansiteLogo}
                                        alt={article.fansite}
                                        className="w-8 h-8 object-contain"
                                      />
                                    </div>
                                  ) : article.fansite ? (
                                    <div className="absolute bottom-2 right-2 bg-black text-white text-[10px] px-2 py-1 border border-white" style={{ fontFamily: 'Volter' }}>
                                      {article.fansite}
                                    </div>
                                  ) : null}
                                </div>
                                
                                <div>
                                  <h3 className="font-bold text-lg mb-2">{article.title}</h3>
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                                    {article.summary || article.content}
                                  </p>
                                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      <span>{article.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>Aprovado em {new Date(article.approvedDate).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="mb-4">
                                    {article.category}
                                  </Badge>
                                  {article.contact && (
                                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Volter' }}>
                                      Contato: {article.contact}
                                    </p>
                                  )}
                                </div>

                                <Button 
                                  onClick={() => moveBackToPending(article)}
                                  variant="outline"
                                  className="w-full"
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Mover para Pendente
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Rejected Articles */}
                <TabsContent value="rejected">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        Artigos Rejeitados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {rejectedArticles.map((article) => (
                          <Card key={article.id} className="border-2 border-red-200">
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                <div className="relative">
                                  <img 
                                    src={article.image} 
                                    alt={article.title}
                                    className="w-full h-32 object-cover rounded"
                                  />
                                  {article.origin === 'user' && (
                                    <div className="absolute top-2 left-2">
                                      <Badge className="bg-blue-600 text-white border border-white text-xs py-1 px-2">
                                        Envio da Comunidade
                                      </Badge>
                                    </div>
                                  )}
                                  <div className="absolute bottom-2 left-2">
                                    <img 
                                      src={article.authorAvatar}
                                      alt={article.author}
                                      className="w-12 h-16 object-cover border-2 border-white rounded"
                                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)' }}
                                    />
                                  </div>
                                  {article.fansiteLogo ? (
                                    <div className="absolute bottom-2 right-2">
                                      <img 
                                        src={article.fansiteLogo}
                                        alt={article.fansite}
                                        className="w-8 h-8 object-contain"
                                      />
                                    </div>
                                  ) : article.fansite ? (
                                    <div className="absolute bottom-2 right-2 bg-black text-white text-[10px] px-2 py-1 border border-white" style={{ fontFamily: 'Volter' }}>
                                      {article.fansite}
                                    </div>
                                  ) : null}
                                </div>
                                
                                <div>
                                  <h3 className="font-bold text-lg mb-2">{article.title}</h3>
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                                    {article.summary || article.content}
                                  </p>
                                  <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
                                    <p className="text-sm text-red-800">
                                      <strong>Motivo da rejeição:</strong> {article.reason}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      <span>{article.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>Rejeitado em {new Date(article.rejectedDate).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="mb-4">
                                    {article.category}
                                  </Badge>
                                  {article.contact && (
                                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Volter' }}>
                                      Contato: {article.contact}
                                    </p>
                                  )}
                                </div>

                                <Button 
                                  onClick={() => moveBackToPending(article)}
                                  variant="outline"
                                  className="w-full"
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Mover para Pendente
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Preview Modal */}
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Prévia da Próxima Edição</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Esta é uma prévia da próxima edição do jornal com os artigos selecionados.
                    </p>
                    <div className="border-2 border-gray-300 p-4 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500 text-center">
                        Aqui seria exibido um iframe com a prévia do jornal
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminPanel;
