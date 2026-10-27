'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  NodeProps,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Database,
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  Key,
  Link2,
  Code,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  LayoutGrid,
  Map,
  FileCode,
  Spline,
  GitCommit,
  Share2,
  HelpCircle,
} from 'lucide-react';
import { db } from '@/db/workspace-db';
import { WorkspacePage, ErdEntity, ErdField } from '@/types';

const DATA_TYPES: ErdField['type'][] = [
  'UUID',
  'VARCHAR',
  'INT',
  'BIGINT',
  'BOOLEAN',
  'TIMESTAMP',
  'JSONB',
  'DECIMAL',
  'TEXT',
];

const TABLE_ACCENTS: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-500' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-500' },
  slate: { bg: 'bg-app-sidebar/80', border: 'border-app-border', text: 'text-app-primary' },
};

interface TableNodeData {
  entity: ErdEntity;
  onRenameTable: (entityId: string, newName: string) => void;
  onRenameField: (entityId: string, fieldId: string, newName: string) => void;
  onUpdateFieldType: (entityId: string, fieldId: string, newType: ErdField['type']) => void;
  onTogglePk: (entityId: string, fieldId: string) => void;
  onToggleNullable: (entityId: string, fieldId: string) => void;
  onAddField: (entityId: string) => void;
  onDeleteField: (entityId: string, fieldId: string) => void;
  onDeleteTable: (entityId: string) => void;
  onDuplicateTable: (entityId: string) => void;
  onChangeAccent: (entityId: string, accent: string) => void;
}

