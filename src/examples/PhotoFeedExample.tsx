import React from 'react';
import { EnhancedPhotoCard } from '@/components/console2/EnhancedPhotoCard';
import { EnhancedPhoto } from '@/types/habbo';

// Exemplo de uso do sistema aprimorado de fotos
export const PhotoFeedExample: React.FC = () => {
  // Exemplo de dados de foto no formato aprimorado
  const examplePhotos: EnhancedPhoto[] = [
    {
      id: 'photo-1',
      photo_id: 'photo-1',
      userName: 'Lu,a',
      imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-66179142-1759350614694.png',
      date: '01/10/25',
      likes: [
        {
          id: 'like-1',
          user_id: 'user-1',
          habbo_name: 'Lu,a',
          created_at: '2025-01-10T10:30:00Z'
        }
      ],
      likesCount: 1,
      userLiked: false,
      type: 'PHOTO',
      contentWidth: 400,
      contentHeight: 300,
      caption: 'Minha nova foto!',
      roomName: 'Sala dos Amigos'
    },
    {
      id: 'photo-2',
      photo_id: 'photo-2',
      userName: 'Yildz',
      imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-89011003-1759350395461.png',
      date: '01/10/25',
      likes: [
        {
          id: 'like-2',
          user_id: 'user-2',
          habbo_name: 'Lu,a',
          created_at: '2025-01-10T10:25:00Z'
        }
      ],
      likesCount: 1,
      userLiked: false,
      type: 'SELFIE',
      contentWidth: 300,
      contentHeight: 400,
      caption: 'Selfie do dia!',
      roomName: 'Quarto Privado'
    },
    {
      id: 'photo-3',
      photo_id: 'photo-3',
      userName: 'boy2patrick',
      imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-11297847-1759344009595.png',
      date: '01/10/25',
      likes: [
        {
          id: 'like-3',
          user_id: 'user-3',
          habbo_name: 'Lu,a',
          created_at: '2025-01-10T10:20:00Z'
        },
        {
          id: 'like-4',
          user_id: 'user-4',
          habbo_name: 'boy2patrick',
          created_at: '2025-01-10T10:15:00Z'
        },
        {
          id: 'like-5',
          user_id: 'user-5',
          habbo_name: 'nynny2802',
          created_at: '2025-01-10T10:10:00Z'
        },
        {
          id: 'like-6',
          user_id: 'user-6',
          habbo_name: 'Talitamanbe',
          created_at: '2025-01-10T10:05:00Z'
        },
        {
          id: 'like-7',
          user_id: 'user-7',
          habbo_name: 'MeioToxico!',
          created_at: '2025-01-10T10:00:00Z'
        }
      ],
      likesCount: 6,
      userLiked: false,
      type: 'USER_CREATION',
      contentWidth: 600,
      contentHeight: 400,
      caption: 'Minha criação incrível!',
      roomName: 'Studio de Arte'
    }
  ];

  const handleUserClick = (userName: string) => {
    console.log('Usuário clicado:', userName);
    // Aqui você pode abrir um modal de perfil ou navegar para a página do usuário
  };

  const handleLikesClick = (photoId: string) => {
    console.log('Curtidas clicadas para foto:', photoId);
    // Aqui você pode abrir o modal de curtidas
  };

  const handleCommentsClick = (photoId: string) => {
    console.log('Comentários clicados para foto:', photoId);
    // Aqui você pode abrir o modal de comentários
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-4 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        Feed de Fotos Aprimorado
      </h2>
      
      {examplePhotos.map((photo, index) => (
        <div key={photo.id} className="bg-white/5 p-4 border border-dashed border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-200">
          <EnhancedPhotoCard
            photo={photo}
            onUserClick={handleUserClick}
            onLikesClick={handleLikesClick}
            onCommentsClick={handleCommentsClick}
            showDivider={index < examplePhotos.length - 1}
          />
        </div>
      ))}
      
      <div className="text-center text-white/60 text-sm mt-6">
        <p>✨ Sistema de fotos com funcionalidades do site oficial do Habbo</p>
        <ul className="mt-2 space-y-1 text-xs">
          <li>• Exibição de avatares dos usuários que curtiram</li>
          <li>• Suporte para diferentes tipos de foto (SELFIE, PHOTO, USER_CREATION)</li>
          <li>• Classes CSS dinâmicas baseadas nas dimensões</li>
          <li>• Modal para mostrar todos os usuários que curtiram</li>
          <li>• Sistema de curtidas e comentários integrado</li>
        </ul>
      </div>
    </div>
  );
};
