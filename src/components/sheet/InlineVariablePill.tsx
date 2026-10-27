'use client';

import React, { useState } from 'react';
import { Table2, Check, Copy, ExternalLink, Zap } from 'lucide-react';
import { useSheetVariables } from './useSheetVariables';

interface InlineVariablePillProps {
  pageId: string;
  variableRef: string; // e.g. "B4" or "TotalBudget" or "{{B4}}"
}

export const InlineVariablePill: React.FC<InlineVariablePillProps> = ({
  pageId,
  variableRef,
}) => {
  const { resolveVariable } = useSheetVariables(pageId);
  const result = resolveVariable(variableRef);
  const [copied, setCopied] = useState(false);

  const cleanRef = variableRef.replace(/^\{\{|\}\}$/g, '').trim();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(result.value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isError = result.value === '#REF!' || result.value === '#ERROR!' || result.value === '#VALUE!';

  return (
    <span
      onClick={handleCopy}
      title={`Live Two-Way Variable: {{${cleanRef}}} = ${result.value}\nClick to copy value`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-xs cursor-pointer select-none transition-all mx-1 align-baseline border shadow-sm ${
        isError
          ? 'bg-app-sidebar border-app-border text-app-muted'
          : 'bg-app-sidebar border-app-border text-app-primary hover:border-app-muted'
      }`}
    >
      <span className="flex items-center gap-1 text-[11px] text-app-muted">
        <Table2 className="w-3 h-3 text-app-muted" />
        <span className="font-medium text-app-secondary">{cleanRef}</span>
        <span>:</span>
      </span>

      <span className="font-semibold text-app-primary">
        {String(result.value)}
      </span>

      <span className="w-1.5 h-1.5 rounded-full bg-app-muted inline-block" />

      {copied ? (
        <Check className="w-2.5 h-2.5 text-app-primary" />
      ) : (
        <Copy className="w-2.5 h-2.5 text-app-muted opacity-60 hover:opacity-100" />
      )}
    </span>
  );
};
