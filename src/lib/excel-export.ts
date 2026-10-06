import ExcelJS from "exceljs";
import { computeCost, type CostInputs, type CostResult } from "./costing";

const NAVY = "1B4D3E";
const INK = "1A1814";
const MUTED = "6B6458";
const INPUT_BG = "D6E6F5";
const INPUT_BORDER = "7BA3D4";
const TOTAL_BG = "E8E2D6";
const RESULT_BG_LOSS = "F4E4E0";
const RESULT_BG_PROFIT = "DCE8DF";
const EST_BG = "F7F0D8";
const RULE = "C4B8A4";
const HEAD_BG = "1B4D3E";

function money(n: number) {
  return Math.round(n * 100) / 100;
}

function applyPrint(ws: ExcelJS.Worksheet) {
  ws.pageSetup = {
    paperSize: 9,
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.6, right: 0.6, top: 0.7, bottom: 0.7, header: 0.3, footer: 0.3 },
  };
  ws.headerFooter.oddFooter = "&LTimes New Roman · Cost sheet & CVP&C&P of &N&RConfidential working paper";
}

function title(ws: ExcelJS.Worksheet, row: number, text: string, merge: string) {
  ws.mergeCells(merge);
  const c = ws.getCell(row, 1);
  c.value = text;
  c.font = { name: "Times New Roman", size: 16, bold: true, color: { argb: "FF" + NAVY } };
  c.alignment = { vertical: "middle", horizontal: "center" };
}

function subtitle(ws: ExcelJS.Worksheet, row: number, text: string, merge: string) {
  ws.mergeCells(merge);
  const c = ws.getCell(row, 1);
  c.value = text;
  c.font = { name: "Times New Roman", size: 11, italic: true, color: { argb: "FF" + MUTED } };
  c.alignment = { horizontal: "center" };
}

function section(ws: ExcelJS.Worksheet, row: number, text: string, cols = 3) {
  ws.mergeCells(row, 1, row, cols);
  const c = ws.getCell(row, 1);
  c.value = text;
  c.font = { name: "Times New Roman", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + HEAD_BG } };
  c.alignment = { vertical: "middle" };
  ws.getRow(row).height = 22;
}

function labelCell(cell: ExcelJS.Cell, text: string, opts?: { bold?: boolean; italic?: boolean; size?: number }) {
  cell.value = text;
  cell.font = {
    name: "Times New Roman",
    size: opts?.size ?? 12,
    bold: opts?.bold,
    italic: opts?.italic,
    color: { argb: "FF" + INK },
  };
  cell.alignment = { vertical: "middle", wrapText: true };
}

function numCell(cell: ExcelJS.Cell, value: number, fmt = "₹#,##,##0.00") {
  cell.value = money(value);
  cell.numFmt = fmt;
  cell.font = { name: "Times New Roman", size: 12, color: { argb: "FF" + INK } };
  cell.alignment = { vertical: "middle", horizontal: "right" };
}

function inputCell(cell: ExcelJS.Cell, value: number | string, fmt?: string) {
  cell.value = typeof value === "number" ? value : value;
  if (typeof value === "number" && fmt) cell.numFmt = fmt;
  cell.font = { name: "Times New Roman", size: 12, color: { argb: "FF1A365D" } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + INPUT_BG } };
  cell.border = {
    top: { style: "thin", color: { argb: "FF" + INPUT_BORDER } },
    left: { style: "thin", color: { argb: "FF" + INPUT_BORDER } },
    bottom: { style: "thin", color: { argb: "FF" + INPUT_BORDER } },
    right: { style: "thin", color: { argb: "FF" + INPUT_BORDER } },
  };
  cell.alignment = { vertical: "middle", horizontal: typeof value === "number" ? "right" : "left" };
}

function hairline(ws: ExcelJS.Worksheet, row: number, cols: number) {
  for (let i = 1; i <= cols; i++) {
    ws.getCell(row, i).border = {
      ...(ws.getCell(row, i).border || {}),
      bottom: { style: "thin", color: { argb: "FF" + RULE } },
    };
  }
}

