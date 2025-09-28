import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
}

interface PhotoInteraction {
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

interface PhotoInteractions {
  [photoId: string]: PhotoInteraction;
}

export const usePhotoInteractions = () => {
  const [interactions, setInteractions] = useState<PhotoInteractions>({});

  // Carregar interações salvas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('photo-interactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Converter timestamps de string para Date
        Object.keys(parsed).forEach(photoId => {
          if (parsed[photoId].comments) {
            parsed[photoId].comments = parsed[photoId].comments.map((comment: any) => ({
              ...comment,
              timestamp: new Date(comment.timestamp)
            }));
          }
        });
        setInteractions(parsed);
      } catch (error) {
        console.error('Erro ao carregar interações:', error);
      }
    }
  }, []);

  // Salvar interações no localStorage
  const saveInteractions = (newInteractions: PhotoInteractions) => {
    localStorage.setItem('photo-interactions', JSON.stringify(newInteractions));
  };

  // Obter interações de uma foto
  const getPhotoInteractions = (photoId: string): PhotoInteraction => {
    return interactions[photoId] || {
      likes: 0,
      comments: [],
      isLiked: false
    };
  };

  // Curtir/descurtir foto
  const toggleLike = (photoId: string, currentUser: string) => {
    setInteractions(prev => {
      const current = prev[photoId] || { likes: 0, comments: [], isLiked: false };
      const newInteraction = {
        ...current,
        likes: current.isLiked ? current.likes - 1 : current.likes + 1,
        isLiked: !current.isLiked
      };
      
      const newInteractions = { ...prev, [photoId]: newInteraction };
      saveInteractions(newInteractions);
      return newInteractions;
    });
  };

  // Adicionar comentário
  const addComment = (photoId: string, message: string, author: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author,
      message,
      timestamp: new Date()
    };

    setInteractions(prev => {
      const current = prev[photoId] || { likes: 0, comments: [], isLiked: false };
      const newInteraction = {
        ...current,
        comments: [...current.comments, newComment]
      };
      
      const newInteractions = { ...prev, [photoId]: newInteraction };
      saveInteractions(newInteractions);
      return newInteractions;
    });
  };

  return {
    getPhotoInteractions,
    toggleLike,
    addComment
  };
};
