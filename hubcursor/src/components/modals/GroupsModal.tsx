
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Users, ExternalLink } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  type: string;
  roomId: string;
  badgeCode: string;
  primaryColour: string;
  secondaryColour: string;
  isAdmin: boolean;
  memberCount?: number;
}

interface GroupsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: Group[];
  habboName: string;
}

export const GroupsModal: React.FC<GroupsModalProps> = ({
  open,
  onOpenChange,
  groups,
  habboName
}) => {
  const getGroupBadgeUrl = (badgeCode: string) => {
    return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
  };

  const getGroupImageUrl = (groupId: string) => {
    // URL da imagem do grupo baseada no ID
    return `https://images.habbo.com/c_images/groups/${groupId}.gif`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg">
        <DialogHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-t-lg -m-6 mb-4">
          <DialogTitle className="text-2xl volter-font flex items-center gap-2">
            <Users className="w-6 h-6" />
            Grupos de {habboName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 volter-font">Este usuário não participa de nenhum grupo</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {/* Imagem do grupo */}
                    <div className="flex-shrink-0">
                      <img
                        src={getGroupImageUrl(group.id)}
                        alt={`Grupo ${group.name}`}
                        className="w-16 h-16 rounded-lg border border-gray-300"
                        onError={(e) => {
                          // Fallback para badge do grupo se imagem principal não carregar
                          const target = e.target as HTMLImageElement;
                          target.src = getGroupBadgeUrl(group.badgeCode);
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 volter-font truncate">
                          {group.name}
                        </h3>
                        {group.isAdmin && (
                          <Badge className="bg-yellow-100 text-yellow-800 volter-font text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>

                      {group.description && (
                        <p className="text-sm text-gray-600 volter-font mb-2 line-clamp-2">
                          {group.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="outline" className="volter-font">
                            {group.type}
                          </Badge>
                          {group.memberCount && (
                            <span className="volter-font flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {group.memberCount}
                            </span>
                          )}
                        </div>

                        {group.roomId && (
                          <a
                            href={`https://www.habbo.com.br/room/${group.roomId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 volter-font text-xs flex items-center gap-1"
                          >
                            Ver Quarto
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
