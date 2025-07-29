
import React from 'react';

interface ForumCategoryCardProps {
  title: string;
  description: string;
  topics: number;
  posts: number;
  lastPostTime: string;
  bgColorClass?: string;
}

export const ForumCategoryCard: React.FC<ForumCategoryCardProps> = ({ 
  title, 
  description, 
  topics, 
  posts, 
  lastPostTime, 
  bgColorClass = "bg-blue-100" 
}) => {
  return (
    <div className="bg-white border border-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className={`p-4 ${bgColorClass} flex items-center justify-center`}>
        <div className="w-8 h-8 text-gray-600">
          {/* Simple icon placeholder */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2 volter-font">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Tópicos:</span>
            <span className="font-medium">{topics}</span>
          </div>
          <div className="flex justify-between">
            <span>Posts:</span>
            <span className="font-medium">{posts}</span>
          </div>
          <div className="flex justify-between">
            <span>Último post:</span>
            <span className="font-medium">{lastPostTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
