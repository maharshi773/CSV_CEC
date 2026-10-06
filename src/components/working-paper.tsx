import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BookOpen,
  Download,
  Factory,
  Printer,
  RotateCcw,
  Table2,
} from "lucide-react";
import { BreakEvenChart, CostMixChart, SensitivityChart } from "@/components/charts";
import { Badge, Button, Input, Label } from "@/components/ui";
import { computeCost, DEFAULT_INPUTS, type CostInputs, type CostResult } from "@/lib/costing";
import { useCostStore } from "@/lib/store";
import { cn, inr, pct, qty, signedInr } from "@/lib/utils";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "inputs", label: "Inputs" },
  { id: "sheet", label: "Cost sheet" },
  { id: "cvp", label: "CVP" },
  { id: "scenarios", label: "Scenarios" },
  { id: "findings", label: "Findings" },
  { id: "report", label: "Report" },
] as const;

type NavId = (typeof NAV)[number]["id"];

export function WorkingPaper() {
  const inputs = useCostStore((s) => s.inputs);
  const setInput = useCostStore((s) => s.setInput);
  const reset = useCostStore((s) => s.reset);
  const result = useMemo(() => computeCost(inputs), [inputs]);
  const [tab, setTab] = useState<NavId>("overview");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    void useCostStore.persist.rehydrate();
  }, []);

  async function onDownload() {
    setDownloading(true);
    try {
      const { downloadWorkbook } = await import("@/lib/excel-export");
      await downloadWorkbook(inputs);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <div className="pointer-events-none fixed inset-y-0 left-0 z-20 w-2 bg-binding no-print" />
      <Header
        result={result}
        onDownload={onDownload}
        downloading={downloading}
        onReset={reset}
      />
      <nav className="no-print sticky top-16 z-30 border-b border-rule bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 md:px-6">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTab(item.id);
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={cn(
                "h-10 shrink-0 rounded-full px-3.5 text-sm transition-colors duration-150",
                tab === item.id
                  ? "bg-accent text-accent-fg"
                  : "text-ink-muted hover:bg-bg-sunken hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10">
        <Overview result={result} />
        <InputsPanel inputs={inputs} setInput={setInput} />
        <CostSheetPanel result={result} />
        <CvpPanel result={result} />
        <ScenariosPanel result={result} />
        <FindingsPanel result={result} />
        <ReportPanel result={result} />
      </main>
    </div>
  );
}

function Header({
  result,
  onDownload,
  downloading,
  onReset,
}: {
  result: CostResult;
  onDownload: () => void;
  downloading: boolean;
  onReset: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur no-print">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
        <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-fg">
          <Factory className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight tracking-tight text-ink md:text-xl">
            Cost sheet & CVP
          </p>
          <p className="truncate text-xs text-ink-muted">
            {result.inputs.productName} · {result.inputs.companyName} · CEC-1 working paper
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onReset} aria-label="Reset to factory data">
            <RotateCcw />
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => window.print()}>
            <Printer />
            Print
          </Button>
          <Button size="sm" onClick={onDownload} disabled={downloading}>
            <Download />
            {downloading ? "Preparing…" : "Excel"}
          </Button>
        </div>
      </div>
    </header>
  );
}

