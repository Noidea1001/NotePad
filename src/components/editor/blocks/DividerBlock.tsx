'use client';

import React from 'react';
import { Minus } from 'lucide-react';
import { EditorBlock } from '../types';

export const DividerBlock: React.FC<{ block: EditorBlock }> = () => {
  return (
    <div className="w-full my-4 py-2 flex items-center justify-center group select-none">
      <div className="w-full border-t border-app-border/80 group-hover:border-app-accent/60 transition-colors" />
    </div>
  );
};
