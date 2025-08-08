import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Post {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category: string;
  created_at: string;
  likes_count?: number;
}

interface PostsListProps {
  posts: Post[];
}

export const PostsList: React.FC<PostsListProps> = ({ posts }) => {
  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <Card className="border-2 border-black">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-xl volter-font mb-2">Nenhum post encontrado</h3>
            <p className="text-gray-600 volter-font">
              Seja o primeiro a compartilhar algo interessante!
            </p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="forum-post hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white volter-font habbo-outline-sm px-3 py-1">
                      {post.category}
                    </Badge>
                    <span className="text-sm text-gray-500 volter-font">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg volter-font font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-700 volter-font text-sm mb-3">
                    {post.content.length > 200 
                      ? `${post.content.substring(0, 200)}...` 
                      : post.content
                    }
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="volter-font">Por: {post.author_name}</span>
                    <span className="volter-font">👍 {post.likes_count || 0}</span>
                    <span className="volter-font">💬 0 respostas</span>
                  </div>
                </div>
                
                <div className="ml-4 text-right">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {post.author_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
