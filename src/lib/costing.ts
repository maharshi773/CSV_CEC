/**
 * Cost sheet + CVP engine for 76mm Core Plugs.
 *
 * Factory figures are taken as given. Two gaps are filled as estimates
 * (clearly flagged): net piece weight implied by ₹2,47,800 material issue
 * at ₹158/kg, and machinery original cost for 2%/month depreciation.
 */

export type CostInputs = {
  companyName: string;
  productName: string;
  periodLabel: string;
  sellingPrice: number;
  unitsProduced: number;
  unitsSold: number;
  maxCapacity: number;
  rawMaterialRatePerKg: number;
  /** Net polymer in one good piece, grams. */
  netWeightGrams: number;
  wastePercent: number;
  scrapRecoveryPercent: number;
  labourPerDay: number;
  productionEmployees: number;
  workingDays: number;
  hoursPerDay: number;
  otherVariableMonthly: number;
  factoryFixedMonthly: number;
  adminMonthly: number;
  sellingDistMonthly: number;
  repairsMonthly: number;
  depreciationRateMonthly: number;
  machineryValue: number;
  targetProfit: number;
};

export type CostLine = {
  id: string;
  label: string;
  amount: number;
  perUnit: number;
  kind: "item" | "subtotal" | "total" | "result" | "section";
  note?: string;
  estimate?: boolean;
};

export type SensitivityRow = {
  id: string;
  label: string;
  sellingPrice: number;
  contributionPerUnit: number;
  fixedCost: number;
  bepUnits: number | null;
  bepSales: number | null;
  profitAtActual: number;
  note?: string;
};

export type CostResult = {
  inputs: CostInputs;
  kgIssued: number;
  kgGood: number;
  kgWaste: number;
  gramsIssuedPerUnit: number;
  grossMaterial: number;
  scrapCredit: number;
  netMaterial: number;
  directLabour: number;
  labourHours: number;
  labourPerHour: number;
  otherVariable: number;
  otherVariablePerUnit: number;
  depreciation: number;
  primeCost: number;
  factoryOverheads: number;
  factoryCost: number;
  adminOverheads: number;
  costOfProduction: number;
  sellingDist: number;
  costOfSales: number;
  salesRevenue: number;
  profit: number;
  profitMarginOnSales: number;
  costPerUnit: number;
  variableCost: number;
  variableCostPerUnit: number;
  variableMaterialPerUnit: number;
  variableLabourPerUnit: number;
  variableOtherPerUnit: number;
  contributionPerUnit: number;
  contributionTotal: number;
  pvRatio: number;
  totalFixed: number;
  bepUnits: number | null;
  bepSales: number | null;
  marginOfSafetyUnits: number | null;
  marginOfSafetyPercent: number | null;
  degreeOfOperatingLeverage: number | null;
  bepPercentOfCapacity: number | null;
  profitAtCapacity: number;
  unitsForTargetProfit: number | null;
  capacityUtilisation: number;
  contributionIsNegative: boolean;
  lines: CostLine[];
  sensitivity: SensitivityRow[];
  fixedBreakdown: { label: string; amount: number; estimate?: boolean }[];
};

/** Factory RM total used to back-solve net grams. */
export const FACTORY_MATERIAL_TOTAL = 247_800;
export const FACTORY_MATERIAL_RATE = 158;
export const FACTORY_UNITS = 120_000;
export const FACTORY_WASTE = 0.03;

export const IMPLIED_NET_WEIGHT_GRAMS =
  (((FACTORY_MATERIAL_TOTAL / FACTORY_MATERIAL_RATE) * (1 - FACTORY_WASTE)) /
    FACTORY_UNITS) *
  1000;

export const DEFAULT_INPUTS: CostInputs = {
  companyName: "Core Plug Manufacturing Unit",
  productName: "Core Plugs (76mm)",
  periodLabel: "One month",
  sellingPrice: 2,
  unitsProduced: 120_000,
  unitsSold: 120_000,
  maxCapacity: 200_000,
  rawMaterialRatePerKg: 158,
  netWeightGrams: IMPLIED_NET_WEIGHT_GRAMS,
  wastePercent: 3,
  scrapRecoveryPercent: 40,
  labourPerDay: 400,
  productionEmployees: 2,
  workingDays: 26,
  hoursPerDay: 12,
  otherVariableMonthly: 0,
  factoryFixedMonthly: 6_000,
  adminMonthly: 5_000,
  sellingDistMonthly: 2_000,
  repairsMonthly: 3_000,
  depreciationRateMonthly: 0.02,
  machineryValue: 300_000,
  targetProfit: 50_000,
};

