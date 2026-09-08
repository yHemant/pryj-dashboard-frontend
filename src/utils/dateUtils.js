const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Parses any month representation (Excel serial 46082, ISO string, or YYYY-MM)
 * and returns { year, monthIndex (0-11) }
 */
export const parseMonthComponents = (val) => {
  if (val === null || val === undefined || val === '') return null;

  // 1. Excel serial number (e.g. 46082 or "46082")
  if (typeof val === 'number' || (!isNaN(val) && !String(val).includes('-') && !String(val).includes('/'))) {
    const num = Number(val);
    // 25569 = days between 1899-12-30 and 1970-01-01
    // Add 12 hours buffer (43200000 ms) to avoid midnight boundary shifts
    const date = new Date(Math.round((num - 25569) * 86400 * 1000) + 43200000);
    return {
      year: date.getUTCFullYear(),
      monthIndex: date.getUTCMonth()
    };
  }

  const str = String(val).trim();

  // 2. ISO timestamp with timezone (e.g. "2026-02-28T18:30:00.000Z")
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      // In local time (India Standard Time), 2026-02-28T18:30:00.000Z correctly resolves to March 2026
      return {
        year: d.getFullYear(),
        monthIndex: d.getMonth()
      };
    }
  }

  // 3. Plain date string (e.g. "2026-03-01" or "2026-03")
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      if (!isNaN(year) && !isNaN(monthIndex) && monthIndex >= 0 && monthIndex <= 11) {
        return { year, monthIndex };
      }
    }
  }

  return null;
};

/**
 * Returns formatted month as "Mar-26"
 */
export const formatMonthYear = (val) => {
  const comp = parseMonthComponents(val);
  if (!comp) return String(val || '');
  const shortYear = String(comp.year).slice(-2);
  return `${MONTH_NAMES_SHORT[comp.monthIndex]}-${shortYear}`;
};

/**
 * Returns full month name as "March 2026"
 */
export const formatMonthFull = (val) => {
  const comp = parseMonthComponents(val);
  if (!comp) return String(val || '');
  return `${MONTH_NAMES_FULL[comp.monthIndex]} ${comp.year}`;
};

/**
 * Formats data values cleanly for modern UI chart labels
 */
export const formatMetricLabel = (val, metricKey = '') => {
  if (val === undefined || val === null) return '';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num) || num === 0) return '0';

  const isTime = metricKey.includes('hrs') || metricKey === 'dfc_fp';
  const isPct = metricKey.includes('pct');

  if (isTime) {
    // If integer, e.g. 14 -> 14h, or 14.5 -> 14.5h
    return Number.isInteger(num) ? `${num}h` : `${num.toFixed(1)}h`;
  }

  if (isPct) {
    return `${Math.round(num)}%`;
  }

  return Number.isInteger(num) ? `${num}` : `${num.toFixed(1)}`;
};
