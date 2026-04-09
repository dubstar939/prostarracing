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
  const tireWidth = (w * 0.2 + (config.tires * 2)) * (config.model === 'tank' ? 1.5 : (config.model === 'drifter' ? 1.2 : 1.1));
  const tireHeight = h * 0.35;
  const tireY = y - h * 0.15;

  const drawWheel = (wx: number, wy: number) => {
    // Tire
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.roundRect(wx - tireWidth / 2, wy - tireHeight / 2, tireWidth, tireHeight, 4);
    ctx.fill();

    // Rim
    const rimSize = tireWidth * 0.7;
    const rimGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, rimSize / 2);
    rimGrad.addColorStop(0, '#d1d5db');
    rimGrad.addColorStop(1, '#4b5563');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(wx, wy, rimSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Spokes
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx + Math.cos(angle) * rimSize / 2.2, wy + Math.sin(angle) * rimSize / 2.2);
      ctx.stroke();
    }
  };

  drawWheel(x - w * 0.4, tireY);
  drawWheel(x + w * 0.4, tireY);
  
  if (config.model === 'tank') {
    drawWheel(x - w * 0.4, tireY - tireHeight * 0.8);
    drawWheel(x + w * 0.4, tireY - tireHeight * 0.8);
  }
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

const drawMainBody = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, config: CarConfig, damage: number, driftAngle: number) => {
  // PBR-like Base Color with soft gradients
  const bodyGrad = ctx.createLinearGradient(x, y - h, x, y);
  bodyGrad.addColorStop(0, shadeColor(config.color, 10));
  bodyGrad.addColorStop(0.4, config.color);
  bodyGrad.addColorStop(1, shadeColor(config.color, -30));
  ctx.fillStyle = bodyGrad;
  
  // 2.5D Side Panel for depth
  const sideWidth = Math.abs(driftAngle) * 50;
  if (sideWidth > 2) {
    const sideGrad = ctx.createLinearGradient(x, y - h, x, y);
    sideGrad.addColorStop(0, shadeColor(config.color, -20));
    sideGrad.addColorStop(1, shadeColor(config.color, -60));
    ctx.fillStyle = sideGrad;
    ctx.beginPath();
    const sideX = driftAngle > 0 ? x - w/2 : x + w/2;
    const dir = driftAngle > 0 ? -1 : 1;
    ctx.moveTo(sideX, y - h * 0.1);
    ctx.lineTo(sideX + dir * sideWidth, y - h * 0.2);
    ctx.lineTo(sideX + dir * sideWidth, y - h * 0.6);
    ctx.lineTo(sideX, y - h * 0.5);
    ctx.fill();
  }

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  
  const dent = (val: number) => {
    if (damage < 25) return val;
    return val + (Math.random() - 0.5) * (damage / 8);
  };

  // Simplified clean low-poly geometry
  if (config.model === 'speedster') {
    ctx.moveTo(dent(x - w * 0.48), dent(y - h * 0.05));
    ctx.lineTo(dent(x - w * 0.45), dent(y - h * 0.55));
    ctx.lineTo(dent(x + w * 0.45), dent(y - h * 0.55));
    ctx.lineTo(dent(x + w * 0.48), dent(y - h * 0.05));
  } else if (config.model === 'tank') {
    ctx.moveTo(dent(x - w * 0.52), dent(y - h * 0.05));
    ctx.lineTo(dent(x - w * 0.52), dent(y - h * 0.65));
    ctx.lineTo(dent(x + w * 0.52), dent(y - h * 0.65));
    ctx.lineTo(dent(x + w * 0.52), dent(y - h * 0.05));
  } else if (config.model === 'drifter') {
    ctx.moveTo(dent(x - w * 0.5), dent(y - h * 0.05));
    ctx.lineTo(dent(x - w * 0.42), dent(y - h * 0.58));
    ctx.lineTo(dent(x + w * 0.42), dent(y - h * 0.58));
    ctx.lineTo(dent(x + w * 0.5), dent(y - h * 0.05));
  } else {
    ctx.moveTo(dent(x - w * 0.46), dent(y - h * 0.05));
    ctx.lineTo(dent(x - w * 0.44), dent(y - h * 0.6));
    ctx.lineTo(dent(x + w * 0.44), dent(y - h * 0.6));
    ctx.lineTo(dent(x + w * 0.46), dent(y - h * 0.05));
  }
  ctx.closePath();
  ctx.fill();

  // Panel Lines & Stylized Details
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // Trunk line
  ctx.moveTo(x - w * 0.35, y - h * 0.3);
  ctx.lineTo(x + w * 0.35, y - h * 0.3);
  // Vertical split
  ctx.moveTo(x, y - h * 0.1);
  ctx.lineTo(x, y - h * 0.3);
  ctx.stroke();

  // 939PRO Neon Trim Lines
  ctx.strokeStyle = shadeColor(config.color, 50);
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.4, y - h * 0.1);
  ctx.lineTo(x - w * 0.4, y - h * 0.4);
  ctx.moveTo(x + w * 0.4, y - h * 0.1);
  ctx.lineTo(x + w * 0.4, y - h * 0.4);
  ctx.stroke();
  ctx.shadowBlur = 0;
};

