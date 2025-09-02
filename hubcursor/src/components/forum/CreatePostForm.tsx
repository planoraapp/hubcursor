
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

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

  const handleSubmit = async () => {
    await onCreatePost(newPostTitle, newPostContent, newPostImage, selectedCategory);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostImage(null);
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
