"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell 
} from "recharts";

interface ChartProps {
  data: { bin: number; count: number }[];
  expectedProfit: number;
  valueAtRisk: number;
}

// FIX: Handle the 'undefined' type required by Recharts
const tooltipFormatter = (value: number | string | undefined): [string, string] => {
  if (value === undefined) return ["0", "Iterations"];
  return [value.toString(), "Iterations"];
};

export default function SimulationCharts({ data, expectedProfit, valueAtRisk }: ChartProps) {
  // Format currency for the X-Axis
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="w-full bg-card p-6 rounded-lg border border-border shadow-sm mt-8">
      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Profit Distribution (Monte Carlo)</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            {/* Theme-aligned grid and axes */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="bin" 
              tickFormatter={formatCurrency} 
              fontSize={12} 
              tick={{fill: 'var(--muted-foreground)'}}
            />
            <YAxis 
              fontSize={12} 
              tick={{fill: 'var(--muted-foreground)'}} 
              label={{ 
                value: 'Frequency', 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle', fill: 'var(--muted-foreground)' } 
              }} 
            />
            <Tooltip 
              formatter={tooltipFormatter}
              labelFormatter={(label: number) => `Profit Range: ${formatCurrency(label)}`}
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)', 
                color: 'var(--foreground)',
                borderRadius: 'var(--radius)' 
              }}
            />
            
            {/* Histogram Bars using your theme's chart and destructive variables */}
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.bin <= valueAtRisk ? "var(--destructive)" : "var(--chart-1)"} 
                  fillOpacity={entry.bin <= valueAtRisk ? 1 : 0.7}
                />
              ))}
            </Bar>

            {/* Strategic Reference Lines using theme colors */}
            <ReferenceLine 
              x={expectedProfit} 
              stroke="var(--chart-2)" 
              strokeDasharray="5 5" 
              label={{ position: 'top', value: 'Mean', fill: 'var(--chart-2)', fontSize: 12 }} 
            />
            <ReferenceLine 
              x={valueAtRisk} 
              stroke="var(--destructive)" 
              strokeDasharray="5 5" 
              label={{ position: 'top', value: 'VaR', fill: 'var(--destructive)', fontSize: 12 }} 
            />
            <ReferenceLine x={0} stroke="var(--foreground)" strokeWidth={1} strokeOpacity={0.4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-4 italic">
        * Red bars indicate outcomes at or below the 5th percentile (Value at Risk). The dashed line represents the mean outcome.
      </p>
    </div>
  );
}