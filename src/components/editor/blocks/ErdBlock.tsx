'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Database,
  Plus,
  Key,
  Link2,
  Code2,
  Download,
  Copy,
  Check,
  X,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ErdBlockData, ErdTableNodeData, ErdColumn } from '../types';

// Custom Table Node Component for React Flow
const TableNode: React.FC<NodeProps> = ({ id, data }) => {
  const tableData = data as unknown as ErdTableNodeData;
  const columns = tableData?.columns || [];

  return (
    <div className="rounded-xl border border-app-border bg-app-surface shadow-sm min-w-[210px] overflow-hidden text-xs select-none">
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-app-muted !border !border-app-border -left-1"
      />

      {/* Table Header */}
      <div className="px-3 py-2 bg-app-sidebar/60 border-b border-app-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-app-primary font-mono text-[11px]">
          <Database className="w-3.5 h-3.5 text-app-muted" />
          <span>{tableData?.tableName || 'table_name'}</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.2 rounded bg-app-surface text-app-muted border border-app-border">
          {columns.length} cols
        </span>
      </div>

      {/* Column List */}
      <div className="divide-y divide-app-border/40 py-0.5">
        {columns.map((col) => (
          <div
            key={col.id}
            className="px-3 py-1.5 flex items-center justify-between gap-2 hover:bg-app-sidebar/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {col.isPk ? (
                <span title="Primary Key" className="shrink-0 text-app-primary">
                  <Key className="w-3 h-3" />
                </span>
              ) : col.isFk ? (
                <span title="Foreign Key" className="shrink-0 text-app-muted">
                  <Link2 className="w-3 h-3" />
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-app-border shrink-0" />
              )}
              <span
                className={`font-mono text-[11px] truncate ${
                  col.isPk ? 'font-semibold text-app-primary' : 'text-app-secondary'
                }`}
              >
                {col.name}
              </span>
            </div>

            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-app-sidebar border border-app-border/60 text-app-muted uppercase">
              {col.type}
            </span>
          </div>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-app-muted !border !border-app-border -right-1"
      />
    </div>
  );
};

const INITIAL_NODES: Node[] = [
  {
    id: 'users',
    type: 'tableNode',
    position: { x: 40, y: 50 },
    data: {
      tableName: 'users',
      columns: [
        { id: 'u1', name: 'id', type: 'UUID', isPk: true, nullable: false },
        { id: 'u2', name: 'email', type: 'VARCHAR', nullable: false },
        { id: 'u3', name: 'role', type: 'VARCHAR', nullable: false },
        { id: 'u4', name: 'created_at', type: 'TIMESTAMP', nullable: false },
      ],
    },
  },
  {
    id: 'workspaces',
    type: 'tableNode',
    position: { x: 340, y: 50 },
    data: {
      tableName: 'workspaces',
      columns: [
        { id: 'w1', name: 'id', type: 'UUID', isPk: true, nullable: false },
        { id: 'w2', name: 'owner_id', type: 'UUID', isFk: true, nullable: false },
        { id: 'w3', name: 'name', type: 'VARCHAR', nullable: false },
        { id: 'w4', name: 'created_at', type: 'TIMESTAMP', nullable: false },
      ],
    },
  },
  {
    id: 'pages',
    type: 'tableNode',
    position: { x: 640, y: 50 },
    data: {
      tableName: 'pages',
      columns: [
        { id: 'p1', name: 'id', type: 'UUID', isPk: true, nullable: false },
        { id: 'p2', name: 'workspace_id', type: 'UUID', isFk: true, nullable: false },
        { id: 'p3', name: 'title', type: 'VARCHAR', nullable: false },
        { id: 'p4', name: 'blocks', type: 'JSONB', nullable: true },
        { id: 'p5', name: 'updated_at', type: 'TIMESTAMP', nullable: false },
      ],
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  {
    id: 'e-users-workspaces',
    source: 'users',
    target: 'workspaces',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
  {
    id: 'e-workspaces-pages',
    source: 'workspaces',
    target: 'pages',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
  },
];

interface ErdBlockProps {
  data?: ErdBlockData;
  onChange: (data: Partial<ErdBlockData>) => void;
}

export const ErdBlock: React.FC<ErdBlockProps> = ({ data, onChange }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    (data?.nodes as unknown as Node[]) || INITIAL_NODES
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    (data?.edges as Edge[]) || INITIAL_EDGES
  );

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'sql' | 'prisma' | 'csharp'>('sql');
  const [copied, setCopied] = useState(false);

  const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const next = addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
          },
          eds
        );
        onChange({ edges: next as any });
        return next;
      });
    },
    [setEdges, onChange]
  );

  const handleAddTable = () => {
    const tableIndex = nodes.length + 1;
    const newId = `table_${Date.now().toString(36).substring(2, 6)}`;
    const newNode: Node = {
      id: newId,
      type: 'tableNode',
      position: { x: 60 + (nodes.length % 3) * 260, y: 240 },
      data: {
        tableName: `entity_${tableIndex}`,
        columns: [
          { id: `c-${Date.now()}-1`, name: 'id', type: 'UUID', isPk: true, nullable: false },
          { id: `c-${Date.now()}-2`, name: 'created_at', type: 'TIMESTAMP', nullable: false },
        ],
      },
    };

    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    onChange({ nodes: nextNodes as any });
  };

  // Code generation for SQL, Prisma, EF Core
  const generateExportCode = () => {
    const tables = nodes.map((n) => n.data as unknown as ErdTableNodeData);

    if (exportFormat === 'sql') {
      let sql = `-- Generated by NoteWorkspace ERD Engine\n-- Dialect: PostgreSQL 16+\n\n`;
      for (const t of tables) {
        if (!t?.tableName) continue;
        sql += `CREATE TABLE "${t.tableName}" (\n`;
        const lines = (t.columns || []).map((col) => {
          let line = `  "${col.name}" ${col.type}`;
          if (col.isPk) line += ` PRIMARY KEY`;
          if (!col.nullable && !col.isPk) line += ` NOT NULL`;
          return line;
        });
        sql += lines.join(',\n');
        sql += `\n);\n\n`;
      }
      return sql;
    }

    if (exportFormat === 'prisma') {
      let prisma = `// Generated Prisma Schema\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n`;
      for (const t of tables) {
        if (!t?.tableName) continue;
        const modelName = t.tableName.charAt(0).toUpperCase() + t.tableName.slice(1);
        prisma += `model ${modelName} {\n`;
        for (const col of t.columns || []) {
          let pType = 'String';
          if (col.type === 'INT' || col.type === 'BIGINT') pType = 'Int';
          if (col.type === 'BOOLEAN') pType = 'Boolean';
          if (col.type === 'TIMESTAMP') pType = 'DateTime';
          if (col.type === 'JSONB') pType = 'Json';

          let line = `  ${col.name.padEnd(16)} ${pType}`;
          if (col.isPk) line += ` @id @default(uuid())`;
          if (col.type === 'TIMESTAMP' && col.name.includes('updated')) line += ` @updatedAt`;
          if (col.type === 'TIMESTAMP' && col.name.includes('created')) line += ` @default(now())`;
          prisma += `${line}\n`;
        }
        prisma += `}\n\n`;
      }
      return prisma;
    }

    if (exportFormat === 'csharp') {
      let cs = `// Generated C# Entity Framework Core Models\nusing System;\nusing System.ComponentModel.DataAnnotations;\nusing System.ComponentModel.DataAnnotations.Schema;\n\nnamespace NoteWorkspace.Data.Entities\n{\n`;
      for (const t of tables) {
        if (!t?.tableName) continue;
        const className = t.tableName.charAt(0).toUpperCase() + t.tableName.slice(1);
        cs += `    [Table("${t.tableName}")]\n    public class ${className}\n    {\n`;
        for (const col of t.columns || []) {
          let csType = 'string';
          if (col.type === 'UUID') csType = 'Guid';
          if (col.type === 'INT') csType = 'int';
          if (col.type === 'BIGINT') csType = 'long';
          if (col.type === 'BOOLEAN') csType = 'bool';
          if (col.type === 'TIMESTAMP') csType = 'DateTime';

          if (col.isPk) cs += `        [Key]\n`;
          if (!col.nullable && csType === 'string') cs += `        [Required]\n`;
          const propName = col.name.charAt(0).toUpperCase() + col.name.slice(1);
          cs += `        public ${csType} ${propName} { get; set; }\n\n`;
        }
        cs += `    }\n\n`;
      }
      cs += `}\n`;
      return cs;
    }

    return '';
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateExportCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-app-border bg-app-surface overflow-hidden shadow-card transition-all">
      {/* Canvas Top Bar */}
      <div className="px-4 py-2.5 bg-app-sidebar/80 border-b border-app-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-purple-500/10 text-purple-400">
            <Database className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-app-primary">Visual DB Schema (ERD Canvas)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-app-surface border border-app-border text-app-muted">
            {nodes.length} Tables &bull; Connect Handles to Link
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAddTable}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-app-surface border border-app-border text-app-secondary hover:text-app-primary hover:bg-app-sidebar text-xs transition-colors"
          >
            <Plus className="w-3 h-3 text-app-accent" />
            <span>Add Table</span>
          </button>

          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-app-accent hover:bg-app-accentHover text-white text-xs font-medium shadow-sm transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Export Schema</span>
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="h-[360px] w-full bg-app-bg relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          className="bg-app-canvas"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#333" />
          <Controls className="!bg-app-surface !border-app-border !fill-app-primary !rounded-lg overflow-hidden shadow-md" />
          <MiniMap
            className="!bg-app-surface !border-app-border !rounded-lg overflow-hidden hidden sm:block"
            nodeColor="#3b82f6"
            maskColor="rgba(0, 0, 0, 0.6)"
          />
        </ReactFlow>
      </div>

      {/* Code Export Modal */}
      {exportModalOpen && (
        <div
          onClick={() => setExportModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-app-surface border border-app-border shadow-2xl overflow-hidden flex flex-col text-app-primary"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-app-border">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-app-accent" />
                <h3 className="text-sm font-semibold">Export Schema Code</h3>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="p-1 rounded text-app-muted hover:text-app-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Format Tabs */}
            <div className="px-5 pt-3 pb-1 border-b border-app-border flex items-center gap-2 bg-app-sidebar/40">
              <button
                onClick={() => setExportFormat('sql')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  exportFormat === 'sql'
                    ? 'bg-app-surface border border-app-border text-app-accent font-semibold shadow-sm'
                    : 'text-app-muted hover:text-app-primary'
                }`}
              >
                PostgreSQL (SQL)
              </button>
              <button
                onClick={() => setExportFormat('prisma')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  exportFormat === 'prisma'
                    ? 'bg-app-surface border border-app-border text-app-accent font-semibold shadow-sm'
                    : 'text-app-muted hover:text-app-primary'
                }`}
              >
                Prisma Schema (.prisma)
              </button>
              <button
                onClick={() => setExportFormat('csharp')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  exportFormat === 'csharp'
                    ? 'bg-app-surface border border-app-border text-app-accent font-semibold shadow-sm'
                    : 'text-app-muted hover:text-app-primary'
                }`}
              >
                C# EF Core (Entity Models)
              </button>
            </div>

            {/* Generated Code Body */}
            <div className="p-4 bg-app-bg overflow-auto max-h-[360px] font-mono text-xs leading-relaxed text-emerald-400">
              <pre>{generateExportCode()}</pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-app-border flex items-center justify-between bg-app-sidebar/50">
              <span className="text-xs text-app-muted">
                Synthesized directly from React Flow table canvas
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
