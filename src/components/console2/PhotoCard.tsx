import React from 'react';
import { EnhancedPhotoCard } from './EnhancedPhotoCard';
import { PhotoCardProps } from '@/types/habbo';

// Re-export the enhanced component for backward compatibility
export const PhotoCard: React.FC<PhotoCardProps> = (props) => {
  return <EnhancedPhotoCard {...props} />;
};