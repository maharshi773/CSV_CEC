import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { bepChartPoints, type CostResult } from "@/lib/costing";
import { inr, qty } from "@/lib/utils";

const tooltipStyle = {
  background: "var(--color-paper)",
  border: "1px solid var(--color-rule)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--color-ink)",
};

export function BreakEvenChart({ result }: { result: CostResult }) {
  const data = bepChartPoints(result).map((p) => ({
    ...p,
    unitsLabel: Math.round(p.units),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-rule)" strokeDasharray="3 3" />
          <XAxis
            dataKey="units"
            tickFormatter={(v) => qty(v, 0)}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--color-rule-strong)" }}
          />
          <YAxis
            tickFormatter={(v) => inr(v, 0)}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 11 }}
            width={72}
            axisLine={{ stroke: "var(--color-rule-strong)" }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number | string, name: string) => [
              typeof value === "number" ? inr(value, 0) : value,
              name,
            ]}
            labelFormatter={(l) => `${qty(Number(l), 0)} units`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Sales revenue"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="totalCost"
            name="Total cost"
            stroke="var(--color-loss)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="fixed"
            name="Fixed cost"
            stroke="var(--color-ink-subtle)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CostMixChart({ result }: { result: CostResult }) {
  const slices = [
    { name: "Net material", value: result.netMaterial, fill: "var(--color-accent)" },
    { name: "Direct labour", value: result.directLabour, fill: "var(--color-ink-muted)" },
    {
      name: "Factory overheads",
      value: result.factoryOverheads,
      fill: "var(--color-rule-strong)",
    },
    { name: "Administration", value: result.adminOverheads, fill: "var(--color-ink-subtle)" },
    { name: "Selling & distribution", value: result.sellingDist, fill: "var(--color-input-border)" },
  ].filter((s) => s.value > 0);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={92}
            paddingAngle={2}
          >
            {slices.map((s) => (
              <Cell key={s.name} fill={s.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number | string) =>
              typeof value === "number" ? inr(value, 0) : value
            }
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SensitivityChart({ result }: { result: CostResult }) {
  const data = result.sensitivity.map((s) => ({
    name: s.label.replace("Selling price ", "SP ").replace("Recycled PP at ", ""),
    profit: s.profitAtActual,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 64 }}>
          <CartesianGrid stroke="var(--color-rule)" strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            interval={0}
            angle={-38}
            textAnchor="end"
            tick={{ fill: "var(--color-ink-muted)", fontSize: 10 }}
            height={70}
          />
          <YAxis
            tickFormatter={(v) => inr(v, 0)}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 11 }}
            width={72}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number | string) =>
              typeof value === "number" ? inr(value, 0) : value
            }
          />
          <Bar dataKey="profit" name="Profit / (loss)" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell
                key={d.name}
                fill={d.profit >= 0 ? "var(--color-profit)" : "var(--color-loss)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
