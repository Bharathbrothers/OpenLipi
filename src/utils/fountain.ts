import { ScreenplayDocument, ScriptBlock, ScreenplayElementType } from '../types/screenplay';

/**
 * Serializes a ScreenplayDocument to standard Fountain plain-text markup.
 */
export function exportToFountain(doc: ScreenplayDocument): string {
  const lines: string[] = [];

  // Title Page Header
  if (doc.titlePage.title) {
    lines.push(`Title: ${doc.titlePage.title}`);
  }
  if (doc.titlePage.credit) {
    lines.push(`Credit: ${doc.titlePage.credit}`);
  }
  if (doc.titlePage.author) {
    lines.push(`Author: ${doc.titlePage.author}`);
  }
  if (doc.titlePage.source) {
    lines.push(`Source: ${doc.titlePage.source}`);
  }
  if (doc.titlePage.draft) {
    lines.push(`Draft date: ${doc.titlePage.draft} (${doc.titlePage.date || ''})`);
  }
  if (doc.titlePage.contact) {
    const contactLines = doc.titlePage.contact.split('\n');
    contactLines.forEach((c) => lines.push(`Contact: ${c}`));
  }
  if (doc.titlePage.copyright) {
    lines.push(`Copyright: ${doc.titlePage.copyright}`);
  }

  lines.push('\n===\n'); // Fountain title page separator

  // Script Blocks
  for (let i = 0; i < doc.blocks.length; i++) {
    const b = doc.blocks[i];

    switch (b.type) {
      case 'scene_heading': {
        const sceneNum = b.sceneNumber ? ` #${b.sceneNumber}#` : '';
        lines.push(`\n${b.text.toUpperCase()}${sceneNum}\n`);
        break;
      }
      case 'action': {
        lines.push(`\n${b.text}\n`);
        break;
      }
      case 'character': {
        lines.push(`\n${b.text.toUpperCase()}`);
        break;
      }
      case 'parenthetical': {
        const p = b.text.startsWith('(') && b.text.endsWith(')') ? b.text : `(${b.text.replace(/^\(|\)$/g, '')})`;
        lines.push(p);
        break;
      }
      case 'dialogue': {
        lines.push(b.text);
        break;
      }
      case 'dual_dialogue': {
        // Dual dialogue in Fountain uses the caret ^ next to the second character
        lines.push(`\n${(b.character1 || 'CHARACTER 1').toUpperCase()}`);
        if (b.parenthetical1) {
          lines.push(`(${b.parenthetical1.replace(/^\(|\)$/g, '')})`);
        }
        lines.push(b.dialogue1 || '');
        lines.push(`\n${(b.character2 || 'CHARACTER 2').toUpperCase()} ^`);
        if (b.parenthetical2) {
          lines.push(`(${b.parenthetical2.replace(/^\(|\)$/g, '')})`);
        }
        lines.push(b.dialogue2 || '');
        break;
      }
      case 'transition': {
        if (b.text.endsWith('TO:') || b.text === 'FADE OUT.') {
          lines.push(`\n${b.text.toUpperCase()}\n`);
        } else {
          lines.push(`\n> ${b.text.toUpperCase()}\n`);
        }
        break;
      }
      case 'shot': {
        lines.push(`\n${b.text.toUpperCase()}\n`);
        break;
      }
      case 'section': {
        lines.push(`\n# ${b.text}\n`);
        break;
      }
      case 'synopsis': {
        lines.push(`\n= ${b.text}\n`);
        break;
      }
      case 'note': {
        lines.push(`\n[[${b.text}]]\n`);
        break;
      }
      default:
        lines.push(`\n${b.text}\n`);
    }

    if (b.notes && b.notes.length > 0) {
      b.notes.forEach((n) => {
        lines.push(`[[${n.author}: ${n.text}]]`);
      });
    }
  }

  return lines.join('\n');
}

/**
 * Parses raw Fountain text into a structured ScreenplayDocument.
 */
