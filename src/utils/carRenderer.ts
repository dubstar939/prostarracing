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

const drawUnderglow = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string) => {
  ctx.save();
  ctx.shadowBlur = 30;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.6, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawTires = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, config: CarConfig) => {
  ctx.fillStyle = '#111';
  let tireWidth = w * 0.2 + (config.tires * 2);
  let tireHeight = h * 0.3;
  let tireY = y - h * 0.2;

  if (config.model === 'tank') {
    tireWidth *= 1.5;
    tireHeight *= 1.3;
    // Draw an extra set of wheels for the tank
    ctx.fillRect(x - w / 2 - tireWidth / 2 + 5, tireY - tireHeight * 0.8, tireWidth, tireHeight);
    ctx.fillRect(x + w / 2 - tireWidth / 2 - 5, tireY - tireHeight * 0.8, tireWidth, tireHeight);
  } else if (config.model === 'drifter') {
    tireWidth *= 1.3;
  }

  ctx.fillRect(x - w / 2 - tireWidth / 2 + 5, tireY, tireWidth, tireHeight);
  ctx.fillRect(x + w / 2 - tireWidth / 2 - 5, tireY, tireWidth, tireHeight);
};

const drawSpoiler = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, config: CarConfig) => {
  if (config.spoiler === 'none' && config.model !== 'interceptor') return;

  let wingHeight = 20;
  let wingWidth = w * 0.8;
  let mountOffset = 0.2;
  
  if (config.spoiler === 'small') {
    wingHeight = 25;
    wingWidth = w * 0.85;
  } else if (config.spoiler === 'large' || config.model === 'interceptor') {
    wingHeight = 45;
    wingWidth = w * 1.1;
    mountOffset = 0.3;
  }

  // Wing mounts
  ctx.fillStyle = '#111';
  ctx.fillRect(x - w * mountOffset - 2, y - h - wingHeight, 4, wingHeight + 10);
  ctx.fillRect(x + w * mountOffset - 2, y - h - wingHeight, 4, wingHeight + 10);

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

  // Wing Endplates
  if (config.spoiler === 'large' || config.model === 'interceptor') {
    ctx.fillStyle = config.color;
    ctx.fillRect(x - wingWidth / 2 - 2, y - h - wingHeight - 5, 4, 25);
    ctx.fillRect(x + wingWidth / 2 - 2, y - h - wingHeight - 5, 4, 25);
  }
};

const drawMainBody = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, config: CarConfig) => {
  const bodyGrad = ctx.createLinearGradient(x, y - h, x, y);
  bodyGrad.addColorStop(0, config.color);
  bodyGrad.addColorStop(1, shadeColor(config.color, -40));
  ctx.fillStyle = bodyGrad;
  
  ctx.beginPath();
  if (config.model === 'speedster') {
    ctx.moveTo(x - w / 2, y - h * 0.1);
    ctx.bezierCurveTo(x - w / 2, y - h * 0.3, x - w * 0.45, y - h * 0.5, x - w * 0.45, y - h * 0.5);
    ctx.lineTo(x + w * 0.45, y - h * 0.5);
    ctx.bezierCurveTo(x + w * 0.45, y - h * 0.5, x + w / 2, y - h * 0.3, x + w / 2, y - h * 0.1);
  } else if (config.model === 'tank') {
    ctx.moveTo(x - w * 0.55, y - h * 0.1);
    ctx.lineTo(x - w * 0.55, y - h * 0.6);
    ctx.lineTo(x + w * 0.55, y - h * 0.6);
    ctx.lineTo(x + w * 0.55, y - h * 0.1);
  } else if (config.model === 'drifter') {
    ctx.moveTo(x - w * 0.52, y - h * 0.1);
    ctx.lineTo(x - w * 0.48, y - h * 0.55);
    ctx.lineTo(x + w * 0.48, y - h * 0.55);
    ctx.lineTo(x + w * 0.52, y - h * 0.1);
  } else {
    ctx.moveTo(x - w / 2, y - h * 0.1);
    ctx.bezierCurveTo(x - w / 2, y - h * 0.4, x - w * 0.48, y - h * 0.6, x - w * 0.48, y - h * 0.6);
    ctx.lineTo(x + w * 0.48, y - h * 0.6);
    ctx.bezierCurveTo(x + w * 0.48, y - h * 0.6, x + w / 2, y - h * 0.4, x + w / 2, y - h * 0.1);
  }
  ctx.closePath();
  ctx.fill();
};

