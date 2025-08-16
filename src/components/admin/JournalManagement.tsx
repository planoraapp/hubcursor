
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Archive,
  Send,
  RotateCcw
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Article {
  id: string;
  title: string;
  section: string;
  author: string;
  authorHabboName: string;
  content: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'next-edition';
}

export const JournalManagement = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  
  // Simulação de dados - em produção viria do backend
  const [articles, setArticles] = useState<Article[]>([
    {
      id: '1',
      title: 'A Nova Era dos Mobis Raros',
      section: 'Opinião',
      author: 'João Silva',
      authorHabboName: 'CollectorPro',
      content: 'Com as recentes mudanças no sistema de mobis raros do Habbo Hotel, observamos uma transformação significativa na economia virtual...',
      submittedAt: '2025-01-15T14:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Entrevista: O Construtor Mais Criativo do Hotel',
      section: 'Entrevistas',
      author: 'Maria Santos',
      authorHabboName: 'PixelReporter',
      content: 'Conversamos com BuildMaster sobre suas criações mais impressionantes e os segredos por trás dos quartos mais visitados...',
      submittedAt: '2025-01-14T10:15:00Z',
      status: 'next-edition'
    }
  ]);

  const [nextEditionCount, setNextEditionCount] = useState(2);
  const minArticlesForEdition = 5;

  const getPendingArticles = () => articles.filter(a => a.status === 'pending');
  const getNextEditionArticles = () => articles.filter(a => a.status === 'next-edition');
  const getApprovedArticles = () => articles.filter(a => a.status === 'approved');
  const getRejectedArticles = () => articles.filter(a => a.status === 'rejected');

  const moveToNextEdition = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, status: 'next-edition' as const }
        : article
    ));
    setNextEditionCount(prev => prev + 1);
  };

  const rejectArticle = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, status: 'rejected' as const }
        : article
    ));
  };

  const moveToPending = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, status: 'pending' as const }
        : article
    ));
    if (articles.find(a => a.id === articleId)?.status === 'next-edition') {
      setNextEditionCount(prev => prev - 1);
    }
  };

  const generatePreview = () => {
    // Em produção, isso abriria uma janela com preview da próxima edição
    alert('Preview da próxima edição seria gerado aqui!');
  };

  const publishEdition = () => {
    const nextEditionArticles = getNextEditionArticles();
    setArticles(prev => prev.map(article => 
      nextEditionArticles.find(a => a.id === article.id)
        ? { ...article, status: 'approved' as const }
        : article
    ));
    setNextEditionCount(0);
    alert('Edição publicada com sucesso!');
  };

  const openArticleModal = (article: Article) => {
    setSelectedArticle(article);
    setPreviewModalOpen(true);
  };

  const getAvatarUrl = (habboName: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboName}&size=s&direction=2&head_direction=3&action=std`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Gerenciamento do Journal Hub</h2>
        <p className="text-muted-foreground">
          Gerencie as submissões de colunas e prepare as próximas edições do jornal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conteúdo Pendente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Conteúdo Pendente ({getPendingArticles().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {getPendingArticles().map((article) => (
                  <div key={article.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{article.title}</h4>
                      <Badge variant="outline">{article.section}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={getAvatarUrl(article.authorHabboName)} />
                        <AvatarFallback>{article.authorHabboName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {article.authorHabboName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {formatDate(article.submittedAt)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {article.content}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openArticleModal(article)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => moveToNextEdition(article.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectArticle(article.id)}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
                
                {getPendingArticles().length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum conteúdo pendente</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Próxima Edição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Próxima Edição ({nextEditionCount}/{minArticlesForEdition})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex gap-2">
                <Button
                  onClick={generatePreview}
                  disabled={nextEditionCount < minArticlesForEdition}
                  className="flex-1"
                >
                  Gerar Prévia
                </Button>
                <Button
                  onClick={publishEdition}
                  disabled={nextEditionCount < minArticlesForEdition}
                  variant="default"
                  className="flex-1"
                >
                  Publicar Edição
                </Button>
              </div>
            </div>

            <ScrollArea className="max-h-80">
              <div className="space-y-3">
                {getNextEditionArticles().map((article) => (
                  <div key={article.id} className="border rounded-lg p-3 bg-green-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{article.title}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveToPending(article.id)}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={getAvatarUrl(article.authorHabboName)} />
                        <AvatarFallback>{article.authorHabboName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {article.authorHabboName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Conteúdo Aprovado (Arquivado) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Conteúdo Aprovado ({getApprovedArticles().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-60">
              <div className="space-y-3">
                {getApprovedArticles().map((article) => (
                  <div key={article.id} className="border rounded-lg p-3 bg-blue-50">
                    <h4 className="font-semibold text-sm">{article.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {article.authorHabboName}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveToPending(article.id)}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Conteúdo Rejeitado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Conteúdo Rejeitado ({getRejectedArticles().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-60">
              <div className="space-y-3">
                {getRejectedArticles().map((article) => (
                  <div key={article.id} className="border rounded-lg p-3 bg-red-50">
                    <h4 className="font-semibold text-sm">{article.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {article.authorHabboName}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveToPending(article.id)}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Visualização */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedArticle?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedArticle && (
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={getAvatarUrl(selectedArticle.authorHabboName)} />
                    <AvatarFallback>{selectedArticle.authorHabboName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedArticle.authorHabboName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedArticle.section} • {formatDate(selectedArticle.submittedAt)}
                    </p>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedArticle.content}</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