export async function buildWorkbook(inputs: CostInputs): Promise<ArrayBuffer> {
  const r = computeCost(inputs);
  const wb = new ExcelJS.Workbook();
  wb.creator = "Core Plug Cost Sheet";
  wb.created = new Date();
  wb.lastModifiedBy = "Managerial Accounting CEC-1";

  buildCover(wb, inputs, r);
  buildInputs(wb, inputs, r);
  buildCostSheet(wb, inputs, r);
  buildCvp(wb, inputs, r);
  buildSensitivity(wb, r);
  buildAssumptions(wb, inputs, r);

  const buf = await wb.xlsx.writeBuffer();
  return buf as ArrayBuffer;
}

export async function downloadWorkbook(inputs: CostInputs) {
  const buffer = await buildWorkbook(inputs);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Core_Plugs_76mm_Cost_Sheet_CVP.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildCover(wb: ExcelJS.Workbook, inputs: CostInputs, r: CostResult) {
  const ws = wb.addWorksheet("Title Page", {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: "FF" + NAVY } },
  });
  applyPrint(ws);
  ws.columns = [{ width: 18 }, { width: 28 }, { width: 28 }, { width: 22 }];
  ws.getRow(2).height = 18;
  title(ws, 4, "NARAYANA BUSINESS SCHOOL", "A4:D4");
  subtitle(ws, 5, "LEARN  ·  LEAD  ·  TRANSFORM", "A5:D5");
  ws.getRow(7).height = 28;
  title(
    ws,
    7,
    `Preparation of Cost Sheet and Cost-Volume-Profit (CVP)\nAnalysis of ${inputs.companyName}`,
    "A7:D8",
  );
  ws.getRow(7).height = 36;
  ws.getRow(8).height = 22;
  subtitle(ws, 10, "1PGDM01  ||  Managerial Accounting - I", "A10:D10");
  subtitle(ws, 11, "PGDM — Trimester I", "A11:D11");
  subtitle(ws, 12, "CEC 1 — Project (20 Marks)", "A12:D12");

  const meta: [string, string][] = [
    ["Product", inputs.productName],
    ["Period", inputs.periodLabel],
    ["Output", `${r.inputs.unitsProduced.toLocaleString("en-IN")} pieces`],
    ["Selling price", `₹${inputs.sellingPrice} per piece`],
    ["Prepared as", "Working paper with live Excel formulae on Inputs"],
    ["Faculty", "Dr. Reshmi Banerjee, Assistant Professor"],
    ["Month", "October 2026"],
  ];
  let row = 15;
  for (const [k, v] of meta) {
    labelCell(ws.getCell(row, 2), k, { italic: true, size: 11 });
    labelCell(ws.getCell(row, 3), v, { bold: true });
    row += 1;
  }
  ws.mergeCells("A24:D26");
  const note = ws.getCell(24, 1);
  note.value =
    "Blue cells on the Inputs sheet are the only cells that should be edited. The Cost Sheet, CVP and Sensitivity sheets recalculate from those inputs. Estimated items (machinery value, scrap recovery, working days) are marked on Inputs.";
  note.font = { name: "Times New Roman", size: 11, italic: true, color: { argb: "FF" + MUTED } };
  note.alignment = { wrapText: true, vertical: "top" };
}

