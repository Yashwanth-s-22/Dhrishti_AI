import React from 'react';
import { Database, Cpu, Network, UserCheck, Sparkles, FileSpreadsheet } from 'lucide-react';

interface ProvenanceTagProps {
  tag: string;
  size?: 'sm' | 'md';
}

export function formatProvenanceLabel(rawTag: string): string {
  if (!rawTag) return 'Verified Data';
  const clean = rawTag.replace(/^\[+|\]+$/g, '').trim();
  const upper = clean.toUpperCase();

  if (upper.includes('CHAMPION')) return 'Forecast Model';
  if (upper.includes('ML') || upper.includes('INFERENCE') || upper.includes('MODEL OUTPUT') || upper.includes('MODEL CASCADE')) return 'Model Projection';
  if (upper.includes('FALLBACK') || upper.includes('BASELINE')) return 'Baseline Estimate';
  if (upper.includes('PROXY') || upper.includes('SECTORAL')) return 'Sectoral Projection';
  if (upper.includes('UNAVAILABLE') || upper.includes('UNOBSERVED')) return 'Projected Corridor';
  if (upper.includes('PORT') || upper.includes('MOPSW')) return 'Port Authority Statistics';
  if (upper.includes('AGRICULTURE') || upper.includes('DES DATA') || upper.includes('DES HISTORICAL')) return 'Agricultural Statistics';
  if (upper.includes('RAVS')) return 'Vulnerability Index';
  if (upper.includes('GRAPH') || upper.includes('TOPOLOGY') || upper.includes('MULTIDIGRAPH')) return 'Supply Chain Network';
  if (upper.includes('USER') || upper.includes('CLI')) return 'Scenario Parameter';
  if (upper.includes('LLM')) return 'Strategic Synthesis';
  if (upper.includes('GDELT')) return 'Event Intelligence';
  if (upper.includes('MCP') || upper.includes('STORE')) return 'Historical Precedent Database';
  if (upper.includes('STAKEHOLDER')) return 'Distribution Model';
  if (upper.includes('AUDIT')) return 'Audit Trail Verified';
  
  return clean;
}

export const ProvenanceTag: React.FC<ProvenanceTagProps> = ({ tag, size = 'sm' }) => {
  const label = formatProvenanceLabel(tag);

  const getIcon = () => {
    const upper = (tag || '').toUpperCase();
    if (upper.includes('ML')) return <Cpu className="w-3 h-3 text-purple-400" />;
    if (upper.includes('GRAPH')) return <Network className="w-3 h-3 text-cyan-400" />;
    if (upper.includes('PORT') || upper.includes('AGRICULTURE') || upper.includes('DES')) return <FileSpreadsheet className="w-3 h-3 text-emerald-400" />;
    if (upper.includes('USER') || upper.includes('CLI')) return <UserCheck className="w-3 h-3 text-amber-400" />;
    if (upper.includes('LLM')) return <Sparkles className="w-3 h-3 text-sky-400" />;
    return <Database className="w-3 h-3 text-slate-400" />;
  };

  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center space-x-1.5 font-mono bg-slate-900/80 border border-slate-800 text-slate-300 rounded ${sizeClass}`}>
      {getIcon()}
      <span className="tracking-tight">{label}</span>
    </span>
  );
};
