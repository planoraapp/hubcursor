const fs = require('fs');
const { createCanvas } = require('canvas');

// Criar canvas
const canvas = createCanvas(200, 120);
const ctx = canvas.getContext('2d');

// Fundo verde (Brasil)
ctx.fillStyle = '#009639';
ctx.fillRect(0, 0, 100, 120);

// Fundo verde (Portugal)
ctx.fillStyle = '#046A38';
ctx.fillRect(100, 0, 100, 120);

// Linha divisória dourada
ctx.strokeStyle = '#FEDD00';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(100, 0);
ctx.lineTo(100, 120);
ctx.stroke();

// Texto BR/PT
ctx.fillStyle = 'white';
ctx.font = 'bold 20px Arial';
ctx.textAlign = 'center';
ctx.fillText('BR/PT', 100, 65);

// Salvar como PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('public/assets/flagbrpt.png', buffer);

console.log('Bandeira PT/BR criada com sucesso!');