function buildInputs(wb: ExcelJS.Workbook, inputs: CostInputs, r: CostResult) {
  const ws = wb.addWorksheet("Inputs", {
    views: [{ showGridLines: false, state: "frozen", ySplit: 4 }],
    properties: { tabColor: { argb: "FF7BA3D4" } },
  });
  applyPrint(ws);
  ws.columns = [{ width: 46 }, { width: 22 }, { width: 62 }];
  title(ws, 1, `${inputs.companyName} — Input data (monthly)`, "A1:C1");
  subtitle(
    ws,
    2,
    "Blue = factory visit / stated assumption. Edit blue cells only. All other sheets recalculate from this sheet.",
    "A2:C2",
  );

  const header = ws.addRow(["Item", "Value", "Source / note"]);
  header.font = { name: "Times New Roman", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  header.eachCell((c) => {
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + HEAD_BG } };
    c.alignment = { vertical: "middle" };
  });
  header.height = 22;

  type Row = {
    label: string;
    value: number | string;
    note: string;
    fmt?: string;
    readonly?: boolean;
  };

  const rows: Row[] = [
    { label: "Company name", value: inputs.companyName, note: "Editable" },
    { label: "Product", value: inputs.productName, note: "76mm PP core plug (paper / film / textile cores)" },
    { label: "Period", value: inputs.periodLabel, note: "Monthly working paper" },
    { label: "Units produced per month", value: inputs.unitsProduced, note: "Factory: 1,20,000 pieces", fmt: "#,##,##0" },
    { label: "Units sold per month", value: inputs.unitsSold, note: "Factory: equal to production (no stock)", fmt: "#,##,##0" },
    { label: "Maximum capacity (units/month)", value: inputs.maxCapacity, note: "Factory: 2,00,000 pieces", fmt: "#,##,##0" },
    { label: "Selling (job) rate per unit (₹)", value: inputs.sellingPrice, note: "Factory: ₹2 per piece", fmt: "₹#,##0.00" },
    { label: "Raw material rate (₹/kg)", value: inputs.rawMaterialRatePerKg, note: "Factory: ₹158 per kg PP", fmt: "₹#,##0.00" },
    {
      label: "Net weight per good piece (grams)",
      value: Math.round(inputs.netWeightGrams * 10000) / 10000,
      note: "ESTIMATE — back-solved so ₹2,47,800 issue at ₹158/kg and 3% waste reconcilies (≈12.68 g)",
      fmt: "0.0000",
    },
    { label: "Waste / scrap (%)", value: inputs.wastePercent / 100, note: "Factory: 3%", fmt: "0.00%" },
    {
      label: "Scrap recovery (% of waste material value)",
      value: inputs.scrapRecoveryPercent / 100,
      note: "ESTIMATE — regrind typically recovered below virgin value",
      fmt: "0.00%",
    },
    { label: "Making (labour) cost per day (₹)", value: inputs.labourPerDay, note: "Factory: ₹400 per day", fmt: "₹#,##0.00" },
    { label: "Number of production employees", value: inputs.productionEmployees, note: "Factory: 2", fmt: "0" },
    { label: "Working days per month", value: inputs.workingDays, note: "ESTIMATE — 26-day manufacturing month", fmt: "0" },
    { label: "Average working hours per day", value: inputs.hoursPerDay, note: "Factory: 12 hours", fmt: "0.0" },
    {
      label: "Other variable production cost (₹/month)",
      value: inputs.otherVariableMonthly,
      note: "Default 0. Factory ₹2,47,800 is treated as material issue (see Assumptions).",
      fmt: "₹#,##,##0.00",
    },
    { label: "Factory / manufacturing fixed cost (₹)", value: inputs.factoryFixedMonthly, note: "Factory: ₹6,000", fmt: "₹#,##,##0.00" },
    { label: "Administrative expenses (₹)", value: inputs.adminMonthly, note: "Factory: ₹5,000", fmt: "₹#,##,##0.00" },
    { label: "Selling & distribution (₹)", value: inputs.sellingDistMonthly, note: "Factory: ₹2,000", fmt: "₹#,##,##0.00" },
    { label: "Machine repair & maintenance (₹)", value: inputs.repairsMonthly, note: "Factory: ₹3,000", fmt: "₹#,##,##0.00" },
    { label: "Machinery original cost (₹)", value: inputs.machineryValue, note: "ESTIMATE — used 50–80T moulder + 76mm mould", fmt: "₹#,##,##0.00" },
    { label: "Depreciation rate per month", value: inputs.depreciationRateMonthly, note: "Factory: 2% per month", fmt: "0.00%" },
    { label: "Target profit (₹/month)", value: inputs.targetProfit, note: "Planning figure for CVP", fmt: "₹#,##,##0.00" },
    {
      label: "Implied material issued (₹) — check figure",
      value: r.grossMaterial,
      note: "Should be ~₹2,47,800 at factory defaults. Read-only.",
      fmt: "₹#,##,##0.00",
      readonly: true,
    },
    {
      label: "Implied kg issued",
      value: r.kgIssued,
      note: "Gross polymer through the machine, including 3% waste",
      fmt: "#,##0.00",
      readonly: true,
    },
  ];

  rows.forEach((row) => {
    const excelRow = ws.addRow([row.label, row.value, row.note]);
    excelRow.height = 20;
    excelRow.getCell(1).font = { name: "Times New Roman", size: 12 };
    excelRow.getCell(3).font = { name: "Times New Roman", size: 10, italic: true, color: { argb: "FF" + MUTED } };
    excelRow.getCell(3).alignment = { wrapText: true, vertical: "middle" };
    if (row.readonly) {
      numCell(excelRow.getCell(2), row.value as number, row.fmt);
      excelRow.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + TOTAL_BG } };
    } else if (typeof row.value === "number") {
      inputCell(excelRow.getCell(2), row.value, row.fmt);
    } else {
      inputCell(excelRow.getCell(2), row.value);
    }
    if (row.note.startsWith("ESTIMATE")) {
      excelRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + EST_BG } };
    }
  });

  ws.addRow([]);
  const legend = ws.addRow(["Legend", "", "Blue = input · Gold = estimate · Taupe = calculated check"]);
  legend.getCell(1).font = { name: "Times New Roman", size: 11, bold: true };
  legend.getCell(3).font = { name: "Times New Roman", size: 10, italic: true, color: { argb: "FF" + MUTED } };
}

