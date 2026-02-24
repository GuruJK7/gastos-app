// src/features/estadisticas/services/estadisticas.service.ts
// ─── Pure aggregation helpers (no fetching, no side-effects) ─────────

export type Period = "month" | "quarter" | "year";

interface DailyPoint {
  day: number;
  usd: number;
}

interface CategoryTotal {
  category: string;
  usd: number;
}

interface Summary {
  ingresosUsd: number;
  gastosUsd: number;
  balanceUsd: number;
  ahorroPct: number;
}

export interface EstadisticasResult {
  dailyPoints: DailyPoint[];
  categoryTotals: CategoryTotal[];
  summary: Summary;
}

// ── Helpers ──────────────────────────────────────────────────────────

export function toUsd(item: any): number {
  return Number(item.amountUsd ?? item.amount ?? item.monto ?? 0) || 0;
}

export function parseAnyDate(item: any): Date | null {
  const dateStr = item.date ?? item.fecha;
  if (typeof dateStr !== "string") return null;
  let d: Date;
  if (dateStr.includes("/")) {
    const [dd, mm, yyyy] = dateStr.split("/").map(Number);
    d = new Date(yyyy, mm - 1, dd);
  } else {
    d = new Date(dateStr);
  }
  return isNaN(d.getTime()) ? null : d;
}

export function getRange(period: Period, now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  let start: Date;
  let end: Date;

  if (period === "month") {
    start = new Date(y, m, 1);
    end = new Date(y, m + 1, 0, 23, 59, 59, 999);
  } else if (period === "quarter") {
    const q = Math.floor(m / 3) * 3;
    start = new Date(y, q, 1);
    end = new Date(y, q + 3, 0, 23, 59, 59, 999);
  } else {
    start = new Date(y, 0, 1);
    end = new Date(y, 11, 31, 23, 59, 59, 999);
  }

  const daysInRange = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return { start, end, daysInRange, year: y, ...(period === "month" ? { monthIndex: m } : {}) };
}

function inRange(d: Date, start: Date, end: Date) {
  return d >= start && d <= end;
}

export function aggregateGastosByDay(gastos: any[], start: Date, end: Date): Array<{ day: number; usd: number }> {
  const daysCount = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  const map = new Map<number, number>();
  for (let i = 1; i <= daysCount; i++) map.set(i, 0);

  for (const g of gastos) {
    const d = parseAnyDate(g);
    if (!d || !inRange(d, start, end)) continue;
    const dayIndex = Math.floor((d.getTime() - start.getTime()) / 86400000) + 1;
    map.set(dayIndex, (map.get(dayIndex) || 0) + toUsd(g));
  }

  return Array.from(map.entries()).map(([day, usd]) => ({ day, usd }));
}

export function aggregateGastosByCategory(gastos: any[], start: Date, end: Date): Array<{ category: string; usd: number }> {
  const map = new Map<string, number>();

  for (const g of gastos) {
    const d = parseAnyDate(g);
    if (!d || !inRange(d, start, end)) continue;
    const cat: string = g.category ?? g.categoria ?? "Sin categoría";
    map.set(cat, (map.get(cat) || 0) + toUsd(g));
  }

  return Array.from(map.entries())
    .map(([category, usd]) => ({ category, usd }))
    .sort((a, b) => b.usd - a.usd);
}

export function computeSummary(gastos: any[], ingresos: any[], start: Date, end: Date) {
  let gastosUsd = 0;
  let ingresosUsd = 0;

  for (const g of gastos) {
    const d = parseAnyDate(g);
    if (d && inRange(d, start, end)) gastosUsd += toUsd(g);
  }
  for (const i of ingresos) {
    const d = parseAnyDate(i);
    if (d && inRange(d, start, end)) ingresosUsd += toUsd(i);
  }

  const balanceUsd = ingresosUsd - gastosUsd;
  const ahorroPct = ingresosUsd > 0 ? Math.round((balanceUsd / ingresosUsd) * 10000) / 100 : 0;

  return { ingresosUsd, gastosUsd, balanceUsd, ahorroPct };
}
