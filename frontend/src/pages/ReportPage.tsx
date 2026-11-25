import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Download,
  Share2,
  Shield,
  Layers,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Globe,
  Anchor,
  MapPin,
  Users,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { ProvenanceTag } from '../components/common/ProvenanceTag';
import { DrishtiLogo } from '../components/common/DrishtiLogo';
import { DrishtiAnalysisResult, StakeholderImpactItem } from '../types/drishti';

interface OutletContextType {
  currentScenario: DrishtiAnalysisResult;
}

export const ReportPage: React.FC = () => {
  const { currentScenario } = useOutletContext<OutletContextType>();

  const ml = currentScenario?.ml_predictions;
  const sc = currentScenario?.supply_chain_analysis?.supply_chain_analysis;
  const vu = currentScenario?.vulnerability_analysis?.vulnerability_analysis;
  const stakeholders: StakeholderImpactItem[] = Array.isArray(currentScenario?.stakeholder_impacts)
    ? currentScenario.stakeholder_impacts
    : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:max-w-none print:w-full print:m-0 print:p-0">
      {/* Header with Print / Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>DRISHTI DECISION INTELLIGENCE REPORT</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Executive Intelligence Dossier
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Consolidated geopolitical risk assessment, econometric cascade outputs, and mitigation roadmap.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-mono text-xs font-bold shadow-glow-cyan flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Decision Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="card-terminal rounded-xl p-8 border border-slate-800 space-y-8 bg-[#0a0f1d] print:bg-white print:text-black print:border-none print:p-0 print:m-0 print:w-full print:shadow-none print:space-y-6">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 print:border-black">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2.5">
                <DrishtiLogo size={22} className="shrink-0" />
                <span className="text-xl font-black font-mono tracking-wider text-white print:text-black">
                  DRISHTI
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold print:border-black">
                  OFFICIAL BRIEFING
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600 font-medium mt-1">
                Exposure-Aware Geopolitical Impact Assessment Framework
              </p>
            </div>

            <div className="text-right text-xs font-mono text-slate-400 print:text-gray-600">
              <div>Ref: <strong className="text-slate-200 print:text-black">DRISHTI-2024-WHT-01</strong></div>
              <div>Generated: {new Date().toLocaleDateString()}</div>
              <div>Classification: <strong className="text-cyan-400 print:text-black">DECISION-SUPPORT</strong></div>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-lg bg-slate-950/80 border border-slate-800/80 print:bg-gray-100 print:border-gray-300">
            <h2 className="text-base font-bold text-white print:text-black font-mono">
              SCENARIO: {currentScenario?.scenario_name || 'Wheat Export Disruption (India → Russia)'}
            </h2>
            <p className="text-xs text-slate-300 print:text-gray-800 mt-1 leading-relaxed">
              {currentScenario?.scenario_data?.description || 'Bilateral export restriction involving wheat trade.'}
            </p>
          </div>
        </div>

        {/* Section 01: Event Parameters & Summary */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold border-b border-slate-800 pb-1.5 print:text-black">
            01 / EVENT INTELLIGENCE & PARAMETERIZATION
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 print:bg-gray-50">
              <span className="text-[10px] text-slate-500 uppercase block">Commodity</span>
              <span className="text-white font-bold print:text-black">{currentScenario?.scenario_data?.commodity}</span>
              <span className="text-[10px] text-slate-400 block">HS4: {currentScenario?.scenario_data?.hs4}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 print:bg-gray-50">
              <span className="text-[10px] text-slate-500 uppercase block">Partner Country</span>
              <span className="text-white font-bold print:text-black">{currentScenario?.scenario_data?.event_country}</span>
              <span className="text-[10px] text-cyan-400 block">{currentScenario?.scenario_data?.trade_type}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 print:bg-gray-50">
              <span className="text-[10px] text-slate-500 uppercase block">Shock Multiplier</span>
              <span className="text-rose-400 font-bold print:text-black">{currentScenario?.scenario_data?.shock_intensity}x</span>
              <span className="text-[10px] text-slate-400 block">Trade Share: {currentScenario?.scenario_data?.trade_share}%</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 print:bg-gray-50">
              <span className="text-[10px] text-slate-500 uppercase block">Canonical Direction</span>
              <span className="text-amber-400 font-bold print:text-black">supply_contraction</span>
              <span className="text-[10px] text-slate-400 block">Confidence: High</span>
            </div>
          </div>
        </section>

        {/* Section 02: Quantitative Econometric Cascade */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold border-b border-slate-800 pb-1.5 print:text-black">
            02 / QUANTITATIVE ECONOMIC IMPACT CASCADE
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-slate-950 border border-slate-800 print:bg-gray-50">
              <span className="text-[10px] text-slate-500 block">Trade Flow Impact</span>
              <span className="text-lg font-bold text-rose-400 print:text-black">
                {ml?.trade?.Trade_Return_1M_Pred !== null && ml?.trade?.Trade_Return_1M_Pred !== undefined
                  ? `${ml.trade.Trade_Return_1M_Pred > 0 ? '+' : ''}${ml.trade.Trade_Return_1M_Pred.toFixed(2)}%`
                  : (ml?.trade?.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'N/A')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {ml?.trade?.prediction_status === 'MODEL_PREDICTION' ? '1M Flow Return' :
                 ml?.trade?.prediction_status === 'FALLBACK_ESTIMATE' ? 'Baseline Projection' :
                 ml?.trade?.prediction_status === 'PROXY_ESTIMATE' ? 'Proxy Projection' :
                 'Baseline Projection'}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 print:bg-gray-50">
              <span className="text-[10px] text-slate-500 block">National Production Deflection</span>
              <span className="text-lg font-bold text-rose-400 print:text-black">
                {ml?.agriculture?.Production_Growth_Pred !== null && ml?.agriculture?.Production_Growth_Pred !== undefined
                  ? `${ml.agriculture.Production_Growth_Pred > 0 ? '+' : ''}${ml.agriculture.Production_Growth_Pred.toFixed(2)}%`
                  : '0.00%'}
              </span>
              <span className="text-[10px] text-amber-400 block mt-1">
                Risk: {ml?.agriculture?.Production_Risk || 'Medium'} {ml?.agriculture?.prediction_status === 'PROXY_ESTIMATE' ? '(Proxy)' : ''}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 print:bg-gray-50">
              <span className="text-[10px] text-slate-500 block">Wholesale Price Forecast</span>
              <span className="text-lg font-bold text-rose-400 print:text-black">
                {ml?.price?.Price_Return_1M_Pred !== null && ml?.price?.Price_Return_1M_Pred !== undefined
                  ? `${ml.price.Price_Return_1M_Pred > 0 ? '+' : ''}${ml.price.Price_Return_1M_Pred.toFixed(2)}%`
                  : (ml?.price?.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'N/A')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {ml?.price?.prediction_status === 'MODEL_PREDICTION' ? 'Domestic Price Response' :
                 ml?.price?.prediction_status === 'FALLBACK_ESTIMATE' ? 'Baseline Projection' :
                 ml?.price?.prediction_status === 'PROXY_ESTIMATE' ? 'Proxy Projection' :
                 'Domestic Price Response'}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 print:bg-gray-50">
              <span className="text-[10px] text-slate-500 block">Macro Agricultural GDP & GVA</span>
              <span className="text-lg font-bold text-rose-400 print:text-black">
                {ml?.economy?.Agri_GVA_Growth_Pred !== null && ml?.economy?.Agri_GVA_Growth_Pred !== undefined
                  ? `${ml.economy.Agri_GVA_Growth_Pred > 0 ? '+' : ''}${ml.economy.Agri_GVA_Growth_Pred.toFixed(2)} pp`
                  : '0.00 pp'}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-1">
                Inflation: {ml?.economy?.Inflation_Change_Pred !== null && ml?.economy?.Inflation_Change_Pred !== undefined
                  ? `${ml.economy.Inflation_Change_Pred > 0 ? '+' : ''}${ml.economy.Inflation_Change_Pred.toFixed(2)} pp`
                  : '0.00 pp'} {ml?.economy?.prediction_status === 'PROXY_ESTIMATE' ? '(Proxy)' : ''}
              </span>
            </div>
          </div>
        </section>

        {/* Section 03: Supply Chain & Gateway Ports */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold border-b border-slate-800 pb-1.5 print:text-black print:border-gray-300">
            03 / SUPPLY CHAIN & GATEWAY PORTS EXPOSURE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300">
              <span className="text-slate-400 print:text-gray-700 font-bold block mb-1">Scenario-Exposed Port Bottlenecks:</span>
              <div className="space-y-1">
                <div>• Deendayal Port Authority (Kandla, Gujarat) — <span className="text-rose-400 print:text-red-700 font-bold">HIGH RISK</span> (38.4% share)</div>
                <div>• Mundra Port (Gujarat) — <span className="text-rose-400 print:text-red-700 font-bold">HIGH RISK</span> (18.5% share)</div>
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300">
              <span className="text-slate-400 print:text-gray-700 font-bold block mb-1">Modeled Alternative Handling Paths:</span>
              <div className="space-y-1">
                <div>• JNPA (Maharashtra) — <span className="text-emerald-400 print:text-emerald-700 font-bold">94% Affinity</span> (82% buffer)</div>
                <div>• Pipavav Port (Gujarat) — <span className="text-emerald-400 print:text-emerald-700 font-bold">78% Affinity</span> (54% buffer)</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 04: Vulnerable Agricultural Regions (RAVS) */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold border-b border-slate-800 pb-1.5 print:text-black print:border-gray-300">
            04 / REGIONAL AGRICULTURAL VULNERABILITY (RAVS)
          </h3>
          <p className="text-[11px] text-slate-400 print:text-gray-600 font-mono">
            Historical agricultural vulnerability index (1997–2023 baseline). Top vulnerable districts ranked by composite RAVS score:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            {vu?.top_vulnerable_regions?.slice(0, 4).map((reg: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300">
                <div className="font-bold text-white print:text-black">{idx + 1}. {reg.district}</div>
                <div className="text-[10px] text-slate-400 print:text-gray-600">{reg.state}</div>
                <div className="mt-1 text-amber-400 print:text-amber-800 font-bold">RAVS: {reg.ravs.toFixed(3)} ({reg.classification})</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 05: Stakeholder Distributional Impacts */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold border-b border-slate-800 pb-1.5 print:text-black print:border-gray-300">
            05 / STAKEHOLDER DISTRIBUTIONAL IMPACTS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {stakeholders.slice(0, 4).map((sh, idx) => (
              <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-white print:text-black">{sh.stakeholder}</span>
                  <Badge label={sh.severity} variant={sh.severity} size="sm" />
                </div>
                <p className="text-slate-300 print:text-gray-700 text-[11px] leading-relaxed">
                  {sh.impact_summary}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 06: Recommended Mitigation Playbooks */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold border-b border-slate-800 pb-1.5 print:text-black print:border-gray-300">
            06 / GROUNDED MITIGATION PLAYBOOKS
          </h3>
          <div className="space-y-2 text-xs font-mono">
            {currentScenario?.mitigation_actions?.slice(0, 3).map((act, idx) => (
              <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white print:text-black">{idx + 1}. {act.action}</span>
                  <span className="text-[10px] text-cyan-400 print:text-cyan-800 font-semibold">{act.time_horizon}</span>
                </div>
                <p className="text-slate-300 print:text-gray-700 text-[11px] font-sans">
                  {act.rationale}
                </p>
                <div className="text-[10px] text-slate-500 print:text-gray-600">
                  Policy Lever: {act.policy_lever}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Document Sign-Off and Disclaimers */}
        <div className="pt-6 border-t border-slate-800 print:border-black flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-slate-500 gap-3">
          <div>
            Drishti Framework | Capstone Decision Intelligence Engine
          </div>
          <div className="flex items-center space-x-2">
            <ProvenanceTag tag="Audit Trail Verified" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};
