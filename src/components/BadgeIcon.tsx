
interface BadgeIconProps {
  badgeCode: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BadgeIcon = ({ badgeCode, alt, size = 'md', className = '' }: BadgeIconProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // Mapear códigos de emblemas para arquivos locais
  const badgeFiles: Record<string, string> = {
    'ADM': '1044__-IT.png',
    'MOD': '1134__-3B0.png',
    'VIP': '1136__-4HX.png',
    'HC': '1197__-51B.png',
    'STAR': '1203__-1c1.png',
    'CROWN': '1211__-3V6.png',
    'DIAMOND': '1258__-0eH.png',
    'BUILDER': '1360__-3C7.png',
    'ARTIST': '1431__-RS.png',
    'HELPER': '1686__-sQ.png',
    'GUIDE': '1876__-6Ie.png',
    'EVENT': '1944__-vg.png',
    'COMP': '1965__-4fV.png',
    'WINNER': '1974__-301.png',
    'BASIC': '203__-100.png',
    'FRIEND': '2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png',
    'RARE1': '2403__-5t3.png',
    'RARE2': '2404__-5M9.png',
    'RARE3': '2408__-2bX.png',
    'CLASSIC': '264__-HG.png',
    'VINTAGE': '387__-4CK.png',
    'COLLECTOR': '522__-2uz.png',
    'TRADER': '522__-2uz.png',
    'PIXEL': '898_HabboToolbarCom_icon_pixel_0_png.png',
  };

  const fileName = badgeFiles[badgeCode] || badgeFiles['BASIC'];
  
  return (
    <div className={`flex items-center justify-center bg-gray-100 rounded border-2 border-gray-300 ${sizeClasses[size]} ${className}`}>
      <img 
        src={`/assets/${fileName}`}
        alt={alt || `Emblema ${badgeCode}`}
        className="w-full h-full object-contain p-1"
        onError={(e) => {
          // Fallback para um ícone padrão se a imagem não carregar
          e.currentTarget.src = '/assets/203__-100.png';
        }}
      />
    </div>
  );
};
