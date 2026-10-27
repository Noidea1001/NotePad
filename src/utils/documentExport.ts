import { WorkspacePage } from '@/types';
import { getOrCreateYDoc } from '@/components/editor/YjsManager';
import { EditorBlock, TableBlockData } from '@/components/editor/types';

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function getDocumentBlocks(pageId: string, fallbackContent?: string): EditorBlock[] {
  try {
    const { doc } = getOrCreateYDoc(pageId);
    const yBlocks = doc.getArray<EditorBlock>('blocks').toArray();
    if (yBlocks && yBlocks.length > 0) {
      return yBlocks;
    }
  } catch (err) {
    console.error('Error fetching Yjs blocks for export:', err);
  }

  // Fallback
  return [
    {
      id: 'fallback-1',
      type: 'paragraph',
      content: fallbackContent || '',
    },
  ];
}

export function convertBlocksToMarkdown(pageTitle: string, blocks: EditorBlock[]): string {
  let md = pageTitle && pageTitle !== 'Untitled' ? `# ${pageTitle}\n\n` : '';

  for (const block of blocks) {
    switch (block.type) {
      case 'h1':
        md += `# ${stripHtml(block.content)}\n\n`;
        break;
      case 'h2':
        md += `## ${stripHtml(block.content)}\n\n`;
        break;
      case 'h3':
        md += `### ${stripHtml(block.content)}\n\n`;
        break;
      case 'paragraph':
        if (block.content) {
          md += `${stripHtml(block.content)}\n\n`;
        }
        break;
      case 'task':
        md += `- [${block.checked ? 'x' : ' '}] ${stripHtml(block.content)}\n`;
        break;
      case 'quote':
        md += `> ${stripHtml(block.content)}\n\n`;
        break;
      case 'code': {
        const lang = block.data?.language || 'javascript';
        md += `\`\`\`${lang}\n${block.content || ''}\n\`\`\`\n\n`;
        break;
      }
      case 'toggle': {
        const title = block.data?.title || 'Toggle Solution';
        const content = stripHtml(block.data?.content || '');
        md += `<details>\n<summary>${title}</summary>\n\n${content}\n</details>\n\n`;
        break;
      }
      case 'table': {
        const tableData = block.data as TableBlockData | undefined;
        const rows = tableData?.rows || [];
        if (rows.length > 0) {
          const colCount = rows[0]?.length || 1;
          // Header row
          const header = rows[0].map((c) => c.replace(/\|/g, '\\|') || ' ').join(' | ');
          md += `| ${header} |\n`;
          // Separator
          md += `| ${new Array(colCount).fill('---').join(' | ')} |\n`;
          // Remaining rows
          for (let r = 1; r < rows.length; r++) {
            const rowText = rows[r].map((c) => c.replace(/\|/g, '\\|') || ' ').join(' | ');
            md += `| ${rowText} |\n`;
          }
          md += '\n';
        }
        break;
      }
      case 'columns-2':
      case 'columns-3': {
        const cols = (block.data?.columns as Array<{ title: string; content: string }>) || [];
        for (const col of cols) {
          md += `#### ${col.title}\n${stripHtml(col.content)}\n\n`;
        }
        break;
      }
      case 'callout': {
        const title = block.data?.title || 'Note';
        const content = stripHtml(block.data?.content || '');
        md += `> **${title}**\n> ${content}\n\n`;
        break;
      }
      case 'sticky-board': {
        const title = block.data?.title || 'Sticky Notes Board';
        const notes = (block.data?.notes as Array<{ text: string }>) || [];
        md += `### ${title}\n`;
        notes.forEach((n) => {
          md += `- ${n.text}\n`;
        });
        md += '\n';
        break;
      }
      case 'plan-roadmap': {
        const title = block.data?.title || 'Project Roadmap';
        const phases = (block.data?.phases as Array<{ name: string; tasks: Array<{ title: string; done: boolean }> }>) || [];
        md += `### ${title}\n`;
        phases.forEach((p) => {
          md += `\n**Phase: ${p.name}**\n`;
          p.tasks.forEach((t) => {
            md += `- [${t.done ? 'x' : ' '}] ${t.title}\n`;
          });
        });
        md += '\n';
        break;
      }
      case 'divider':
        md += `---\n\n`;
        break;
      default:
        if (block.content) {
          md += `${stripHtml(block.content)}\n\n`;
        }
    }
  }

  return md;
}

export function convertBlocksToPlainText(pageTitle: string, blocks: EditorBlock[]): string {
  let text = pageTitle && pageTitle !== 'Untitled' ? `${pageTitle.toUpperCase()}\n${'='.repeat(pageTitle.length)}\n\n` : '';

  for (const block of blocks) {
    switch (block.type) {
      case 'h1':
      case 'h2':
      case 'h3':
        text += `\n[ ${stripHtml(block.content).toUpperCase()} ]\n\n`;
        break;
      case 'paragraph':
        if (block.content) {
          text += `${stripHtml(block.content)}\n\n`;
        }
        break;
      case 'task':
        text += `[${block.checked ? 'X' : ' '}] ${stripHtml(block.content)}\n`;
        break;
      case 'code':
        text += `\n--- CODE (${block.data?.language || 'code'}) ---\n${block.content || ''}\n------------------------\n\n`;
        break;
      case 'toggle':
        text += `\n[▼ ${block.data?.title || 'Toggle'}]\n${stripHtml(block.data?.content || '')}\n\n`;
        break;
      case 'table': {
        const tableData = block.data as TableBlockData | undefined;
        const rows = tableData?.rows || [];
        rows.forEach((row) => {
          text += row.join('\t | \t') + '\n';
        });
        text += '\n';
        break;
      }
      case 'columns-2':
      case 'columns-3': {
        const cols = (block.data?.columns as Array<{ title: string; content: string }>) || [];
        cols.forEach((col) => {
          text += `--- ${col.title} ---\n${stripHtml(col.content)}\n\n`;
        });
        break;
      }
      case 'callout': {
        text += `NOTE: ${block.data?.title || ''}\n${stripHtml(block.data?.content || '')}\n\n`;
        break;
      }
      case 'divider':
        text += `----------------------------------------\n\n`;
        break;
      default:
        if (block.content) {
          text += `${stripHtml(block.content)}\n\n`;
        }
    }
  }

  return text;
}

export function convertBlocksToHtml(pageTitle: string, blocks: EditorBlock[]): string {
  const md = convertBlocksToMarkdown(pageTitle, blocks);
  // Build a standalone HTML document with clean styling
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${pageTitle || 'Untitled Note'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    h1 { font-size: 2.2rem; border-bottom: 2px solid #eaecef; padding-bottom: 0.3em; margin-bottom: 1em; }
    h2 { font-size: 1.5rem; margin-top: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.2em; }
    h3 { font-size: 1.2rem; margin-top: 1.2em; }
    p { margin: 0.8em 0; }
    blockquote { border-left: 4px solid #007acc; padding: 10px 16px; margin: 16px 0; background: #f6f8fa; border-radius: 4px; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; font-family: monospace; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #dfe2e5; padding: 8px 12px; text-align: left; }
    th { background: #f6f8fa; font-weight: 600; }
    ul { padding-left: 20px; }
    hr { border: none; border-top: 1px solid #eaecef; margin: 30px 0; }
    @media print {
      body { max-width: 100%; margin: 0; padding: 15mm; }
    }
  </style>
</head>
<body>
  <h1>${pageTitle || 'Untitled'}</h1>
  <div>
    <pre style="white-space: pre-wrap; font-family: inherit;">${md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </div>
</body>
</html>`;
}

// Helper to trigger file download in browser
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