function buildCostSheet(wb: ExcelJS.Workbook, inputs: CostInputs, r: CostResult) {
  const ws = wb.addWorksheet("Cost Sheet", {
    views: [{ showGridLines: false, state: "frozen", ySplit: 5 }],
    properties: { tabColor: { argb: "FF1B4D3E" } },
  });
  applyPrint(ws);
  ws.columns = [{ width: 78 }, { width: 22 }, { width: 18 }];
  title(ws, 1, `Cost Sheet — ${inputs.productName}`, "A1:C1");
  subtitle(
    ws,
    2,
    `Period: ${inputs.periodLabel}  |  Output: ${inputs.unitsProduced.toLocaleString("en-IN")} pieces  |  ${inputs.companyName}`,
    "A2:C2",
  );

  const head = ws.addRow(["Particulars", "Amount (₹)", "Per unit (₹)"]);
  head.font = { name: "Times New Roman", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  head.eachCell((c) => {
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + HEAD_BG } };
    c.alignment = { vertical: "middle" };
  });
  head.height = 22;

  for (const line of r.lines) {
    if (line.kind === "section") {
      const row = ws.addRow([line.label, "", ""]);
      row.font = { name: "Times New Roman", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
      row.eachCell((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3D5C52" } };
      });
      continue;
    }
    const row = ws.addRow([line.label, money(line.amount), money(line.perUnit)]);
    row.height = 20;
    row.getCell(1).font = {
      name: "Times New Roman",
      size: 12,
      bold: line.kind === "subtotal" || line.kind === "total" || line.kind === "result",
    };
    row.getCell(2).numFmt = "₹#,##,##0.00;(₹#,##,##0.00)";
    row.getCell(3).numFmt = "₹#,##0.000;(₹#,##0.000)";
    row.getCell(2).font = { name: "Times New Roman", size: 12, bold: line.kind !== "item" };
    row.getCell(3).font = { name: "Times New Roman", size: 12, bold: line.kind !== "item" };
    row.getCell(2).alignment = { horizontal: "right" };
    row.getCell(3).alignment = { horizontal: "right" };
    if (line.kind === "subtotal") {
      row.eachCell((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EEE4" } };
      });
      hairline(ws, row.number, 3);
    }
    if (line.kind === "total") {
      row.eachCell((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + TOTAL_BG } };
        c.font = { name: "Times New Roman", size: 12, bold: true };
      });
    }
    if (line.kind === "result") {
      const bg = r.profit >= 0 ? RESULT_BG_PROFIT : RESULT_BG_LOSS;
      row.eachCell((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bg } };
        c.font = { name: "Times New Roman", size: 13, bold: true };
      });
    }
    if (line.estimate) {
      row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + EST_BG } };
    }
  }

  ws.addRow([]);
  const m = ws.addRow(["Profit / (loss) margin on sales", r.profitMarginOnSales, ""]);
  m.getCell(2).numFmt = "0.00%";
  m.font = { name: "Times New Roman", size: 12 };
}

