'use client';

import { useMemo } from 'react';
import { useSheetData } from './useSheetData';
import { getCellValueByRef, evaluateFormula } from './FormulaEngine';

export interface SheetVariableResult {
  ref: string;
  value: any;
  exists: boolean;
  type: string;
}

export function useSheetVariables(pageId: string) {
  const { columns, rows, isReady } = useSheetData(pageId);

  const resolveVariable = useMemo(() => {
    return (rawRef: string): SheetVariableResult => {
      if (!isReady || columns.length === 0 || rows.length === 0) {
        return { ref: rawRef, value: '...', exists: false, type: 'loading' };
      }

      // Strip {{ and }}
      const cleanRef = rawRef.replace(/^\{\{|\}\}$/g, '').trim();

      // Check if it's a formula or cell ref
      let val = getCellValueByRef(cleanRef, rows, columns);

      // If value is a formula (starts with =), evaluate it
      if (typeof val === 'string' && val.startsWith('=')) {
        val = evaluateFormula(val, rows, columns);
      }

      const exists = val !== '#REF!' && val !== undefined && val !== null;

      return {
        ref: cleanRef,
        value: exists ? val : '#REF!',
        exists,
        type: typeof val,
      };
    };
  }, [columns, rows, isReady]);

  return {
    columns,
    rows,
    isReady,
    resolveVariable,
  };
}
