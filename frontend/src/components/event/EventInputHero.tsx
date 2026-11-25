import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft, Globe, Compass, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { PRESET_SCENARIOS } from '../../services/mockData';

interface EventInputHeroProps {
  onAnalyze: (query: string) => void;
  isLoading?: boolean;
}

export const EventInputHero: React.FC<EventInputHeroProps> = ({ onAnalyze, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onAnalyze(query.trim());
  };

  const handleDropdownChange = (id: string) => {
    setSelectedPresetId(id);
    const found = PRESET_SCENARIOS.find((p) => p.id === id);
    if (found) {
      setQuery(found.query);
    }
  };

  return (
    <div className="card-terminal rounded-xl p-6 border border-slate-800 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-medium mb-1">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>GEOPOLITICAL EVENT INGESTION</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            What geopolitical event is being analyzed?
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Enter a natural-language description of an agricultural trade restriction, embargo, or corridor disruption.
            The Event Intelligence Agent will cross-reference GDELT and resolve structured shock parameters.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[11px] font-mono text-slate-400">Baseline perspective:</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold flex items-center space-x-1">
            <Globe className="w-3 h-3" />
            <span>INDIA</span>
          </span>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative z-10 space-y-3">
        <div className="relative flex items-center">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="e.g. Russia stopped importing wheat from India amid sanitary disputes and Black Sea freight risks..."
            rows={2}
            className="w-full bg-[#070b14]/90 border border-slate-700/80 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 resize-none font-sans leading-relaxed"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-3 bottom-3 px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-md text-xs font-mono font-semibold flex items-center space-x-2 shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting Event...</span>
              </>
            ) : (
              <>
                <span>Analyze Event →</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Scenarios Dropdown & Quick Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-mono text-cyan-400 font-semibold flex items-center space-x-1.5 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preset Scenarios:</span>
            </span>

            {/* Sleek Dropdown */}
            <div className="relative inline-block">
              <select
                value={selectedPresetId}
                onChange={(e) => handleDropdownChange(e.target.value)}
                className="bg-slate-900 border border-slate-700 hover:border-cyan-500 rounded-lg pl-3 pr-8 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 appearance-none cursor-pointer transition-colors shadow-inner max-w-[340px] sm:max-w-[440px] truncate"
              >
                <option value="">⚡ Select a Curated Geopolitical Scenario...</option>
                {PRESET_SCENARIOS.map((preset) => (
                  <option key={preset.id} value={preset.id} className="bg-slate-950 text-slate-100 py-1">
                    {preset.emoji} {preset.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Selected Preset Details Badge */}
            {selectedPresetId && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-medium">
                {(() => {
                  const p = PRESET_SCENARIOS.find((x) => x.id === selectedPresetId);
                  return p ? `HS4 ${p.hs4} • ${p.badge}` : '';
                })()}
              </span>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-500 hidden xl:flex items-center space-x-1">
            <CornerDownLeft className="w-3 h-3 text-slate-600" />
            <span>Select preset to populate query</span>
          </div>
        </div>
      </form>
    </div>
  );
};
