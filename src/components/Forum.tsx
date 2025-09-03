
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ForumCategoryCard } from './forum/ForumCategoryCard';
import { CreatePostModal } from './forum/CreatePostModal';
import { PostsList } from './forum/PostsList';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import type { ForumPost } from '../types/forum';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  bg_color: string;
  topics_count: number;
  posts_count: number;
  last_post_time: string;
}

export const Forum = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { user, habboAccount, isLoggedIn } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, [selectedCategory]);

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
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'Todos') {
        const category = categories.find(cat => cat.name === selectedCategory);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar posts:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar posts do fórum",
          variant: "destructive"
        });
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (title: string, content: string, image: File | null, categoryId: string) => {
    if (!isLoggedIn || !habboAccount) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um post",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreatingPost(true);
      let imageUrl = null;

      if (image) {
        setUploadingImage(true);
        const fileName = `${Date.now()}-${image.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('habbo-hub-images')
          .upload(`forum/${fileName}`, image);

        if (uploadError) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
          toast({
            title: "Erro",
            description: "Erro ao fazer upload da imagem",
            variant: "destructive"
          });
          return;
        }

        const { data: urlData } = supabase.storage
          .from('habbo-hub-images')
          .getPublicUrl(uploadData.path);

        imageUrl = urlData.publicUrl;
        setUploadingImage(false);
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          title,
          content,
          image_url: imageUrl,
          category_id: categoryId,
          author_supabase_user_id: user?.id,
          author_habbo_name: habboAccount.habbo_name
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar post:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar post",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Post criado com sucesso!"
      });

      loadPosts();
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar post",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPost(false);
      setUploadingImage(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para curtir posts",
        variant: "destructive"
      });
      return;
    }

    try {
      // First get the current post
      const { data: currentPost, error: fetchError } = await supabase
        .from('forum_posts')
        .select('likes')
        .eq('id', postId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar post:', fetchError);
        return;
      }

      // Update with incremented likes
      const { error } = await supabase
        .from('forum_posts')
        .update({ likes: currentPost.likes + 1 })
        .eq('id', postId);

      if (error) {
        console.error('Erro ao curtir post:', error);
        return;
      }

      // Atualizar localmente
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes + 1 }
            : post
        )
      );
    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Forum Categories */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6 border-2 border-black">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg mb-4">
          <h2 className="text-2xl font-bold text-center volter-font"
              style={{ textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px' }}>
            Categorias do Fórum
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <ForumCategoryCard
              key={category.id}
              title={category.name}
              description={category.description}
              topics={category.topics_count}
              posts={category.posts_count}
              lastPostTime={new Date(category.last_post_time || '').toLocaleDateString('pt-BR')}
              bgColorClass={category.bg_color}
            />
          ))}
        </div>
      </div>

      {/* Create Post Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setCreatePostModalOpen(true)}
          disabled={!isLoggedIn}
          className="bg-green-600 hover:bg-green-700 text-white volter-font flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Criar Post
        </Button>
        {!isLoggedIn && (
          <p className="text-sm text-gray-500 mt-2">Faça login para criar posts</p>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        open={createPostModalOpen}
        setOpen={setCreatePostModalOpen}
        onCreatePost={handleCreatePost}
        isCreatingPost={isCreatingPost}
        uploadingImage={uploadingImage}
      />

      {/* Posts List */}
      <PostsList
        posts={posts}
        loading={loading}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onLikePost={handleLikePost}
        currentUserId={user?.id || null}
        categories={['Todos', ...categories.map(cat => cat.name)]}
      />
    </div>
  );
};