const drawCabin = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, config: CarConfig) => {
  const cabinColor = shadeColor(config.color, -20);
  ctx.fillStyle = cabinColor;
  ctx.beginPath();
  if (config.model === 'tank') {
    ctx.moveTo(x - w * 0.42, y - h * 0.65);
    ctx.lineTo(x - w * 0.38, y - h * 1.15);
    ctx.lineTo(x + w * 0.38, y - h * 1.15);
    ctx.lineTo(x + w * 0.42, y - h * 0.65);
  } else if (config.model === 'speedster') {
    ctx.moveTo(x - w * 0.38, y - h * 0.55);
    ctx.lineTo(x - w * 0.22, y - h * 0.95);
    ctx.lineTo(x + w * 0.22, y - h * 0.95);
    ctx.lineTo(x + w * 0.38, y - h * 0.55);
  } else {
    ctx.moveTo(x - w * 0.4, y - h * 0.6);
    ctx.lineTo(x - w * 0.3, y - h * 1.05);
    ctx.lineTo(x + w * 0.3, y - h * 1.05);
    ctx.lineTo(x + w * 0.4, y - h * 0.6);
  }
  ctx.closePath();
  ctx.fill();

  // Roof Highlight (Soft PBR Gradient)
  const roofGrad = ctx.createLinearGradient(x, y - h * 1.1, x, y - h * 0.6);
  roofGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
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
  const winGrad = ctx.createLinearGradient(x, y - h * 1.0, x, y - h * 0.6);
  winGrad.addColorStop(0, '#1e293b');
  winGrad.addColorStop(0.6, '#334155');
  winGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = winGrad;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.28, y - h * 1.0);
  ctx.lineTo(x + w * 0.28, y - h * 1.0);
  ctx.lineTo(x + w * 0.38, y - h * 0.65);
  ctx.lineTo(x - w * 0.38, y - h * 0.65);
  ctx.closePath();
  ctx.fill();

  // Glass Reflection (Stylized)
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.25, y - h * 0.98);
  ctx.lineTo(x - w * 0.05, y - h * 0.98);
  ctx.lineTo(x + w * 0.05, y - h * 0.68);
  ctx.lineTo(x - w * 0.35, y - h * 0.68);
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

