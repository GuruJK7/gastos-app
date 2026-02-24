import { useMemo } from 'react';

function parseDate(item) {
  if (item?.date) {
    const d = new Date(item.date);
    if (!isNaN(d)) return d;
  }
  if (item?.fecha) {
    // DD/MM/YYYY
    const parts = String(item.fecha).split('/');
    if (parts.length === 3) {
      const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (!isNaN(d)) return d;
    }
    const d = new Date(item.fecha);
    if (!isNaN(d)) return d;
  }
  return null;
}

function usd(item) {
  return item?.amountUsd ?? item?.amount ?? item?.monto ?? 0;
}

function getPeriodRange(period) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  let start, end;

  if (period === 'year') {
    start = new Date(year, 0, 1);
    end = new Date(year, 11, 31, 23, 59, 59, 999);
  } else if (period === 'quarter') {
    const q = Math.floor(month / 3);
    start = new Date(year, q * 3, 1);
    end = new Date(year, q * 3 + 3, 0, 23, 59, 59, 999);
  } else {
    start = new Date(year, month, 1);
    end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  }

  return { start, end };
}

function filterByPeriod(items, start, end) {
  return (items || []).filter((item) => {
    const d = parseDate(item);
    return d && d >= start && d <= end;
  });
}

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function monthKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfWeek(d) {
  // Monday-based week start (more “finanzas” friendly)
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun .. 6 Sat
  const diff = (day === 0 ? -6 : 1) - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmtDayLabel(date) {
  return String(date.getDate());
}

function fmtMonthLabel(date) {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return meses[date.getMonth()];
}

function fmtWeekLabel(date) {
  // show dd/mm
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

export function useEstadisticas({ gastos, ingresos, period = 'month' } = {}) {
  const { start, end } = useMemo(() => getPeriodRange(period), [period]);

  const filteredGastos = useMemo(
    () => filterByPeriod(gastos, start, end),
    [gastos, start, end],
  );

  const filteredIngresos = useMemo(
    () => filterByPeriod(ingresos, start, end),
    [ingresos, start, end],
  );

  // ✅ FULL SERIES depending on period (so the chart NEVER looks empty)
  const dailyPoints = useMemo(() => {
    // Monthly: daily points
    if (period === 'month') {
      const totals = {};
      for (const g of filteredGastos) {
        const d = parseDate(g);
        if (!d) continue;
        const key = ymd(d);
        totals[key] = (totals[key] || 0) + usd(g);
      }

      const out = [];
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        const key = ymd(d);
        const value = totals[key] || 0;
        out.push({
          day: key,                 // for tooltip
          label: fmtDayLabel(d),    // x axis
          usd: Math.round(value * 100) / 100,
        });
      }
      return out;
    }

    // Quarterly: weekly points (start-of-week buckets)
    if (period === 'quarter') {
      const buckets = {};
      for (const g of filteredGastos) {
        const d = parseDate(g);
        if (!d) continue;
        const wk = startOfWeek(d);
        const key = ymd(wk);
        buckets[key] = (buckets[key] || 0) + usd(g);
      }

      // build week keys from range
      const out = [];
      let cursor = startOfWeek(start);
      while (cursor <= end) {
        const key = ymd(cursor);
        const value = buckets[key] || 0;
        out.push({
          day: key,
          label: fmtWeekLabel(cursor),
          usd: Math.round(value * 100) / 100,
        });
        cursor = addDays(cursor, 7);
      }
      return out;
    }

    // Yearly: monthly points
    const buckets = {};
    for (const g of filteredGastos) {
      const d = parseDate(g);
      if (!d) continue;
      const key = monthKey(d);
      buckets[key] = (buckets[key] || 0) + usd(g);
    }

    const out = [];
    for (let m = 0; m < 12; m++) {
      const d = new Date(start.getFullYear(), m, 1);
      const key = monthKey(d);
      const value = buckets[key] || 0;
      out.push({
        day: key,
        label: fmtMonthLabel(d),
        usd: Math.round(value * 100) / 100,
      });
    }
    return out;
  }, [filteredGastos, start, end, period]);

  const categoryTotals = useMemo(() => {
    const map = {};
    for (const g of filteredGastos) {
      const cat = g.category || g.categoria || 'Sin categoría';
      map[cat] = (map[cat] || 0) + usd(g);
    }
    return Object.entries(map)
      .map(([category, total]) => ({
        category,
        usd: Math.round(total * 100) / 100,
      }))
      .sort((a, b) => b.usd - a.usd);
  }, [filteredGastos]);

  const summary = useMemo(() => {
    const gastosUsd = filteredGastos.reduce((sum, g) => sum + usd(g), 0);
    const ingresosUsd = filteredIngresos.reduce((sum, i) => sum + usd(i), 0);
    const balanceUsd = ingresosUsd - gastosUsd;
    const ahorroPct = ingresosUsd > 0
      ? Math.round((balanceUsd / ingresosUsd) * 10000) / 100
      : 0;

    return {
      ingresosUsd: Math.round(ingresosUsd * 100) / 100,
      gastosUsd: Math.round(gastosUsd * 100) / 100,
      balanceUsd: Math.round(balanceUsd * 100) / 100,
      ahorroPct,
    };
  }, [filteredGastos, filteredIngresos]);

  // ── Ingresos vs Gastos comparison series ──
  const comparisonSeries = useMemo(() => {
    const gBuckets = {};
    const iBuckets = {};

    const bucketKey = (d) => {
      if (period === 'month') return ymd(d);
      if (period === 'quarter') return ymd(startOfWeek(d));
      return monthKey(d);
    };

    for (const g of filteredGastos) {
      const d = parseDate(g);
      if (!d) continue;
      const k = bucketKey(d);
      gBuckets[k] = (gBuckets[k] || 0) + usd(g);
    }

    for (const ing of filteredIngresos) {
      const d = parseDate(ing);
      if (!d) continue;
      const k = bucketKey(d);
      iBuckets[k] = (iBuckets[k] || 0) + usd(ing);
    }

    const out = [];

    if (period === 'month') {
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        const k = ymd(d);
        out.push({
          key: k,
          label: fmtDayLabel(d),
          gastos: Math.round((gBuckets[k] || 0) * 100) / 100,
          ingresos: Math.round((iBuckets[k] || 0) * 100) / 100,
        });
      }
    } else if (period === 'quarter') {
      let cursor = startOfWeek(start);
      while (cursor <= end) {
        const k = ymd(cursor);
        out.push({
          key: k,
          label: fmtWeekLabel(cursor),
          gastos: Math.round((gBuckets[k] || 0) * 100) / 100,
          ingresos: Math.round((iBuckets[k] || 0) * 100) / 100,
        });
        cursor = addDays(cursor, 7);
      }
    } else {
      for (let m = 0; m < 12; m++) {
        const d = new Date(start.getFullYear(), m, 1);
        const k = monthKey(d);
        out.push({
          key: k,
          label: fmtMonthLabel(d),
          gastos: Math.round((gBuckets[k] || 0) * 100) / 100,
          ingresos: Math.round((iBuckets[k] || 0) * 100) / 100,
        });
      }
    }

    return out;
  }, [filteredGastos, filteredIngresos, start, end, period]);

  return { dailyPoints, categoryTotals, summary, comparisonSeries };
}