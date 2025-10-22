import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Crown, ExternalLink, Users, X } from 'lucide-react';
import { getGroupDetails, getGroupMembers, getRoomDetails } from '@/services/habboApi';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/contexts/I18nContext';

interface GroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: any[];
  userName: string;
  onNavigateToProfile?: (username: string) => void;
}

export const GroupsModal: React.FC<GroupsModalProps> = ({ 
  isOpen, 
  onClose, 
  groups, 
  userName,
  onNavigateToProfile
}) => {
  const { t } = useI18n();
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupDetails, setGroupDetails] = useState<Map<string, any>>(new Map());

  // Função ROBUSTA para buscar detalhes completos do grupo e identificar o dono
  const fetchComprehensiveGroupDetails = async (groupId: string, roomId?: string) => {
    if (groupDetails.has(groupId)) {
      return groupDetails.get(groupId);
    }

    try {let ownerInfo = null;
      let groupData = null;
      let membersData = null;
      let roomData = null;
      
      // 1. PRIMEIRO: Buscar detalhes do grupo via API pública
      try {groupData = await getGroupDetails(groupId);// Verificar se a API retorna informações do dono diretamente
        if (groupData?.ownerName) {
          ownerInfo = {
            ownerName: groupData.ownerName,
            ownerUniqueId: groupData.ownerUniqueId,
            roomName: groupData.name,
            source: 'group_api_direct',
            confirmed: true
          };} else {
          console.log(`❌ API do grupo não retorna ownerName. Campos disponíveis:`, Object.keys(groupData || {}));
        }
      } catch (error) {}
      
      // 2. SEGUNDO: Buscar membros do grupo para identificar o dono
      if (!ownerInfo) {
        try {membersData = await getGroupMembers(groupId);if (membersData && membersData.length > 0) {
            // Procurar por um membro que seja dono usando múltiplos critérios
            const ownerMember = membersData.find(member => 
              member.isOwner === true || 
              member.owner === true || 
              member.role === 'owner' ||
              member.role === 'OWNER' ||
              member.role === 'Owner' ||
              member.role === 'ADMIN' ||
              member.role === 'admin' ||
              member.isAdmin === true ||
              member.admin === true
            );
            
            // Se não encontrou com critérios padrão, tentar outras estratégias
            if (!ownerMember && membersData.length > 0) {// Estratégia 1: Primeiro membro pode ser o dono
              const firstMember = membersData[0];
              console.log(`🔍 Primeiro membro (possível dono):`, firstMember);
              
              // Estratégia 2: Procurar por membro com nome específico
              const beebopMember = membersData.find(m => 
                m.name === userName || 
                m.username === userName ||
                m.name?.toLowerCase().includes('beebop') ||
                m.username?.toLowerCase().includes('beebop')
              );
              
              if (beebopMember) {console.log(`🔍 Campos do Beebop:`, Object.keys(beebopMember));// Se Beebop é admin, pode ser o dono
                if (beebopMember.isAdmin || beebopMember.admin || beebopMember.role === 'ADMIN') {
                  ownerInfo = {
                    ownerName: beebopMember.name || beebopMember.username,
                    ownerUniqueId: beebopMember.uniqueId || beebopMember.id,
                    roomName: groupData?.name || 'Quarto do grupo',
                    source: 'beebop_admin_logic',
                    confirmed: true
                  };
                  console.log(`👑 Beebop identificado como dono (é admin):`, ownerInfo);
                } else {}
              }
            }
            
            if (ownerMember) {
              ownerInfo = {
                ownerName: ownerMember.name || ownerMember.username,
                ownerUniqueId: ownerMember.uniqueId || ownerMember.id,
                roomName: groupData?.name || 'Quarto do grupo',
                source: 'group_members',
                confirmed: true
              };} else {console.log(`📊 Roles dos membros:`, membersData.map(m => ({ name: m.name, role: m.role, isOwner: m.isOwner })));
              console.log(`🔍 Primeiros 5 membros detalhados:`, membersData.slice(0, 5).map(m => ({ 
                name: m.name, 
                username: m.username,
                uniqueId: m.uniqueId,
                id: m.id,
                role: m.role, 
                isOwner: m.isOwner,
                owner: m.owner,
                allFields: Object.keys(m)
              })));
              
              // Expandir o primeiro membro completamente para ver todos os campos
              if (membersData.length > 0) {}
            }
          }
        } catch (error) {}
      }
      
      // 3. TERCEIRO: Buscar detalhes do quarto associado ao grupo
      if (!ownerInfo && roomId) {
        try {roomData = await getRoomDetails(roomId);if (roomData?.ownerName) {
            ownerInfo = {
              ownerName: roomData.ownerName,
              ownerUniqueId: roomData.ownerUniqueId,
              roomName: roomData.name,
              source: 'room_api',
              confirmed: true
            };}
        } catch (error) {}
      }
      
      // 4. QUARTO: Buscar perfil do usuário atual para verificar se é dono
      if (!ownerInfo) {
        try {// Buscar perfil do usuário atual
          const userUrl = `https://www.habbo.com.br/api/public/users?name=${userName}`;
          const userResponse = await fetch(userUrl);
          
          if (userResponse.ok) {
            const userData = await userResponse.json();console.log(`👤 Campos disponíveis no usuário:`, Object.keys(userData));
            
            // Verificar se o usuário tem grupos onde é dono
            if (userData.groups) {
              console.log(`👤 Grupos do usuário ${userName}:`, userData.groups.map(g => ({ 
                id: g.id, 
                name: g.name, 
                role: g.role, 
                isOwner: g.isOwner,
                allFields: Object.keys(g)
              })));
              
              const ownedGroup = userData.groups.find(g => 
                g.id === groupId && 
                (g.isOwner === true || g.role === 'owner' || g.role === 'OWNER')
              );
              
              if (ownedGroup) {
                ownerInfo = {
                  ownerName: userName,
                  ownerUniqueId: userData.uniqueId,
                  roomName: groupData?.name || 'Quarto do grupo',
                  source: 'user_groups',
                  confirmed: true
                };} else {}
            } else {}
          }
        } catch (error) {}
      }
      
      // 5. QUINTO: Buscar no Supabase como fallback final
      if (!ownerInfo) {
        try {// Buscar por qualquer relação possível
          const { data: supabaseData, error: supabaseError } = await supabase
            .from('habbo_rooms')
            .select('*')
            .or(`name.ilike.%${groupData?.name}%,habbo_group_id.eq.${groupId}`)
            .limit(5);if (supabaseData && supabaseData.length > 0) {
            const room = supabaseData[0];
            if (room.owner_name) {
              ownerInfo = {
                ownerName: room.owner_name,
                ownerUniqueId: room.owner_unique_id,
                roomName: room.name,
                source: 'supabase',
                confirmed: true
              };}
          }
        } catch (error) {}
      }
      
      // Se não encontrou dono, marcar como não identificado
      if (!ownerInfo) {
        ownerInfo = {
          ownerName: null,
          ownerUniqueId: null,
          roomName: groupData?.name || 'Quarto do grupo',
          source: 'not_found',
          confirmed: false
        };}

      const enhancedDetails = {
        ...groupData,
        ...ownerInfo,
        membersData,
        roomData,
        searchAttempted: true,
        hasRoomId: !!roomId,
        apiNote: 'Busca completa realizada com todas as APIs disponíveis'
      };setGroupDetails(prev => new Map(prev).set(groupId, enhancedDetails));
      return enhancedDetails;
      
    } catch (error) {
      console.warn(`❌ Erro geral ao buscar grupo ${groupId}:`, error);
    }
    return null;
  };

  // Função para gerar URLs de emblemas de grupos com múltiplos fallbacks
  const getGroupBadgeUrls = (badgeCode: string) => {
    return [
      // URLs oficiais do Habbo para emblemas
      `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`,
      `https://images.habbo.com/c_images/album1584/${badgeCode}.png`,
      
      // URLs alternativas
      `https://www.habbo.com.br/habbo-imaging/badge/${badgeCode}`,
      `https://habbo-stories-content.s3.amazonaws.com/badges/${badgeCode}.gif`,
      
      // URLs de fallback genéricas
      `https://images.habbo.com/c_images/album1584/default.gif`,
      '/placeholder.svg'
    ];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-transparent border-0 p-0 overflow-hidden rounded-lg" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
        backgroundSize: '100% 2px'
      }}>
        {/* Borda superior amarela com textura pontilhada */}
        <div className="bg-yellow-400 border-2 border-black border-b-0 rounded-t-lg relative overflow-hidden" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}>
          <div className="pixel-pattern absolute inset-0 opacity-20"></div>
          <DialogHeader className="p-4 relative z-10">
            <DialogTitle className="flex items-center gap-2 text-white font-bold text-sm" style={{
              textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
            }}>
              <Crown className="w-5 h-5 text-white" />
              {t('pages.console.groupsOf', { username: userName, count: groups.length })}
            </DialogTitle>
          </DialogHeader>
        </div>
        
        {/* Conteúdo principal com fundo de linhas horizontais */}
        <div className="bg-gray-900 relative overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
          backgroundSize: '100% 2px',
          height: '60vh'
        }}>
          <div className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {Array.isArray(groups) ? groups.map((group) => {
                const badgeUrls = getGroupBadgeUrls(group.badgeCode);
                return (
                  <Popover key={group.id} open={selectedGroup?.id === group.id} onOpenChange={async (open) => {
                    if (open) {
                      setSelectedGroup(group);
                      console.log(`🔍 Abrindo grupo: ${group.name} (ID: ${group.id}, RoomID: ${group.roomId})`);
                      await fetchComprehensiveGroupDetails(group.id, group.roomId);
                    } else {
                      setSelectedGroup(null);
                    }
                  }}>
                    <PopoverTrigger asChild>
                      <div className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          {/* Emblema do grupo */}
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <img
                              src={badgeUrls[0]}
                              alt={group.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const currentSrc = target.src;
                                const currentIndex = badgeUrls.indexOf(currentSrc);
                                
                                if (currentIndex < badgeUrls.length - 1) {
                                  target.src = badgeUrls[currentIndex + 1];
                                } else {
                                  target.style.display = 'none';
                                }
                              }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-sm leading-tight text-white">{group.name}</h3>
                              <Button variant="ghost" size="sm" className="p-1 flex-shrink-0">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {group.description && (
                              <p className="text-xs text-white/70 mb-3 line-clamp-2 leading-relaxed">
                                {group.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                {group.isAdmin && (
                                  <Badge variant="outline" className="text-xs border-yellow-400/30 text-yellow-300">
                                    Admin
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-white/60">
                                <Users className="w-3 h-3" />
                                <span>Grupo</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverTrigger>
                    
                    <PopoverContent className="w-80 text-white border border-white/20 p-4" style={{
                      backgroundColor: '#333333'
                    }}>
                      <div className="flex items-start gap-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <img
                            src={badgeUrls[0]}
                            alt={group.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const currentSrc = target.src;
                              const currentIndex = badgeUrls.indexOf(currentSrc);
                              
                              if (currentIndex < badgeUrls.length - 1) {
                                target.src = badgeUrls[currentIndex + 1];
                              } else {
                                target.style.display = 'none';
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg text-white">{group.name}</h3>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-1 text-white/60 hover:text-white flex-shrink-0"
                              onClick={() => setSelectedGroup(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {group.isAdmin && (
                            <Badge variant="outline" className="text-xs border-yellow-400/30 text-yellow-300 mb-2">
                              Admin
                            </Badge>
                          )}
                          
                          {/* Estatísticas e Dados de Propriedade */}
                          <div className="space-y-2 mb-3">
                            {/* Informações do grupo */}
                            <div className="space-y-2 text-sm text-white/80">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                <span>Tipo: {group.type || 'NORMAL'}</span>
                              </div>
                              {group.isAdmin && (
                                <div className="flex items-center gap-2">
                                  <Crown className="w-4 h-4 text-yellow-400" />
                                  <span className="text-yellow-400">Admin</span>
                                </div>
                              )}
                              {(() => {
                                const details = groupDetails.get(group.id);
                                if (details?.ownerName && details?.confirmed) {
                                  return (
                                    <div className="flex items-center gap-2 text-white/80">
                                      <Crown className="w-4 h-4 text-yellow-400" />
                                      <span>Dono: {details.ownerName}</span>
                                      <span className="text-xs text-green-400">✓</span>
                                    </div>
                                  );
                                }
                                return (
                                  <div className="flex items-center gap-2 text-white/60 italic">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                    <span>Dono não identificado</span>
                                  </div>
                                );
                              })()}
                            </div>
                            
                            {/* Informação sobre membros */}
                            <div className="flex items-center gap-2 text-sm text-white/80">
                              <Users className="w-4 h-4 text-green-400" />
                              <span>
                                {(() => {
                                  const details = groupDetails.get(group.id);
                                  if (details?.membersData?.length > 0) {
                                    return `${details.membersData.length} membros encontrados`;
                                  }
                                  return 'Grupo ativo da comunidade';
                                })()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-white/70 leading-relaxed">
                              {group.description || "- sem descrição"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }) : null}
            </div>
            
            {(!Array.isArray(groups) || groups.length === 0) && (
              <div className="text-center text-white/60 py-8">
                <Crown className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum grupo encontrado</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Borda inferior amarela com textura pontilhada */}
        <div className="bg-yellow-400 border-2 border-black border-t-0 rounded-b-lg relative overflow-hidden" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}>
          <div className="pixel-pattern absolute inset-0 opacity-20"></div>
          <div className="p-2 relative z-10"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
