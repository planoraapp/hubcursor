
import { useEffect, useRef } from 'react';
import { useTopRooms } from '../hooks/useHabboData';

export const RoomsChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: topRooms, isLoading } = useTopRooms();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isLoading || !topRooms || topRooms.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sortedRooms = topRooms.slice(0, 5);
    const maxVisitors = Math.max(...sortedRooms.map(room => room.score));

    // Canvas setup
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;

    const padding = 60;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = chartWidth / sortedRooms.length;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    sortedRooms.forEach((room, index) => {
      const barHeight = maxVisitors > 0 ? (room.score / maxVisitors) * chartHeight : 0;
      const x = padding + index * barWidth + barWidth * 0.1;
      const y = canvas.height - padding - barHeight;
      const width = barWidth * 0.8;

      // Draw bar
      ctx.fillStyle = '#008800';
      ctx.fillRect(x, y, width, barHeight);

      // Draw value on top of bar
      ctx.fillStyle = '#38332c';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(room.score.toString(), x + width / 2, y - 5);

      // Draw room name
      ctx.save();
      ctx.translate(x + width / 2, canvas.height - padding + 20);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      const displayName = room.name.length > 12 ? room.name.substring(0, 12) + '...' : room.name;
      ctx.fillText(displayName, 0, 0);
      ctx.restore();
    });

    // Draw axes
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#38332c';
    ctx.font = '12px Inter';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = maxVisitors > 0 ? (maxVisitors / 5) * i : 0;
      const y = canvas.height - padding - (chartHeight / 5) * i;
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }

    // Draw title
    ctx.fillStyle = '#38332c';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Quartos Mais Visitados (Dados Reais)', canvas.width / 2, 25);

  }, [topRooms, isLoading]);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="w-full h-[300px] border border-gray-200 rounded-lg bg-[#f9f9f9] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados dos quartos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!topRooms || topRooms.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="w-full h-[300px] border border-gray-200 rounded-lg bg-[#f9f9f9] flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <p className="text-gray-600">Nenhum dado de quartos disponível</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-[300px] border border-gray-200 rounded-lg bg-[#f9f9f9]"
      />
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>📊 Baseado em dados reais da API do Habbo BR • Atualizado em tempo real</p>
      </div>
    </div>
  );
};
