import { CarConfig } from '../types';

export const shadeColor = (color: string, percent: number) => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = Math.floor(R * (100 + percent) / 100);
  G = Math.floor(G * (100 + percent) / 100);
  B = Math.floor(B * (100 + percent) / 100);
  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;
  const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
  const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
  const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));
  return "#" + RR + GG + BB;
};

export const drawCar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  config: CarConfig,
  isBraking: boolean = false,
  damage: number = 0,
  driftAngle: number = 0
) => {
  ctx.save();
  
  // Apply drift rotation
  if (driftAngle !== 0) {
    ctx.translate(x, y - h/2);
    ctx.rotate(driftAngle);
    ctx.translate(-x, -(y - h/2));
  }

  // Body Kit Width Multiplier
  let bodyWidthMultiplier = 1;
  if (config.bodyKit === 'street') bodyWidthMultiplier = 1.05;
  if (config.bodyKit === 'racing') bodyWidthMultiplier = 1.15;
  if (config.bodyKit === 'extreme') bodyWidthMultiplier = 1.25;

  const currentW = w * bodyWidthMultiplier;

  // --- UNDERGLOW (Extreme Kit) ---
  if (config.bodyKit === 'extreme') {
    ctx.shadowBlur = 30;
    ctx.shadowColor = config.color;
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.ellipse(x, y, currentW * 0.6, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // --- TIRES & RIMS ---
  ctx.fillStyle = '#111';
  const tireWidth = currentW * 0.2 + (config.tires * 2); // Better tires = wider
  ctx.fillRect(x - currentW / 2 - tireWidth/2 + 5, y - h * 0.2, tireWidth, h * 0.3);
  ctx.fillRect(x + currentW / 2 - tireWidth/2 - 5, y - h * 0.2, tireWidth, h * 0.3);

  // --- SPOILER ---
  if (config.spoiler !== 'none') {
    let wingHeight = 20;
    let wingWidth = currentW * 0.8;
    let mountOffset = 0.2;
    
    if (config.spoiler === 'small') {
      wingHeight = 25;
      wingWidth = currentW * 0.85;
    } else if (config.spoiler === 'large') {
      wingHeight = 45;
      wingWidth = currentW * 1.1;
      mountOffset = 0.3;
    }

    // Wing mounts
    ctx.fillStyle = '#111';
    ctx.fillRect(x - currentW * mountOffset - 2, y - h - wingHeight, 4, wingHeight + 10);
    ctx.fillRect(x + currentW * mountOffset - 2, y - h - wingHeight, 4, wingHeight + 10);

    // Main Wing
    const wingGrad = ctx.createLinearGradient(x, y - h - wingHeight, x, y - h - wingHeight + 10);
    wingGrad.addColorStop(0, '#333');
    wingGrad.addColorStop(1, '#000');
    ctx.fillStyle = wingGrad;
    
    ctx.beginPath();
    ctx.moveTo(x - wingWidth / 2, y - h - wingHeight);
    ctx.lineTo(x + wingWidth / 2, y - h - wingHeight);
    ctx.lineTo(x + wingWidth / 2 - 5, y - h - wingHeight + 12);
    ctx.lineTo(x - wingWidth / 2 + 5, y - h - wingHeight + 12);
    ctx.closePath();
    ctx.fill();

    // Wing Endplates (Large spoiler)
    if (config.spoiler === 'large') {
      ctx.fillStyle = config.color;
      ctx.fillRect(x - wingWidth / 2 - 2, y - h - wingHeight - 5, 4, 25);
      ctx.fillRect(x + wingWidth / 2 - 2, y - h - wingHeight - 5, 4, 25);
    }
  }

  // --- LOWER BODY (Widebody & Bumpers) ---
  const bodyGrad = ctx.createLinearGradient(x, y - h, x, y);
  bodyGrad.addColorStop(0, config.color);
  bodyGrad.addColorStop(1, shadeColor(config.color, -40));
  ctx.fillStyle = bodyGrad;
  
  ctx.beginPath();
  ctx.moveTo(x - currentW / 2, y - h * 0.1);
  ctx.bezierCurveTo(x - currentW / 2, y - h * 0.4, x - currentW * 0.48, y - h * 0.6, x - currentW * 0.48, y - h * 0.6);
  ctx.lineTo(x + currentW * 0.48, y - h * 0.6);
  ctx.bezierCurveTo(x + currentW * 0.48, y - h * 0.6, x + currentW / 2, y - h * 0.4, x + currentW / 2, y - h * 0.1);
  ctx.closePath();
  ctx.fill();

  // --- BODY KITS DETAILS ---
  if (config.bodyKit === 'street' || config.bodyKit === 'racing' || config.bodyKit === 'extreme') {
    // Side Skirts
    ctx.fillStyle = '#111';
    ctx.fillRect(x - currentW / 2 - 5, y - h * 0.15, 10, h * 0.1);
    ctx.fillRect(x + currentW / 2 - 5, y - h * 0.15, 10, h * 0.1);
  }
  
  if (config.bodyKit === 'racing' || config.bodyKit === 'extreme') {
    // Vents
    ctx.fillStyle = '#000';
    ctx.fillRect(x - currentW * 0.45, y - h * 0.4, 10, 25);
    ctx.fillRect(x + currentW * 0.45 - 10, y - h * 0.4, 10, 25);
  }

  if (config.bodyKit === 'extreme') {
    // Massive Rear Diffuser
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.moveTo(x - currentW * 0.4, y - h * 0.1);
    ctx.lineTo(x + currentW * 0.4, y - h * 0.1);
    ctx.lineTo(x + currentW * 0.45, y + 5);
    ctx.lineTo(x - currentW * 0.45, y + 5);
    ctx.fill();
    
    // Diffuser Fins
    ctx.fillStyle = '#222';
    for(let i = -3; i <= 3; i++) {
      ctx.fillRect(x + i * (currentW * 0.1) - 2, y - h * 0.1, 4, h * 0.2);
    }
  } else {
    // Standard Rear Bumper
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.roundRect(x - currentW / 2, y - h * 0.18, currentW, h * 0.18, 5);
    ctx.fill();
  }

  // --- UPPER CABIN ---
  ctx.fillStyle = shadeColor(config.color, -15);
  ctx.beginPath();
  ctx.moveTo(x - currentW * 0.42, y - h * 0.6);
  ctx.bezierCurveTo(x - currentW * 0.38, y - h * 0.85, x - currentW * 0.32, y - h, x - currentW * 0.32, y - h);
  ctx.lineTo(x + currentW * 0.32, y - h);
  ctx.bezierCurveTo(x + currentW * 0.32, y - h, x + currentW * 0.38, y - h * 0.85, x + currentW * 0.42, y - h * 0.6);
  ctx.closePath();
  ctx.fill();

  // Roof Highlight
  const roofGrad = ctx.createLinearGradient(x, y - h, x, y - h + 10);
  roofGrad.addColorStop(0, 'rgba(255,255,255,0.3)');
  roofGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = roofGrad;
  ctx.fill();

  // --- DECALS ---
  ctx.save();
  ctx.clip(); // Clip decals to cabin shape
  if (config.decal === 'stripes') {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(x - currentW / 10, y - h, currentW / 20, h);
    ctx.fillRect(x + currentW / 20, y - h, currentW / 20, h);
  } else if (config.decal === 'racing-number') {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y - h * 0.45, currentW / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.font = `bold ${h / 5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('86', x, y - h * 0.45);
  } else if (config.decal === 'flames') {
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(x - currentW * 0.4, y - h * 0.3);
    ctx.quadraticCurveTo(x - currentW * 0.2, y - h * 0.5, x, y - h * 0.3);
    ctx.quadraticCurveTo(x + currentW * 0.2, y - h * 0.5, x + currentW * 0.4, y - h * 0.3);
    ctx.fill();
  } else if (config.decal === 'tribal') {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - currentW * 0.3, y - h * 0.4);
    ctx.lineTo(x - currentW * 0.1, y - h * 0.2);
    ctx.lineTo(x + currentW * 0.1, y - h * 0.4);
    ctx.lineTo(x + currentW * 0.3, y - h * 0.2);
    ctx.stroke();
  }
  ctx.restore();

  // --- REAR WINDOW ---
  const winGrad = ctx.createLinearGradient(x, y - h + 15, x, y - h + 15 + h / 2.5);
  winGrad.addColorStop(0, '#1e293b');
  winGrad.addColorStop(0.5, '#334155');
  winGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = winGrad;
  ctx.beginPath();
  ctx.moveTo(x - currentW * 0.28, y - h + 12);
  ctx.lineTo(x + currentW * 0.28, y - h + 12);
  ctx.lineTo(x + currentW * 0.38, y - h * 0.6 - 8);
  ctx.lineTo(x - currentW * 0.38, y - h * 0.6 - 8);
  ctx.closePath();
  ctx.fill();

  // Window Reflection
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.moveTo(x - currentW * 0.28, y - h + 12);
  ctx.lineTo(x, y - h + 12);
  ctx.lineTo(x + currentW * 0.1, y - h * 0.6 - 8);
  ctx.lineTo(x - currentW * 0.38, y - h * 0.6 - 8);
  ctx.fill();

  // Damage Cracks
  if (damage > 20) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - currentW * 0.1, y - h + 20);
    ctx.lineTo(x + currentW * 0.1, y - h + 40);
    ctx.moveTo(x + currentW * 0.05, y - h + 25);
    ctx.lineTo(x - currentW * 0.05, y - h + 45);
    ctx.stroke();
  }
  if (damage > 60) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(x - currentW * 0.2, y - h + 15);
    ctx.lineTo(x - currentW * 0.1, y - h + 35);
    ctx.stroke();
  }

  // --- TAIL LIGHTS ---
  ctx.fillStyle = isBraking ? '#ff0000' : '#880000';
  ctx.shadowBlur = isBraking ? 45 : 15;
  ctx.shadowColor = '#ff0000';
  
  if (config.bodyKit === 'extreme') {
    // Cyberpunk style light bar
    ctx.fillRect(x - currentW * 0.45, y - h * 0.48, currentW * 0.9, h * 0.05);
  } else {
    // Standard dual lights
    ctx.beginPath();
    ctx.roundRect(x - currentW * 0.44, y - h * 0.52, currentW / 4, h / 10, 3);
    ctx.roundRect(x + currentW * 0.44 - currentW / 4, y - h * 0.52, currentW / 4, h / 10, 3);
    ctx.fill();
  }
  
  // Inner light glow
  ctx.fillStyle = isBraking ? '#ffffff' : '#ffcccc';
  ctx.shadowBlur = isBraking ? 25 : 10;
  if (config.bodyKit !== 'extreme') {
    ctx.beginPath();
    ctx.roundRect(x - currentW * 0.38, y - h * 0.5 + 1, currentW / 15, h / 20, 1);
    ctx.roundRect(x + currentW * 0.38 - currentW / 15, y - h * 0.5 + 1, currentW / 15, h / 20, 1);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Third Brake Light
  if (isBraking) {
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0000';
    ctx.fillRect(x - 15, y - h + 5, 30, 4);
    ctx.shadowBlur = 0;
  }

  // --- EXHAUST PIPES ---
  ctx.fillStyle = '#71717a';
  const exhaustSize = config.engine > 2 ? 14 : 10;
  
  if (config.bodyKit === 'extreme' || config.bodyKit === 'racing') {
    // Quad exhaust
    ctx.beginPath();
    ctx.arc(x - currentW * 0.3, y - 8, exhaustSize, 0, Math.PI * 2);
    ctx.arc(x - currentW * 0.2, y - 8, exhaustSize, 0, Math.PI * 2);
    ctx.arc(x + currentW * 0.2, y - 8, exhaustSize, 0, Math.PI * 2);
    ctx.arc(x + currentW * 0.3, y - 8, exhaustSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - currentW * 0.3, y - 8, exhaustSize - 3, 0, Math.PI * 2);
    ctx.arc(x - currentW * 0.2, y - 8, exhaustSize - 3, 0, Math.PI * 2);
    ctx.arc(x + currentW * 0.2, y - 8, exhaustSize - 3, 0, Math.PI * 2);
    ctx.arc(x + currentW * 0.3, y - 8, exhaustSize - 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Dual exhaust
    ctx.beginPath();
    ctx.arc(x - currentW / 4, y - 8, exhaustSize, 0, Math.PI * 2);
    ctx.arc(x + currentW / 4, y - 8, exhaustSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - currentW / 4, y - 8, exhaustSize - 3, 0, Math.PI * 2);
    ctx.arc(x + currentW / 4, y - 8, exhaustSize - 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- LICENSE PLATE ---
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.roundRect(x - 22, y - h * 0.28, 44, 16, 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DRIFT', x, y - h * 0.28 + 12);

  ctx.restore();
};
