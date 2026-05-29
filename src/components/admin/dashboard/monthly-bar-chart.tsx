"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyPoint } from "@/lib/admin-dashboard-mock";

import { ChartCard } from "./chart-card";

type Props = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  data: MonthlyPoint[];
  /** Bar fill (hex). */
  color: string;
  /** Tooltip series label, e.g. "Pendaftaran". */
  seriesLabel: string;
};

/**
 * Reusable monthly bar chart — backs both "Pendaftaran pengguna baru" and
 * "Kursus terjual" (PRD §6.11.2). The last bar is highlighted to read as the
 * current month.
 */
export function MonthlyBarChart({
  title,
  subtitle,
  icon,
  data,
  color,
  seriesLabel,
}: Props) {
  const total = data.reduce((sum, p) => sum + p.value, 0);
  const lastIndex = data.length - 1;

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      icon={icon}
      action={
        <>
          <p className="font-heading text-base font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
            {total.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Total</p>
        </>
      }
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
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
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-zinc-400"
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(113,142,191,0.1)" }}
              formatter={(value) => [Number(value).toLocaleString("id-ID"), seriesLabel]}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 18px 40px -18px rgba(35,65,137,0.45)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={28}>
              {data.map((entry, i) => (
                <Cell
                  key={entry.month}
                  fill={color}
                  fillOpacity={i === lastIndex ? 1 : 0.55}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