function pu(amount: number, units: number): number {
  if (!units) return 0;
  return amount / units;
}

function materialAndLabour(
  inputs: CostInputs,
  opts?: {
    rate?: number;
    netWeightGrams?: number;
    scrapRecoveryPercent?: number;
    labourPerDay?: number;
    wastePercent?: number;
  },
) {
  const units = Math.max(0, inputs.unitsProduced);
  const rate = opts?.rate ?? inputs.rawMaterialRatePerKg;
  const netG = opts?.netWeightGrams ?? inputs.netWeightGrams;
  const wasteRate = Math.min(
    Math.max((opts?.wastePercent ?? inputs.wastePercent) / 100, 0),
    0.99,
  );
  const recoverRate = Math.min(
    Math.max((opts?.scrapRecoveryPercent ?? inputs.scrapRecoveryPercent) / 100, 0),
    1,
  );
  const kgGood = units * (netG / 1000);
  const kgIssued = wasteRate >= 1 ? 0 : kgGood / (1 - wasteRate);
  const kgWaste = kgIssued - kgGood;
  const grossMaterial = kgIssued * rate;
  const scrapCredit = kgWaste * rate * recoverRate;
  const netMaterial = grossMaterial - scrapCredit;
  const labourPerDay = opts?.labourPerDay ?? inputs.labourPerDay;
  const directLabour = labourPerDay * inputs.productionEmployees * inputs.workingDays;
  const otherVariable = inputs.otherVariableMonthly;
  const vcPerUnit = units
    ? (netMaterial + directLabour + otherVariable) / units
    : 0;
  return {
    kgGood,
    kgIssued,
    kgWaste,
    grossMaterial,
    scrapCredit,
    netMaterial,
    directLabour,
    otherVariable,
    vcPerUnit,
  };
}

function fixedCosts(inputs: CostInputs) {
  const depreciation = inputs.machineryValue * inputs.depreciationRateMonthly;
  const totalFixed =
    inputs.factoryFixedMonthly +
    inputs.repairsMonthly +
    depreciation +
    inputs.adminMonthly +
    inputs.sellingDistMonthly;
  return { depreciation, totalFixed };
}

