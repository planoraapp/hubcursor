
interface PageBackgroundProps {
  children: React.ReactNode;
}

export const PageBackground = ({ children }: PageBackgroundProps) => {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-repeat"
      style={{
        backgroundImage: 'url(/assets/bghabbohub.png)',
        backgroundSize: 'auto'
      }}
    >
      <div className="min-h-screen bg-white/80 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
};