// Custom Draggable & Fully Editable Table Node Component
const ErdTableNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as unknown as TableNodeData;
  const entity = nodeData?.entity;
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!entity) return null;

  const accentKey = entity.color || 'slate';
  const accent = TABLE_ACCENTS[accentKey] || TABLE_ACCENTS.slate;

  return (
    <div
      className={`rounded-xl border bg-app-surface shadow-md min-w-[280px] max-w-[340px] overflow-visible text-xs select-none transition-all ${
        selected ? 'ring-2 ring-app-accent border-app-accent shadow-xl' : 'border-app-border'
      }`}
    >
      {/* Top Header Handle for Table-to-Table Connections */}
      <Handle
        type="target"
        position={Position.Top}
        id={`in-table-${entity.id}`}
        className="!w-3 !h-3 !bg-app-surface !border-2 !border-app-border hover:!border-app-accent -top-1.5 transition-all cursor-crosshair"
      />

      {/* Table Header: Editable Table Name, Color Accent, Controls */}
      <div
        className={`px-3.5 py-2.5 rounded-t-xl border-b border-app-border flex items-center justify-between gap-2 ${accent.bg}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Accent Color Dot Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            title="Change table accent color"
            className="w-3.5 h-3.5 rounded-full border border-app-border/80 shrink-0 hover:scale-125 transition-transform"
            style={{
              backgroundColor:
                accentKey === 'blue'
                  ? '#3b82f6'
                  : accentKey === 'emerald'
                  ? '#10b981'
                  : accentKey === 'purple'
                  ? '#a855f7'
                  : accentKey === 'amber'
                  ? '#f59e0b'
                  : accentKey === 'rose'
                  ? '#f43f5e'
                  : '#64748b',
            }}
          />

          <Database className="w-3.5 h-3.5 text-app-primary shrink-0" />

          {/* Editable Table Name Input */}
          <input
            type="text"
            value={entity.name}
            onChange={(e) => nodeData.onRenameTable(entity.id, e.target.value)}
            placeholder="table_name"
            className="w-full font-mono font-bold text-xs text-app-primary bg-transparent border-none outline-none tracking-tight focus:bg-app-surface/50 px-1 rounded"
          />
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              nodeData.onAddField(entity.id);
            }}
            title="Add new column"
            className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-surface/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nodeData.onDuplicateTable(entity.id);
            }}
            title="Duplicate table"
            className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-surface/80 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nodeData.onDeleteTable(entity.id);
            }}
            title="Delete table"
            className="p-1 rounded text-app-muted hover:text-red-400 hover:bg-app-surface/80 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Color Picker Popover */}
      {showColorPicker && (
        <div className="absolute top-10 left-3 z-50 p-2 rounded-lg bg-app-surface border border-app-border shadow-xl flex items-center gap-1.5 animate-in fade-in duration-100">
          {Object.keys(TABLE_ACCENTS).map((col) => (
            <button
              key={col}
              onClick={(e) => {
                e.stopPropagation();
                nodeData.onChangeAccent(entity.id, col);
                setShowColorPicker(false);
              }}
              title={col}
              className="w-4 h-4 rounded-full border border-app-border hover:scale-125 transition-transform"
              style={{
                backgroundColor:
                  col === 'blue'
                    ? '#3b82f6'
                    : col === 'emerald'
                    ? '#10b981'
                    : col === 'purple'
                    ? '#a855f7'
                    : col === 'amber'
                    ? '#f59e0b'
                    : col === 'rose'
                    ? '#f43f5e'
                    : '#64748b',
              }}
            />
          ))}
        </div>
      )}

      {/* Column Rows List */}
      <div className="divide-y divide-app-border/40 py-0.5">
        {entity.fields.map((field) => (
          <div
            key={field.id}
            className="relative px-3 py-1.5 flex items-center justify-between gap-1.5 hover:bg-app-sidebar/50 transition-colors group"
          >
            {/* Left Connector Handle (Target / Incoming Relation) */}
            <Handle
              type="target"
              position={Position.Left}
              id={`in-${field.id}`}
              className="!w-2.5 !h-2.5 !bg-app-surface !border-2 !border-app-border hover:!border-app-accent hover:!scale-150 -left-1.5 transition-all cursor-crosshair z-20"
              title={`Target: Drop line here to connect to ${entity.name}.${field.name}`}
            />

            {/* Field Meta: PK Toggle, Name Input */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {/* PK Key Toggle */}
              <button
                type="button"
                onClick={() => nodeData.onTogglePk(entity.id, field.id)}
                title={field.isPk ? 'Primary Key (Click to toggle)' : 'Set as Primary Key'}
                className="shrink-0 flex items-center p-0.5 rounded hover:bg-app-sidebar"
              >
                {field.isPk ? (
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                ) : field.isFk ? (
                  <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full border border-app-border hover:border-app-accent" />
                )}
              </button>

              {/* Editable Column Name */}
              <input
                type="text"
                value={field.name}
                onChange={(e) => nodeData.onRenameField(entity.id, field.id, e.target.value)}
                placeholder="column_name"
                className={`w-full font-mono text-[11px] bg-transparent border-none outline-none tracking-tight focus:bg-app-sidebar px-1 rounded truncate ${
                  field.isPk ? 'font-bold text-app-primary' : 'text-app-secondary'
                }`}
              />
            </div>

            {/* Field Controls: Type Dropdown, Nullable, Delete */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Data Type Dropdown */}
              <select
                value={field.type}
                onChange={(e) =>
                  nodeData.onUpdateFieldType(entity.id, field.id, e.target.value as any)
                }
                className="text-[10px] font-mono px-1 py-0.5 rounded bg-app-sidebar/80 border border-app-border/80 text-app-muted uppercase outline-none hover:text-app-primary cursor-pointer"
              >
                {DATA_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>

              {/* Nullable Toggle */}
              <button
                type="button"
                onClick={() => nodeData.onToggleNullable(entity.id, field.id)}
                title={field.nullable ? 'Nullable: true (Click to toggle NOT NULL)' : 'NOT NULL'}
                className={`text-[9px] font-mono px-1 py-0.5 rounded border ${
                  field.nullable
                    ? 'border-app-border/60 text-app-muted'
                    : 'border-app-primary/60 text-app-primary font-bold'
                }`}
              >
                {field.nullable ? 'NULL' : 'NN'}
              </button>

              {/* Delete Field Button */}
              {entity.fields.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nodeData.onDeleteField(entity.id, field.id);
                  }}
                  title="Remove column"
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-app-muted hover:text-red-400 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Right Connector Handle (Source / Drag line from here) */}
            <Handle
              type="source"
              position={Position.Right}
              id={`out-${field.id}`}
              className="!w-2.5 !h-2.5 !bg-app-surface !border-2 !border-app-border hover:!border-app-accent hover:!scale-150 -right-1.5 transition-all cursor-crosshair z-20"
              title={`Drag line from ${entity.name}.${field.name} to connect to another table`}
            />
          </div>
        ))}
      </div>

      {/* Quick Add Column Footer */}
      <div className="p-1.5 bg-app-sidebar/30 border-t border-app-border/40 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            nodeData.onAddField(entity.id);
          }}
          className="w-full py-1 text-[11px] text-app-muted hover:text-app-primary flex items-center justify-center gap-1 rounded hover:bg-app-sidebar transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add Column</span>
        </button>
      </div>

      {/* Bottom Source Handle for Table-to-Table Connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id={`out-table-${entity.id}`}
        className="!w-3 !h-3 !bg-app-surface !border-2 !border-app-border hover:!border-app-accent -bottom-1.5 transition-all cursor-crosshair"
      />
    </div>
  );
};

// Internal Canvas Flow Component with Professional Controls
const ErdFlowCanvas: React.FC<{
  page: WorkspacePage;
  entities: ErdEntity[];
}> = ({ page, entities }) => {
  const { fitView, zoomIn, zoomOut, setViewport } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [lineStyle, setLineStyle] = useState<'bezier' | 'smoothstep' | 'straight'>('bezier');
  const [showMinimap, setShowMinimap] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTab, setExportTab] = useState<'sql' | 'prisma' | 'sqlite'>('sql');
  const [copied, setCopied] = useState(false);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');

  // Callbacks for live table & field mutations
  const handleRenameTable = useCallback(async (entityId: string, newName: string) => {
    await db.erdEntities.update(entityId, { name: newName });
  }, []);

  const handleRenameField = useCallback(
    async (entityId: string, fieldId: string, newName: string) => {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity) return;
      const updated = entity.fields.map((f) => (f.id === fieldId ? { ...f, name: newName } : f));
      await db.erdEntities.update(entityId, { fields: updated });
    },
    [entities]
  );

  const handleUpdateFieldType = useCallback(
    async (entityId: string, fieldId: string, newType: ErdField['type']) => {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity) return;
      const updated = entity.fields.map((f) => (f.id === fieldId ? { ...f, type: newType } : f));
      await db.erdEntities.update(entityId, { fields: updated });
    },
    [entities]
  );

  const handleTogglePk = useCallback(
    async (entityId: string, fieldId: string) => {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity) return;
      const updated = entity.fields.map((f) =>
        f.id === fieldId ? { ...f, isPk: !f.isPk } : f
      );
      await db.erdEntities.update(entityId, { fields: updated });
    },
    [entities]
  );

  const handleToggleNullable = useCallback(
    async (entityId: string, fieldId: string) => {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity) return;
      const updated = entity.fields.map((f) =>
        f.id === fieldId ? { ...f, nullable: !f.nullable } : f
      );
      await db.erdEntities.update(entityId, { fields: updated });
    },
    [entities]
  );

  const handleAddField = useCallback(
    async (entityId: string) => {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity) return;

      const newField: ErdField = {
        id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: `new_column_${entity.fields.length + 1}`,
        type: 'VARCHAR',
        isPk: false,
        nullable: true,
      };

      await db.erdEntities.update(entityId, {
        fields: [...entity.fields, newField],
      });
    },
    [entities]
  );

  const handleDeleteField = useCallback(
    async (entityId: string, fieldId: string) => {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity) return;
      await db.erdEntities.update(entityId, {
        fields: entity.fields.filter((f) => f.id !== fieldId),
      });
    },
    [entities]
  );

  const handleDeleteTable = useCallback(async (entityId: string) => {
    await db.erdEntities.delete(entityId);
  }, []);

  const handleDuplicateTable = useCallback(
    async (entityId: string) => {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity) return;

      const duplicated: ErdEntity = {
        id: `entity-${Date.now()}`,
        pageId: entity.pageId,
        name: `${entity.name}_copy`,
        description: entity.description,
        color: entity.color,
        x: (entity.x || 100) + 40,
        y: (entity.y || 80) + 40,
        fields: entity.fields.map((f) => ({
          ...f,
          id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        })),
      };

      await db.erdEntities.add(duplicated);
    },
    [entities]
  );

  const handleChangeAccent = useCallback(async (entityId: string, accent: string) => {
    await db.erdEntities.update(entityId, { color: accent });
  }, []);

  // Define nodeTypes map
  const nodeTypes = useMemo(
    () => ({
      tableNode: ErdTableNode,
    }),
    []
  );

  // Sync Entities to Nodes & Compute Flexible Connecting Lines
  useEffect(() => {
    // 1. Build Nodes
    const newNodes: Node[] = entities.map((entity) => ({
      id: entity.id,
      type: 'tableNode',
      position: { x: entity.x ?? 80, y: entity.y ?? 60 },
      data: {
        entity,
        onRenameTable: handleRenameTable,
        onRenameField: handleRenameField,
        onUpdateFieldType: handleUpdateFieldType,
        onTogglePk: handleTogglePk,
        onToggleNullable: handleToggleNullable,
        onAddField: handleAddField,
        onDeleteField: handleDeleteField,
        onDeleteTable: handleDeleteTable,
        onDuplicateTable: handleDuplicateTable,
        onChangeAccent: handleChangeAccent,
      },
    }));

    // 2. Compute Flexible Connecting Edges
    const newEdges: Edge[] = [];
    for (const entity of entities) {
      for (const field of entity.fields) {
        if (field.references || field.isFk) {
          const targetTable = field.references?.table?.toLowerCase();
          const targetEntity = entities.find(
            (e) =>
              e.name.toLowerCase() === targetTable ||
              (field.name.endsWith('_id') &&
                (e.name.toLowerCase() === field.name.replace(/_id$/, 's') ||
                  e.name.toLowerCase() === field.name.replace(/_id$/, '')))
          );

          if (targetEntity) {
            const targetField =
              targetEntity.fields.find((f) => f.name === field.references?.field) ||
              targetEntity.fields.find((f) => f.isPk) ||
              targetEntity.fields[0];

            if (targetField) {
              const edgeId = `edge-${entity.id}-${field.id}-${targetEntity.id}-${targetField.id}`;
              newEdges.push({
                id: edgeId,
                source: entity.id,
                sourceHandle: `out-${field.id}`,
                target: targetEntity.id,
                targetHandle: `in-${targetField.id}`,
                type: lineStyle === 'bezier' ? 'default' : lineStyle,
                animated: true,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 14,
                  height: 14,
                  color: 'var(--text-secondary, #94a3b8)',
                },
                style: {
                  stroke: 'var(--text-secondary, #94a3b8)',
                  strokeWidth: 1.75,
                },
                label: `1 : N`,
                labelStyle: {
                  fill: 'var(--text-muted, #94a3b8)',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                },
                labelBgStyle: {
                  fill: 'var(--bg-surface, #1e1e1e)',
                  stroke: 'var(--border-color, #333)',
                  strokeWidth: 1,
                },
                labelBgPadding: [4, 2],
                labelBgBorderRadius: 4,
              });
            }
          }
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [
    entities,
    lineStyle,
    handleRenameTable,
    handleRenameField,
    handleUpdateFieldType,
    handleTogglePk,
    handleToggleNullable,
    handleAddField,
    handleDeleteField,
    handleDeleteTable,
    handleDuplicateTable,
    handleChangeAccent,
    setNodes,
    setEdges,
  ]);

  // Persist node position on drag stop
  const onNodeDragStop = useCallback(
    async (_event: unknown, node: Node) => {
      await db.erdEntities.update(node.id, {
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      });
    },
    []
  );

  // Handle Dragging Lines to connect tables manually
  const onConnect = useCallback(
    async (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: lineStyle === 'bezier' ? 'default' : lineStyle,
            animated: true,
            label: '1 : N',
            markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
            style: { stroke: 'var(--text-secondary, #94a3b8)', strokeWidth: 1.75 },
          },
          eds
        )
      );

      // Persist foreign key reference in IndexedDB
      if (connection.source && connection.target && connection.sourceHandle && connection.targetHandle) {
        const sourceEntity = entities.find((e) => e.id === connection.source);
        const targetEntity = entities.find((e) => e.id === connection.target);

        if (sourceEntity && targetEntity) {
          const sourceFieldId = connection.sourceHandle.replace('out-', '');
          const targetFieldId = connection.targetHandle.replace('in-', '');
          const targetField =
            targetEntity.fields.find((f) => f.id === targetFieldId) || targetEntity.fields[0];

          const updatedFields = sourceEntity.fields.map((f) => {
            if (f.id === sourceFieldId) {
              return {
                ...f,
                isFk: true,
                references: {
                  table: targetEntity.name,
                  field: targetField?.name || 'id',
                },
              };
            }
            return f;
          });

          await db.erdEntities.update(sourceEntity.id, { fields: updatedFields });
        }
      }
    },
    [entities, lineStyle, setEdges]
  );

  // Add New Table
  const handleAddTable = async () => {
    const tableName = (newTableName.trim() || `table_${entities.length + 1}`)
      .toLowerCase()
      .replace(/\s+/g, '_');

    const newEntity: ErdEntity = {
      id: `entity-${Date.now()}`,
      pageId: page.id,
      name: tableName,
      description: 'Custom entity table',
      color: 'blue',
      x: 100 + (entities.length % 3) * 340,
      y: 80 + Math.floor(entities.length / 3) * 320,
      fields: [
        { id: `f-${Date.now()}-1`, name: 'id', type: 'UUID', isPk: true, nullable: false },
        { id: `f-${Date.now()}-2`, name: 'name', type: 'VARCHAR', isPk: false, nullable: false },
        { id: `f-${Date.now()}-3`, name: 'created_at', type: 'TIMESTAMP', isPk: false, nullable: false },
      ],
    };

    await db.erdEntities.add(newEntity);
    setNewTableName('');
    setIsAddingTable(false);
  };

  // Tidy Layout: Auto arranges tables cleanly
  const handleTidyLayout = async () => {
    const colWidth = 380;
    const rowHeight = 360;
    const cols = Math.min(3, Math.max(2, Math.ceil(Math.sqrt(entities.length))));

    for (let i = 0; i < entities.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const newX = 80 + col * colWidth;
      const newY = 80 + row * rowHeight;
      await db.erdEntities.update(entities[i].id, { x: newX, y: newY });
    }

    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 150);
  };

  // SQL & Prisma Generator
  const generateSqlDdl = (dialect: 'postgres' | 'sqlite' = 'postgres') => {
    let sql = `-- Generated by NoteWorkspace ERD Studio\n-- Dialect: ${dialect.toUpperCase()}\n\n`;
    for (const ent of entities) {
      sql += `CREATE TABLE "${ent.name}" (\n`;
      const fieldLines = ent.fields.map((f) => {
        let line = `  "${f.name}" ${f.type}`;
        if (f.isPk) line += ` PRIMARY KEY`;
        if (!f.nullable && !f.isPk) line += ` NOT NULL`;
        if (f.references) {
          line += ` REFERENCES "${f.references.table}"("${f.references.field}") ON DELETE CASCADE`;
        }
        return line;
      });
      sql += fieldLines.join(',\n');
      sql += `\n);\n\n`;
    }
    return sql;
  };

  const generatePrismaSchema = () => {
    let prisma = `// Generated by NoteWorkspace ERD Studio\n// Prisma Schema (v5+)\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n`;
    for (const ent of entities) {
      const modelName =
        ent.name.charAt(0).toUpperCase() +
        ent.name
          .slice(1)
          .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      prisma += `model ${modelName} {\n`;
      for (const f of ent.fields) {
        let pType = 'String';
        if (f.type === 'INT') pType = 'Int';
        if (f.type === 'BIGINT') pType = 'BigInt';
        if (f.type === 'BOOLEAN') pType = 'Boolean';
        if (f.type === 'TIMESTAMP') pType = 'DateTime';
        if (f.type === 'JSONB') pType = 'Json';
        if (f.type === 'DECIMAL') pType = 'Decimal';

        let line = `  ${f.name.padEnd(16)} ${pType}`;
        if (f.isPk) line += ` @id @default(uuid())`;
        if (f.nullable && !f.isPk) line += `?`;
        prisma += `${line}\n`;
      }
      prisma += `}\n\n`;
    }
    return prisma;
  };

  const handleCopyCode = () => {
    let code = '';
    if (exportTab === 'sql') code = generateSqlDdl('postgres');
    else if (exportTab === 'sqlite') code = generateSqlDdl('sqlite');
    else code = generatePrismaSchema();

    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative select-none">
      {/* Top Navbar Header with Studio Controls */}
      <div className="px-6 py-3 border-b border-app-border bg-app-surface/90 flex items-center justify-between shrink-0 z-20">
        <div>
          <h1 className="text-base font-bold text-app-primary flex items-center gap-2">
            <Database className="w-4 h-4 text-app-primary" />
            <span>{page.title}</span>
          </h1>
          <p className="text-[11px] text-app-muted mt-0.5">
            {entities.length} Tables &bull; {edges.length} Relations &bull; Drag handles to pull lines &bull; Double click text to edit
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Line Style Toggle: Bezier Curve vs Step vs Straight */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-app-sidebar border border-app-border text-xs">
            <button
              onClick={() => setLineStyle('bezier')}
              title="Curved Lines (Bends fluidly)"
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                lineStyle === 'bezier'
                  ? 'bg-app-surface text-app-primary font-semibold shadow-sm'
                  : 'text-app-muted hover:text-app-primary'
              }`}
            >
              <Spline className="w-3.5 h-3.5" />
              <span>Curve</span>
            </button>
            <button
              onClick={() => setLineStyle('smoothstep')}
              title="90° Step Lines"
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                lineStyle === 'smoothstep'
                  ? 'bg-app-surface text-app-primary font-semibold shadow-sm'
                  : 'text-app-muted hover:text-app-primary'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Step</span>
            </button>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-app-border bg-app-sidebar/60 hover:bg-app-sidebar text-xs text-app-secondary hover:text-app-primary transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Export DDL</span>
          </button>

          <button
            onClick={() => setIsAddingTable(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-app-primary text-app-canvas hover:opacity-90 text-xs font-semibold shadow-sm transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Table</span>
          </button>
        </div>
      </div>

      {/* Infinite Canvas */}
      <div className="flex-1 w-full h-full relative bg-app-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          minZoom={0.25}
          maxZoom={2.5}
          defaultViewport={{ x: 60, y: 40, zoom: 0.95 }}
          zoomOnScroll={true}
          panOnDrag={true}
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          className="w-full h-full"
        >
          {/* Background Grid */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color="var(--border-color, #475569)"
            className="opacity-40"
          />

          {/* Floating Zoom & Canvas Controls Dock */}
          <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1 p-1 rounded-xl bg-app-surface/90 border border-app-border shadow-xl backdrop-blur-md">
            <button
              onClick={() => zoomIn({ duration: 250 })}
              title="Zoom In (+)"
              className="p-1.5 rounded-lg text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={() => zoomOut({ duration: 250 })}
              title="Zoom Out (-)"
              className="p-1.5 rounded-lg text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-app-border my-auto mx-0.5" />

            <button
              onClick={() => fitView({ padding: 0.2, duration: 350 })}
              title="Fit to Screen"
              className="p-1.5 rounded-lg text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewport({ x: 60, y: 40, zoom: 1 }, { duration: 250 })}
              title="Reset Zoom (100%)"
              className="p-1.5 rounded-lg text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-app-border my-auto mx-0.5" />

            <button
              onClick={handleTidyLayout}
              title="Auto-Tidy / Organize Tables"
              className="p-1.5 rounded-lg text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowMinimap(!showMinimap)}
              title="Toggle Minimap"
              className={`p-1.5 rounded-lg transition-colors ${
                showMinimap
                  ? 'text-app-primary bg-app-sidebar'
                  : 'text-app-muted hover:text-app-primary hover:bg-app-sidebar'
              }`}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>

          {/* Minimap Overview */}
          {showMinimap && (
            <div className="absolute bottom-6 right-6 z-20 rounded-xl overflow-hidden border border-app-border shadow-2xl bg-app-surface/90 backdrop-blur-md">
              <MiniMap
                nodeStrokeWidth={2}
                nodeColor="var(--text-muted, #64748b)"
                maskColor="rgba(0, 0, 0, 0.45)"
                className="!m-0 !w-[180px] !h-[120px] !bg-transparent"
              />
            </div>
          )}
        </ReactFlow>
      </div>

      {/* New Table Modal */}
      {isAddingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl border border-app-border bg-app-surface p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-app-primary flex items-center gap-2">
                <Database className="w-4 h-4 text-app-primary" />
                <span>Create Database Table</span>
              </h3>
              <button
                onClick={() => setIsAddingTable(false)}
                className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-app-secondary">Table Name</label>
              <input
                type="text"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTable();
                }}
                placeholder="e.g. users, products, orders"
                autoFocus
                className="w-full px-3 py-2 rounded-lg bg-app-sidebar border border-app-border text-xs text-app-primary outline-none focus:border-app-accent font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddingTable(false)}
                className="px-3 py-1.5 rounded-lg border border-app-border text-xs text-app-secondary hover:bg-app-sidebar"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTable}
                className="px-3.5 py-1.5 rounded-lg bg-app-primary text-app-canvas text-xs font-semibold hover:opacity-90"
              >
                Add Table to Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Schema Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-xl border border-app-border bg-app-surface shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-app-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-app-primary" />
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-app-sidebar border border-app-border text-xs">
                  <button
                    onClick={() => setExportTab('sql')}
                    className={`px-3 py-1 rounded-md transition-colors font-medium ${
                      exportTab === 'sql'
                        ? 'bg-app-surface text-app-primary shadow-sm'
                        : 'text-app-muted hover:text-app-primary'
                    }`}
                  >
                    PostgreSQL
                  </button>
                  <button
                    onClick={() => setExportTab('sqlite')}
                    className={`px-3 py-1 rounded-md transition-colors font-medium ${
                      exportTab === 'sqlite'
                        ? 'bg-app-surface text-app-primary shadow-sm'
                        : 'text-app-muted hover:text-app-primary'
                    }`}
                  >
                    SQLite / MySQL
                  </button>
                  <button
                    onClick={() => setExportTab('prisma')}
                    className={`px-3 py-1 rounded-md transition-colors font-medium ${
                      exportTab === 'prisma'
                        ? 'bg-app-surface text-app-primary shadow-sm'
                        : 'text-app-muted hover:text-app-primary'
                    }`}
                  >
                    Prisma
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-sidebar hover:bg-app-border/40 text-xs text-app-primary border border-app-border transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Schema</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-app-canvas">
              <pre className="text-xs font-mono text-app-secondary leading-relaxed p-4 rounded-lg bg-app-sidebar/60 border border-app-border/80 overflow-x-auto select-text">
                {exportTab === 'sql'
                  ? generateSqlDdl('postgres')
                  : exportTab === 'sqlite'
                  ? generateSqlDdl('sqlite')
                  : generatePrismaSchema()}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Export Wrapped with ReactFlowProvider
export const ErdView: React.FC<{ page: WorkspacePage }> = ({ page }) => {
  const entities =
    useLiveQuery(
      () => db.erdEntities.where('pageId').equals(page.id).toArray(),
      [page.id]
    ) || [];

  return (
    <ReactFlowProvider>
      <ErdFlowCanvas page={page} entities={entities} />
    </ReactFlowProvider>
  );
};
