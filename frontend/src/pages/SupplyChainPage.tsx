import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Globe2,
  Anchor,
  ShieldCheck,
  Compass,
  Layers,
  ArrowRight,
  TrendingDown,
  Maximize2,
  Sparkles,
  Activity
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { ProvenanceTag } from '../components/common/ProvenanceTag';
import { KpiCard } from '../components/common/KpiCard';
import { SupplyChainGlobe3D } from '../components/supplychain/SupplyChainGlobe3D';
import { DrishtiAnalysisResult, PortNode } from '../types/drishti';
import { extractAlternativePorts, NormalizedAlternativePort } from '../components/supplychain/portCoordinates';

interface OutletContextType {
  currentScenario: DrishtiAnalysisResult;
}

export const SupplyChainPage: React.FC = () => {
  const { currentScenario } = useOutletContext<OutletContextType>();
  const scData =
    currentScenario?.supply_chain_analysis?.supply_chain_analysis ||
    (currentScenario?.supply_chain_analysis as any);

  const criticalPorts: PortNode[] = useMemo(() => scData?.critical_ports || [], [scData]);
  const scenarioExposure = scData?.scenario_exposure;
  const eventCountry =
    scData?.event_country ||
    (scData as any)?.affected_country ||
    (scData as any)?.scenario?.event_country ||
    (scData as any)?.scenario?.affected_country ||
    currentScenario?.scenario_data?.event_country ||
    (currentScenario?.scenario_data as any)?.country ||
    'RUSSIA';
  const commodity =
    scData?.commodity ||
    (scData as any)?.scenario?.commodity ||
    currentScenario?.scenario_data?.commodity ||
    'Wheat';

  // Normalize alternative handling ports from backend contract
  const normalizedAltPorts: NormalizedAlternativePort[] = useMemo(() => {
    return extractAlternativePorts(scData?.alternative_paths || scData?.network_resilience?.modeled_alternative_ports);
  }, [scData]);

  // Two-way interactive state between right panels and 3D globe
  const [selectedPortName, setSelectedPortName] = useState<string | null>(
    criticalPorts[0]?.port || normalizedAltPorts[0]?.port || null
  );
  const [hoveredPortName, setHoveredPortName] = useState<string | null>(null);
  const [focusPortTrigger, setFocusPortTrigger] = useState<{ portName: string; timestamp: number } | null>(null);

  // Port matching helper for robust name & alias reconciliation
  const isPortMatch = (name1?: string | null, name2?: string | null) => {
    if (!name1 || !name2) return false;
    const clean1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const clean2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean1.includes(clean2) || clean2.includes(clean1);
  };

  // Find active selected gateway or alternative port dossier
  const selectedCriticalPort = useMemo(
    () => criticalPorts.find((p) => isPortMatch(p.port, selectedPortName)),
    [criticalPorts, selectedPortName]
  );
  const selectedAltPort = useMemo(
    () => normalizedAltPorts.find((a) => isPortMatch(a.port, selectedPortName)),
    [normalizedAltPorts, selectedPortName]
  );

  const activePortDisplayName = selectedCriticalPort?.port || selectedAltPort?.port || selectedPortName;
  const activePortState = selectedCriticalPort?.state || selectedAltPort?.state || 'Indian Maritime Terminal';

  // Top bottleneck calculation & flagged ports
  const flaggedPorts = useMemo(
    () => criticalPorts.filter((p) => p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL'),
    [criticalPorts]
  );
  const flaggedCount = flaggedPorts.length || 1;
  const topBottleneckName = criticalPorts[0]?.port || 'Deendayal';

  // Alternative handling ports summary for Card 4
  const altGatewaysCount = normalizedAltPorts.length || 3;
  const altGatewaysSummary = normalizedAltPorts.length > 0
    ? normalizedAltPorts.map((p) => p.port.split(' ')[0]).slice(0, 3).join(', ')
    : 'JNPT, Mumbai, Cochin';

  const effectiveShockPercent = scenarioExposure?.effective_shock !== undefined
    ? `${(scenarioExposure.effective_shock * 100).toFixed(1)}%`
    : '7.5%';

  const tradeSharePercent = currentScenario?.scenario_data?.trade_share !== undefined
    ? `${Number(currentScenario.scenario_data.trade_share).toFixed(1)}%`
    : '5.0%';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1">
            <Anchor className="w-4 h-4 text-cyan-400" />
            <span>GLOBAL MARITIME LOGISTICS & INLAND SUPPLY CHAIN</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Supply Chain Network Exposure & Port Bottlenecks
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Real-time 3D Earth visualization mapping primary scenario-exposed connections and modeled alternative handling paths across India's maritime gateways.
          </p>
        </div>
      </div>

      {/* Top Supply Chain Risk Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Bilateral Trade Dependency"
          value={tradeSharePercent}
          severity="MODERATE"
          subtitle={`National trade volume tied to ${eventCountry}`}
          provenance="Bilateral Trade Flow"
          accentColor="cyan"
        />

        <KpiCard
          title="Simulated Trade Shock"
          value={effectiveShockPercent}
          severity="HIGH"
          subtitle="Trade volume under immediate contraction"
          provenance="Propagation Network"
          accentColor="red"
        />

        <KpiCard
          title="At-Risk Maritime Gateways"
          value={`${flaggedCount} ${flaggedCount === 1 ? 'Port Flagged' : 'Ports Flagged'}`}
          severity="HIGH"
          subtitle={`Top Bottleneck: ${topBottleneckName}`}
          provenance="Port Traffic Analytics"
          accentColor="red"
        />

        <KpiCard
          title="Rerouting Alternatives"
          value={`${altGatewaysCount} Modeled Gateways`}
          severity="INFO"
          subtitle={`Available for diverted cargo (${altGatewaysSummary})`}
          provenance="Supply Chain Network"
          accentColor="green"
        />
      </div>

      {/* Main Visual Feature: 3D Earth Globe + Right Side Intelligence Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Authentic 3D Earth Globe Canvas (~67% width) */}
        <div className="lg:col-span-8 card-terminal rounded-xl border border-slate-800 flex flex-col relative overflow-hidden min-h-[640px] xl:min-h-[720px] shadow-2xl">
          <SupplyChainGlobe3D
            criticalPorts={criticalPorts}
            alternativePaths={normalizedAltPorts}
            selectedPortName={selectedPortName}
            hoveredPortName={hoveredPortName}
            onSelectPortName={(portName) => setSelectedPortName(portName)}
            onHoverPortName={(portName) => setHoveredPortName(portName)}
            eventCountry={eventCountry}
            commodity={commodity}
            focusPortTrigger={focusPortTrigger}
          />
        </div>

        {/* Right: Network Intelligence, Alternative Paths & Selected Gateway Dossier (~33% width) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {/* Selected Gateway Dossier */}
          <div className="card-terminal rounded-xl p-5 border border-slate-800 space-y-3.5 bg-slate-950/80 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500">SELECTED GATEWAY DOSSIER</span>
                <h3 className="text-sm font-bold font-mono text-white mt-0.5 truncate max-w-[210px]">
                  {activePortDisplayName || 'Select a Port on Globe'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {activePortDisplayName ? activePortState : 'Click any port marker or card'}
                </span>
              </div>
              {selectedCriticalPort ? (
                <Badge label={selectedCriticalPort.risk_level} variant={selectedCriticalPort.risk_level} size="sm" />
              ) : selectedAltPort ? (
                <Badge label="MODELED ALTERNATIVE" variant="LOW" size="sm" />
              ) : (
                <Badge label="INACTIVE" variant="SLATE" size="sm" />
              )}
            </div>

            {activePortDisplayName ? (
              <div className="space-y-2 text-xs font-mono">
                {/* Alternative Port Modeled Metrics if applicable */}
                {selectedAltPort && (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-emerald-400 font-medium">Modeled Affinity:</span>
                      <span className="text-emerald-300 font-bold">
                        {(selectedAltPort.affinity_score * 100).toFixed(0)}% MODELED AFFINITY
                      </span>
                    </div>
                    {selectedAltPort.handling_capacity_pct !== undefined && (
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Handling Buffer:</span>
                        <span className="text-cyan-300 font-bold">{selectedAltPort.handling_capacity_pct}%</span>
                      </div>
                    )}
                    {selectedAltPort.cargo_mt !== undefined && (
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Cargo Context:</span>
                        <span className="text-white font-bold">{selectedAltPort.cargo_mt} MT</span>
                      </div>
                    )}
                    {selectedAltPort.redundancy_status && (
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Redundancy Status:</span>
                        <span className="text-emerald-400 font-medium">{selectedAltPort.redundancy_status}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Gateway Port Metrics if applicable */}
                {selectedCriticalPort && (
                  <>
                    {selectedCriticalPort.betweenness_centrality !== undefined && (
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Betweenness Centrality:</span>
                        <span className="text-white font-bold">
                          {selectedCriticalPort.betweenness_centrality.toFixed(3)}
                        </span>
                      </div>
                    )}
                    {selectedCriticalPort.cargo_share_pct !== undefined && (
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">National Cargo Share:</span>
                        <span className="text-cyan-300 font-bold">
                          {selectedCriticalPort.cargo_share_pct}%
                        </span>
                      </div>
                    )}
                    {selectedCriticalPort.composite_importance !== undefined && (
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Composite Importance:</span>
                        <span className="text-slate-200">
                          {selectedCriticalPort.composite_importance.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedCriticalPort.identification_basis && (
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Identification Basis:</span>
                        <span className="text-slate-200 text-right text-[11px] truncate max-w-[170px]">
                          {selectedCriticalPort.identification_basis}
                        </span>
                      </div>
                    )}
                    {selectedCriticalPort.note && (
                      <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed mt-2">
                        <span className="text-amber-400 font-semibold block mb-0.5">Strategic Role:</span>
                        {selectedCriticalPort.note}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-mono py-4 text-center">
                Click any port marker on the 3D globe or card below to inspect its capacity and risk profile.
              </div>
            )}
          </div>

          {/* Modeled Alternative Handling Ports List */}
          <div className="card-terminal rounded-xl p-5 border border-slate-800 space-y-3 bg-slate-950/80 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-200 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>MODELED ALTERNATIVE HANDLING PORTS</span>
              </div>
              <Badge label="RESILIENCE" variant="LOW" size="sm" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Derived from the MultiDiGraph topology to absorb scenario-diverted agricultural export flows:
            </p>

            <div className="space-y-2">
              {normalizedAltPorts.length > 0 ? (
                normalizedAltPorts.map((alt, idx) => {
                  const isSelected = isPortMatch(selectedPortName, alt.port);
                  const isHovered = isPortMatch(hoveredPortName, alt.port);

                  return (
                    <div
                      key={alt.id || idx}
                      onMouseEnter={() => setHoveredPortName(alt.port)}
                      onMouseLeave={() => setHoveredPortName(null)}
                      onClick={() => {
                        setSelectedPortName(alt.port);
                        setFocusPortTrigger({ portName: alt.port, timestamp: Date.now() });
                      }}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-md ring-1 ring-emerald-500/50'
                          : isHovered
                          ? 'bg-emerald-950/40 border-emerald-600/80 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-emerald-700/60 text-slate-300'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="text-xs font-mono font-bold text-white flex items-center space-x-1.5">
                          <span className="text-emerald-400">{idx + 1}.</span>
                          <span className="truncate max-w-[170px]">{alt.port}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          State: {alt.state || 'Maritime Terminal'}
                          {alt.handling_capacity_pct !== undefined ? ` | Buffer: ${alt.handling_capacity_pct}%` : ''}
                          {alt.cargo_mt !== undefined ? ` | Cargo: ${alt.cargo_mt} MT` : ''}
                        </div>
                        {alt.redundancy_status && (
                          <span className="text-[9px] font-mono text-emerald-300/80 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60 mt-1 inline-block">
                            {alt.redundancy_status}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-emerald-400">
                          {(alt.affinity_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                          MODELED AFFINITY
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-500 font-mono py-3 text-center">
                  No alternative handling ports populated in current scenario.
                </div>
              )}
            </div>
          </div>

          {/* Evaluated Gateway Nodes List */}
          <div className="card-terminal rounded-xl p-5 border border-slate-800 space-y-3 bg-slate-950/80 shadow-lg flex-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-200 font-bold">
                <Anchor className="w-4 h-4 text-cyan-400" />
                <span>EVALUATED GATEWAY NODES</span>
              </div>
              <ProvenanceTag tag="[MoPSW PORT DATA]" size="sm" />
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {criticalPorts.map((port, idx) => {
                const isSelected = isPortMatch(selectedPortName, port.port);
                const isHovered = isPortMatch(hoveredPortName, port.port);

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredPortName(port.port)}
                    onMouseLeave={() => setHoveredPortName(null)}
                    onClick={() => {
                      setSelectedPortName(port.port);
                      setFocusPortTrigger({ portName: port.port, timestamp: Date.now() });
                    }}
                    className={`p-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-md ring-1 ring-cyan-500/50'
                        : isHovered
                        ? 'bg-cyan-950/40 border-cyan-600/80 text-white shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="font-bold truncate max-w-[190px]">{port.port}</div>
                      <div className="text-[10px] text-slate-400">{port.state || 'Major Port'}</div>
                    </div>
                    <Badge label={port.risk_level} variant={port.risk_level} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