export function computeCost(inputs: CostInputs): CostResult {
  const units = Math.max(0, inputs.unitsProduced);
  const sold = Math.max(0, inputs.unitsSold);
  const m = materialAndLabour(inputs);
  const { depreciation, totalFixed } = fixedCosts(inputs);

  const labourHours =
    inputs.productionEmployees * inputs.hoursPerDay * inputs.workingDays;
  const labourPerHour = labourHours ? m.directLabour / labourHours : 0;
  const gramsIssuedPerUnit = units ? (m.kgIssued / units) * 1000 : 0;

  const primeCost = m.netMaterial + m.directLabour;
  const factoryOverheads =
    m.otherVariable +
    inputs.factoryFixedMonthly +
    inputs.repairsMonthly +
    depreciation;
  const factoryCost = primeCost + factoryOverheads;
  const adminOverheads = inputs.adminMonthly;
  const costOfProduction = factoryCost + adminOverheads;
  const sellingDist = inputs.sellingDistMonthly;

  const copPerProduced = pu(costOfProduction, units);
  const cogs = copPerProduced * sold;
  const costOfSales = cogs + sellingDist;
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
  const marginOfSafetyPercent =
    marginOfSafetyUnits === null || !sold ? null : marginOfSafetyUnits / sold;
  const degreeOfOperatingLeverage =
    profit === 0 || contributionIsNegative ? null : contributionTotal / profit;
  const bepPercentOfCapacity =
    bepUnits === null || !inputs.maxCapacity ? null : bepUnits / inputs.maxCapacity;
  const profitAtCapacity =
    (inputs.sellingPrice - variableCostPerUnit) * inputs.maxCapacity - totalFixed;
  const unitsForTargetProfit = contributionIsNegative
    ? null
    : (totalFixed + inputs.targetProfit) / contributionPerUnit;
  const capacityUtilisation = inputs.maxCapacity ? units / inputs.maxCapacity : 0;

  const lines: CostLine[] = [
    { id: "dm-sec", label: "A. Direct material", amount: 0, perUnit: 0, kind: "section" },
    {
      id: "dm-gross",
      label: `PP granules issued (${fmtKg(m.kgIssued)} kg × ${fmtRs(inputs.rawMaterialRatePerKg)}/kg)`,
      amount: m.grossMaterial,
      perUnit: pu(m.grossMaterial, units),
      kind: "item",
    },
    {
      id: "dm-scrap",
      label: `Less: scrap / regrind recovery (${fmtKg(m.kgWaste)} kg × ${fmtPct(inputs.scrapRecoveryPercent / 100)} of material value)`,
      amount: -m.scrapCredit,
      perUnit: pu(-m.scrapCredit, units),
      kind: "item",
    },
    {
      id: "dm-net",
      label: "Net direct material",
      amount: m.netMaterial,
      perUnit: pu(m.netMaterial, units),
      kind: "subtotal",
    },
    { id: "dl-sec", label: "B. Direct labour", amount: 0, perUnit: 0, kind: "section" },
    {
      id: "dl",
      label: `Production wages (${inputs.productionEmployees} workers × ${fmtRs(inputs.labourPerDay)}/day × ${inputs.workingDays} days)`,
      amount: m.directLabour,
      perUnit: pu(m.directLabour, units),
      kind: "item",
    },
    {
      id: "prime",
      label: "Prime cost (A + B)",
      amount: primeCost,
      perUnit: pu(primeCost, units),
      kind: "total",
    },
    { id: "foh-sec", label: "C. Factory overheads", amount: 0, perUnit: 0, kind: "section" },
    {
      id: "foh-var",
      label: "Other variable production cost",
      amount: m.otherVariable,
      perUnit: pu(m.otherVariable, units),
      kind: "item",
      note:
        m.otherVariable === 0
          ? "₹2,47,800 from the factory is treated as raw-material issue, not extra overhead"
          : undefined,
    },
    {
      id: "foh-fix",
      label: "Factory / manufacturing fixed cost",
      amount: inputs.factoryFixedMonthly,
      perUnit: pu(inputs.factoryFixedMonthly, units),
      kind: "item",
    },
    {
      id: "foh-rep",
      label: "Machine repair & maintenance",
      amount: inputs.repairsMonthly,
      perUnit: pu(inputs.repairsMonthly, units),
      kind: "item",
    },
    {
      id: "foh-dep",
      label: `Depreciation of machinery (${fmtPct(inputs.depreciationRateMonthly)} of ${fmtRs(inputs.machineryValue)})`,
      amount: depreciation,
      perUnit: pu(depreciation, units),
      kind: "item",
      estimate: true,
    },
    {
      id: "foh-tot",
      label: "Total factory overheads",
      amount: factoryOverheads,
      perUnit: pu(factoryOverheads, units),
      kind: "subtotal",
    },
    {
      id: "factory",
      label: "Factory cost (prime + factory OH)",
      amount: factoryCost,
      perUnit: pu(factoryCost, units),
      kind: "total",
    },
    { id: "aoh-sec", label: "D. Administrative overheads", amount: 0, perUnit: 0, kind: "section" },
    {
      id: "aoh",
      label: "Administrative expenses",
      amount: adminOverheads,
      perUnit: pu(adminOverheads, units),
      kind: "item",
    },
    {
      id: "cop",
      label: "Cost of production",
      amount: costOfProduction,
      perUnit: pu(costOfProduction, units),
      kind: "total",
    },
    { id: "sd-sec", label: "E. Selling & distribution", amount: 0, perUnit: 0, kind: "section" },
    {
      id: "sd",
      label: "Selling & distribution expenses",
      amount: sellingDist,
      perUnit: pu(sellingDist, sold || units),
      kind: "item",
    },
    {
      id: "cos",
      label: "Total cost of sales",
      amount: costOfSales,
      perUnit: costPerUnit,
      kind: "total",
    },
    {
      id: "sales",
      label: `Sales revenue (${sold.toLocaleString("en-IN")} × ₹${inputs.sellingPrice})`,
      amount: salesRevenue,
      perUnit: inputs.sellingPrice,
      kind: "item",
    },
    {
      id: "profit",
      label: profit >= 0 ? "Profit" : "Loss",
      amount: profit,
      perUnit: pu(profit, sold || units),
      kind: "result",
    },
  ];

  const fixedBreakdown = [
    { label: "Factory / manufacturing fixed", amount: inputs.factoryFixedMonthly },
    { label: "Machine repair & maintenance", amount: inputs.repairsMonthly },
    { label: "Depreciation of machinery", amount: depreciation, estimate: true },
    { label: "Administrative expenses", amount: adminOverheads },
    { label: "Selling & distribution", amount: sellingDist },
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
    fixedBreakdown,
  };
}

