/**
 * Script Content Exporter Module
 * Handles converting the internal JSON ScreenplayDocument representation into:
 * - PDF (Standard Hollywood Screenplay format in Courier Prime 12pt with proper margins)
 * - DOCX (Microsoft Word compatible with standard screenplay indentation)
 * - Fountain (.fountain)
 * - Final Draft XML (.fdx)
 * - Formatted Plain Text (.txt)
 * - OpenScript JSON backup
 */

import { ScreenplayDocument } from '../types/screenplay';
import { generateScreenplayPDF } from './pdfExport';
import { generateScreenplayDocx } from './docxExport';
import { exportToFountain } from './fountain';
import { exportToFDX } from './fdx';

export type ExportFormat = 'pdf' | 'docx' | 'fountain' | 'fdx' | 'txt' | 'json';

export interface ExportOptions {
  includeTitlePage?: boolean;
  includeSceneNumbers?: boolean;
  customFilename?: string;
  revisionDraftColor?: string;
}

/**
 * Downloads a raw string or text as a file in the browser.
 */
export function triggerFileDownload(
  content: string,
  filename: string,
  mimeType: string = 'text/plain;charset=utf-8'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Formats screenplay document as structured plain text with standard indentation.
 */
export function convertToFormattedText(doc: ScreenplayDocument): string {
  const lines: string[] = [];

  // Title Page
  if (doc.titlePage.title) {
    lines.push('\n\n\n');
    lines.push(`\t\t\t\t${doc.titlePage.title.toUpperCase()}`);
    lines.push(`\t\t\t\t${doc.titlePage.credit || 'written by'}`);
    lines.push(`\t\t\t\t${doc.titlePage.author || 'Anonymous'}`);
    if (doc.titlePage.source) lines.push(`\t\t\t\t${doc.titlePage.source}`);
    lines.push('\n\n\n========================================================================\n\n');
  }

  // Blocks
  doc.blocks.forEach((b) => {
    switch (b.type) {
      case 'scene_heading':
        lines.push(`\n${b.text.toUpperCase()}\n`);
        break;
      case 'character':
        lines.push(`\n\t\t\t${b.text.toUpperCase()}`);
        break;
      case 'parenthetical':
        lines.push(`\t\t${b.text}`);
        break;
      case 'dialogue':
        lines.push(`\t${b.text}`);
        break;
      case 'dual_dialogue':
        lines.push(`\n\t\t${(b.character1 || '').toUpperCase()}\t\t\t${(b.character2 || '').toUpperCase()}`);
        if (b.parenthetical1 || b.parenthetical2) {
          lines.push(`\t\t${b.parenthetical1 || ''}\t\t\t${b.parenthetical2 || ''}`);
        }
        lines.push(`\t${b.dialogue1 || ''}\t\t${b.dialogue2 || ''}`);
        break;
      case 'transition':
        lines.push(`\n\t\t\t\t\t\t${b.text.toUpperCase()}\n`);
        break;
      case 'shot':
        lines.push(`\n${b.text.toUpperCase()}\n`);
        break;
      default:
        lines.push(`\n${b.text}\n`);
    }
  });

  return lines.join('\n');
}

/**
 * Main Universal Export Function
 * Converts internal script representation to the requested format and triggers download.
 */
export async function exportScript(
  doc: ScreenplayDocument,
  format: ExportFormat,
  options: ExportOptions = {}
): Promise<{ success: boolean; filename: string }> {
  const baseTitle = (doc.titlePage.title || 'Screenplay').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = options.customFilename || baseTitle;

  switch (format) {
    case 'pdf': {
      // PDF export adhering to Hollywood standard formatting
      generateScreenplayPDF(doc);
      return { success: true, filename: `${filename}.pdf` };
    }

    case 'docx': {
      // DOCX export compatible with Word, LibreOffice, and Google Docs
      await generateScreenplayDocx(doc);
      return { success: true, filename: `${filename}.docx` };
    }

    case 'fountain': {
      // Fountain plain-text export
      const fountainContent = exportToFountain(doc);
      triggerFileDownload(fountainContent, `${filename}.fountain`, 'text/plain;charset=utf-8');
      return { success: true, filename: `${filename}.fountain` };
    }

    case 'fdx': {
      // Final Draft XML export
      const fdxContent = exportToFDX(doc);
      triggerFileDownload(fdxContent, `${filename}.fdx`, 'application/xml;charset=utf-8');
      return { success: true, filename: `${filename}.fdx` };
    }

    case 'txt': {
      // Plain text formatted screenplay export
      const textContent = convertToFormattedText(doc);
      triggerFileDownload(textContent, `${filename}.txt`, 'text/plain;charset=utf-8');
      return { success: true, filename: `${filename}.txt` };
    }

    case 'json': {
      // Full OpenScript project JSON snapshot
      const jsonContent = JSON.stringify(doc, null, 2);
      triggerFileDownload(jsonContent, `${filename}.openscript.json`, 'application/json;charset=utf-8');
      return { success: true, filename: `${filename}.openscript.json` };
    }

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}