function buildCvp(wb: ExcelJS.Workbook, inputs: CostInputs, r: CostResult) {
  const ws = wb.addWorksheet("CVP", {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: "FF9B2C2C" } },
  });
  applyPrint(ws);
  ws.columns = [{ width: 52 }, { width: 24 }, { width: 48 }];
  title(ws, 1, "Cost-Volume-Profit Analysis", "A1:C1");
  subtitle(ws, 2, `${inputs.productName}  ·  ${inputs.periodLabel}`, "A2:C2");

  const head = ws.addRow(["Particulars", "Amount", "Note"]);
  head.font = { name: "Times New Roman", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  head.eachCell((c) => {
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + HEAD_BG } };
  });

  const cvpRows: { label: string; value: number | string; fmt?: string; note: string }[] = [
    { label: "Variable cost per unit — material (net)", value: r.variableMaterialPerUnit, fmt: "₹#,##0.0000", note: "Includes 3% normal waste, net of regrind credit" },
    { label: "Variable cost per unit — labour", value: r.variableLabourPerUnit, fmt: "₹#,##0.0000", note: "2 workers, daily wage treated as variable" },
    { label: "Variable cost per unit — other", value: r.variableOtherPerUnit, fmt: "₹#,##0.0000", note: "Zero at default (material not double-counted)" },
    { label: "Total variable cost per unit", value: r.variableCostPerUnit, fmt: "₹#,##0.0000", note: "" },
    { label: "Selling price per unit", value: inputs.sellingPrice, fmt: "₹#,##0.00", note: "" },
    { label: "Contribution per unit", value: r.contributionPerUnit, fmt: "₹#,##0.0000", note: r.contributionIsNegative ? "NEGATIVE — volume cannot recover fixed cost" : "" },
    { label: "P/V ratio", value: r.pvRatio, fmt: "0.00%", note: "" },
    { label: "Total fixed costs (monthly)", value: r.totalFixed, fmt: "₹#,##,##0.00", note: "Factory + repairs + depreciation + admin + S&D" },
    { label: "Break-even point (units)", value: r.bepUnits ?? "Not achievable", fmt: r.bepUnits !== null ? "#,##,##0.00" : undefined, note: r.bepUnits === null ? "Contribution ≤ 0" : "" },
    { label: "Break-even point (sales value, ₹)", value: r.bepSales ?? "Not achievable", fmt: r.bepSales !== null ? "₹#,##,##0.00" : undefined, note: "" },
    { label: "Actual units sold", value: inputs.unitsSold, fmt: "#,##,##0", note: "" },
    { label: "Margin of safety (units)", value: r.marginOfSafetyUnits ?? "—", fmt: r.marginOfSafetyUnits !== null ? "#,##,##0.00" : undefined, note: "" },
    { label: "Margin of safety (%)", value: r.marginOfSafetyPercent ?? "—", fmt: r.marginOfSafetyPercent !== null ? "0.00%" : undefined, note: "" },
    { label: "Total contribution", value: r.contributionTotal, fmt: "₹#,##,##0.00", note: "" },
    { label: "Profit / (loss)", value: r.profit, fmt: "₹#,##,##0.00;(₹#,##,##0.00)", note: "" },
    { label: "Degree of operating leverage", value: r.degreeOfOperatingLeverage ?? "—", fmt: r.degreeOfOperatingLeverage !== null ? "0.00" : undefined, note: "" },
    { label: "Break-even as % of capacity", value: r.bepPercentOfCapacity ?? "—", fmt: r.bepPercentOfCapacity !== null ? "0.00%" : undefined, note: "" },
    { label: "Capacity utilisation", value: r.capacityUtilisation, fmt: "0.00%", note: "" },
    { label: "Profit at full capacity (units)", value: inputs.maxCapacity, fmt: "#,##,##0", note: r.contributionIsNegative ? "Loss widens with volume when contribution is negative" : "" },
    { label: "Profit at full capacity (₹)", value: r.profitAtCapacity, fmt: "₹#,##,##0.00;(₹#,##,##0.00)", note: "" },
    { label: "Target profit (₹)", value: inputs.targetProfit, fmt: "₹#,##,##0.00", note: "" },
    { label: "Units required for target profit", value: r.unitsForTargetProfit ?? "Not achievable at this contribution", fmt: r.unitsForTargetProfit !== null ? "#,##,##0.00" : undefined, note: "" },
  ];

  for (const row of cvpRows) {
    const excelRow = ws.addRow([row.label, row.value, row.note]);
    excelRow.height = 20;
    excelRow.getCell(1).font = { name: "Times New Roman", size: 12 };
    excelRow.getCell(3).font = { name: "Times New Roman", size: 10, italic: true, color: { argb: "FF" + MUTED } };
    if (typeof row.value === "number" && row.fmt) {
      excelRow.getCell(2).value = row.value;
      excelRow.getCell(2).numFmt = row.fmt;
    }
    excelRow.getCell(2).font = { name: "Times New Roman", size: 12 };
    excelRow.getCell(2).alignment = { horizontal: "right" };
  }
}

