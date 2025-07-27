interface AdSpaceProps {
  type: 'square' | 'horizontal' | 'vertical' | 'wide' | 'banner' | 'medium' | 'skyscraper';
  className?: string;
}

export const AdSpace = ({ type, className = "" }: AdSpaceProps) => {
  const getAdConfig = () => {
    switch (type) {
      case 'square':
        return { width: '200px', height: '200px' };
      case 'horizontal':
        return { width: '100%', height: '90px', maxWidth: '728px' };
      case 'vertical':
        return { width: '160px', height: '600px' };
      case 'wide':
        return { width: '100%', height: '120px', maxWidth: '728px' };
      case 'banner':
        return { width: '468px', height: '60px' };
      case 'medium':
        return { width: '300px', height: '250px' };
      case 'skyscraper':
        return { width: '160px', height: '600px' };
      default:
        return { width: '200px', height: '200px' };
    }
  };

  const config = getAdConfig();

  return (
    <div 
      className={`bg-gray-100 border-2 border-gray-300 flex items-center justify-center mx-auto ${className}`}
      style={{
        width: config.width,
        height: config.height,
        maxWidth: config.maxWidth || 'auto'
      }}
    >
      <div className="text-gray-500 text-sm font-medium text-center px-4">
        <div>📺</div>
        <div className="mt-1">Espaço Publicitário</div>
        <div className="text-xs mt-1 opacity-75">{config.width} × {config.height}</div>
      </div>
    </div>
  );
};