export function parseFountain(fountainText: string): Partial<ScreenplayDocument> {
  const lines = fountainText.split(/\r?\n/);
  const blocks: ScriptBlock[] = [];
  const titlePage = {
    title: '',
    credit: 'written by',
    author: '',
    source: '',
    draft: 'First Draft',
    date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    contact: '',
    copyright: ''
  };

  let inTitlePage = true;
  let sceneCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed === '===' || (inTitlePage && trimmed === '' && i > 10)) {
      inTitlePage = false;
      continue;
    }

    if (inTitlePage) {
      const match = trimmed.match(/^([A-Za-z\s]+):\s*(.*)$/);
      if (match) {
        const key = match[1].toLowerCase().trim();
        const value = match[2].trim();
        if (key === 'title') titlePage.title = value;
        else if (key === 'credit') titlePage.credit = value;
        else if (key === 'author' || key === 'authors') titlePage.author = value;
        else if (key === 'source') titlePage.source = value;
        else if (key === 'draft' || key === 'draft date') titlePage.draft = value;
        else if (key === 'contact') titlePage.contact = (titlePage.contact ? titlePage.contact + '\n' : '') + value;
        else if (key === 'copyright') titlePage.copyright = value;
        continue;
      } else if (trimmed === '') {
        continue;
      } else {
        // First non-metadata line marks start of screenplay
        inTitlePage = false;
      }
    }

    if (!trimmed) continue;

    // Section header
    if (trimmed.startsWith('#')) {
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'section',
        text: trimmed.replace(/^#+\s*/, '')
      });
      continue;
    }

    // Synopsis
    if (trimmed.startsWith('=')) {
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'synopsis',
        text: trimmed.replace(/^=\s*/, '')
      });
      continue;
    }

    // Note [[...]]
    if (trimmed.startsWith('[[') && trimmed.endsWith(']]')) {
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'note',
        text: trimmed.slice(2, -2).trim()
      });
      continue;
    }

    // Forced transition or standard transition
    if (trimmed.startsWith('>') && !trimmed.endsWith('<')) {
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'transition',
        text: trimmed.replace(/^>\s*/, '').toUpperCase()
      });
      continue;
    }

    if (/^(FADE OUT\.|CUT TO:|SMASH CUT TO:|DISSOLVE TO:|MATCH CUT TO:|JUMP CUT TO:)$/i.test(trimmed)) {
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'transition',
        text: trimmed.toUpperCase()
      });
      continue;
    }

    // Scene heading (INT, EXT, INT/EXT, etc.)
    if (
      /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.|INT\s|EXT\s)/i.test(trimmed) ||
      (trimmed.startsWith('.') && !trimmed.startsWith('..'))
    ) {
      let cleanHeading = trimmed.startsWith('.') ? trimmed.substring(1).trim() : trimmed;
      let sceneNumber: string | number = sceneCounter++;
      const sceneNumMatch = cleanHeading.match(/#([^#]+)#$/);
      if (sceneNumMatch) {
        sceneNumber = sceneNumMatch[1];
        cleanHeading = cleanHeading.replace(/#([^#]+)#$/, '').trim();
      }
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'scene_heading',
        text: cleanHeading.toUpperCase(),
        sceneNumber
      });
      continue;
    }

    // Dual dialogue marker (CHARACTER ^)
    if (trimmed.endsWith('^')) {
      const charName = trimmed.replace(/\^$/, '').trim().toUpperCase();
      // Check if previous block or sequence can form dual dialogue
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock && lastBlock.type === 'dialogue') {
        // Adjust previous structure
        blocks.push({
          id: `blk-${Date.now()}-${blocks.length}`,
          type: 'character',
          text: charName
        });
      } else {
        blocks.push({
          id: `blk-${Date.now()}-${blocks.length}`,
          type: 'character',
          text: charName
        });
      }
      continue;
    }

    // Parenthetical
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'parenthetical',
        text: trimmed
      });
      continue;
    }

    // Character vs Action vs Dialogue
    // In Fountain, uppercase lines preceded by blank lines are Characters
    const isAllUpper = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && trimmed.length < 35 && !trimmed.includes('..');
    const prevBlock = blocks[blocks.length - 1];

    if (isAllUpper && (!prevBlock || prevBlock.type !== 'character')) {
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'character',
        text: trimmed
      });
      continue;
    }

    if (prevBlock && (prevBlock.type === 'character' || prevBlock.type === 'parenthetical')) {
      blocks.push({
        id: `blk-${Date.now()}-${blocks.length}`,
        type: 'dialogue',
        text: trimmed
      });
      continue;
    }

    // Default is action
    blocks.push({
      id: `blk-${Date.now()}-${blocks.length}`,
      type: 'action',
      text: trimmed
    });
  }

  return {
    titlePage,
    blocks: blocks.length > 0 ? blocks : undefined
  };
}