function buildSensitivity(wb: ExcelJS.Workbook, r: CostResult) {
  const ws = wb.addWorksheet("Sensitivity", {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: "FFC4B8A4" } },
  });
  applyPrint(ws);
  ws.columns = [
    { width: 42 },
    { width: 18 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 40 },
  ];
  title(ws, 1, "Sensitivity / what-if scenarios", "A1:G1");
  subtitle(ws, 2, "Profit is measured at actual monthly sales volume. BEP is n/a when contribution is negative.", "A2:G2");

  const head = ws.addRow([
    "Scenario",
    "Selling price",
    "Contribution/unit",
    "Fixed cost",
    "BEP (units)",
    "Profit at actual",
    "Note",
  ]);
  head.font = { name: "Times New Roman", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  head.eachCell((c) => {
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + HEAD_BG } };
  });

  for (const s of r.sensitivity) {
    const row = ws.addRow([
      s.label,
      s.sellingPrice,
      s.contributionPerUnit,
      s.fixedCost,
      s.bepUnits,
      s.profitAtActual,
      s.note ?? "",
    ]);
    row.font = { name: "Times New Roman", size: 12 };
    row.getCell(2).numFmt = "₹#,##0.00";
    row.getCell(3).numFmt = "₹#,##0.0000;(₹#,##0.0000)";
    row.getCell(4).numFmt = "₹#,##,##0.00";
    row.getCell(5).numFmt = "#,##,##0";
    row.getCell(6).numFmt = "₹#,##,##0.00;(₹#,##,##0.00)";
    row.getCell(7).font = { name: "Times New Roman", size: 10, italic: true, color: { argb: "FF" + MUTED } };
    if (s.id === "base") {
      row.eachCell((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + TOTAL_BG } };
        c.font = { name: "Times New Roman", size: 12, bold: true };
      });
    }
    if (s.profitAtActual > 0) {
      row.getCell(6).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + RESULT_BG_PROFIT } };
    } else {
      row.getCell(6).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + RESULT_BG_LOSS } };
    }
  }
}

