"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/src/components/ui/button"
import { formatCurrencyGR } from "../lib/utils"


const data = [
  { month: "Jan", meta: 100000, vendas: 82000 },
  { month: "Fev", meta: 100000, vendas: 91000 },
  { month: "Mar", meta: 100000, vendas: 105000 },
  { month: "Abr", meta: 120000, vendas: 112000 },
  { month: "Mai", meta: 120000, vendas: 126000 },
  { month: "Jun", meta: 130000, vendas: 118000 },
].map((item) => ({
  ...item,
  diferenca: item.vendas - item.meta,
}))


export function MetaProjectionChart() {
  return (
    <div className="rounded-xl bg-muted/40 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            Meta x Vendas Mensais
          </h3>
          <p className="text-xs text-muted-foreground">
            Projeção e desempenho em tempo real
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            Ano Atual
          </Button>
          <Button variant="ghost" size="sm">
            Últimos 6 meses
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {/* Meta */}
              <linearGradient id="metaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>

              {/* Vendas */}
              <linearGradient id="vendasGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={formatCurrencyGR}
            />

            <Tooltip
              formatter={(value, name) => {
                const labelMap: Record<string, string> = {
                  meta: "Meta",
                  vendas: "Vendas",
                  diferenca: "Diferença",
                }

                let numericValue = 0

                if (typeof value === "number") {
                  numericValue = value
                } else if (typeof value === "string") {
                  numericValue = Number(value)
                } else if (Array.isArray(value)) {
                  numericValue = Number(value[0])
                }

                const safeName = name ?? ""

                return [
                  formatCurrencyGR(numericValue),
                  labelMap[safeName] ?? safeName,
                ]
              }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
              }}
            />

            {/* Meta */}
            <Area
              type="monotone"
              dataKey="meta"
              stroke="#2563eb"
              fill="url(#metaGradient)"
              strokeWidth={2}
            />

            {/* Vendas */}
            <Area
              type="monotone"
              dataKey="vendas"
              stroke="#22c55e"
              fill="url(#vendasGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
