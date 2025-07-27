
import { useEffect, useRef } from 'react';
import { mockData } from '../data/mockData';

export const RoomsChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sortedRooms = [...mockData.rooms].sort((a, b) => b.visitors - a.visitors).slice(0, 5);
    const maxVisitors = Math.max(...sortedRooms.map(room => room.visitors));

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
      const barHeight = (room.visitors / maxVisitors) * chartHeight;
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
      ctx.fillText(room.visitors.toString(), x + width / 2, y - 5);

      // Draw room name
      ctx.save();
      ctx.translate(x + width / 2, canvas.height - padding + 20);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.fillText(room.name.length > 12 ? room.name.substring(0, 12) + '...' : room.name, 0, 0);
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
      const value = (maxVisitors / 5) * i;
      const y = canvas.height - padding - (chartHeight / 5) * i;
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-[300px] border border-gray-200 rounded-lg bg-[#f9f9f9]"
      />
    </div>
  );
};
