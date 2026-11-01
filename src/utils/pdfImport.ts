import * as pdfjsLib from 'pdfjs-dist';
import { ScreenplayDocument, ScriptBlock } from '../types/screenplay';

// Configure pdfjs worker to load from CDN for browser compatibility
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

interface TextItemWithPos {
  text: string;
  x: number;
  y: number;
  page: number;
}

/**
 * Parses a screenplay PDF with precision-calibrated margin and page-split handling.
 * - Extracts Title Page from Page 1 if present (preventing duplicate pages)
 * - Strips running headers & page numbers at top-right
 * - Cleans (MORE) and (CONT'D) page-break artifacts
 * - Accurately distinguishes Scene Headings, Action, Character, Dialogue, Parentheticals, and Transitions
 */
export async function parseScreenplayPDF(
  pdfData: ArrayBuffer | Uint8Array,
  filename: string = 'Imported Script'
): Promise<ScreenplayDocument> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;

  const totalPages = pdf.numPages;
  const rawItemsByPage: Map<number, TextItemWithPos[]> = new Map();

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items: TextItemWithPos[] = [];

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim()) {
        const tx = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
        const x = tx[4];
        const y = tx[5]; // In PDF.js, y=0 is bottom, y=792 is top
        items.push({
          text: item.str,
          x,
          y,
          page: pageNum,
        });
      }
    }
    rawItemsByPage.set(pageNum, items);
  }

  // Helper to assemble text items into ordered lines on a single page
  const extractLinesFromPage = (items: TextItemWithPos[]) => {
    // Sort top to bottom (descending y), then left to right (ascending x)
    const sorted = [...items].sort((a, b) => {
      if (Math.abs(a.y - b.y) < 4) {
        return a.x - b.x;
      }
      return b.y - a.y;
    });

    const lines: { text: string; x: number; y: number; page: number }[] = [];
    let currentLine: { text: string; x: number; y: number; page: number } | null = null;

    for (const item of sorted) {
      if (currentLine && Math.abs(currentLine.y - item.y) < 4) {
        currentLine.text += (currentLine.text.endsWith(' ') ? '' : ' ') + item.text;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = {
          text: item.text.trim(),
          x: item.x,
          y: item.y,
          page: item.page,
        };
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };

  // Inspect Page 1 to determine if it is a Cover / Title Page
  const page1Items = rawItemsByPage.get(1) || [];
  const page1Lines = extractLinesFromPage(page1Items);

  let hasTitlePage = false;
  let title = filename.replace(/\.[^/.]+$/, '').toUpperCase();
  let credit = 'written by';
  let author = 'Unknown Author';
  let draft = 'Director Reference Draft';
  let date = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  let contact = '';

  // Check if page 1 contains any scene headings
  const hasSceneHeadingOnPage1 = page1Lines.some((l) =>
    /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.|INT\s|EXT\s)/i.test(l.text.trim())
  );

  if (totalPages > 1 && !hasSceneHeadingOnPage1 && page1Lines.length < 20) {
    hasTitlePage = true;
    // Extract metadata from Page 1
    const cleanP1Texts = page1Lines.map((l) => l.text.trim());
    if (cleanP1Texts.length > 0) {
      title = cleanP1Texts[0].toUpperCase();
    }
    for (let k = 1; k < cleanP1Texts.length; k++) {
      const lineText = cleanP1Texts[k];
      if (/^(written by|screenplay by|story by|by)$/i.test(lineText)) {
        credit = lineText.toLowerCase();
        if (cleanP1Texts[k + 1]) {
          author = cleanP1Texts[k + 1];
        }
      } else if (/draft/i.test(lineText)) {
        draft = lineText;
      } else if (/@|phone|tel|email|contact|agency|agent/i.test(lineText)) {
        contact += (contact ? '\n' : '') + lineText;
      }
    }
  }

  // Process Script Body Pages (start from page 2 if page 1 was title page, else from page 1)
  const startPage = hasTitlePage ? 2 : 1;
  const allBodyLines: { text: string; x: number; y: number; page: number }[] = [];

  for (let p = startPage; p <= totalPages; p++) {
    const pageItems = rawItemsByPage.get(p) || [];
    const pageLines = extractLinesFromPage(pageItems);

    // Filter running headers and top-right page numbers:
    // Page numbers are usually in top 60pt (y > 720) on the right (x > 380)
    const cleaned = pageLines.filter((l) => {
      const t = l.text.trim();
      // Standalone numbers or "12." at top of page
      if (l.y > 720 && /^\d+\.?$/.test(t)) return false;
      // Running header with page number e.g. "TITLE - 12."
      if (l.y > 730 && /\b\d+\.?$/.test(t)) return false;
      // Discard standalone (MORE) markers at the bottom of pages
      if (l.y < 120 && /^\(more\)$/i.test(t)) return false;
      return true;
    });

    allBodyLines.push(...cleaned);
  }

  // Parse lines into screenplay blocks with paragraph continuity
  const blocks: ScriptBlock[] = [];
  let sceneCounter = 1;

  for (let i = 0; i < allBodyLines.length; i++) {
    const line = allBodyLines[i];
    const text = line.text.trim();
    const x = line.x;

    if (!text) continue;

    // Check for Transition (e.g. CUT TO:, FADE OUT., or right-aligned >= 360pt)
    if (
      /^(FADE OUT\.|FADE IN:|CUT TO:|SMASH CUT TO:|DISSOLVE TO:|MATCH CUT TO:|JUMP CUT TO:)$/i.test(
        text
      ) ||
      (x >= 360 && text.endsWith(':') && text === text.toUpperCase())
    ) {
      blocks.push({
        id: `pdf-blk-${Date.now()}-${blocks.length}`,
        type: 'transition',
        text: text.toUpperCase(),
      });
      continue;
    }

    // Check for Scene Heading (INT., EXT., etc.)
    if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.|INT\s|EXT\s)/i.test(text)) {
      blocks.push({
        id: `pdf-blk-${Date.now()}-${blocks.length}`,
        type: 'scene_heading',
        text: text.toUpperCase(),
        sceneNumber: sceneCounter++,
      });
      continue;
    }

    // Check for Parenthetical
    if (text.startsWith('(') && text.endsWith(')')) {
      // Check if it's a continuation marker like (CONT'D)
      if (/^\(cont'?d\)$/i.test(text)) {
        // Skip isolated (CONT'D)
        continue;
      }
      blocks.push({
        id: `pdf-blk-${Date.now()}-${blocks.length}`,
        type: 'parenthetical',
        text: text,
      });
      continue;
    }

    // Check for Character name (uppercase line, indented towards center, length <= 36, no terminal sentence punctuation)
    const isUppercase = text === text.toUpperCase() && /[A-Z]/.test(text) && text.length <= 36;
    const isCharIndented = x >= 180 && x <= 360;
    const hasSentencePunctuation = /[.!?,;:]$/.test(text.replace(/\s*\([^)]*\)$/, ''));

    if (isUppercase && isCharIndented && !hasSentencePunctuation) {
      const cleanChar = text.replace(/\s*\(CONT'D\)/i, '').replace(/\s*\(cont'd\)/i, '').trim();
      const prevBlock = blocks[blocks.length - 1];

      // If this is the same character continuing across a page break directly from dialogue
      if (prevBlock && prevBlock.type === 'dialogue') {
        const charBlockBeforeDial = blocks[blocks.length - 2];
        if (charBlockBeforeDial && charBlockBeforeDial.type === 'character' && charBlockBeforeDial.text === cleanChar) {
          // It's a continued dialogue across page break! PDF export will handle (MORE) and (CONT'D)
          continue;
        }
      }

      blocks.push({
        id: `pdf-blk-${Date.now()}-${blocks.length}`,
        type: 'character',
        text: cleanChar,
      });
      continue;
    }

    // Check if line belongs to Dialogue
    const prevBlock = blocks[blocks.length - 1];
    if (
      prevBlock &&
      (prevBlock.type === 'character' || prevBlock.type === 'parenthetical' || prevBlock.type === 'dialogue') &&
      x >= 130 &&
      x <= 280
    ) {
      if (prevBlock.type === 'dialogue') {
        const prevLine = allBodyLines[i - 1];
        const isSamePage = prevLine && prevLine.page === line.page;
        const gap = isSamePage ? Math.abs(prevLine.y - line.y) : 0;
        // Preserves intentional double space / paragraph breaks within monologue
        if (gap > 20) {
          prevBlock.text += '\n\n' + text;
        } else {
          prevBlock.text += (prevBlock.text.endsWith(' ') ? '' : ' ') + text;
        }
      } else {
        blocks.push({
          id: `pdf-blk-${Date.now()}-${blocks.length}`,
          type: 'dialogue',
          text: text,
        });
      }
      continue;
    }

    // Default: Action
    if (prevBlock && prevBlock.type === 'action' && x < 180) {
      const prevLine = allBodyLines[i - 1];
      const isSamePage = prevLine && prevLine.page === line.page;
      const gap = isSamePage ? Math.abs(prevLine.y - line.y) : 0;

      const isContinuationAcrossPage =
        prevLine &&
        line.page === prevLine.page + 1 &&
        (!/[.!?:]$/.test(prevLine.text.trim()) || /^[a-z]/.test(text));

      if ((isSamePage && gap < 18) || isContinuationAcrossPage) {
        prevBlock.text += (prevBlock.text.endsWith(' ') ? '' : ' ') + text;
      } else {
        // Distinct action paragraph
        blocks.push({
          id: `pdf-blk-${Date.now()}-${blocks.length}`,
          type: 'action',
          text: text,
        });
      }
    } else {
      blocks.push({
        id: `pdf-blk-${Date.now()}-${blocks.length}`,
        type: 'action',
        text: text,
      });
    }
  }

  // Fallback if empty
  if (blocks.length === 0) {
    blocks.push({
      id: `pdf-blk-${Date.now()}`,
      type: 'action',
      text: 'Imported script contained no readable screenplay elements.',
    });
  }

  return {
    id: `script-pdf-${Date.now()}`,
    version: 1,
    updatedAt: Date.now(),
    titlePage: {
      title,
      credit,
      author,
      source: `Imported from PDF: ${filename}`,
      draft,
      date,
      contact,
      copyright: '',
    },
    blocks,
  };
}
