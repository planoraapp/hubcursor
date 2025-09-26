
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, ExternalLink, Users } from 'lucide-react';
import { unifiedHabboService } from '@/services/unifiedHabboService';
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Grupos de {userName} ({groups.length})
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            {groups.map((group) => (
              <div 
                key={group.id}
                className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={unifiedHabboService.getBadgeUrl(group.badgeCode)}
                    alt={group.name}
                    className="w-12 h-12 border border-gray-200 rounded bg-white p-1 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm leading-tight">{group.name}</h3>
                      <Button variant="ghost" size="sm" className="p-1 flex-shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {group.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                        {group.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={group.type === 'NORMAL' ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {group.type}
                        </Badge>
                        {group.isAdmin && (
                          <Badge variant="outline" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
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
            <div className="text-center text-gray-500 py-8">
              <Crown className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum grupo encontrado</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
