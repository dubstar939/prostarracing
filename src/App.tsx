import React, { useState } from 'react';
import { tracks } from './data/tracks';
import { TrackViewer } from './components/TrackViewer';
import { Flag } from 'lucide-react';

export default function App() {
  const [activeTrackId, setActiveTrackId] = useState(tracks[0].id);
  const activeTrack = tracks.find(t => t.id === activeTrackId) || tracks[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-zinc-800">
      {/* Top Navigation */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flag className="text-white" size={24} />
            <h1 className="text-xl font-black tracking-tighter uppercase italic">
              Pro Star <span className="text-zinc-500">Racing</span>
            </h1>
          </div>
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Track Blueprint Database
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-2">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2 px-2">
            Select Track
          </div>
          {tracks.map(track => (
            <button
              key={track.id}
              onClick={() => setActiveTrackId(track.id)}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-between group ${
                activeTrackId === track.id 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <span className="uppercase tracking-wide text-sm">{track.name}</span>
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${activeTrackId === track.id ? 'scale-100' : 'scale-0 group-hover:scale-50'}`}
                style={{ backgroundColor: track.themeColor, boxShadow: `0 0 10px ${track.themeColor}` }}
              />
            </button>
          ))}
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <TrackViewer track={activeTrack} />
        </div>
      </main>
    </div>
  );
}
