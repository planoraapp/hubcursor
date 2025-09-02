
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePlus, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  bg_color: string;
}

interface CreatePostModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreatePost: (title: string, content: string, image: File | null, categoryId: string) => Promise<void>;
  isCreatingPost: boolean;
  uploadingImage: boolean;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  setOpen,
  onCreatePost,
  isCreatingPost,
  uploadingImage
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<ForumCategory[]>([]);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao carregar categorias:', error);
        return;
      }

      setCategories(data || []);
      if (data && data.length > 0) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !selectedCategoryId) {
      return;
    }

    await onCreatePost(title, content, image, selectedCategoryId);
    
    // Reset form
    setTitle('');
    setContent('');
    setImage(null);
    setSelectedCategoryId('');
    setOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] bg-white border-2 border-gray-900">
        <DialogHeader>
          <DialogTitle className="volter-font text-xl">Criar Novo Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-full border-gray-300">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do post"
              className="border-gray-300"
              disabled={isCreatingPost}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Conteúdo</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite o conteúdo do post"
              rows={6}
              className="border-gray-300"
              disabled={isCreatingPost}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Imagem (opcional)</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={isCreatingPost}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={isCreatingPost}
                className="border-gray-300"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                {image ? image.name : 'Adicionar Imagem'}
              </Button>
              {image && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setImage(null)}
                  disabled={isCreatingPost}
                  className="text-red-600 hover:text-red-700"
                >
                  Remover
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || !selectedCategoryId || isCreatingPost || uploadingImage}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white volter-font"
            >
              <Send className="w-4 h-4 mr-2" />
              {isCreatingPost ? 'Criando...' : 'Publicar Post'}
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              disabled={isCreatingPost}
              className="border-gray-900"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