const drawCabin = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, config: CarConfig) => {
  ctx.fillStyle = shadeColor(config.color, -15);
  ctx.beginPath();
  if (config.model === 'tank') {
    ctx.moveTo(x - w * 0.45, y - h * 0.6);
    ctx.lineTo(x - w * 0.4, y - h * 1.1);
    ctx.lineTo(x + w * 0.4, y - h * 1.1);
    ctx.lineTo(x + w * 0.45, y - h * 0.6);
  } else if (config.model === 'speedster') {
    ctx.moveTo(x - w * 0.4, y - h * 0.5);
    ctx.bezierCurveTo(x - w * 0.35, y - h * 0.75, x - w * 0.25, y - h * 0.9, x - w * 0.25, y - h * 0.9);
    ctx.lineTo(x + w * 0.25, y - h * 0.9);
    ctx.bezierCurveTo(x + w * 0.25, y - h * 0.9, x + w * 0.35, y - h * 0.75, x + w * 0.4, y - h * 0.5);
  } else {
    ctx.moveTo(x - w * 0.42, y - h * 0.6);
    ctx.bezierCurveTo(x - w * 0.38, y - h * 0.85, x - w * 0.32, y - h, x - w * 0.32, y - h);
    ctx.lineTo(x + w * 0.32, y - h);
    ctx.bezierCurveTo(x + w * 0.32, y - h, x + w * 0.38, y - h * 0.85, x + w * 0.42, y - h * 0.6);
  }
  ctx.closePath();
  ctx.fill();

  // Roof Highlight
  const roofGrad = ctx.createLinearGradient(x, y - h, x, y - h + 10);
  roofGrad.addColorStop(0, 'rgba(255,255,255,0.3)');
  roofGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = roofGrad;
  ctx.fill();
};

