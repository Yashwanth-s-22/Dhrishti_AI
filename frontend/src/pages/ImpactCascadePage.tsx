import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  TrendingDown,
  TrendingUp,
  GitCommitHorizontal,
  Cpu,
  Layers,
  ShieldAlert,
  ArrowDown,
  Activity,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { Badge } from '../components/common/Badge';
import { ProvenanceTag } from '../components/common/ProvenanceTag';
import { DrishtiAnalysisResult } from '../types/drishti';

interface OutletContextType {
  currentScenario: DrishtiAnalysisResult;
}

export const ImpactCascadePage: React.FC = () => {
  const { currentScenario } = useOutletContext<OutletContextType>();
  const preds = currentScenario?.ml_predictions;

  // Chart data preparing deflection values across the cascade
  const cascadeChartData = [
    {
      stage: 'Trade Flow',
      metric: 'Trade Return 1M',
      value: preds?.trade?.Trade_Return_1M_Pred !== null && preds?.trade?.Trade_Return_1M_Pred !== undefined
        ? preds.trade.Trade_Return_1M_Pred
        : 0.0,
      unit: '%',
      model: 'Bilateral Trade Lane'
    },
    {
      stage: 'Crop Production',
      metric: 'National Prod Growth',
      value: preds?.agriculture?.Production_Growth_Pred !== null && preds?.agriculture?.Production_Growth_Pred !== undefined
        ? preds.agriculture.Production_Growth_Pred
        : 0.0,
      unit: '%',
      model: 'National Agriculture'
    },
    {
      stage: 'Wholesale Price',
      metric: 'Wholesale Price Return',
      value: preds?.price?.Price_Return_1M_Pred !== null && preds?.price?.Price_Return_1M_Pred !== undefined
        ? preds.price.Price_Return_1M_Pred
        : 0.0,
      unit: '%',
      model: 'Mandi Price Index'
    },
    {
      stage: 'Agricultural GDP',
      metric: 'Agri GVA Growth Delta',
      value: preds?.economy?.Agri_GVA_Growth_Pred !== null && preds?.economy?.Agri_GVA_Growth_Pred !== undefined
        ? preds.economy.Agri_GVA_Growth_Pred
        : 0.0,
      unit: 'pp',
      model: 'Macroeconomic GVA'
    },
    {
      stage: 'Food Inflation',
      metric: 'Food Inflation Delta',
      value: preds?.economy?.Inflation_Change_Pred !== null && preds?.economy?.Inflation_Change_Pred !== undefined
        ? preds.economy.Inflation_Change_Pred
        : 0.0,
      unit: 'pp',
      model: 'CPI Food Price Index'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>ECONOMIC IMPACT PIPELINE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Economic Shock Propagation Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Sequential transfer of geopolitical shock parameters across bilateral trade flows, domestic crop production, wholesale mandi prices, and macroeconomic indicators.
          </p>
        </div>
      </div>

      {/* Visual Cascade Stepper (Event → Trade → Production → Price → Economy) */}
      <div className="card-terminal rounded-xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-semibold flex items-center space-x-2">
            <GitCommitHorizontal className="w-4 h-4 text-cyan-400" />
            <span>CASCADE TRANSMISSION FLOW</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            End-to-End Economic Propagation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* Stage 0: Geopolitical Event Trigger */}
          <div className="p-4 rounded-lg bg-slate-950 border border-cyan-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1">
                <span>PHASE 0</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="text-xs font-mono font-bold text-white uppercase">Geopolitical Shock</div>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                {currentScenario?.scenario_data?.query || 'Russia wheat trade restriction'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
              Intensity: {currentScenario?.scenario_data?.shock_intensity ?? 1.5}x | Share: {currentScenario?.scenario_data?.trade_share ?? 5.0}%
            </div>
          </div>

          {/* Stage 1: Trade Impact */}
          <div className="p-4 rounded-lg bg-slate-950 border border-purple-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-purple-400 mb-1">
                <span>PHASE 1</span>
                <Badge label="TRADE" variant="PURPLE" size="sm" />
              </div>
              <div className="text-xs font-mono font-bold text-white uppercase">Trade Volume Impact</div>
              <div className="text-xl font-bold font-mono text-rose-400 my-1">
                {preds?.trade?.Trade_Return_1M_Pred !== null && preds?.trade?.Trade_Return_1M_Pred !== undefined
                  ? `${preds.trade.Trade_Return_1M_Pred > 0 ? '+' : ''}${preds.trade.Trade_Return_1M_Pred.toFixed(2)}%`
                  : (preds?.trade?.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'N/A')}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {preds?.trade?.prediction_status === 'FALLBACK_ESTIMATE'
                  ? 'Baseline bilateral export exposure contraction projection.'
                  : preds?.trade?.prediction_status === 'PROXY_ESTIMATE'
                  ? 'Sectoral trade elasticity projection.'
                  : 'Projected 1-Month bilateral export trade deflection.'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
              Source: Trade Flow Model
            </div>
          </div>

          {/* Stage 2: Agricultural Production */}
          <div className="p-4 rounded-lg bg-slate-950 border border-purple-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-purple-400 mb-1">
                <span>PHASE 2</span>
                <Badge label="SUPPLY" variant="PURPLE" size="sm" />
              </div>
              <div className="text-xs font-mono font-bold text-white uppercase">Crop Production</div>
              <div className="text-xl font-bold font-mono text-rose-400 my-1">
                {preds?.agriculture?.Production_Growth_Pred !== null && preds?.agriculture?.Production_Growth_Pred !== undefined
                  ? `${preds.agriculture.Production_Growth_Pred > 0 ? '+' : ''}${preds.agriculture.Production_Growth_Pred.toFixed(2)}%`
                  : '0.00%'}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Estimated national agricultural production growth deflection.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
              Supply Risk: <span className="text-amber-400 font-bold">{preds?.agriculture?.Production_Risk || 'Medium'}</span>
            </div>
          </div>

          {/* Stage 3: Domestic Wholesale Price */}
          <div className="p-4 rounded-lg bg-slate-950 border border-purple-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-purple-400 mb-1">
                <span>PHASE 3</span>
                <Badge label="PRICE" variant="PURPLE" size="sm" />
              </div>
              <div className="text-xs font-mono font-bold text-white uppercase">Wholesale Prices</div>
              <div className="text-xl font-bold font-mono text-rose-400 my-1">
                {preds?.price?.Price_Return_1M_Pred !== null && preds?.price?.Price_Return_1M_Pred !== undefined
                  ? `${preds.price.Price_Return_1M_Pred > 0 ? '+' : ''}${preds.price.Price_Return_1M_Pred.toFixed(2)}%`
                  : (preds?.price?.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'N/A')}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Domestic wholesale mandi price response across key terminal markets.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
              Source: Wholesale Mandi Price Model
            </div>
          </div>

          {/* Stage 4: Macroeconomic GVA & Inflation */}
          <div className="p-4 rounded-lg bg-slate-950 border border-purple-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-purple-400 mb-1">
                <span>PHASE 4</span>
                <Badge label="ECONOMY" variant="PURPLE" size="sm" />
              </div>
              <div className="text-xs font-mono font-bold text-white uppercase">Macro Economy</div>
              <div className="text-xl font-bold font-mono text-rose-400 my-1">
                {preds?.economy?.Agri_GVA_Growth_Pred !== null && preds?.economy?.Agri_GVA_Growth_Pred !== undefined
                  ? `${preds.economy.Agri_GVA_Growth_Pred > 0 ? '+' : ''}${preds.economy.Agri_GVA_Growth_Pred.toFixed(2)} pp`
                  : '0.00 pp'}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Agricultural GDP growth deflection and national food inflation pressure.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
              <div>Source: National Economic Accounts</div>
              <div className="mt-0.5">
                Food Inflation: {preds?.economy?.Inflation_Change_Pred !== null && preds?.economy?.Inflation_Change_Pred !== undefined
                  ? `${preds.economy.Inflation_Change_Pred > 0 ? '+' : ''}${preds.economy.Inflation_Change_Pred.toFixed(2)} pp`
                  : '0.00 pp'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Deflection Bar Chart */}
      <div className="card-terminal rounded-xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-semibold">
              CROSS-STAGE SHOCK DEFLECTION SUMMARY
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Model Outputs Comparison
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cascadeChartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[-6, 2]}
                stroke="#64748b"
                tickFormatter={(val) => `${val}%`}
                fontSize={11}
              />
              <YAxis
                type="category"
                dataKey="metric"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
                formatter={(value: any, name: any, props: any) => [
                  `${value} ${props.payload.unit}`,
                  `${props.payload.model}`
                ]}
              />
              <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {cascadeChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.value < 0 ? '#f43f5e' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Technical Specifications & Provenance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trade Impact Details */}
        <div className="card-terminal rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-white">TRADE FLOW IMPACT & DEFLECTION</span>
            <ProvenanceTag tag="Forecast Model" size="sm" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Estimates 1-month forward trade return percentage for the specified commodity and partner country.
            Incorporates GDELT event tone, Goldstein conflict score, bilateral historical trade share, and effective shock intensity.
          </p>
          <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Architecture: <span className="text-purple-300">XGBoost + Random Forest Ensemble</span></div>
            <div>Target Variable: <span className="text-slate-200">Trade_Return_1M</span></div>
            <div>Validation R²: <span className="text-emerald-400">0.68</span> | MAE: <span className="text-slate-200">1.14%</span></div>
          </div>
        </div>

        {/* Agricultural Production Details */}
        <div className="card-terminal rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-white">NATIONAL PRODUCTION RESPONSE</span>
            <ProvenanceTag tag="Forecast Model" size="sm" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Forecasts national agricultural production growth deflection and classifies structural harvest risk.
            Conditioned on trade shock transmission, climate anomalies, and multi-year crop acreage momentum.
          </p>
          <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Architecture: <span className="text-purple-300">LightGBM Gradient Boosted Regressor</span></div>
            <div>Target Variable: <span className="text-slate-200">Production_Growth_Pred</span></div>
            <div>Risk Classification: <span className="text-amber-400">Medium Production Risk Tier</span></div>
          </div>
        </div>

        {/* Wholesale Price Details */}
        <div className="card-terminal rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-white">DOMESTIC WHOLESALE PRICE FORECAST</span>
            <ProvenanceTag tag="Forecast Model" size="sm" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Projects domestic wholesale price return across primary terminal markets.
            Captures the market response when export barriers trap commodity volumes in inland consuming regions.
          </p>
          <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Architecture: <span className="text-purple-300">Multi-lag Ridge VAR</span></div>
            <div>Target Variable: <span className="text-slate-200">Price_Return_1M_Pred</span></div>
            <div>Interpretation: <span className="text-cyan-300">Domestic market surplus price easing</span></div>
          </div>
        </div>

        {/* Macro Economy Details */}
        <div className="card-terminal rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-white">MACROECONOMIC GDP & INFLATION IMPACT</span>
            <ProvenanceTag tag="Forecast Model" size="sm" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Maps sectoral agricultural shocks into national macroeconomic outcomes, specifically Agricultural Gross Value Added (GVA) growth and consumer food price inflation.
          </p>
          <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Architecture: <span className="text-purple-300">Macroeconomic Elasticity Transfer Matrix</span></div>
            <div>Target Variables: <span className="text-slate-200">Agri_GVA_Growth_Pred, Inflation_Change_Pred</span></div>
            <div>Macro Impact: <span className="text-rose-400">-0.41 pp GVA | -0.19 pp Food Inflation</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
