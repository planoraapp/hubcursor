
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, ExternalLink, Users, X } from 'lucide-react';

interface GroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: any[];
  userName: string;
}

export const GroupsModal: React.FC<GroupsModalProps> = ({ 
  isOpen, 
  onClose, 
  groups, 
  userName 
}) => {
  const getBadgeUrl = (badgeCode: string) => {
    return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl text-white">
              <Crown className="w-5 h-5 text-orange-400" />
              Grupos de {userName} ({groups.length})
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            {groups.map((group) => (
              <div 
                key={group.id}
                className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-700"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={getBadgeUrl(group.badgeCode)}
                    alt={group.name}
                    className="w-12 h-12 border border-gray-600 rounded bg-white p-1 flex-shrink-0"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm leading-tight text-white">{group.name}</h3>
                      <Button variant="ghost" size="sm" className="p-1 flex-shrink-0 text-gray-400 hover:text-white">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {group.description && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                        {group.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={group.type === 'NORMAL' ? 'default' : 'secondary'} 
                          className={`text-xs ${group.type === 'NORMAL' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}
                        >
                          {group.type}
                        </Badge>
                        {group.isAdmin && (
                          <Badge variant="outline" className="text-xs border-orange-400 text-orange-400">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>Grupo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {groups.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              <Crown className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum grupo encontrado</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
