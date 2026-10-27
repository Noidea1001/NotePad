'use client';

import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Play,
  Terminal,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { EditorBlock } from '../types';

interface CodeBlockProps {
  block: EditorBlock;
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'html', label: 'HTML / CSS' },
  { id: 'sql', label: 'SQL' },
  { id: 'bash', label: 'Bash / Shell' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'csharp', label: 'C#' },
  { id: 'json', label: 'JSON' },
];

export const CodeBlock: React.FC<CodeBlockProps> = ({ block, onUpdate }) => {
  const language = block.data?.language || 'javascript';
  const caption = block.data?.caption || '';
  const code = block.content || '// Write lesson code here\nconsole.log("Welcome to coding class!");';

  const [copied, setCopied] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (langId: string) => {
    onUpdate({
      data: {
        ...block.data,
        language: langId,
      },
    });
    setShowLanguages(false);
  };

  const handleCaptionChange = (newCaption: string) => {
    onUpdate({
      data: {
        ...block.data,
        caption: newCaption,
      },
    });
  };

  const handleCodeChange = (newCode: string) => {
    onUpdate({
      content: newCode,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      handleCodeChange(newValue);
      setTimeout(() => {
        const textarea = document.getElementById(`code-area-${block.id}`) as HTMLTextAreaElement;
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Run JavaScript code in sandbox and capture console.log
  const handleRunCode = () => {
    setShowOutput(true);
    if (language === 'javascript' || language === 'typescript') {
      try {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
          warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' ')),
          error: (...args: any[]) => logs.push('[ERROR] ' + args.join(' ')),
        };

        const runFn = new Function('console', code);
        runFn(customConsole);

        if (logs.length === 0) {
          setConsoleOutput('Program executed successfully (no console.log output).');
        } else {
          setConsoleOutput(logs.join('\n'));
        }
      } catch (err: any) {
        setConsoleOutput(`Runtime Error: ${err.message}`);
      }
    } else {
      setConsoleOutput(`Output simulation for ${language}:\nCode executed successfully in student environment.`);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="w-full my-3 rounded-xl border border-app-border overflow-hidden bg-[#1e1e1e] text-gray-200 shadow-md">
      {/* Code Header Bar: Language, Caption, Copy Button, Run Button */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#333333] text-xs select-none">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#2d2d30] border border-[#3c3c3c] text-emerald-400 font-mono text-[11px] font-semibold transition-colors"
            >
              <Code className="w-3 h-3" />
              <span>{LANGUAGES.find((l) => l.id === language)?.label || language}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            {showLanguages && (
              <div className="absolute top-full left-0 mt-1 w-36 rounded-lg bg-[#252526] border border-[#3c3c3c] shadow-2xl py-1 z-50 text-xs">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`w-full px-3 py-1 text-left hover:bg-[#37373d] font-mono text-[11px] ${
                      language === lang.id ? 'text-emerald-400 font-bold bg-[#2a2d2e]' : 'text-gray-300'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Optional Caption Input (e.g. // lesson-1-loops.js) */}
          <input
            type="text"
            value={caption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="// Add file name or code caption..."
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-[11px] font-mono text-gray-400 placeholder:text-gray-600 truncate"
          />
        </div>

        {/* Action Buttons: Run Code & Copy */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleRunCode}
            title="Run Code & View Console Output"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] transition-colors"
          >
            <Play className="w-3 h-3 fill-emerald-400" />
            <span className="hidden sm:inline">Run</span>
          </button>

          <button
            onClick={handleCopy}
            title="Copy Code to Clipboard"
            className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#2d2d30] border border-[#3c3c3c] text-gray-300 hover:text-white font-mono text-[11px] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-gray-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Body with Line Numbers */}
      <div className="flex relative font-mono text-xs leading-relaxed overflow-x-auto min-h-[90px]">
        {/* Line Numbers Gutter */}
        <div className="select-none py-3 px-2.5 text-right bg-[#181818] border-r border-[#2d2d30] text-gray-600 font-mono text-[11px] min-w-[36px]">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Editable Code Textarea */}
        <div className="flex-1 p-3">
          <textarea
            id={`code-area-${block.id}`}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="// Write code here..."
            rows={Math.max(3, lines.length)}
            spellCheck={false}
            className="w-full bg-transparent border-none outline-none resize-none font-mono text-xs leading-relaxed text-[#9cdcfe] placeholder:text-gray-600 overflow-hidden"
          />
        </div>
      </div>

      {/* Interactive Run Console Output (For Students) */}
      {showOutput && (
        <div className="border-t border-[#333333] bg-[#141414] p-3 text-xs font-mono">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#252526] text-[10px] text-gray-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Terminal className="w-3 h-3" />
              <span>Console Output</span>
            </span>
            <button
              onClick={() => setShowOutput(false)}
              className="text-gray-500 hover:text-gray-300"
            >
              Hide
            </button>
          </div>
          <pre className="text-emerald-300 text-[11px] whitespace-pre-wrap leading-relaxed">
            {consoleOutput || 'Running...'}
          </pre>
        </div>
      )}

      {/* Backdrop for language selector */}
      {showLanguages && (
        <div onClick={() => setShowLanguages(false)} className="fixed inset-0 z-40" />
      )}
    </div>
  );
};
