import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, X } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  type: string;
  isAdmin: boolean;
  online: boolean;
  badgeCode: string;
  primaryColour: string;
}

interface GroupsModalProps {
  groups: Group[];
  isOpen: boolean;
  onClose: () => void;
}

export const GroupsModal: React.FC<GroupsModalProps> = ({ groups, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-black rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-black bg-purple-500">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Grupos ({groups.length})
          </h3>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-black hover:bg-black/20">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {groups.map((group) => (
              <div key={group.id} className="p-3 bg-white/10 rounded border border-black">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded" style={{ backgroundColor: `#${group.primaryColour}` }}>
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                      {group.badgeCode}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{group.name}</div>
                    <div className="text-sm text-white/60">{group.description}</div>
                    <div className="text-xs text-white/40">
                      Tipo: {group.type} • {group.isAdmin ? 'Admin' : 'Membro'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs px-2 py-1 rounded ${
                      group.online ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                    }`}>
                      {group.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
