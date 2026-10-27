import { SheetColumn, SheetRowData } from './types';

export function colIndexToLetter(index: number): string {
  let letter = '';
  let temp = index;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export function letterToColIndex(letter: string): number {
  let col = 0;
  for (let i = 0; i < letter.length; i++) {
    col = col * 26 + (letter.charCodeAt(i) - 64);
  }
  return col - 1;
}

export function parseCellRef(ref: string): { row: number; col: number } | null {
  const match = ref.trim().toUpperCase().match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;
  const colLetter = match[1];
  const rowNum = parseInt(match[2], 10);
  return {
    col: letterToColIndex(colLetter),
    row: rowNum - 1, // 0-indexed
  };
}

export function getCellValueByRef(
  ref: string,
  rows: SheetRowData[],
  columns: SheetColumn[]
): any {
  // 1. Try coordinate parsing (e.g. "B4", "A1")
  const parsed = parseCellRef(ref);
  if (parsed) {
    const { row, col } = parsed;
    if (row >= 0 && row < rows.length && col >= 0 && col < columns.length) {
      const targetCol = columns[col];
      const targetRow = rows[row];
      return targetRow?.cells?.[targetCol.id];
    }
  }

  // 2. Try named column reference (e.g. "TotalBudget", "Budget", "StoryPoints")
  const normalizedRef = ref.trim().toLowerCase().replace(/[\s_-]/g, '');
  const matchedCol = columns.find(
    (c) => c.name.toLowerCase().replace(/[\s_-]/g, '') === normalizedRef
  );

  if (matchedCol) {
    // If referencing a whole column by name (e.g. {{TotalBudget}}), return the sum or first value
    const numericValues = rows
      .map((r) => parseFloat(r.cells?.[matchedCol.id]))
      .filter((v) => !isNaN(v));
    if (numericValues.length > 0) {
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      return Math.round(sum * 100) / 100;
    }
    return rows[0]?.cells?.[matchedCol.id] ?? '';
  }

  return '#REF!';
}

export function evaluateFormula(
  formula: string,
  rows: SheetRowData[],
  columns: SheetColumn[],
  currentRowIndex?: number
): string | number {
  if (!formula.startsWith('=')) return formula;

  const expr = formula.substring(1).trim();

  // 1. Handle SUM(Range) e.g. SUM(B1:B5) or SUM(B1, B2)
  const sumMatch = expr.match(/^SUM\(([^)]+)\)$/i);
  if (sumMatch) {
    const range = sumMatch[1];
    return calculateRangeAggregate(range, rows, columns, (vals) =>
      vals.reduce((a, b) => a + b, 0)
    );
  }

  // 2. Handle AVG(Range) e.g. AVG(B1:B5)
  const avgMatch = expr.match(/^AVG\(([^)]+)\)$/i);
  if (avgMatch) {
    const range = avgMatch[1];
    return calculateRangeAggregate(range, rows, columns, (vals) =>
      vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : 0
    );
  }

  // 3. Handle COUNT(Range) e.g. COUNT(A1:A10)
  const countMatch = expr.match(/^COUNT\(([^)]+)\)$/i);
  if (countMatch) {
    const range = countMatch[1];
    return calculateRangeCount(range, rows, columns);
  }

  // 4. Handle Basic Arithmetic with Cell References e.g. "B1 * 1.1", "A1 + B1", "D2 - 5"
  try {
    let resolvedExpr = expr;
    // Find all cell references like A1, B2, C10
    const cellRefRegex = /\b([A-Z]+[0-9]+)\b/gi;
    resolvedExpr = resolvedExpr.replace(cellRefRegex, (match) => {
      const val = getCellValueByRef(match, rows, columns);
      const num = parseFloat(val);
      return isNaN(num) ? '0' : String(num);
    });

    // Safely calculate math expression using Function with sanitized tokens
    if (/^[0-9+\-*/().\s]+$/.test(resolvedExpr)) {
      // eslint-disable-next-line no-new-func
      const result = new Function(`return (${resolvedExpr})`)();
      if (typeof result === 'number' && !isNaN(result)) {
        return Math.round(result * 100) / 100;
      }
    }
  } catch {
    return '#ERROR!';
  }

  return '#VALUE!';
}

function calculateRangeAggregate(
  rangeStr: string,
  rows: SheetRowData[],
  columns: SheetColumn[],
  aggregateFn: (numbers: number[]) => number
): number {
  const parts = rangeStr.split(':');
  if (parts.length === 2) {
    const start = parseCellRef(parts[0]);
    const end = parseCellRef(parts[1]);
    if (!start || !end) return 0;

    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);

    const values: number[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const col = columns[c];
        const row = rows[r];
        if (col && row) {
          const val = parseFloat(row.cells?.[col.id]);
          if (!isNaN(val)) values.push(val);
        }
      }
    }
    return Math.round(aggregateFn(values) * 100) / 100;
  } else {
    // Comma separated cells e.g. B1, B2, B3
    const cells = rangeStr.split(',').map((c) => c.trim());
    const values: number[] = [];
    for (const cell of cells) {
      const val = parseFloat(getCellValueByRef(cell, rows, columns));
      if (!isNaN(val)) values.push(val);
    }
    return Math.round(aggregateFn(values) * 100) / 100;
  }
}

function calculateRangeCount(
  rangeStr: string,
  rows: SheetRowData[],
  columns: SheetColumn[]
): number {
  const parts = rangeStr.split(':');
  if (parts.length === 2) {
    const start = parseCellRef(parts[0]);
    const end = parseCellRef(parts[1]);
    if (!start || !end) return 0;

    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);

    let count = 0;
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const col = columns[c];
        const row = rows[r];
        if (col && row) {
          const val = row.cells?.[col.id];
          if (val !== undefined && val !== null && val !== '') count++;
        }
      }
    }
    return count;
  }
  return 0;
}
