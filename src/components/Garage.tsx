import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Zap, Gauge, Settings, Palette, ArrowRight, Check, Lock } from 'lucide-react';
import { CarConfig, CAR_MODELS, CarModelType, UPGRADE_COSTS } from '../types';

interface GarageProps {
  carConfig: CarConfig;
  setCarConfig: React.Dispatch<React.SetStateAction<CarConfig>>;
  money: number;
  setMoney: React.Dispatch<React.SetStateAction<number>>;
  onBack: () => void;
}

export const Garage: React.FC<GarageProps> = ({ carConfig, setCarConfig, money, setMoney, onBack }) => {
  const currentModel = CAR_MODELS[carConfig.model];

  const handleUpgrade = (type: 'engine' | 'tires' | 'turbo') => {
    const currentLevel = carConfig[type];
    if (currentLevel >= 5) return;
    
    const cost = UPGRADE_COSTS[currentLevel];
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setCarConfig(prev => ({ ...prev, [type]: currentLevel + 1 }));
    }
  };

  const selectModel = (modelId: CarModelType) => {
    setCarConfig(prev => ({ ...prev, model: modelId }));
  };

  const colors = ['#4ade80', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa', '#f472b6', '#ffffff', '#1f2937'];

  return (
    <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden flex flex-col md:flex-row h-[80vh]">
      {/* Sidebar - Navigation */}
      <div className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 p-6 space-y-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors uppercase font-bold text-xs tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Menu
        </button>

        <div className="space-y-4">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-cyan-400">Garage</h2>
          <div className="p-3 bg-zinc-800 rounded-sm border border-zinc-700">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Available Cash</p>
            <p className="text-xl font-black text-emerald-400">${money}</p>
          </div>
        </div>

        <nav className="space-y-2">
          <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest px-2">Customization</p>
          <button className="w-full text-left p-3 rounded-sm bg-cyan-500 text-black font-bold flex items-center gap-3">
            <Settings className="w-4 h-4" /> Performance
          </button>
          <button className="w-full text-left p-3 rounded-sm hover:bg-zinc-800 text-zinc-400 font-bold flex items-center gap-3 transition-colors">
            <Palette className="w-4 h-4" /> Visuals
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto space-y-12">
        {/* Car Model Selection */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Select Vehicle</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.values(CAR_MODELS)).map((model) => (
              <button
                key={model.id}
                onClick={() => selectModel(model.id)}
                className={`p-4 rounded-sm border transition-all text-left space-y-2 ${
                  carConfig.model === model.id 
                    ? 'bg-zinc-800 border-cyan-500 ring-1 ring-cyan-500' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-black italic uppercase text-lg">{model.name}</span>
                  {carConfig.model === model.id && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight uppercase">{model.description}</p>
                
                <div className="pt-2 space-y-1">
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${(model.baseStats.maxSpeed / 18000) * 100}%` }}></div>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(model.baseStats.accel / 8000) * 100}%` }}></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Performance Upgrades */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Performance Upgrades</h3>
          <div className="space-y-4">
            {[
              { id: 'engine', name: 'Engine Block', icon: Gauge, color: 'text-cyan-400', level: carConfig.engine },
              { id: 'tires', name: 'Racing Tires', icon: Settings, color: 'text-emerald-400', level: carConfig.tires },
              { id: 'turbo', name: 'Turbo Charger', icon: Zap, color: 'text-amber-400', level: carConfig.turbo },
            ].map((upgrade) => (
              <div key={upgrade.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-zinc-800 rounded-sm ${upgrade.color}`}>
                    <upgrade.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-tight">{upgrade.name}</h4>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((l) => (
                        <div 
                          key={l} 
                          className={`w-4 h-1.5 rounded-full ${l <= upgrade.level ? 'bg-cyan-500' : 'bg-zinc-800'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {upgrade.level < 5 ? (
                  <button
                    onClick={() => handleUpgrade(upgrade.id as any)}
                    disabled={money < UPGRADE_COSTS[upgrade.level]}
                    className={`flex items-center gap-2 py-2 px-4 rounded-sm font-bold uppercase text-xs transition-all ${
                      money >= UPGRADE_COSTS[upgrade.level]
                        ? 'bg-white text-black hover:bg-cyan-400'
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    Upgrade <ArrowRight className="w-3 h-3" /> ${UPGRADE_COSTS[upgrade.level]}
                  </button>
                ) : (
                  <span className="text-[10px] font-bold uppercase text-cyan-500 tracking-widest">Max Level</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Visual Customization */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Visual Customization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-zinc-400">Body Color</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setCarConfig(prev => ({ ...prev, color: c }))}
                    className={`w-10 h-10 rounded-sm border-2 transition-all ${
                      carConfig.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-zinc-400">Spoiler Style</h4>
              <div className="flex gap-2">
                {(['none', 'small', 'large'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setCarConfig(prev => ({ ...prev, spoiler: s }))}
                    className={`flex-1 py-2 px-3 rounded-sm border font-bold uppercase text-[10px] transition-all ${
                      carConfig.spoiler === s 
                        ? 'bg-zinc-800 border-cyan-500 text-white' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
