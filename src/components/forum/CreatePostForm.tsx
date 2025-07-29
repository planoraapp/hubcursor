
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Image as ImageIcon } from 'lucide-react';

interface CreatePostFormProps {
  isLoggedIn: boolean;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onCreatePost: (title: string, content: string, image: File | null, category: string) => Promise<void>;
  isCreatingPost: boolean;
  uploadingImage: boolean;
}

export const CreatePostForm: React.FC<CreatePostFormProps> = ({
  isLoggedIn,
  selectedCategory,
  setSelectedCategory,
  onCreatePost,
  isCreatingPost,
  uploadingImage
}) => {
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setNewPostImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setNewPostImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    await onCreatePost(newPostTitle, newPostContent, newPostImage, selectedCategory);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostImage(null);
    setImagePreview(null);
  };

  return (
    <Card className="bg-white border-gray-900">
      <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <CardTitle className="volter-font">Criar Novo Post</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoggedIn ? (
          <div className="space-y-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreatingPost}
            >
              <option value="Geral">Discussões Gerais</option>
              <option value="Suporte">Suporte Técnico</option>
              <option value="Eventos">Eventos e Competições</option>
            </select>
            
            <Input
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="Título do post"
              disabled={isCreatingPost}
            />
            
            <Textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Conteúdo do post"
              rows={4}
              disabled={isCreatingPost}
            />
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 cursor-pointer volter-font">
                <ImageIcon className="h-4 w-4" />
                {uploadingImage ? 'Carregando...' : 'Adicionar Imagem'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage || isCreatingPost}
                />
              </label>
              
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-16 w-16 object-cover rounded-lg border"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <Button 
              onClick={handleSubmit} 
              className="w-full bg-green-600 hover:bg-green-700 text-white volter-font"
              disabled={isCreatingPost || uploadingImage}
            >
              {isCreatingPost ? 'Criando...' : 'Publicar Post'}
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Faça login para criar um post no fórum</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