const drawDecals = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, config: CarConfig) => {
  ctx.save();
  // Note: Clipping should be handled by the caller or we need the cabin path again.
  // For simplicity in this refactor, we assume the caller has set up clipping if needed, 
  // but here we just draw them.
  if (config.decal === 'stripes') {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(x - w / 10, y - h, w / 20, h);
    ctx.fillRect(x + w / 20, y - h, w / 20, h);
  } else if (config.decal === 'racing-number') {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y - h * 0.45, w / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.font = `bold ${h / 5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('86', x, y - h * 0.45);
  } else if (config.decal === 'flames') {
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.4, y - h * 0.3);
    ctx.quadraticCurveTo(x - w * 0.2, y - h * 0.5, x, y - h * 0.3);
    ctx.quadraticCurveTo(x + w * 0.2, y - h * 0.5, x + w * 0.4, y - h * 0.3);
    ctx.fill();
  } else if (config.decal === 'tribal') {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.3, y - h * 0.4);
    ctx.lineTo(x - w * 0.1, y - h * 0.2);
    ctx.lineTo(x + w * 0.1, y - h * 0.4);
    ctx.lineTo(x + w * 0.3, y - h * 0.2);
    ctx.stroke();
  }
  ctx.restore();
};

const drawWindows = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, damage: number) => {
  const winGrad = ctx.createLinearGradient(x, y - h + 15, x, y - h + 15 + h / 2.5);
  winGrad.addColorStop(0, '#1e293b');
  winGrad.addColorStop(0.5, '#334155');
  winGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = winGrad;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.28, y - h + 12);
  ctx.lineTo(x + w * 0.28, y - h + 12);
  ctx.lineTo(x + w * 0.38, y - h * 0.6 - 8);
  ctx.lineTo(x - w * 0.38, y - h * 0.6 - 8);
  ctx.closePath();
  ctx.fill();

  // Window Reflection
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.28, y - h + 12);
  ctx.lineTo(x, y - h + 12);
  ctx.lineTo(x + w * 0.1, y - h * 0.6 - 8);
  ctx.lineTo(x - w * 0.38, y - h * 0.6 - 8);
  ctx.fill();

  // Damage Cracks
  if (damage > 20) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.1, y - h + 20);
    ctx.lineTo(x + w * 0.1, y - h + 40);
    ctx.moveTo(x + w * 0.05, y - h + 25);
    ctx.lineTo(x - w * 0.05, y - h + 45);
    ctx.stroke();
  }
  if (damage > 60) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.2, y - h + 15);
    ctx.lineTo(x - w * 0.1, y - h + 35);
    ctx.stroke();
  }
};

const drawTailLights = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, config: CarConfig, isBraking: boolean) => {
  ctx.fillStyle = isBraking ? '#ff0000' : '#880000';
  ctx.shadowBlur = isBraking ? 45 : 15;
  ctx.shadowColor = '#ff0000';
  
  if (config.bodyKit === 'extreme') {
    ctx.fillRect(x - w * 0.45, y - h * 0.48, w * 0.9, h * 0.05);
  } else {
    ctx.beginPath();
    ctx.roundRect(x - w * 0.44, y - h * 0.52, w / 4, h / 10, 3);
    ctx.roundRect(x + w * 0.44 - w / 4, y - h * 0.52, w / 4, h / 10, 3);
    ctx.fill();
  }
  
  // Inner light glow
  ctx.fillStyle = isBraking ? '#ffffff' : '#ffcccc';
  ctx.shadowBlur = isBraking ? 25 : 10;
  if (config.bodyKit !== 'extreme') {
    ctx.beginPath();
    ctx.roundRect(x - w * 0.38, y - h * 0.5 + 1, w / 15, h / 20, 1);
    ctx.roundRect(x + w * 0.38 - w / 15, y - h * 0.5 + 1, w / 15, h / 20, 1);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  if (isBraking) {
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0000';
    ctx.fillRect(x - 15, y - h + 5, 30, 4);
    ctx.shadowBlur = 0;
  }

  // Interceptor flashing lights
  if (config.model === 'interceptor') {
    const flash = Math.floor(Date.now() / 200) % 2 === 0;
    ctx.fillStyle = flash ? '#0000ff' : '#ff0000';
    ctx.shadowBlur = 20;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fillRect(x - w * 0.2, y - h - 5, w * 0.4, 6);
    ctx.shadowBlur = 0;
  }
};

const drawExhaust = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, config: CarConfig) => {
  ctx.fillStyle = '#71717a';
  const exhaustSize = config.engine > 2 ? 14 : 10;
  
  if (config.bodyKit === 'extreme' || config.bodyKit === 'racing' || config.model === 'drifter') {
    const offset = config.model === 'drifter' ? 0.35 : 0.25;
    ctx.beginPath();
    ctx.arc(x - w * offset, y - 8, exhaustSize, 0, Math.PI * 2);
    ctx.arc(x - w * (offset - 0.1), y - 8, exhaustSize, 0, Math.PI * 2);
    ctx.arc(x + w * (offset - 0.1), y - 8, exhaustSize, 0, Math.PI * 2);
    ctx.arc(x + w * offset, y - 8, exhaustSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - w * offset, y - 8, exhaustSize - 3, 0, Math.PI * 2);
    ctx.arc(x - w * (offset - 0.1), y - 8, exhaustSize - 3, 0, Math.PI * 2);
    ctx.arc(x + w * (offset - 0.1), y - 8, exhaustSize - 3, 0, Math.PI * 2);
    ctx.arc(x + w * offset, y - 8, exhaustSize - 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x - w / 4, y - 8, exhaustSize, 0, Math.PI * 2);
    ctx.arc(x + w / 4, y - 8, exhaustSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - w / 4, y - 8, exhaustSize - 3, 0, Math.PI * 2);
    ctx.arc(x + w / 4, y - 8, exhaustSize - 3, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawLicensePlate = (ctx: CanvasRenderingContext2D, x: number, y: number, h: number, model: string) => {
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.roundRect(x - 22, y - h * 0.28, 44, 16, 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  const text = model === 'interceptor' ? 'POLICE' : 'DRIFT';
  ctx.fillText(text, x, y - h * 0.28 + 12);
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
  
  if (driftAngle !== 0) {
    ctx.translate(x, y - h/2);
    ctx.rotate(driftAngle);
    ctx.translate(-x, -(y - h/2));
  }

  let bodyWidthMultiplier = 1;
  if (config.bodyKit === 'street') bodyWidthMultiplier = 1.05;
  if (config.bodyKit === 'racing') bodyWidthMultiplier = 1.15;
  if (config.bodyKit === 'extreme') bodyWidthMultiplier = 1.25;

  const currentW = w * bodyWidthMultiplier;

  if (config.bodyKit === 'extreme') {
    drawUnderglow(ctx, x, y, currentW, config.color);
  }

  drawTires(ctx, x, y, currentW, h, config);
  drawSpoiler(ctx, x, y, currentW, h, config);
  drawMainBody(ctx, x, y, currentW, h, config);
  
  // Cabin and Decals with clipping
  ctx.save();
  // We need to re-trace the cabin path for clipping
  // To avoid duplication, we could have a getCabinPath helper, but for now we just draw it
  drawCabin(ctx, x, y, currentW, h, config);
  ctx.clip();
  drawDecals(ctx, x, y, currentW, h, config);
  ctx.restore();

  drawWindows(ctx, x, y, currentW, h, damage);
  drawTailLights(ctx, x, y, currentW, h, config, isBraking);
  drawExhaust(ctx, x, y, currentW, config);
  drawLicensePlate(ctx, x, y, h, config.model);

  ctx.restore();
};
