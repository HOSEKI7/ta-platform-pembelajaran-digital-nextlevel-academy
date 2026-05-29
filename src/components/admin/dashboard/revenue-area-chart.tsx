"use client";

import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { idr } from "@/lib/format";
import type { MonthlyPoint } from "@/lib/admin-dashboard-mock";

import { ChartCard } from "./chart-card";

const BRAND = "#2b72ea";

/** Compact "Rp 4,3 jt" style for axis ticks — keeps the Y axis legible. */
function compactIdr(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)} jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} rb`;
  return `Rp ${value}`;
}

type Props = {
  data: MonthlyPoint[];
};

export function RevenueAreaChart({ data }: Props) {
  const total = data.reduce((sum, p) => sum + p.value, 0);

  return (
    <ChartCard
      title="Pendapatan per Bulan"
      subtitle="12 bulan terakhir"
      icon={TrendingUp}
      action={
        <>
          <p className="font-heading text-base font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
            {idr.format(total)}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Total</p>
        </>
      }
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-700"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-zinc-400"
            />
            <YAxis
              width={64}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-zinc-400"
              tickFormatter={compactIdr}
            />
            <Tooltip
              cursor={{ stroke: BRAND, strokeWidth: 1, strokeDasharray: "4 4" }}
              formatter={(value) => [idr.format(Number(value)), "Pendapatan"]}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 18px 40px -18px rgba(35,65,137,0.45)",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={BRAND}
              strokeWidth={2.5}
              fill="url(#revenueFill)"
              dot={false}
              activeDot={{ r: 4, fill: BRAND }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