function scenario(
  id: string,
  label: string,
  sellingPrice: number,
  vcPerUnit: number,
  fixedCost: number,
  sold: number,
  note?: string,
): SensitivityRow {
  const contributionPerUnit = sellingPrice - vcPerUnit;
  const neg = contributionPerUnit <= 0;
  const bepUnits = neg ? null : fixedCost / contributionPerUnit;
  return {
    id,
    label,
    sellingPrice,
    contributionPerUnit,
    fixedCost,
    bepUnits,
    bepSales: bepUnits === null ? null : bepUnits * sellingPrice,
    profitAtActual: contributionPerUnit * sold - fixedCost,
    note,
  };
}

function buildSensitivity(
  inputs: CostInputs,
  sold: number,
  totalFixed: number,
): SensitivityRow[] {
  const sp = inputs.sellingPrice;
  const baseVc = materialAndLabour(inputs).vcPerUnit;
  const lab10Vc = materialAndLabour(inputs, { labourPerDay: inputs.labourPerDay * 1.1 }).vcPerUnit;
  const rm90Vc = materialAndLabour(inputs, { rate: 90 }).vcPerUnit;
  const rm130Vc = materialAndLabour(inputs, { rate: 130 }).vcPerUnit;
  const wt90Vc = materialAndLabour(inputs, {
    netWeightGrams: inputs.netWeightGrams * 0.9,
  }).vcPerUnit;
  const regrindVc = materialAndLabour(inputs, { scrapRecoveryPercent: 100 }).vcPerUnit;

  return [
    scenario("base", "Base case (factory data)", sp, baseVc, totalFixed, sold),
    scenario("lab10", "Labour rate +10%", sp, lab10Vc, totalFixed, sold),
    scenario("sp18", "Selling price ₹1.80", 1.8, baseVc, totalFixed, sold),
    scenario("sp25", "Selling price ₹2.50", 2.5, baseVc, totalFixed, sold),
    scenario("sp30", "Selling price ₹3.00", 3, baseVc, totalFixed, sold),
    scenario(
      "rm90",
      "Recycled PP at ₹90/kg",
      sp,
      rm90Vc,
      totalFixed,
      sold,
      "Typical regrind/recycled resin used for core plugs",
    ),
    scenario("rm130", "Resin at ₹130/kg", sp, rm130Vc, totalFixed, sold),
    scenario(
      "wt10",
      "Net piece weight −10%",
      sp,
      wt90Vc,
      totalFixed,
      sold,
      "Thinner wall if the customer specification allows",
    ),
    scenario(
      "regrind",
      "100% in-house regrind of 3% waste",
      sp,
      regrindVc,
      totalFixed,
      sold,
    ),
    scenario("fix10", "Fixed costs +10%", sp, baseVc, totalFixed * 1.1, sold),
    scenario(
      "combo",
      "₹2.50 price + recycled ₹90/kg",
      2.5,
      rm90Vc,
      totalFixed,
      sold,
      "Combined commercial and sourcing correction",
    ),
  ];
}

export function bepChartPoints(result: CostResult, extra = 1.12) {
  const cap = result.inputs.maxCapacity || result.inputs.unitsProduced || 1;
  const maxX = Math.max(cap, result.inputs.unitsProduced, result.bepUnits ?? 0, 1) * extra;
  const steps = 8;
  const pts: {
    units: number;
    revenue: number;
    totalCost: number;
    variableCost: number;
    fixed: number;
  }[] = [];
  for (let i = 0; i <= steps; i++) {
    const units = (maxX * i) / steps;
    pts.push({
      units,
      revenue: units * result.inputs.sellingPrice,
      totalCost: result.totalFixed + units * result.variableCostPerUnit,
      variableCost: units * result.variableCostPerUnit,
      fixed: result.totalFixed,
    });
  }
  return pts;
}

function fmtKg(kg: number): string {
  return kg.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function fmtRs(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function fmtPct(n: number): string {
  const p = n * 100;
  return `${p.toFixed(p % 1 === 0 ? 0 : 1)}%`;
}
