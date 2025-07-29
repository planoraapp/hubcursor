
import React from 'react';
import { MessageCircle, Users, Clock } from 'lucide-react';

interface ForumCategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  topics: number;
  posts: number;
  lastPostTime: string;
  bgColorClass?: string;
}

export const ForumCategoryCard: React.FC<ForumCategoryCardProps> = ({ 
  icon, 
  title, 
  description, 
  topics, 
  posts, 
  lastPostTime, 
  bgColorClass = "bg-blue-100" 
}) => {
  return (
    <div className="bg-white border border-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className={`p-4 ${bgColorClass}`}>
        {icon}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2 volter-font">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between"><span>Tópicos:</span><span className="font-medium">{topics}</span></div>
          <div className="flex justify-between"><span>Posts:</span><span className="font-medium">{posts}</span></div>
          <div className="flex justify-between"><span>Último post:</span><span className="font-medium">{lastPostTime}</span></div>
        </div>
      </div>
    </div>
  );
};
