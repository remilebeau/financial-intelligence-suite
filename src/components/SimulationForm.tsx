"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { AlertCircle, TrendingUp, ShieldAlert, Activity } from "lucide-react";

interface SimulationInputs {
  productionQuantity: number;
  unitCost: number;
  unitPrice: number;
  salvagePrice: number;
  fixedCost: number;
  worstLikelyDemand: number;
  expectedDemand: number;
  bestLikelyDemand: number;
}

interface SimulationResponse {
  summary: {
    expectedProfit: number;
    valueAtRisk: number;
    bestCase: number;
    probOfLoss: number;
  };
  histogramData: { bin: number; count: number }[];
}

export default function SimulationForm() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SimulationResponse | null>(null);
  const [inputs, setInputs] = useState<SimulationInputs>({
    productionQuantity: 100,
    unitCost: 50,
    unitPrice: 120,
    salvagePrice: 20,
    fixedCost: 1000,
    worstLikelyDemand: 50,
    expectedDemand: 100,
    bestLikelyDemand: 150,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Note: Update this URL to your production API path when deploying
      const response = await fetch("http://127.0.0.1:8000/api/simulations/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      if (!response.ok) throw new Error("Simulation failed");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <form onSubmit={handleSubmit} className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Simulation Parameters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(inputs).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="number"
                name={key}
                value={value}
                onChange={handleInputChange}
                className="p-2 bg-background border border-input rounded-md focus:ring-1 focus:ring-ring outline-none transition-all"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-primary text-primary-foreground font-bold py-3 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Calculating Probabilities..." : "Execute Monte Carlo Simulation"}
        </button>
      </form>

      {/* Results Section */}
      {results && (
        <div className="animate-fade-in-scale">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Expected Profit" 
              value={formatCurrency(results.summary.expectedProfit)} 
              icon={<TrendingUp className="w-4 h-4" />} 
              chartVar="var(--chart-2)" 
            />
            <StatCard 
              title="Value at Risk (5%)" 
              value={formatCurrency(results.summary.valueAtRisk)} 
              icon={<ShieldAlert className="w-4 h-4" />} 
              chartVar="var(--destructive)" 
            />
            <StatCard 
              title="Best Case (95%)" 
              value={formatCurrency(results.summary.bestCase)} 
              icon={<TrendingUp className="w-4 h-4" />} 
              chartVar="var(--chart-1)" 
            />
            <StatCard 
              title="Prob. of Loss" 
              value={`${(results.summary.probOfLoss * 100).toFixed(1)}%`} 
              icon={<AlertCircle className="w-4 h-4" />} 
              chartVar="var(--chart-5)" 
            />
          </div>

          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-6">Financial Distribution Map</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.histogramData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="bin" 
                    tickFormatter={formatCurrency} 
                    fontSize={11} 
                    tick={{fill: 'var(--muted-foreground)'}} 
                    axisLine={{stroke: 'var(--border)'}}
                  />
                  <YAxis fontSize={11} tick={{fill: 'var(--muted-foreground)'}} axisLine={{stroke: 'var(--border)'}} />
                  <Tooltip 
                    cursor={{fill: 'var(--accent)', opacity: 0.1}}
                    contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--foreground)',
                        borderRadius: 'var(--radius)' 
                    }}
                    itemStyle={{ color: 'var(--foreground)' }}
                    // Fix: Default parameters handle potential undefined values from Recharts
                    formatter={(value: number = 0) => [value, "Iterations"]}
                    labelFormatter={(label: number = 0) => `Profit Point: ${formatCurrency(label)}`}
                  />
                  <Bar dataKey="count">
                    {results.histogramData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.bin <= 0 ? "var(--destructive)" : "var(--chart-1)"} 
                        fillOpacity={entry.bin <= results.summary.valueAtRisk ? 1 : 0.6}
                      />
                    ))}
                  </Bar>
                  <ReferenceLine x={results.summary.expectedProfit} stroke="var(--chart-2)" strokeDasharray="5 5" />
                  <ReferenceLine x={0} stroke="var(--foreground)" strokeWidth={1} strokeOpacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-6 text-[10px] text-muted-foreground uppercase tracking-widest justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'var(--destructive)'}}></div> 
                    Tail Risk (VaR)
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'var(--chart-1)'}}></div> 
                    Feasible Returns
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, chartVar }: { title: string; value: string; icon: React.ReactNode, chartVar: string }) {
  return (
    <div className="bg-card p-5 rounded-lg border border-border flex flex-col gap-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div style={{ color: chartVar }}>{icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-tighter">{title}</span>
      </div>
      <div className="text-xl font-mono font-medium tracking-tight" style={{ color: chartVar }}>
        {value}
      </div>
    </div>
  );
}