const drawTailLights = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, config: CarConfig, isBraking: boolean, damage: number) => {
  const leftLightOut = damage > 50 && Math.random() > 0.95; // Flickering or out
  const rightLightOut = damage > 70 && Math.random() > 0.98;
  const bothOut = damage > 90;

  const drawLight = (lx: number, ly: number, lw: number, lh: number, isOut: boolean) => {
    if (isOut || bothOut) {
      ctx.fillStyle = '#220000';
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = isBraking ? '#ff0000' : '#880000';
      ctx.shadowBlur = isBraking ? 45 : 15;
      ctx.shadowColor = '#ff0000';
    }
    ctx.beginPath();
    ctx.roundRect(lx, ly, lw, lh, 3);
    ctx.fill();
  };

  if (config.bodyKit === 'extreme') {
    ctx.fillStyle = isBraking ? '#ff0000' : '#880000';
    ctx.shadowBlur = isBraking ? 45 : 15;
    ctx.shadowColor = '#ff0000';
    if (damage > 80) ctx.globalAlpha = 0.3;
    ctx.fillRect(x - w * 0.45, y - h * 0.48, w * 0.9, h * 0.05);
    ctx.globalAlpha = 1.0;
  } else {
    drawLight(x - w * 0.44, y - h * 0.52, w / 4, h / 10, leftLightOut);
    drawLight(x + w * 0.44 - w / 4, y - h * 0.52, w / 4, h / 10, rightLightOut);
  }
  
  // Inner light glow
  if (!bothOut) {
    ctx.fillStyle = isBraking ? '#ffffff' : '#ffcccc';
    ctx.shadowBlur = isBraking ? 25 : 10;
    if (config.bodyKit !== 'extreme') {
      if (!leftLightOut) ctx.beginPath(), ctx.roundRect(x - w * 0.38, y - h * 0.5 + 1, w / 15, h / 20, 1), ctx.fill();
      if (!rightLightOut) ctx.beginPath(), ctx.roundRect(x + w * 0.38 - w / 15, y - h * 0.5 + 1, w / 15, h / 20, 1), ctx.fill();
    }
  }
  ctx.shadowBlur = 0;

  if (isBraking && damage < 95) {
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

const drawBoostFlames = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.save();
  const time = Date.now() / 50;
  const flameW = w * 0.15;
  const flameH = h * 0.8;
  
  const drawFlame = (fx: number, fy: number) => {
    const grad = ctx.createLinearGradient(fx, fy, fx, fy + flameH);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.2, '#00ffff');
    grad.addColorStop(0.5, '#0066ff');
    grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = grad;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    
    ctx.beginPath();
    ctx.moveTo(fx - flameW/2, fy);
    ctx.lineTo(fx + flameW/2, fy);
    ctx.lineTo(fx + (Math.sin(time) * 5), fy + flameH + (Math.cos(time) * 10));
    ctx.fill();
  };

  drawFlame(x - w * 0.25, y - 5);
  drawFlame(x + w * 0.25, y - 5);
  ctx.restore();
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
  driftAngle: number = 0,
  isBoosting: boolean = false
) => {
  ctx.save();
  
  if (isBoosting) {
    drawBoostFlames(ctx, x, y, w, h);
  }
  
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
  drawMainBody(ctx, x, y, currentW, h, config, damage, driftAngle);
  
  // Cabin and Decals with clipping
  ctx.save();
  // We need to re-trace the cabin path for clipping
  // To avoid duplication, we could have a getCabinPath helper, but for now we just draw it
  drawCabin(ctx, x, y, currentW, h, config);
  ctx.clip();
  drawDecals(ctx, x, y, currentW, h, config);
  ctx.restore();

  drawWindows(ctx, x, y, currentW, h, damage);
  drawTailLights(ctx, x, y, currentW, h, config, isBraking, damage);
  drawExhaust(ctx, x, y, currentW, config);
  drawLicensePlate(ctx, x, y, h, config.model);

  // Damage Smoke Indicator
  if (damage > 70) {
    ctx.fillStyle = 'rgba(50, 50, 50, 0.4)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x + (Math.random() - 0.5) * 40, y - h - 10 - Math.random() * 20, 10 + Math.random() * 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
};
