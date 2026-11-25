import React, { useEffect, useState } from 'react';
import { Radio, RefreshCw, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { DrishtiLogo } from '../common/DrishtiLogo';
import { DrishtiAPI } from '../../services/api';
import { DrishtiAnalysisResult } from '../../types/drishti';

interface HeaderProps {
  currentScenario?: DrishtiAnalysisResult;
  onRefresh?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onRefresh,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  const [apiHealth, setApiHealth] = useState<{ status: string; latencyMs: number }>({
    status: 'checking',
    latencyMs: 0
  });

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const res = await DrishtiAPI.checkHealth();
      if (mounted) {
        setApiHealth({
          status: res.status === 'online' ? 'CONNECTED' : 'LOCAL ENGINE',
          latencyMs: res.latencyMs
        });
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const scenarioDesc = currentScenario?.scenario_name || 'Wheat Export Disruption (India → Russia)';

  return (
    <header className="h-16 border-b border-slate-800 bg-[#070a12]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 print:hidden">
      {/* Brand & Subtitle + Sidebar Toggle */}
      <div className="flex items-center space-x-3.5">
        {onToggleSidebar && (
          <>
            <button
              onClick={onToggleSidebar}
              title={isSidebarOpen ? "Hide sidebar (Ctrl+B)" : "Show sidebar (Ctrl+B)"}
              className="p-1.5 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors flex items-center justify-center"
              aria-label="Toggle Navigation Sidebar"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>
            <div className="h-5 w-px bg-slate-800" />
          </>
        )}

        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 via-sky-600/30 to-purple-600/20 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan">
            <DrishtiLogo size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-base text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 font-mono">
                DRISHTI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">
              Agricultural Decision Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Active Scenario HUD Indicator */}
      <div className="hidden lg:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span>Active Corridor:</span>
        </div>
        <div className="h-3 w-px bg-slate-700/80" />
        <span className="font-mono text-xs font-semibold text-slate-100 tracking-wide truncate max-w-xs xl:max-w-md">
          {scenarioDesc}
        </span>
      </div>

      {/* System Status Indicators */}
      <div className="flex items-center space-x-2 text-xs">
        {/* Clean System Ready Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-slate-300 font-mono text-[11px] font-medium">System Ready</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Analysis State"
            className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all duration-200 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