function buildAssumptions(wb: ExcelJS.Workbook, inputs: CostInputs, r: CostResult) {
  const ws = wb.addWorksheet("Assumptions", {
    views: [{ showGridLines: false }],
  });
  applyPrint(ws);
  ws.columns = [{ width: 28 }, { width: 88 }];
  title(ws, 1, "Assumptions, methodology and notes", "A1:B1");

  const blocks: [string, string][] = [
    [
      "Company & product",
      `${inputs.companyName} manufactures injection-moulded ${inputs.productName} for paper, film and textile cores. Monthly output ${inputs.unitsProduced.toLocaleString("en-IN")} pieces against capacity of ${inputs.maxCapacity.toLocaleString("en-IN")}. Two operators, 12-hour days.`,
    ],
    [
      "Material figure",
      `Factory gave both ₹158 per kg and a monthly amount of ₹2,47,800. These reconcile at ${r.kgIssued.toFixed(2)} kg issued (${r.gramsIssuedPerUnit.toFixed(2)} g/piece including waste; ${inputs.netWeightGrams.toFixed(2)} g net in a good piece). ₹2,47,800 is therefore treated as raw-material issue, not as an extra variable overhead. Putting it in both places would double-count polymer cost.`,
    ],
    [
      "Waste",
      `${inputs.wastePercent}% normal process loss. Scrap recovery ${inputs.scrapRecoveryPercent}% of waste material value (estimate — regrind trades below virgin PP). Closed-loop 100% regrind is modelled on the Sensitivity sheet.`,
    ],
    [
      "Labour",
      `${inputs.productionEmployees} workers × ₹${inputs.labourPerDay}/day × ${inputs.workingDays} days = ₹${r.directLabour.toLocaleString("en-IN")}. Working days (26) estimated. 12-hour shift used only for labour-hour analytics (${r.labourHours} hours; ₹${r.labourPerHour.toFixed(2)}/hour). Direct labour is classified as variable for CVP.`,
    ],
    [
      "Depreciation",
      `2% per month as stated. Machinery original cost ₹${inputs.machineryValue.toLocaleString("en-IN")} is an estimate for one used 50–80T injection moulder plus a 76mm multi-cavity mould. Change the blue cell if the asset register is available.`,
    ],
    [
      "Fixed vs variable",
      "Variable: net material, production wages, other variable production. Fixed: factory manufacturing cost, repairs, depreciation, administration, selling & distribution (all given as monthly lumps).",
    ],
    [
      "CVP implication",
      r.contributionIsNegative
        ? "Contribution per unit is negative. Break-even does not exist at the current price/cost mix. Increasing volume toward 2,00,000 pieces increases the loss. Price and/or polymer cost must move first."
        : "Contribution is positive. Break-even and margin of safety are reported on the CVP sheet.",
    ],
    [
      "Format",
      "Times New Roman 12 body / 14 headings, as specified in the CEC-1 brief. Charts in the web working paper may be printed in colour; the ledger itself is designed to read in black and white.",
    ],
    [
      "References",
      "CEC-1 brief, 1PGDM01 Managerial Accounting-I (Narayana Business School, Oct 2026); standard cost-sheet classification (prime → factory → cost of production → cost of sales); CVP identities (contribution, P/V, BEP, MoS, DOL); IndiaMART / TradeIndia listings for 76mm PP core plugs (≈20–30 g commercial pieces at ₹1.60–₹1.90 when recycled resin is used).",
    ],
  ];

  for (const [h, body] of blocks) {
    section(ws, ws.rowCount + 2, h, 2);
    const row = ws.addRow(["", body]);
    ws.mergeCells(row.number, 1, row.number, 2);
    row.getCell(1).value = body;
    row.getCell(1).font = { name: "Times New Roman", size: 12 };
    row.getCell(1).alignment = { wrapText: true, vertical: "top" };
    row.height = 64;
  }
}
