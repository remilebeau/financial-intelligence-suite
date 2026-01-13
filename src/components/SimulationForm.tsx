"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  Activity,
  Loader2,
} from "lucide-react";
import SimulationCharts from "./SimulationCharts";
import simulateProduction from "@/lib/simulateProduction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SimulationForm() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SimulationResponse | null>(null);

  // Initial state uses the global SimulationInputs type
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

    // Using the refactored lib function
    const data = await simulateProduction(inputs);

    if (data) {
      setResults(data);
    } else {
      // Basic error feedback
      console.error("Failed to fetch simulation results.");
    }

    setLoading(false);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Activity className="text-primary h-5 w-5" />
            Simulation Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(inputs).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label
                    htmlFor={key}
                    className="text-muted-foreground capitalize"
                  >
                    {key.replace(/([A-Z])/g, " $1")}
                  </Label>
                  <Input
                    id={key}
                    type="number"
                    name={key}
                    value={value}
                    onChange={handleInputChange}
                    className="bg-background"
                  />
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-8 w-full py-6 text-lg font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating 5,000 Scenarios...
                </>
              ) : (
                "Execute Monte Carlo Simulation"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results && (
        <div className="animate-fade-in-scale">
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
              title="Expected Profit"
              value={formatCurrency(results.summary.expectedProfit)}
              icon={<TrendingUp className="h-4 w-4" />}
              chartVar="var(--chart-2)"
            />
            <StatCard
              title="Value at Risk (5%)"
              value={formatCurrency(results.summary.valueAtRisk)}
              icon={<ShieldAlert className="h-4 w-4" />}
              chartVar="var(--destructive)"
            />
            <StatCard
              title="Best Case (95%)"
              value={formatCurrency(results.summary.bestCase)}
              icon={<TrendingUp className="h-4 w-4" />}
              chartVar="var(--chart-1)"
            />
            <StatCard
              title="Prob. of Loss"
              value={`${(results.summary.probOfLoss * 100).toFixed(1)}%`}
              icon={<AlertCircle className="h-4 w-4" />}
              chartVar="var(--chart-5)"
            />
          </div>

          <SimulationCharts
            data={results.histogramData}
            expectedProfit={results.summary.expectedProfit}
            valueAtRisk={results.summary.valueAtRisk}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  chartVar,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  chartVar: string;
}) {
  return (
    <Card className="border-l-4" style={{ borderLeftColor: chartVar }}>
      <CardContent className="flex flex-col gap-1 p-5">
        <div className="text-muted-foreground flex items-center gap-2">
          <div style={{ color: chartVar }}>{icon}</div>
          <span className="text-[10px] font-bold tracking-tighter uppercase">
            {title}
          </span>
        </div>
        <div
          className="font-mono text-xl font-medium tracking-tight"
          style={{ color: chartVar }}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