function Overview({ result }: { result: CostResult }) {
  const loss = result.profit < 0;
  return (
    <section id="overview" className="scroll-mt-32">
      <div className="mb-6 max-w-3xl">
      <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">
          1PGDM01 · Managerial Accounting-I · October 2026
        </p>
        <h1 className="mt-2 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
          {result.inputs.productName}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted md:text-base">
          Monthly cost sheet for an injection-moulded 76mm PP core plug. Factory
          figures are live on the Inputs tab — blue cells in the Excel download
          work the same way. Estimates are marked.
        </p>
      </div>

      {result.contributionIsNegative && (
        <div className="mb-6 flex gap-3 rounded-lg border border-loss/20 bg-loss-soft p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-loss" />
          <div>
            <p className="font-medium text-loss">Contribution is negative</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              Variable cost of {inr(result.variableCostPerUnit, 3)} exceeds the
              selling price of {inr(result.inputs.sellingPrice, 2)}. Break-even
              does not exist. Running toward {qty(result.inputs.maxCapacity)}{" "}
              capacity would widen the loss to {signedInr(result.profitAtCapacity)}.
              Price or polymer cost has to move first — see Findings.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Sales" value={inr(result.salesRevenue, 0)} hint={`${qty(result.inputs.unitsSold)} × ₹${result.inputs.sellingPrice}`} />
        <Kpi label="Cost of sales" value={inr(result.costOfSales, 0)} hint={`${inr(result.costPerUnit, 3)} / piece`} />
        <Kpi
          label={loss ? "Loss" : "Profit"}
          value={signedInr(result.profit, 0)}
          hint={pct(result.profitMarginOnSales)}
          tone={loss ? "loss" : "profit"}
        />
        <Kpi
          label="Contribution / unit"
          value={signedInr(result.contributionPerUnit, 3)}
          hint={`P/V ${pct(result.pvRatio)}`}
          tone={result.contributionIsNegative ? "loss" : "profit"}
        />
        <Kpi label="Break-even" value={result.bepUnits === null ? "Not reachable" : qty(result.bepUnits, 0)} hint={result.bepSales === null ? "Negative contribution" : inr(result.bepSales, 0)} />
        <Kpi label="Capacity used" value={pct(result.capacityUtilisation)} hint={`${qty(result.inputs.unitsProduced)} of ${qty(result.inputs.maxCapacity)}`} />
        <Kpi label="Net material / unit" value={inr(result.variableMaterialPerUnit, 3)} hint={`${result.inputs.netWeightGrams.toFixed(2)} g net · ₹${result.inputs.rawMaterialRatePerKg}/kg`} />
        <Kpi label="Fixed costs" value={inr(result.totalFixed, 0)} hint="Factory, repairs, depreciation, admin, S&D" />
      </div>
    </section>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "loss" | "profit";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-rule bg-paper p-4",
        tone === "loss" && "border-loss/20 bg-loss-soft",
        tone === "profit" && "border-profit/20 bg-profit-soft",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">{label}</p>
      <p
        className={cn(
          "mt-1 font-display text-xl tabular-nums tracking-tight md:text-2xl",
          tone === "loss" && "text-loss",
          tone === "profit" && "text-profit",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-ink-subtle">{hint}</p>
    </div>
  );
}

function InputsPanel({
  inputs,
  setInput,
}: {
  inputs: CostInputs;
  setInput: <K extends keyof CostInputs>(key: K, value: CostInputs[K]) => void;
}) {
  return (
    <section id="inputs" className="scroll-mt-32 print-break">
      <SectionTitle
        icon={<Table2 className="size-4" />}
        kicker="Edit blue cells"
        title="Factory inputs"
        body="Figures in blue come from the visit. Gold rows are estimates required to complete the cost sheet (weight, working days, machinery value, scrap recovery). Changing any field recalculates the ledger, CVP and Excel file."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <FieldGroup title="Identity">
          <TextField label="Company" value={inputs.companyName} onChange={(v) => setInput("companyName", v)} />
          <TextField label="Product" value={inputs.productName} onChange={(v) => setInput("productName", v)} />
          <TextField label="Period" value={inputs.periodLabel} onChange={(v) => setInput("periodLabel", v)} />
        </FieldGroup>
        <FieldGroup title="Volume & price">
          <NumField label="Units produced / month" value={inputs.unitsProduced} onChange={(v) => setInput("unitsProduced", v)} />
          <NumField label="Units sold / month" value={inputs.unitsSold} onChange={(v) => setInput("unitsSold", v)} />
          <NumField label="Maximum capacity" value={inputs.maxCapacity} onChange={(v) => setInput("maxCapacity", v)} />
          <NumField label="Selling price ₹ / piece" value={inputs.sellingPrice} step={0.1} onChange={(v) => setInput("sellingPrice", v)} />
        </FieldGroup>
        <FieldGroup title="Direct material" badge="₹2,47,800 reconcilies here">
          <NumField label="PP rate ₹ / kg" value={inputs.rawMaterialRatePerKg} onChange={(v) => setInput("rawMaterialRatePerKg", v)} />
          <NumField
            label="Net weight / good piece (g)"
            value={round4(inputs.netWeightGrams)}
            step={0.01}
            estimate
            onChange={(v) => setInput("netWeightGrams", v)}
            note="Back-solved from ₹2,47,800 issue at ₹158/kg with 3% waste"
          />
          <NumField label="Waste / scrap %" value={inputs.wastePercent} step={0.1} onChange={(v) => setInput("wastePercent", v)} />
          <NumField
            label="Scrap recovery % of waste value"
            value={inputs.scrapRecoveryPercent}
            estimate
            onChange={(v) => setInput("scrapRecoveryPercent", v)}
          />
        </FieldGroup>
        <FieldGroup title="Labour">
          <NumField label="Wage ₹ / worker / day" value={inputs.labourPerDay} onChange={(v) => setInput("labourPerDay", v)} />
          <NumField label="Production employees" value={inputs.productionEmployees} onChange={(v) => setInput("productionEmployees", v)} />
          <NumField
            label="Working days / month"
            value={inputs.workingDays}
            estimate
            onChange={(v) => setInput("workingDays", v)}
            note="26-day manufacturing month"
          />
          <NumField label="Hours / day" value={inputs.hoursPerDay} onChange={(v) => setInput("hoursPerDay", v)} />
        </FieldGroup>
        <FieldGroup title="Overheads">
          <NumField
            label="Other variable production ₹ / month"
            value={inputs.otherVariableMonthly}
            onChange={(v) => setInput("otherVariableMonthly", v)}
            note="Keep 0 unless ₹2,47,800 is truly extra overhead on top of polymer"
          />
          <NumField label="Factory / manufacturing fixed ₹" value={inputs.factoryFixedMonthly} onChange={(v) => setInput("factoryFixedMonthly", v)} />
          <NumField label="Administrative expenses ₹" value={inputs.adminMonthly} onChange={(v) => setInput("adminMonthly", v)} />
          <NumField label="Selling & distribution ₹" value={inputs.sellingDistMonthly} onChange={(v) => setInput("sellingDistMonthly", v)} />
          <NumField label="Machine repair & maintenance ₹" value={inputs.repairsMonthly} onChange={(v) => setInput("repairsMonthly", v)} />
        </FieldGroup>
        <FieldGroup title="Capital & planning">
          <NumField
            label="Machinery original cost ₹"
            value={inputs.machineryValue}
            estimate
            onChange={(v) => setInput("machineryValue", v)}
            note="Used 50–80T moulder + 76mm mould"
          />
          <NumField
            label="Depreciation rate % / month"
            value={inputs.depreciationRateMonthly * 100}
            step={0.1}
            onChange={(v) => setInput("depreciationRateMonthly", v / 100)}
          />
          <NumField label="Target profit ₹ / month" value={inputs.targetProfit} onChange={(v) => setInput("targetProfit", v)} />
        </FieldGroup>
      </div>
    </section>
  );
}

function FieldGroup({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-rule bg-paper p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg tracking-tight">{title}</h3>
        {badge ? <Badge tone="input">{badge}</Badge> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  step = 1,
  estimate,
  note,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  estimate?: boolean;
  note?: string;
}) {
  return (
    <div className={cn("space-y-1.5", estimate && "rounded-md bg-estimate/60 p-2")}>
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {estimate ? <Badge tone="estimate">Estimate</Badge> : <Badge tone="input">Input</Badge>}
      </div>
      <Input
        type="number"
        step={step}
        value={
          Number.isFinite(value)
            ? step < 1
              ? Number(value.toFixed(4))
              : value
            : 0
        }
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
      {note ? <p className="text-xs leading-snug text-ink-subtle">{note}</p> : null}
    </div>
  );
}

function CostSheetPanel({ result }: { result: CostResult }) {
  return (
    <section id="sheet" className="scroll-mt-32 print-break">
      <SectionTitle
        kicker="Classified manufacturing ledger"
        title="Cost sheet"
        body={`Period: ${result.inputs.periodLabel}. Output ${qty(result.inputs.unitsProduced)} pieces. Depreciation is the only estimated overhead.`}
      />
      <div className="overflow-x-auto rounded-lg border border-rule bg-paper">
        <table className="w-full min-w-xl border-collapse text-sm">
          <thead>
            <tr className="bg-accent text-accent-fg">
              <th className="px-4 py-3 text-left font-medium">Particulars</th>
              <th className="px-4 py-3 text-right font-medium">Amount (₹)</th>
              <th className="px-4 py-3 text-right font-medium">Per unit (₹)</th>
            </tr>
          </thead>
          <tbody>
            {result.lines.map((line) => {
              if (line.kind === "section") {
                return (
                  <tr key={line.id} className="bg-accent-soft">
                    <td colSpan={3} className="px-4 py-2 font-medium text-accent">
                      {line.label}
                    </td>
                  </tr>
                );
              }
              return (
                <tr
                  key={line.id}
                  className={cn(
                    "border-t border-rule",
                    line.kind === "subtotal" && "bg-bg-sunken/60",
                    line.kind === "total" && "bg-bg-sunken font-medium",
                    line.kind === "result" && (result.profit >= 0 ? "bg-profit-soft" : "bg-loss-soft"),
                    line.estimate && "bg-estimate/70",
                  )}
                >
                  <td className="px-4 py-2.5">
                    <span className={cn(line.kind !== "item" && "font-medium")}>{line.label}</span>
                    {line.estimate ? (
                      <Badge tone="estimate" className="ml-2">
                        Estimate
                      </Badge>
                    ) : null}
                    {line.note ? (
                      <p className="mt-0.5 text-xs text-ink-subtle">{line.note}</p>
                    ) : null}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right tabular-nums",
                      line.kind === "result" && (result.profit >= 0 ? "text-profit" : "text-loss"),
                    )}
                  >
                    {signedInr(line.amount, 2)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">
                    {signedInr(line.perUnit, 3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-subtle">
        Margin on sales {pct(result.profitMarginOnSales, 2)} · Prime cost{" "}
        {inr(result.primeCost, 0)} · Factory cost {inr(result.factoryCost, 0)}
      </p>
    </section>
  );
}

function CvpPanel({ result }: { result: CostResult }) {
  const rows: { k: string; v: string; n?: string }[] = [
    { k: "Variable cost / unit — material", v: inr(result.variableMaterialPerUnit, 4) },
    { k: "Variable cost / unit — labour", v: inr(result.variableLabourPerUnit, 4) },
    { k: "Variable cost / unit — other", v: inr(result.variableOtherPerUnit, 4) },
    { k: "Total variable cost / unit", v: inr(result.variableCostPerUnit, 4) },
    { k: "Selling price / unit", v: inr(result.inputs.sellingPrice, 2) },
    { k: "Contribution / unit", v: signedInr(result.contributionPerUnit, 4) },
    { k: "P/V ratio", v: pct(result.pvRatio, 2) },
    { k: "Total fixed costs", v: inr(result.totalFixed, 2) },
    {
      k: "Break-even (units)",
      v: result.bepUnits === null ? "Not achievable" : qty(result.bepUnits, 0),
    },
    {
      k: "Break-even (sales)",
      v: result.bepSales === null ? "Not achievable" : inr(result.bepSales, 0),
    },
    {
      k: "Margin of safety",
      v:
        result.marginOfSafetyUnits === null
          ? "—"
          : `${qty(result.marginOfSafetyUnits, 0)} (${pct(result.marginOfSafetyPercent ?? 0)})`,
    },
    { k: "Total contribution", v: signedInr(result.contributionTotal, 0) },
    { k: "Profit / (loss)", v: signedInr(result.profit, 0) },
    {
      k: "Degree of operating leverage",
      v: result.degreeOfOperatingLeverage === null ? "—" : result.degreeOfOperatingLeverage.toFixed(2),
    },
    {
      k: "BEP as % of capacity",
      v: result.bepPercentOfCapacity === null ? "—" : pct(result.bepPercentOfCapacity),
    },
    { k: "Profit at full capacity", v: signedInr(result.profitAtCapacity, 0) },
    {
      k: `Units for target profit ${inr(result.inputs.targetProfit, 0)}`,
      v: result.unitsForTargetProfit === null ? "Not achievable" : qty(result.unitsForTargetProfit, 0),
    },
  ];

  return (
    <section id="cvp" className="scroll-mt-32 print-break">
      <SectionTitle
        kicker="Break-even and profit planning"
        title="Cost-volume-profit"
        body="Direct material (net of regrind), production wages and other variable production are treated as variable. Monthly lumps — factory, repairs, depreciation, admin, selling — are fixed."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-rule bg-paper">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row) => (
                <tr key={row.k} className="border-t border-rule first:border-t-0">
                  <td className="px-4 py-2.5 text-ink-muted">{row.k}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{row.v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-6">
          <Panel title="Break-even chart">
            <BreakEvenChart result={result} />
            {result.contributionIsNegative ? (
              <p className="mt-2 text-xs text-loss">
                Revenue and total-cost lines do not meet in the relevant range.
              </p>
            ) : null}
          </Panel>
          <Panel title="Cost of sales mix">
            <CostMixChart result={result} />
          </Panel>
        </div>
      </div>
    </section>
  );
}

function ScenariosPanel({ result }: { result: CostResult }) {
  return (
    <section id="scenarios" className="scroll-mt-32 print-break">
      <SectionTitle
        kicker="What-if"
        title="Sensitivity"
        body="Each row holds one change against the factory base. Profit is at actual monthly volume (1,20,000 unless you edited it)."
      />
      <div className="mb-6 overflow-x-auto rounded-lg border border-rule bg-paper">
        <table className="w-full min-w-3xl text-sm">
          <thead>
            <tr className="bg-accent text-accent-fg">
              <th className="px-3 py-3 text-left font-medium">Scenario</th>
              <th className="px-3 py-3 text-right font-medium">Contrib / u</th>
              <th className="px-3 py-3 text-right font-medium">Fixed</th>
              <th className="px-3 py-3 text-right font-medium">BEP units</th>
              <th className="px-3 py-3 text-right font-medium">Profit at actual</th>
            </tr>
          </thead>
          <tbody>
            {result.sensitivity.map((s) => (
              <tr
                key={s.id}
                className={cn(
                  "border-t border-rule",
                  s.id === "base" && "bg-bg-sunken font-medium",
                )}
              >
                <td className="px-3 py-2.5">
                  {s.label}
                  {s.note ? <p className="text-xs font-normal text-ink-subtle">{s.note}</p> : null}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{signedInr(s.contributionPerUnit, 3)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{inr(s.fixedCost, 0)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {s.bepUnits === null ? "—" : qty(s.bepUnits, 0)}
                </td>
                <td
                  className={cn(
                    "px-3 py-2.5 text-right tabular-nums",
                    s.profitAtActual >= 0 ? "text-profit" : "text-loss",
                  )}
                >
                  {signedInr(s.profitAtActual, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Panel title="Profit under each scenario">
        <SensitivityChart result={result} />
      </Panel>
    </section>
  );
}

function FindingsPanel({ result }: { result: CostResult }) {
  const combo = result.sensitivity.find((s) => s.id === "combo");
  const recycled = result.sensitivity.find((s) => s.id === "rm90");
  const price = result.sensitivity.find((s) => s.id === "sp25");

  return (
    <section id="findings" className="scroll-mt-32 print-break">
      <SectionTitle kicker="Observations" title="Findings and recommendations" />
      <div className="grid gap-4 md:grid-cols-2">
        <Note title="Polymer is above the selling price">
          Net material is {inr(result.variableMaterialPerUnit, 3)} against a job rate of{" "}
          {inr(result.inputs.sellingPrice, 2)}. At ₹{result.inputs.rawMaterialRatePerKg}/kg
          the implied good-piece weight is {result.inputs.netWeightGrams.toFixed(2)} g
          ({result.gramsIssuedPerUnit.toFixed(2)} g issued including {result.inputs.wastePercent}% waste).
          Virgin PP at this rate cannot support a ₹2 plug.
        </Note>
        <Note title="Volume is not the lever">
          {result.contributionIsNegative
            ? `Each extra piece loses ${inr(Math.abs(result.contributionPerUnit), 3)}. Filling the remaining ${qty(result.inputs.maxCapacity - result.inputs.unitsProduced)} of capacity would increase the monthly loss, not reduce it.`
            : `Margin of safety is ${pct(result.marginOfSafetyPercent ?? 0)} of current sales.`}
        </Note>
        <Note title="Two paths back to profit">
          Recycled PP at ₹90/kg turns the month into {signedInr(recycled?.profitAtActual ?? 0, 0)}
          {recycled?.bepUnits ? ` (BEP ${qty(recycled.bepUnits, 0)} pieces)` : ""}. Raising the
          job rate to ₹2.50 alone yields {signedInr(price?.profitAtActual ?? 0, 0)}. Doing both
          yields {signedInr(combo?.profitAtActual ?? 0, 0)}.
        </Note>
        <Note title="What not to do">
          Do not treat ₹2,47,800 as overhead on top of ₹158/kg — that double-counts resin and
          makes variable cost look ~₹4/piece. Confirm with the owner that the rupee figure is
          monthly polymer consumption. Keep 100% sprue/runner regrind in closed loop; the 40%
          recovery used here is conservative.
        </Note>
      </div>
    </section>
  );
}

function ReportPanel({ result }: { result: CostResult }) {
  const i = result.inputs;
  return (
    <section id="report" className="scroll-mt-32 print-break">
      <SectionTitle
        icon={<BookOpen className="size-4" />}
        kicker="CEC-1 write-up"
        title="Report draft"
        body="Use this as the 15–20 page skeleton. Paste into Word as Times New Roman 12 / headings 14, line spacing 1.5, then add visit photos, the Excel printouts and the plagiarism report."
      />
      <article className="space-y-8 rounded-lg border border-rule bg-paper p-5 leading-relaxed md:p-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-ink-muted">Narayana Business School</p>
          <h2 className="mt-2 font-display text-2xl tracking-tight">
            Preparation of Cost Sheet and Cost-Volume-Profit (CVP) Analysis of {i.companyName}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            1PGDM01 · Managerial Accounting-I · PGDM Trimester I · CEC-1 (20 marks) · October 2026
          </p>
          <p className="mt-1 text-sm text-ink-muted">Under the guidance of Dr. Reshmi Banerjee, Assistant Professor</p>
        </div>

        <ReportH>1. Introduction and company profile</ReportH>
        <p>
          {i.companyName} is a small injection-moulding unit producing {i.productName} — round
          polypropylene end plugs used on paper, film, foil and textile cores. The commercial
          76mm (3-inch) plug is a high-volume, thin-margin industrial consumable. The unit runs
          two production employees on 12-hour shifts, with stated monthly output of{" "}
          {qty(i.unitsProduced)} pieces against a machine capacity of {qty(i.maxCapacity)}. The
          job-work / selling rate is ₹{i.sellingPrice} per piece, which is in line with lightweight
          76mm plugs listed in the North Indian wholesale market (typically ₹1.60–₹1.90 when
          recycled resin is used).
        </p>

        <ReportH>2. Methodology</ReportH>
        <p>
          Cost data were taken from the production floor: polymer rate, monthly material issue,
          daily wages, headcount, hours, waste percentage, factory fixed cost, administration,
          selling and distribution, repairs, and the depreciation rate. Where a figure was missing
          — net piece weight, working days, machinery original cost, and scrap-recovery percentage —
          a reasoned estimate was used, as permitted by the CEC-1 brief, and is flagged in the
          working paper. Classification follows a conventional manufacturing cost sheet (direct
          material, direct labour, prime cost, factory overheads, factory cost, administration,
          cost of production, selling and distribution, cost of sales). CVP treats material, wages
          and other variable production as variable, and monthly lumps as fixed. Opening stock is
          assumed nil; production equals sales in the base month.
        </p>

        <ReportH>3. Production process</ReportH>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Receipt and storage of PP granules (virgin or recycled).</li>
          <li>Drying / mixing with colour masterbatch if required.</li>
          <li>Injection moulding in a 76mm core-plug cavity tool.</li>
          <li>Cooling, ejection, deflashing of sprue and runners.</li>
          <li>Regrind of process waste (target: closed loop).</li>
          <li>Visual quality check on diameter and seating.</li>
          <li>Bag / carton packing and dispatch to paper-tube and film converters.</li>
        </ol>

        <ReportH>4. Cost structure</ReportH>
        <p>
          Monthly cost of sales is {inr(result.costOfSales, 2)} ({inr(result.costPerUnit, 3)} per
          piece) against sales of {inr(result.salesRevenue, 2)}, a {result.profit < 0 ? "loss" : "profit"} of{" "}
          {signedInr(result.profit, 2)}. Net direct material {inr(result.netMaterial, 2)} is{" "}
          {pct(result.netMaterial / result.costOfSales)} of cost and {inr(result.variableMaterialPerUnit, 3)}{" "}
          per piece — already above the selling price. Direct labour is modest at{" "}
          {inr(result.directLabour, 2)} ({i.productionEmployees} × ₹{i.labourPerDay} × {i.workingDays} days,
          {result.labourHours} labour hours at {inr(result.labourPerHour, 2)}/hour). Fixed cash and
          non-cash overheads total {inr(result.totalFixed, 2)}, of which depreciation{" "}
          {inr(result.depreciation, 2)} is estimated from a ₹{qty(i.machineryValue)} asset at 2% per month.
        </p>

        <ReportH>5. CVP analysis</ReportH>
        <p>
          Contribution per unit is {signedInr(result.contributionPerUnit, 4)}; P/V ratio{" "}
          {pct(result.pvRatio, 2)}.{" "}
          {result.contributionIsNegative
            ? "Because contribution is negative, the break-even point is undefined: no positive volume covers fixed cost. Margin of safety and degree of operating leverage are not reported. Profit at full capacity is " +
              signedInr(result.profitAtCapacity, 2) +
              ", worse than the current month. Units required for the target profit of " +
              inr(i.targetProfit, 0) +
              " are likewise unattainable until the contribution turns positive."
            : `Break-even is ${qty(result.bepUnits ?? 0, 0)} units (${inr(result.bepSales ?? 0, 0)}). Margin of safety is ${qty(result.marginOfSafetyUnits ?? 0, 0)} units (${pct(result.marginOfSafetyPercent ?? 0)}).`}
        </p>

        <ReportH>6. Key findings</ReportH>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Resin at ₹{i.rawMaterialRatePerKg}/kg is inconsistent with a ₹{i.sellingPrice} plug of ~{i.netWeightGrams.toFixed(1)} g.</li>
          <li>₹2,47,800 is monthly polymer issue (~{result.kgIssued.toFixed(0)} kg), not a second variable overhead.</li>
          <li>Labour and cash fixed costs are not the problem; material is.</li>
          <li>Capacity utilisation is {pct(result.capacityUtilisation)}; unused capacity is not a profit lever while contribution is negative.</li>
        </ul>

        <ReportH>7. Conclusion and recommendations</ReportH>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Move the job rate toward ₹2.50–₹3.00, or restrict ₹2 work to recycled-resin jobs only.</li>
          <li>Source recycled / regrind PP near ₹90–₹110/kg for this SKU (standard in the 76mm plug trade).</li>
          <li>Close the loop on the 3% process waste — 100% in-house regrind rather than 40% external recovery.</li>
          <li>If the customer specification allows, cut net wall weight by ~10%.</li>
          <li>Do not chase the extra {qty(i.maxCapacity - i.unitsProduced)} pieces of capacity until contribution is positive.</li>
        </ol>

        <ReportH>8. References</ReportH>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>CEC-1 brief, 1PGDM01 Managerial Accounting-I, Narayana Business School, October 2026.</li>
          <li>Standard cost sheet: prime cost, factory cost, cost of production, cost of sales.</li>
          <li>CVP identities: contribution, P/V ratio, break-even, margin of safety, operating leverage.</li>
          <li>Market checks: 76mm PP core plugs, IndiaMART / TradeIndia listings (weight and ₹/piece bands).</li>
        </ul>

        <ReportH>Annexures</ReportH>
        <p className="text-sm">
          A. Title page (as prescribed). B. Contact details of the person visited — to be filled
          after the factory visit. C. List of group members. D. Excel cost sheet (download from this
          working paper). E. Plagiarism report (≤30% similarity). F. Photographs / video of the
          production unit.
        </p>
        <p className="text-xs text-ink-subtle">
          Default estimates used: net weight {DEFAULT_INPUTS.netWeightGrams.toFixed(4)} g; working
          days {DEFAULT_INPUTS.workingDays}; machinery {inr(DEFAULT_INPUTS.machineryValue, 0)}; scrap
          recovery {DEFAULT_INPUTS.scrapRecoveryPercent}%.
        </p>
      </article>
    </section>
  );
}

function SectionTitle({
  kicker,
  title,
  body,
  icon,
}: {
  kicker: string;
  title: string;
  body?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-5 max-w-3xl">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-ink-muted">
        {icon}
        {kicker}
      </p>
      <h2 className="mt-1 font-display text-2xl tracking-tight md:text-3xl">{title}</h2>
      {body ? <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p> : null}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-rule bg-paper p-4">
      <h3 className="mb-3 font-display text-lg tracking-tight">{title}</h3>
      {children}
    </div>
  );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-rule bg-paper p-4">
      <h3 className="font-display text-lg tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{children}</p>
    </div>
  );
}

function ReportH({ children }: { children: ReactNode }) {
  return <h3 className="font-display text-xl tracking-tight">{children}</h3>;
}

function round4(n: number) {
  return Math.round(n * 10000) / 10000;
}
