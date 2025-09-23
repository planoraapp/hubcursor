// Mapeamento de IDs internos do Habbo para UUIDs do Supabase
export const HABBO_ID_MAPPING: Record<string, string> = {
  'hhbr-81b7220d11b7a21997226bf7cfcbad51': '9f3776fd-8fcc-4415-8b22-20d610c7a178', // habbohub
  'hhbr-00e6988dddeb5a1838658c854d62fe49': 'f3830514-4a94-4fd5-87e9-7fdd0556b3d1'  // beebop
};

/**
 * Converte ID interno do Habbo para UUID do Supabase
 */
export const getSupabaseUserId = (habboId: string): string => {
  return HABBO_ID_MAPPING[habboId] || habboId;
};

/**
 * Verifica se é um usuário fictício (habbohub, beebop)
 */
export const isFictionalUser = (habboId: string): boolean => {
  return habboId.startsWith('hhbr-');
};
