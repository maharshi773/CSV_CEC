import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { G as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Factory, i as Printer, n as Table2, o as Download, r as RotateCcw, s as BookOpen, t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as BarChart, o as Line, p as Legend, r as LineChart, s as CartesianGrid, t as PieChart, u as Cell } from "../_libs/recharts+[...].mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-1Smk19t2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var DEFAULT_INPUTS = {
	companyName: "Core Plug Manufacturing Unit",
	productName: "Core Plugs (76mm)",
	periodLabel: "One month",
	sellingPrice: 2,
	unitsProduced: 12e4,
	unitsSold: 12e4,
	maxCapacity: 2e5,
	rawMaterialRatePerKg: 158,
	netWeightGrams: 12.67753164556962,
	wastePercent: 3,
	scrapRecoveryPercent: 40,
	labourPerDay: 400,
	productionEmployees: 2,
	workingDays: 26,
	hoursPerDay: 12,
	otherVariableMonthly: 0,
	factoryFixedMonthly: 6e3,
	adminMonthly: 5e3,
	sellingDistMonthly: 2e3,
	repairsMonthly: 3e3,
	depreciationRateMonthly: .02,
	machineryValue: 3e5,
	targetProfit: 5e4
};
function pu(amount, units) {
	if (!units) return 0;
	return amount / units;
}
function materialAndLabour(inputs, opts) {
	const units = Math.max(0, inputs.unitsProduced);
	const rate = opts?.rate ?? inputs.rawMaterialRatePerKg;
	const netG = opts?.netWeightGrams ?? inputs.netWeightGrams;
	const wasteRate = Math.min(Math.max((opts?.wastePercent ?? inputs.wastePercent) / 100, 0), .99);
	const recoverRate = Math.min(Math.max((opts?.scrapRecoveryPercent ?? inputs.scrapRecoveryPercent) / 100, 0), 1);
	const kgGood = units * (netG / 1e3);
	const kgIssued = wasteRate >= 1 ? 0 : kgGood / (1 - wasteRate);
	const kgWaste = kgIssued - kgGood;
	const grossMaterial = kgIssued * rate;
	const scrapCredit = kgWaste * rate * recoverRate;
	const netMaterial = grossMaterial - scrapCredit;
	const directLabour = (opts?.labourPerDay ?? inputs.labourPerDay) * inputs.productionEmployees * inputs.workingDays;
	const otherVariable = inputs.otherVariableMonthly;
	return {
		kgGood,
		kgIssued,
		kgWaste,
		grossMaterial,
		scrapCredit,
		netMaterial,
		directLabour,
		otherVariable,
		vcPerUnit: units ? (netMaterial + directLabour + otherVariable) / units : 0
	};
}
function fixedCosts(inputs) {
	const depreciation = inputs.machineryValue * inputs.depreciationRateMonthly;
	return {
		depreciation,
		totalFixed: inputs.factoryFixedMonthly + inputs.repairsMonthly + depreciation + inputs.adminMonthly + inputs.sellingDistMonthly
	};
}
function computeCost(inputs) {
	const units = Math.max(0, inputs.unitsProduced);
	const sold = Math.max(0, inputs.unitsSold);
	const m = materialAndLabour(inputs);
	const { depreciation, totalFixed } = fixedCosts(inputs);
	const labourHours = inputs.productionEmployees * inputs.hoursPerDay * inputs.workingDays;
	const labourPerHour = labourHours ? m.directLabour / labourHours : 0;
	const gramsIssuedPerUnit = units ? m.kgIssued / units * 1e3 : 0;
	const primeCost = m.netMaterial + m.directLabour;
	const factoryOverheads = m.otherVariable + inputs.factoryFixedMonthly + inputs.repairsMonthly + depreciation;
	const factoryCost = primeCost + factoryOverheads;
	const adminOverheads = inputs.adminMonthly;
	const costOfProduction = factoryCost + adminOverheads;
	const sellingDist = inputs.sellingDistMonthly;
	const copPerProduced = pu(costOfProduction, units);
	const costOfSales = copPerProduced * sold + sellingDist;
	const salesRevenue = inputs.sellingPrice * sold;
	const profit = salesRevenue - costOfSales;
	const profitMarginOnSales = salesRevenue ? profit / salesRevenue : 0;
	const costPerUnit = sold ? costOfSales / sold : copPerProduced;
	const variableMaterialPerUnit = pu(m.netMaterial, units);
	const variableLabourPerUnit = pu(m.directLabour, units);
	const variableOtherPerUnit = pu(m.otherVariable, units);
	const variableCostPerUnit = m.vcPerUnit;
	const variableCost = variableCostPerUnit * sold;
	const contributionPerUnit = inputs.sellingPrice - variableCostPerUnit;
	const contributionTotal = contributionPerUnit * sold;
	const pvRatio = inputs.sellingPrice ? contributionPerUnit / inputs.sellingPrice : 0;
	const contributionIsNegative = contributionPerUnit <= 0;
	const bepUnits = contributionIsNegative ? null : totalFixed / contributionPerUnit;
	const bepSales = bepUnits === null ? null : bepUnits * inputs.sellingPrice;
	const marginOfSafetyUnits = bepUnits === null ? null : sold - bepUnits;
	const marginOfSafetyPercent = marginOfSafetyUnits === null || !sold ? null : marginOfSafetyUnits / sold;
	const degreeOfOperatingLeverage = profit === 0 || contributionIsNegative ? null : contributionTotal / profit;
	const bepPercentOfCapacity = bepUnits === null || !inputs.maxCapacity ? null : bepUnits / inputs.maxCapacity;
	const profitAtCapacity = (inputs.sellingPrice - variableCostPerUnit) * inputs.maxCapacity - totalFixed;
	const unitsForTargetProfit = contributionIsNegative ? null : (totalFixed + inputs.targetProfit) / contributionPerUnit;
	const capacityUtilisation = inputs.maxCapacity ? units / inputs.maxCapacity : 0;
	const lines = [
		{
			id: "dm-sec",
			label: "A. Direct material",
			amount: 0,
			perUnit: 0,
			kind: "section"
		},
		{
			id: "dm-gross",
			label: `PP granules issued (${fmtKg(m.kgIssued)} kg × ${fmtRs(inputs.rawMaterialRatePerKg)}/kg)`,
			amount: m.grossMaterial,
			perUnit: pu(m.grossMaterial, units),
			kind: "item"
		},
		{
			id: "dm-scrap",
			label: `Less: scrap / regrind recovery (${fmtKg(m.kgWaste)} kg × ${fmtPct(inputs.scrapRecoveryPercent / 100)} of material value)`,
			amount: -m.scrapCredit,
			perUnit: pu(-m.scrapCredit, units),
			kind: "item"
		},
		{
			id: "dm-net",
			label: "Net direct material",
			amount: m.netMaterial,
			perUnit: pu(m.netMaterial, units),
			kind: "subtotal"
		},
		{
			id: "dl-sec",
			label: "B. Direct labour",
			amount: 0,
			perUnit: 0,
			kind: "section"
		},
		{
			id: "dl",
			label: `Production wages (${inputs.productionEmployees} workers × ${fmtRs(inputs.labourPerDay)}/day × ${inputs.workingDays} days)`,
			amount: m.directLabour,
			perUnit: pu(m.directLabour, units),
			kind: "item"
		},
		{
			id: "prime",
			label: "Prime cost (A + B)",
			amount: primeCost,
			perUnit: pu(primeCost, units),
			kind: "total"
		},
		{
			id: "foh-sec",
			label: "C. Factory overheads",
			amount: 0,
			perUnit: 0,
			kind: "section"
		},
		{
			id: "foh-var",
			label: "Other variable production cost",
			amount: m.otherVariable,
			perUnit: pu(m.otherVariable, units),
			kind: "item",
			note: m.otherVariable === 0 ? "₹2,47,800 from the factory is treated as raw-material issue, not extra overhead" : void 0
		},
		{
			id: "foh-fix",
			label: "Factory / manufacturing fixed cost",
			amount: inputs.factoryFixedMonthly,
			perUnit: pu(inputs.factoryFixedMonthly, units),
			kind: "item"
		},
		{
			id: "foh-rep",
			label: "Machine repair & maintenance",
			amount: inputs.repairsMonthly,
			perUnit: pu(inputs.repairsMonthly, units),
			kind: "item"
		},
		{
			id: "foh-dep",
			label: `Depreciation of machinery (${fmtPct(inputs.depreciationRateMonthly)} of ${fmtRs(inputs.machineryValue)})`,
			amount: depreciation,
			perUnit: pu(depreciation, units),
			kind: "item",
			estimate: true
		},
		{
			id: "foh-tot",
			label: "Total factory overheads",
			amount: factoryOverheads,
			perUnit: pu(factoryOverheads, units),
			kind: "subtotal"
		},
		{
			id: "factory",
			label: "Factory cost (prime + factory OH)",
			amount: factoryCost,
			perUnit: pu(factoryCost, units),
			kind: "total"
		},
		{
			id: "aoh-sec",
			label: "D. Administrative overheads",
			amount: 0,
			perUnit: 0,
			kind: "section"
		},
		{
			id: "aoh",
			label: "Administrative expenses",
			amount: adminOverheads,
			perUnit: pu(adminOverheads, units),
			kind: "item"
		},
		{
			id: "cop",
			label: "Cost of production",
			amount: costOfProduction,
			perUnit: pu(costOfProduction, units),
			kind: "total"
		},
		{
			id: "sd-sec",
			label: "E. Selling & distribution",
			amount: 0,
			perUnit: 0,
			kind: "section"
		},
		{
			id: "sd",
			label: "Selling & distribution expenses",
			amount: sellingDist,
			perUnit: pu(sellingDist, sold || units),
			kind: "item"
		},
		{
			id: "cos",
			label: "Total cost of sales",
			amount: costOfSales,
			perUnit: costPerUnit,
			kind: "total"
		},
		{
			id: "sales",
			label: `Sales revenue (${sold.toLocaleString("en-IN")} × ₹${inputs.sellingPrice})`,
			amount: salesRevenue,
			perUnit: inputs.sellingPrice,
			kind: "item"
		},
		{
			id: "profit",
			label: profit >= 0 ? "Profit" : "Loss",
			amount: profit,
			perUnit: pu(profit, sold || units),
			kind: "result"
		}
	];
	const fixedBreakdown = [
		{
			label: "Factory / manufacturing fixed",
			amount: inputs.factoryFixedMonthly
		},
		{
			label: "Machine repair & maintenance",
			amount: inputs.repairsMonthly
		},
		{
			label: "Depreciation of machinery",
			amount: depreciation,
			estimate: true
		},
		{
			label: "Administrative expenses",
			amount: adminOverheads
		},
		{
			label: "Selling & distribution",
			amount: sellingDist
		}
	];
	return {
		inputs,
		kgIssued: m.kgIssued,
		kgGood: m.kgGood,
		kgWaste: m.kgWaste,
		gramsIssuedPerUnit,
		grossMaterial: m.grossMaterial,
		scrapCredit: m.scrapCredit,
		netMaterial: m.netMaterial,
		directLabour: m.directLabour,
		labourHours,
		labourPerHour,
		otherVariable: m.otherVariable,
		otherVariablePerUnit: pu(m.otherVariable, units),
		depreciation,
		primeCost,
		factoryOverheads,
		factoryCost,
		adminOverheads,
		costOfProduction,
		sellingDist,
		costOfSales,
		salesRevenue,
		profit,
		profitMarginOnSales,
		costPerUnit,
		variableCost,
		variableCostPerUnit,
		variableMaterialPerUnit,
		variableLabourPerUnit,
		variableOtherPerUnit,
		contributionPerUnit,
		contributionTotal,
		pvRatio,
		totalFixed,
		bepUnits,
		bepSales,
		marginOfSafetyUnits,
		marginOfSafetyPercent,
		degreeOfOperatingLeverage,
		bepPercentOfCapacity,
		profitAtCapacity,
		unitsForTargetProfit,
		capacityUtilisation,
		contributionIsNegative,
		lines,
		sensitivity: buildSensitivity(inputs, sold, totalFixed),
		fixedBreakdown
	};
}
function scenario(id, label, sellingPrice, vcPerUnit, fixedCost, sold, note) {
	const contributionPerUnit = sellingPrice - vcPerUnit;
	const bepUnits = contributionPerUnit <= 0 ? null : fixedCost / contributionPerUnit;
	return {
		id,
		label,
		sellingPrice,
		contributionPerUnit,
		fixedCost,
		bepUnits,
		bepSales: bepUnits === null ? null : bepUnits * sellingPrice,
		profitAtActual: contributionPerUnit * sold - fixedCost,
		note
	};
}
function buildSensitivity(inputs, sold, totalFixed) {
	const sp = inputs.sellingPrice;
	const baseVc = materialAndLabour(inputs).vcPerUnit;
	const lab10Vc = materialAndLabour(inputs, { labourPerDay: inputs.labourPerDay * 1.1 }).vcPerUnit;
	const rm90Vc = materialAndLabour(inputs, { rate: 90 }).vcPerUnit;
	const rm130Vc = materialAndLabour(inputs, { rate: 130 }).vcPerUnit;
	const wt90Vc = materialAndLabour(inputs, { netWeightGrams: inputs.netWeightGrams * .9 }).vcPerUnit;
	const regrindVc = materialAndLabour(inputs, { scrapRecoveryPercent: 100 }).vcPerUnit;
	return [
		scenario("base", "Base case (factory data)", sp, baseVc, totalFixed, sold),
		scenario("lab10", "Labour rate +10%", sp, lab10Vc, totalFixed, sold),
		scenario("sp18", "Selling price ₹1.80", 1.8, baseVc, totalFixed, sold),
		scenario("sp25", "Selling price ₹2.50", 2.5, baseVc, totalFixed, sold),
		scenario("sp30", "Selling price ₹3.00", 3, baseVc, totalFixed, sold),
		scenario("rm90", "Recycled PP at ₹90/kg", sp, rm90Vc, totalFixed, sold, "Typical regrind/recycled resin used for core plugs"),
		scenario("rm130", "Resin at ₹130/kg", sp, rm130Vc, totalFixed, sold),
		scenario("wt10", "Net piece weight −10%", sp, wt90Vc, totalFixed, sold, "Thinner wall if the customer specification allows"),
		scenario("regrind", "100% in-house regrind of 3% waste", sp, regrindVc, totalFixed, sold),
		scenario("fix10", "Fixed costs +10%", sp, baseVc, totalFixed * 1.1, sold),
		scenario("combo", "₹2.50 price + recycled ₹90/kg", 2.5, rm90Vc, totalFixed, sold, "Combined commercial and sourcing correction")
	];
}
function bepChartPoints(result, extra = 1.12) {
	const cap = result.inputs.maxCapacity || result.inputs.unitsProduced || 1;
	const maxX = Math.max(cap, result.inputs.unitsProduced, result.bepUnits ?? 0, 1) * extra;
	const steps = 8;
	const pts = [];
	for (let i = 0; i <= steps; i++) {
		const units = maxX * i / steps;
		pts.push({
			units,
			revenue: units * result.inputs.sellingPrice,
			totalCost: result.totalFixed + units * result.variableCostPerUnit,
			variableCost: units * result.variableCostPerUnit,
			fixed: result.totalFixed
		});
	}
	return pts;
}
function fmtKg(kg) {
	return kg.toLocaleString("en-IN", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2
	});
}
function fmtRs(n) {
	return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
function fmtPct(n) {
	const p = n * 100;
	return `${p.toFixed(p % 1 === 0 ? 0 : 1)}%`;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function inr(value, digits = 2) {
	if (!Number.isFinite(value)) return "—";
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(value);
}
function qty(value, digits = 0) {
	if (!Number.isFinite(value)) return "—";
	return new Intl.NumberFormat("en-IN", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(value);
}
function pct(value, digits = 1) {
	if (!Number.isFinite(value)) return "—";
	return `${(value * 100).toFixed(digits)}%`;
}
function signedInr(value, digits = 2) {
	if (!Number.isFinite(value)) return "—";
	const formatted = inr(Math.abs(value), digits);
	if (value < 0) return `(${formatted})`;
	return formatted;
}
var tooltipStyle = {
	background: "var(--color-paper)",
	border: "1px solid var(--color-rule)",
	borderRadius: 8,
	fontSize: 12,
	color: "var(--color-ink)"
};
function BreakEvenChart({ result }) {
	const data = bepChartPoints(result).map((p) => ({
		...p,
		unitsLabel: Math.round(p.units)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-72 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
				data,
				margin: {
					top: 8,
					right: 12,
					left: 4,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "var(--color-rule)",
						strokeDasharray: "3 3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "units",
						tickFormatter: (v) => qty(v, 0),
						tick: {
							fill: "var(--color-ink-muted)",
							fontSize: 11
						},
						axisLine: { stroke: "var(--color-rule-strong)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tickFormatter: (v) => inr(v, 0),
						tick: {
							fill: "var(--color-ink-muted)",
							fontSize: 11
						},
						width: 72,
						axisLine: { stroke: "var(--color-rule-strong)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						contentStyle: tooltipStyle,
						formatter: (value, name) => [typeof value === "number" ? inr(value, 0) : value, name],
						labelFormatter: (l) => `${qty(Number(l), 0)} units`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 12 } }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "revenue",
						name: "Sales revenue",
						stroke: "var(--color-accent)",
						strokeWidth: 2,
						dot: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "totalCost",
						name: "Total cost",
						stroke: "var(--color-loss)",
						strokeWidth: 2,
						dot: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "fixed",
						name: "Fixed cost",
						stroke: "var(--color-ink-subtle)",
						strokeDasharray: "5 5",
						strokeWidth: 1.5,
						dot: false
					})
				]
			})
		})
	});
}
function CostMixChart({ result }) {
	const slices = [
		{
			name: "Net material",
			value: result.netMaterial,
			fill: "var(--color-accent)"
		},
		{
			name: "Direct labour",
			value: result.directLabour,
			fill: "var(--color-ink-muted)"
		},
		{
			name: "Factory overheads",
			value: result.factoryOverheads,
			fill: "var(--color-rule-strong)"
		},
		{
			name: "Administration",
			value: result.adminOverheads,
			fill: "var(--color-ink-subtle)"
		},
		{
			name: "Selling & distribution",
			value: result.sellingDist,
			fill: "var(--color-input-border)"
		}
	].filter((s) => s.value > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-72 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
					data: slices,
					dataKey: "value",
					nameKey: "name",
					cx: "50%",
					cy: "50%",
					innerRadius: 58,
					outerRadius: 92,
					paddingAngle: 2,
					children: slices.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: s.fill }, s.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					contentStyle: tooltipStyle,
					formatter: (value) => typeof value === "number" ? inr(value, 0) : value
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 12 } })
			] })
		})
	});
}
function SensitivityChart({ result }) {
	const data = result.sensitivity.map((s) => ({
		name: s.label.replace("Selling price ", "SP ").replace("Recycled PP at ", ""),
		profit: s.profitAtActual
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-80 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
				data,
				margin: {
					top: 8,
					right: 8,
					left: 4,
					bottom: 64
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "var(--color-rule)",
						strokeDasharray: "3 3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "name",
						interval: 0,
						angle: -38,
						textAnchor: "end",
						tick: {
							fill: "var(--color-ink-muted)",
							fontSize: 10
						},
						height: 70
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tickFormatter: (v) => inr(v, 0),
						tick: {
							fill: "var(--color-ink-muted)",
							fontSize: 11
						},
						width: 72
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						contentStyle: tooltipStyle,
						formatter: (value) => typeof value === "number" ? inr(value, 0) : value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						dataKey: "profit",
						name: "Profit / (loss)",
						radius: [
							4,
							4,
							0,
							0
						],
						children: data.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: d.profit >= 0 ? "var(--color-profit)" : "var(--color-loss)" }, d.name))
					})
				]
			})
		})
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:bg-accent-hover",
			outline: "border border-rule bg-surface text-ink hover:bg-bg-sunken",
			ghost: "text-ink-muted hover:bg-bg-sunken hover:text-ink",
			danger: "bg-loss text-paper hover:opacity-90"
		},
		size: {
			default: "h-11 px-4 text-sm",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5 text-sm",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-md border border-input-border bg-input px-3 text-sm text-ink tabular-nums shadow-none", "placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40", "disabled:opacity-50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-xs font-medium tracking-wide text-ink-muted", className),
		...props
	});
}
function Badge({ className, tone = "neutral", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide", tone === "neutral" && "bg-bg-sunken text-ink-muted", tone === "estimate" && "bg-estimate text-ink", tone === "loss" && "bg-loss-soft text-loss", tone === "profit" && "bg-profit-soft text-profit", tone === "input" && "bg-input text-accent", className),
		...props
	});
}
var useCostStore = create()(persist((set) => ({
	inputs: DEFAULT_INPUTS,
	setInput: (key, value) => set((s) => ({ inputs: {
		...s.inputs,
		[key]: value
	} })),
	patch: (partial) => set((s) => ({ inputs: {
		...s.inputs,
		...partial
	} })),
	reset: () => set({ inputs: DEFAULT_INPUTS })
}), {
	name: "core-plug-cost-sheet-v1",
	skipHydration: true
}));
var NAV = [
	{
		id: "overview",
		label: "Overview"
	},
	{
		id: "inputs",
		label: "Inputs"
	},
	{
		id: "sheet",
		label: "Cost sheet"
	},
	{
		id: "cvp",
		label: "CVP"
	},
	{
		id: "scenarios",
		label: "Scenarios"
	},
	{
		id: "findings",
		label: "Findings"
	},
	{
		id: "report",
		label: "Report"
	}
];
function WorkingPaper() {
	const inputs = useCostStore((s) => s.inputs);
	const setInput = useCostStore((s) => s.setInput);
	const reset = useCostStore((s) => s.reset);
	const result = (0, import_react.useMemo)(() => computeCost(inputs), [inputs]);
	const [tab, setTab] = (0, import_react.useState)("overview");
	const [downloading, setDownloading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		useCostStore.persist.rehydrate();
	}, []);
	async function onDownload() {
		setDownloading(true);
		try {
			const { downloadWorkbook } = await import("./excel-export-ChLHo5RV.mjs");
			await downloadWorkbook(inputs);
		} finally {
			setDownloading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none fixed inset-y-0 left-0 z-20 w-2 bg-binding no-print" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				result,
				onDownload,
				downloading,
				onReset: reset
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "no-print sticky top-16 z-30 border-b border-rule bg-bg/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 md:px-6",
					children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setTab(item.id);
							document.getElementById(item.id)?.scrollIntoView({
								behavior: "smooth",
								block: "start"
							});
						},
						className: cn("h-10 shrink-0 rounded-full px-3.5 text-sm transition-colors duration-150", tab === item.id ? "bg-accent text-accent-fg" : "text-ink-muted hover:bg-bg-sunken hover:text-ink"),
						children: item.label
					}, item.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, { result }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputsPanel, {
						inputs,
						setInput
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CostSheetPanel, { result }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CvpPanel, { result }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenariosPanel, { result }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FindingsPanel, { result }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportPanel, { result })
				]
			})
		]
	});
}
function Header({ result, onDownload, downloading, onReset }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur no-print",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-10 items-center justify-center rounded-md bg-accent text-accent-fg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Factory, {
						className: "size-5",
						strokeWidth: 1.75
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg leading-tight tracking-tight text-ink md:text-xl",
						children: "Cost sheet & CVP"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "truncate text-xs text-ink-muted",
						children: [
							result.inputs.productName,
							" · ",
							result.inputs.companyName,
							" · CEC-1 working paper"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: onReset,
							"aria-label": "Reset to factory data",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: "hidden sm:inline-flex",
							onClick: () => window.print(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, {}), "Print"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: onDownload,
							disabled: downloading,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), downloading ? "Preparing…" : "Excel"]
						})
					]
				})
			]
		})
	});
}
function Overview({ result }) {
	const loss = result.profit < 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "overview",
		className: "scroll-mt-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 max-w-3xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-widest text-ink-muted",
						children: "1PGDM01 · Managerial Accounting-I · October 2026"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl",
						children: result.inputs.productName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-relaxed text-ink-muted md:text-base",
						children: "Monthly cost sheet for an injection-moulded 76mm PP core plug. Factory figures are live on the Inputs tab — blue cells in the Excel download work the same way. Estimates are marked."
					})
				]
			}),
			result.contributionIsNegative && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex gap-3 rounded-lg border border-loss/20 bg-loss-soft p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 size-5 shrink-0 text-loss" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-loss",
					children: "Contribution is negative"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm leading-relaxed text-ink",
					children: [
						"Variable cost of ",
						inr(result.variableCostPerUnit, 3),
						" exceeds the selling price of ",
						inr(result.inputs.sellingPrice, 2),
						". Break-even does not exist. Running toward ",
						qty(result.inputs.maxCapacity),
						" ",
						"capacity would widen the loss to ",
						signedInr(result.profitAtCapacity),
						". Price or polymer cost has to move first — see Findings."
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Sales",
						value: inr(result.salesRevenue, 0),
						hint: `${qty(result.inputs.unitsSold)} × ₹${result.inputs.sellingPrice}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Cost of sales",
						value: inr(result.costOfSales, 0),
						hint: `${inr(result.costPerUnit, 3)} / piece`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: loss ? "Loss" : "Profit",
						value: signedInr(result.profit, 0),
						hint: pct(result.profitMarginOnSales),
						tone: loss ? "loss" : "profit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Contribution / unit",
						value: signedInr(result.contributionPerUnit, 3),
						hint: `P/V ${pct(result.pvRatio)}`,
						tone: result.contributionIsNegative ? "loss" : "profit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Break-even",
						value: result.bepUnits === null ? "Not reachable" : qty(result.bepUnits, 0),
						hint: result.bepSales === null ? "Negative contribution" : inr(result.bepSales, 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Capacity used",
						value: pct(result.capacityUtilisation),
						hint: `${qty(result.inputs.unitsProduced)} of ${qty(result.inputs.maxCapacity)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Net material / unit",
						value: inr(result.variableMaterialPerUnit, 3),
						hint: `${result.inputs.netWeightGrams.toFixed(2)} g net · ₹${result.inputs.rawMaterialRatePerKg}/kg`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Fixed costs",
						value: inr(result.totalFixed, 0),
						hint: "Factory, repairs, depreciation, admin, S&D"
					})
				]
			})
		]
	});
}
function Kpi({ label, value, hint, tone = "neutral" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-lg border border-rule bg-paper p-4", tone === "loss" && "border-loss/20 bg-loss-soft", tone === "profit" && "border-profit/20 bg-profit-soft"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-widest text-ink-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1 font-display text-xl tabular-nums tracking-tight md:text-2xl", tone === "loss" && "text-loss", tone === "profit" && "text-profit"),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-ink-subtle",
				children: hint
			})
		]
	});
}
function InputsPanel({ inputs, setInput }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "inputs",
		className: "scroll-mt-32 print-break",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table2, { className: "size-4" }),
			kicker: "Edit blue cells",
			title: "Factory inputs",
			body: "Figures in blue come from the visit. Gold rows are estimates required to complete the cost sheet (weight, working days, machinery value, scrap recovery). Changing any field recalculates the ledger, CVP and Excel file."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 md:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldGroup, {
					title: "Identity",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Company",
							value: inputs.companyName,
							onChange: (v) => setInput("companyName", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Product",
							value: inputs.productName,
							onChange: (v) => setInput("productName", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Period",
							value: inputs.periodLabel,
							onChange: (v) => setInput("periodLabel", v)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldGroup, {
					title: "Volume & price",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Units produced / month",
							value: inputs.unitsProduced,
							onChange: (v) => setInput("unitsProduced", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Units sold / month",
							value: inputs.unitsSold,
							onChange: (v) => setInput("unitsSold", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Maximum capacity",
							value: inputs.maxCapacity,
							onChange: (v) => setInput("maxCapacity", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Selling price ₹ / piece",
							value: inputs.sellingPrice,
							step: .1,
							onChange: (v) => setInput("sellingPrice", v)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldGroup, {
					title: "Direct material",
					badge: "₹2,47,800 reconcilies here",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "PP rate ₹ / kg",
							value: inputs.rawMaterialRatePerKg,
							onChange: (v) => setInput("rawMaterialRatePerKg", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Net weight / good piece (g)",
							value: round4(inputs.netWeightGrams),
							step: .01,
							estimate: true,
							onChange: (v) => setInput("netWeightGrams", v),
							note: "Back-solved from ₹2,47,800 issue at ₹158/kg with 3% waste"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Waste / scrap %",
							value: inputs.wastePercent,
							step: .1,
							onChange: (v) => setInput("wastePercent", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Scrap recovery % of waste value",
							value: inputs.scrapRecoveryPercent,
							estimate: true,
							onChange: (v) => setInput("scrapRecoveryPercent", v)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldGroup, {
					title: "Labour",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Wage ₹ / worker / day",
							value: inputs.labourPerDay,
							onChange: (v) => setInput("labourPerDay", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Production employees",
							value: inputs.productionEmployees,
							onChange: (v) => setInput("productionEmployees", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Working days / month",
							value: inputs.workingDays,
							estimate: true,
							onChange: (v) => setInput("workingDays", v),
							note: "26-day manufacturing month"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Hours / day",
							value: inputs.hoursPerDay,
							onChange: (v) => setInput("hoursPerDay", v)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldGroup, {
					title: "Overheads",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Other variable production ₹ / month",
							value: inputs.otherVariableMonthly,
							onChange: (v) => setInput("otherVariableMonthly", v),
							note: "Keep 0 unless ₹2,47,800 is truly extra overhead on top of polymer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Factory / manufacturing fixed ₹",
							value: inputs.factoryFixedMonthly,
							onChange: (v) => setInput("factoryFixedMonthly", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Administrative expenses ₹",
							value: inputs.adminMonthly,
							onChange: (v) => setInput("adminMonthly", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Selling & distribution ₹",
							value: inputs.sellingDistMonthly,
							onChange: (v) => setInput("sellingDistMonthly", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Machine repair & maintenance ₹",
							value: inputs.repairsMonthly,
							onChange: (v) => setInput("repairsMonthly", v)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldGroup, {
					title: "Capital & planning",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Machinery original cost ₹",
							value: inputs.machineryValue,
							estimate: true,
							onChange: (v) => setInput("machineryValue", v),
							note: "Used 50–80T moulder + 76mm mould"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Depreciation rate % / month",
							value: inputs.depreciationRateMonthly * 100,
							step: .1,
							onChange: (v) => setInput("depreciationRateMonthly", v / 100)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Target profit ₹ / month",
							value: inputs.targetProfit,
							onChange: (v) => setInput("targetProfit", v)
						})
					]
				})
			]
		})]
	});
}
function FieldGroup({ title, badge, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-rule bg-paper p-4 md:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-lg tracking-tight",
				children: title
			}), badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: "input",
				children: badge
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2",
			children
		})]
	});
}
function TextField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
function NumField({ label, value, onChange, step = 1, estimate, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-1.5", estimate && "rounded-md bg-estimate/60 p-2"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), estimate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "estimate",
					children: "Estimate"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "input",
					children: "Input"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "number",
				step,
				value: Number.isFinite(value) ? step < 1 ? Number(value.toFixed(4)) : value : 0,
				onChange: (e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-snug text-ink-subtle",
				children: note
			}) : null
		]
	});
}
function CostSheetPanel({ result }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "sheet",
		className: "scroll-mt-32 print-break",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				kicker: "Classified manufacturing ledger",
				title: "Cost sheet",
				body: `Period: ${result.inputs.periodLabel}. Output ${qty(result.inputs.unitsProduced)} pieces. Depreciation is the only estimated overhead.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg border border-rule bg-paper",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-xl border-collapse text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "bg-accent text-accent-fg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-left font-medium",
								children: "Particulars"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-right font-medium",
								children: "Amount (₹)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-right font-medium",
								children: "Per unit (₹)"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: result.lines.map((line) => {
						if (line.kind === "section") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "bg-accent-soft",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 3,
								className: "px-4 py-2 font-medium text-accent",
								children: line.label
							})
						}, line.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: cn("border-t border-rule", line.kind === "subtotal" && "bg-bg-sunken/60", line.kind === "total" && "bg-bg-sunken font-medium", line.kind === "result" && (result.profit >= 0 ? "bg-profit-soft" : "bg-loss-soft"), line.estimate && "bg-estimate/70"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn(line.kind !== "item" && "font-medium"),
											children: line.label
										}),
										line.estimate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: "estimate",
											className: "ml-2",
											children: "Estimate"
										}) : null,
										line.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-0.5 text-xs text-ink-subtle",
											children: line.note
										}) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("px-4 py-2.5 text-right tabular-nums", line.kind === "result" && (result.profit >= 0 ? "text-profit" : "text-loss")),
									children: signedInr(line.amount, 2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2.5 text-right tabular-nums text-ink-muted",
									children: signedInr(line.perUnit, 3)
								})
							]
						}, line.id);
					}) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-ink-subtle",
				children: [
					"Margin on sales ",
					pct(result.profitMarginOnSales, 2),
					" · Prime cost",
					" ",
					inr(result.primeCost, 0),
					" · Factory cost ",
					inr(result.factoryCost, 0)
				]
			})
		]
	});
}
function CvpPanel({ result }) {
	const rows = [
		{
			k: "Variable cost / unit — material",
			v: inr(result.variableMaterialPerUnit, 4)
		},
		{
			k: "Variable cost / unit — labour",
			v: inr(result.variableLabourPerUnit, 4)
		},
		{
			k: "Variable cost / unit — other",
			v: inr(result.variableOtherPerUnit, 4)
		},
		{
			k: "Total variable cost / unit",
			v: inr(result.variableCostPerUnit, 4)
		},
		{
			k: "Selling price / unit",
			v: inr(result.inputs.sellingPrice, 2)
		},
		{
			k: "Contribution / unit",
			v: signedInr(result.contributionPerUnit, 4)
		},
		{
			k: "P/V ratio",
			v: pct(result.pvRatio, 2)
		},
		{
			k: "Total fixed costs",
			v: inr(result.totalFixed, 2)
		},
		{
			k: "Break-even (units)",
			v: result.bepUnits === null ? "Not achievable" : qty(result.bepUnits, 0)
		},
		{
			k: "Break-even (sales)",
			v: result.bepSales === null ? "Not achievable" : inr(result.bepSales, 0)
		},
		{
			k: "Margin of safety",
			v: result.marginOfSafetyUnits === null ? "—" : `${qty(result.marginOfSafetyUnits, 0)} (${pct(result.marginOfSafetyPercent ?? 0)})`
		},
		{
			k: "Total contribution",
			v: signedInr(result.contributionTotal, 0)
		},
		{
			k: "Profit / (loss)",
			v: signedInr(result.profit, 0)
		},
		{
			k: "Degree of operating leverage",
			v: result.degreeOfOperatingLeverage === null ? "—" : result.degreeOfOperatingLeverage.toFixed(2)
		},
		{
			k: "BEP as % of capacity",
			v: result.bepPercentOfCapacity === null ? "—" : pct(result.bepPercentOfCapacity)
		},
		{
			k: "Profit at full capacity",
			v: signedInr(result.profitAtCapacity, 0)
		},
		{
			k: `Units for target profit ${inr(result.inputs.targetProfit, 0)}`,
			v: result.unitsForTargetProfit === null ? "Not achievable" : qty(result.unitsForTargetProfit, 0)
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "cvp",
		className: "scroll-mt-32 print-break",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
			kicker: "Break-even and profit planning",
			title: "Cost-volume-profit",
			body: "Direct material (net of regrind), production wages and other variable production are treated as variable. Monthly lumps — factory, repairs, depreciation, admin, selling — are fixed."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-lg border border-rule bg-paper",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
					className: "w-full text-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-rule first:border-t-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5 text-ink-muted",
							children: row.k
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5 text-right tabular-nums font-medium",
							children: row.v
						})]
					}, row.k)) })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Break-even chart",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakEvenChart, { result }), result.contributionIsNegative ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-loss",
						children: "Revenue and total-cost lines do not meet in the relevant range."
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "Cost of sales mix",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CostMixChart, { result })
				})]
			})]
		})]
	});
}
function ScenariosPanel({ result }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "scenarios",
		className: "scroll-mt-32 print-break",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				kicker: "What-if",
				title: "Sensitivity",
				body: "Each row holds one change against the factory base. Profit is at actual monthly volume (1,20,000 unless you edited it)."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-6 overflow-x-auto rounded-lg border border-rule bg-paper",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-3xl text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "bg-accent text-accent-fg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-3 text-left font-medium",
								children: "Scenario"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-3 text-right font-medium",
								children: "Contrib / u"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-3 text-right font-medium",
								children: "Fixed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-3 text-right font-medium",
								children: "BEP units"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-3 text-right font-medium",
								children: "Profit at actual"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: result.sensitivity.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: cn("border-t border-rule", s.id === "base" && "bg-bg-sunken font-medium"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2.5",
								children: [s.label, s.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-normal text-ink-subtle",
									children: s.note
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 text-right tabular-nums",
								children: signedInr(s.contributionPerUnit, 3)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 text-right tabular-nums",
								children: inr(s.fixedCost, 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 text-right tabular-nums",
								children: s.bepUnits === null ? "—" : qty(s.bepUnits, 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("px-3 py-2.5 text-right tabular-nums", s.profitAtActual >= 0 ? "text-profit" : "text-loss"),
								children: signedInr(s.profitAtActual, 0)
							})
						]
					}, s.id)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Profit under each scenario",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SensitivityChart, { result })
			})
		]
	});
}
function FindingsPanel({ result }) {
	const combo = result.sensitivity.find((s) => s.id === "combo");
	const recycled = result.sensitivity.find((s) => s.id === "rm90");
	const price = result.sensitivity.find((s) => s.id === "sp25");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "findings",
		className: "scroll-mt-32 print-break",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
			kicker: "Observations",
			title: "Findings and recommendations"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, {
					title: "Polymer is above the selling price",
					children: [
						"Net material is ",
						inr(result.variableMaterialPerUnit, 3),
						" against a job rate of",
						" ",
						inr(result.inputs.sellingPrice, 2),
						". At ₹",
						result.inputs.rawMaterialRatePerKg,
						"/kg the implied good-piece weight is ",
						result.inputs.netWeightGrams.toFixed(2),
						" g (",
						result.gramsIssuedPerUnit.toFixed(2),
						" g issued including ",
						result.inputs.wastePercent,
						"% waste). Virgin PP at this rate cannot support a ₹2 plug."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
					title: "Volume is not the lever",
					children: result.contributionIsNegative ? `Each extra piece loses ${inr(Math.abs(result.contributionPerUnit), 3)}. Filling the remaining ${qty(result.inputs.maxCapacity - result.inputs.unitsProduced)} of capacity would increase the monthly loss, not reduce it.` : `Margin of safety is ${pct(result.marginOfSafetyPercent ?? 0)} of current sales.`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, {
					title: "Two paths back to profit",
					children: [
						"Recycled PP at ₹90/kg turns the month into ",
						signedInr(recycled?.profitAtActual ?? 0, 0),
						recycled?.bepUnits ? ` (BEP ${qty(recycled.bepUnits, 0)} pieces)` : "",
						". Raising the job rate to ₹2.50 alone yields ",
						signedInr(price?.profitAtActual ?? 0, 0),
						". Doing both yields ",
						signedInr(combo?.profitAtActual ?? 0, 0),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
					title: "What not to do",
					children: "Do not treat ₹2,47,800 as overhead on top of ₹158/kg — that double-counts resin and makes variable cost look ~₹4/piece. Confirm with the owner that the rupee figure is monthly polymer consumption. Keep 100% sprue/runner regrind in closed loop; the 40% recovery used here is conservative."
				})
			]
		})]
	});
}
function ReportPanel({ result }) {
	const i = result.inputs;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "report",
		className: "scroll-mt-32 print-break",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" }),
			kicker: "CEC-1 write-up",
			title: "Report draft",
			body: "Use this as the 15–20 page skeleton. Paste into Word as Times New Roman 12 / headings 14, line spacing 1.5, then add visit photos, the Excel printouts and the plagiarism report."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "space-y-8 rounded-lg border border-rule bg-paper p-5 leading-relaxed md:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-ink-muted",
							children: "Narayana Business School"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "mt-2 font-display text-2xl tracking-tight",
							children: ["Preparation of Cost Sheet and Cost-Volume-Profit (CVP) Analysis of ", i.companyName]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-ink-muted",
							children: "1PGDM01 · Managerial Accounting-I · PGDM Trimester I · CEC-1 (20 marks) · October 2026"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-ink-muted",
							children: "Under the guidance of Dr. Reshmi Banerjee, Assistant Professor"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportH, { children: "1. Introduction and company profile" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					i.companyName,
					" is a small injection-moulding unit producing ",
					i.productName,
					" — round polypropylene end plugs used on paper, film, foil and textile cores. The commercial 76mm (3-inch) plug is a high-volume, thin-margin industrial consumable. The unit runs two production employees on 12-hour shifts, with stated monthly output of",
					" ",
					qty(i.unitsProduced),
					" pieces against a machine capacity of ",
					qty(i.maxCapacity),
					". The job-work / selling rate is ₹",
					i.sellingPrice,
					" per piece, which is in line with lightweight 76mm plugs listed in the North Indian wholesale market (typically ₹1.60–₹1.90 when recycled resin is used)."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportH, { children: "2. Methodology" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Cost data were taken from the production floor: polymer rate, monthly material issue, daily wages, headcount, hours, waste percentage, factory fixed cost, administration, selling and distribution, repairs, and the depreciation rate. Where a figure was missing — net piece weight, working days, machinery original cost, and scrap-recovery percentage — a reasoned estimate was used, as permitted by the CEC-1 brief, and is flagged in the working paper. Classification follows a conventional manufacturing cost sheet (direct material, direct labour, prime cost, factory overheads, factory cost, administration, cost of production, selling and distribution, cost of sales). CVP treats material, wages and other variable production as variable, and monthly lumps as fixed. Opening stock is assumed nil; production equals sales in the base month." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportH, { children: "3. Production process" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "list-decimal space-y-1 pl-5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Receipt and storage of PP granules (virgin or recycled)." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Drying / mixing with colour masterbatch if required." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Injection moulding in a 76mm core-plug cavity tool." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Cooling, ejection, deflashing of sprue and runners." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Regrind of process waste (target: closed loop)." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Visual quality check on diameter and seating." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Bag / carton packing and dispatch to paper-tube and film converters." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportH, { children: "4. Cost structure" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Monthly cost of sales is ",
					inr(result.costOfSales, 2),
					" (",
					inr(result.costPerUnit, 3),
					" per piece) against sales of ",
					inr(result.salesRevenue, 2),
					", a ",
					result.profit < 0 ? "loss" : "profit",
					" of",
					" ",
					signedInr(result.profit, 2),
					". Net direct material ",
					inr(result.netMaterial, 2),
					" is",
					" ",
					pct(result.netMaterial / result.costOfSales),
					" of cost and ",
					inr(result.variableMaterialPerUnit, 3),
					" ",
					"per piece — already above the selling price. Direct labour is modest at",
					" ",
					inr(result.directLabour, 2),
					" (",
					i.productionEmployees,
					" × ₹",
					i.labourPerDay,
					" × ",
					i.workingDays,
					" days,",
					result.labourHours,
					" labour hours at ",
					inr(result.labourPerHour, 2),
					"/hour). Fixed cash and non-cash overheads total ",
					inr(result.totalFixed, 2),
					", of which depreciation",
					" ",
					inr(result.depreciation, 2),
					" is estimated from a ₹",
					qty(i.machineryValue),
					" asset at 2% per month."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportH, { children: "5. CVP analysis" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Contribution per unit is ",
					signedInr(result.contributionPerUnit, 4),
					"; P/V ratio",
					" ",
					pct(result.pvRatio, 2),
					".",
					" ",
					result.contributionIsNegative ? "Because contribution is negative, the break-even point is undefined: no positive volume covers fixed cost. Margin of safety and degree of operating leverage are not reported. Profit at full capacity is " + signedInr(result.profitAtCapacity, 2) + ", worse than the current month. Units required for the target profit of " + inr(i.targetProfit, 0) + " are likewise unattainable until the contribution turns positive." : `Break-even is ${qty(result.bepUnits ?? 0, 0)} units (${inr(result.bepSales ?? 0, 0)}). Margin of safety is ${qty(result.marginOfSafetyUnits ?? 0, 0)} units (${pct(result.marginOfSafetyPercent ?? 0)}).`
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportH, { children: "6. Key findings" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "list-disc space-y-1 pl-5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"Resin at ₹",
							i.rawMaterialRatePerKg,
							"/kg is inconsistent with a ₹",
							i.sellingPrice,
							" plug of ~",
							i.netWeightGrams.toFixed(1),
							" g."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"₹2,47,800 is monthly polymer issue (~",
							result.kgIssued.toFixed(0),
							" kg), not a second variable overhead."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Labour and cash fixed costs are not the problem; material is." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"Capacity utilisation is ",
							pct(result.capacityUtilisation),
							"; unused capacity is not a profit lever while contribution is negative."
						] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportH, { children: "7. Conclusion and recommendations" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "list-decimal space-y-1 pl-5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Move the job rate toward ₹2.50–₹3.00, or restrict ₹2 work to recycled-resin jobs only." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Source recycled / regrind PP near ₹90–₹110/kg for this SKU (standard in the 76mm plug trade)." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Close the loop on the 3% process waste — 100% in-house regrind rather than 40% external recovery." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "If the customer specification allows, cut net wall weight by ~10%." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"Do not chase the extra ",
							qty(i.maxCapacity - i.unitsProduced),
							" pieces of capacity until contribution is positive."
						] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportH, { children: "8. References" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "list-disc space-y-1 pl-5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "CEC-1 brief, 1PGDM01 Managerial Accounting-I, Narayana Business School, October 2026." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Standard cost sheet: prime cost, factory cost, cost of production, cost of sales." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "CVP identities: contribution, P/V ratio, break-even, margin of safety, operating leverage." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Market checks: 76mm PP core plugs, IndiaMART / TradeIndia listings (weight and ₹/piece bands)." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportH, { children: "Annexures" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: "A. Title page (as prescribed). B. Contact details of the person visited — to be filled after the factory visit. C. List of group members. D. Excel cost sheet (download from this working paper). E. Plagiarism report (≤30% similarity). F. Photographs / video of the production unit."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-ink-subtle",
					children: [
						"Default estimates used: net weight ",
						DEFAULT_INPUTS.netWeightGrams.toFixed(4),
						" g; working days ",
						DEFAULT_INPUTS.workingDays,
						"; machinery ",
						inr(DEFAULT_INPUTS.machineryValue, 0),
						"; scrap recovery ",
						DEFAULT_INPUTS.scrapRecoveryPercent,
						"%."
					]
				})
			]
		})]
	});
}
function SectionTitle({ kicker, title, body, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-5 max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-ink-muted",
				children: [icon, kicker]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-2xl tracking-tight md:text-3xl",
				children: title
			}),
			body ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-ink-muted",
				children: body
			}) : null
		]
	});
}
function Panel({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-rule bg-paper p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "mb-3 font-display text-lg tracking-tight",
			children: title
		}), children]
	});
}
function Note({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-rule bg-paper p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-display text-lg tracking-tight",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm leading-relaxed text-ink-muted",
			children
		})]
	});
}
function ReportH({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "font-display text-xl tracking-tight",
		children
	});
}
function round4(n) {
	return Math.round(n * 1e4) / 1e4;
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkingPaper, {});
}
//#endregion
export { computeCost as n, routes_exports as t };
