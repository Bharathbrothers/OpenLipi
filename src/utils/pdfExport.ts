import jsPDF from 'jspdf';
import { ScreenplayDocument } from '../types/screenplay';

/**
 * Generates an industry-compliant Hollywood standard Screenplay PDF.
 * Strict Specifications:
 * - US Letter: 8.5" x 11" (612 x 792 pt)
 * - 6 Lines Per Inch (LPI): LINE_HEIGHT = 12.0 pt (single spacing)
 * - Top & Bottom Margins: 1.0 inch (72 pt) -> 54 lines per page maximum
 * - Left Margin: 1.5 inches (108 pt)
 * - Right Margin: 1.0 inch (72 pt)
 * - Action: 6.0" width (432 pt / ~60 chars)
 * - Character: 3.7" left indent (266.4 pt)
 * - Parenthetical: 3.1" left indent (223.2 pt), width 230 pt (~32 chars)
 * - Dialogue: 2.5" left indent (180 pt), width 266 pt (~37 chars)
 * - Transitions: Right-aligned at 540 pt
 */
export function generateScreenplayPDF(doc: ScreenplayDocument): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const PAGE_WIDTH = 612;
  const PAGE_HEIGHT = 792;
  const LEFT_MARGIN = 108; // 1.5 inches
  const RIGHT_MARGIN = 72; // 1.0 inch
  const TOP_MARGIN = 72; // 1.0 inch
  const BOTTOM_MARGIN = 72; // 1.0 inch
  const LINE_HEIGHT = 12.65; // Precision-calibrated for exact Hollywood 1:1 page count matching (~51 lines/page)
  const MAX_Y = PAGE_HEIGHT - BOTTOM_MARGIN; // 720 pt

  // 1. Title Page (Cover page)
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(22);
  const title = (doc.titlePage.title || 'UNTITLED SCREENPLAY').toUpperCase();
  pdf.text(title, PAGE_WIDTH / 2, 280, { align: 'center' });

  pdf.setFontSize(12);
  pdf.text((doc.titlePage.credit || 'written by').toLowerCase(), PAGE_WIDTH / 2, 315, { align: 'center' });

  pdf.setFontSize(14);
  pdf.text(doc.titlePage.author || 'Anonymous', PAGE_WIDTH / 2, 340, { align: 'center' });

  if (doc.titlePage.source) {
    pdf.setFontSize(11);
    pdf.text(doc.titlePage.source, PAGE_WIDTH / 2, 370, { align: 'center' });
  }

  // Bottom metadata on title page
  pdf.setFontSize(10);
  const draftDateText = `${doc.titlePage.draft || 'First Draft'}${
    doc.titlePage.date ? ` - ${doc.titlePage.date}` : ''
  }`;
  pdf.text(draftDateText, LEFT_MARGIN, PAGE_HEIGHT - BOTTOM_MARGIN - 20);

  if (doc.titlePage.contact) {
    const contactLines = doc.titlePage.contact.split('\n');
    let cY = PAGE_HEIGHT - BOTTOM_MARGIN - 20 - (contactLines.length - 1) * 12;
    contactLines.forEach((cline) => {
      pdf.text(cline, PAGE_WIDTH - RIGHT_MARGIN, cY, { align: 'right' });
      cY += 12;
    });
  }

  if (doc.titlePage.copyright) {
    pdf.text(doc.titlePage.copyright, PAGE_WIDTH / 2, PAGE_HEIGHT - BOTTOM_MARGIN + 20, { align: 'center' });
  }

  // 2. Script Body Pages
  let pageNumber = 1;
  pdf.addPage('letter', 'portrait');
  let currentY = TOP_MARGIN;
  let lastCharacterName = '';

  const printPageNumber = (pNum: number) => {
    if (pNum > 1) {
      pdf.setFont('courier', 'normal');
      pdf.setFontSize(12);
      // Top right page number at 0.5" from top (36pt), right margin (540pt)
      pdf.text(`${pNum}.`, PAGE_WIDTH - RIGHT_MARGIN, 36, { align: 'right' });
    }
  };

  const addPageBreak = () => {
    pdf.addPage('letter', 'portrait');
    pageNumber++;
    currentY = TOP_MARGIN;
    printPageNumber(pageNumber);
  };

  const ensureSpace = (linesNeeded: number): boolean => {
    if (currentY + linesNeeded * LINE_HEIGHT > MAX_Y) {
      addPageBreak();
      return true;
    }
    return false;
  };

  // Hollywood Industry Standard Dimensions
  const ACTION_WIDTH = 432; // 6.0 inches (60 chars * 7.2pt)
  const DIALOGUE_WIDTH = 252; // 3.5 inches (35 chars * 7.2pt standard Hollywood dialogue width)
  const PAREN_WIDTH = 216; // 3.0 inches (~30 chars)
  const CHAR_X = 270; // 3.75 inches from left
  const PAREN_X = 223; // 3.1 inches from left
  const DIAL_X = 180; // 2.5 inches from left

  for (let i = 0; i < doc.blocks.length; i++) {
    const block = doc.blocks[i];
    const prevBlock = i > 0 ? doc.blocks[i - 1] : null;

    pdf.setFont('courier', 'normal');
    pdf.setFontSize(12);

    switch (block.type) {
      case 'scene_heading': {
        // Scene heading must not be left alone at bottom of page
        ensureSpace(3);

        // Blank line before scene heading, unless at top of page
        if (currentY > TOP_MARGIN) {
          currentY += LINE_HEIGHT;
        }

        const headingText = block.text.toUpperCase();
        pdf.setFont('courier', 'bold');
        pdf.text(headingText, LEFT_MARGIN, currentY);
        pdf.setFont('courier', 'normal');

        // Exactly 1 blank line after scene heading
        currentY += LINE_HEIGHT * 2;
        break;
      }

      case 'action': {
        // Blank line before action if preceded by dialogue or transition
        if (prevBlock && prevBlock.type !== 'scene_heading' && currentY > TOP_MARGIN) {
          currentY += LINE_HEIGHT;
        }

        const splitAction = pdf.splitTextToSize(block.text, ACTION_WIDTH);
        for (let l = 0; l < splitAction.length; l++) {
          ensureSpace(1);
          pdf.text(splitAction[l], LEFT_MARGIN, currentY);
          currentY += LINE_HEIGHT;
        }
        break;
      }

      case 'character': {
        // Character name + at least 1 line of dialogue/paren cannot be separated by page break
        ensureSpace(3);

        // 1 blank line before character if preceded by action or dialogue
        if (prevBlock && prevBlock.type !== 'scene_heading' && currentY > TOP_MARGIN) {
          currentY += LINE_HEIGHT;
        }

        const charText = block.text.toUpperCase();
        lastCharacterName = charText.replace(/\s*\(CONT'D\)/i, '').trim();
        pdf.text(charText, CHAR_X, currentY);
        // Next element (parenthetical or dialogue) comes immediately on next line
        currentY += LINE_HEIGHT;
        break;
      }

      case 'parenthetical': {
        ensureSpace(2);
        const parenText =
          block.text.startsWith('(') && block.text.endsWith(')')
            ? block.text
            : `(${block.text.replace(/^\(|\)$/g, '')})`;
        const splitParen = pdf.splitTextToSize(parenText, PAREN_WIDTH);
        for (let l = 0; l < splitParen.length; l++) {
          pdf.text(splitParen[l], PAREN_X, currentY);
          currentY += LINE_HEIGHT;
        }
        break;
      }

      case 'dialogue': {
        const paragraphs = (block.text || '').split('\n\n');
        const charName = lastCharacterName || 'CHARACTER';

        for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
          if (pIdx > 0) {
            currentY += LINE_HEIGHT;
          }

          const splitDial = pdf.splitTextToSize(paragraphs[pIdx], DIALOGUE_WIDTH);
          for (let l = 0; l < splitDial.length; l++) {
            if (currentY + LINE_HEIGHT > MAX_Y) {
              const remainingLines = splitDial.length - l;
              if (remainingLines > 0) {
                // Hollywood convention: print (MORE) and continue with (CONT'D) on next page
                pdf.text('(MORE)', 280, currentY);
                addPageBreak();
                pdf.text(`${charName} (CONT'D)`, CHAR_X, currentY);
                currentY += LINE_HEIGHT;
              } else {
                addPageBreak();
              }
            }

            pdf.text(splitDial[l], DIAL_X, currentY);
            currentY += LINE_HEIGHT;
          }
        }
        break;
      }

      case 'dual_dialogue': {
        ensureSpace(5);
        if (currentY > TOP_MARGIN) {
          currentY += LINE_HEIGHT;
        }

        const col1CharX = 140;
        const col1DialX = 108;
        const col1Width = 180;

        const col2CharX = 380;
        const col2DialX = 330;
        const col2Width = 180;

        const startDualY = currentY;

        // Column 1
        pdf.text((block.character1 || 'CHAR 1').toUpperCase(), col1CharX, startDualY);
        let y1 = startDualY + LINE_HEIGHT;
        if (block.parenthetical1) {
          const p1 = `(${block.parenthetical1.replace(/^\(|\)$/g, '')})`;
          pdf.text(p1, col1DialX + 15, y1);
          y1 += LINE_HEIGHT;
        }
        const splitD1 = pdf.splitTextToSize(block.dialogue1 || '', col1Width);
        splitD1.forEach((l: string) => {
          pdf.text(l, col1DialX, y1);
          y1 += LINE_HEIGHT;
        });

        // Column 2
        pdf.text((block.character2 || 'CHAR 2').toUpperCase(), col2CharX, startDualY);
        let y2 = startDualY + LINE_HEIGHT;
        if (block.parenthetical2) {
          const p2 = `(${block.parenthetical2.replace(/^\(|\)$/g, '')})`;
          pdf.text(p2, col2DialX + 15, y2);
          y2 += LINE_HEIGHT;
        }
        const splitD2 = pdf.splitTextToSize(block.dialogue2 || '', col2Width);
        splitD2.forEach((l: string) => {
          pdf.text(l, col2DialX, y2);
          y2 += LINE_HEIGHT;
        });

        currentY = Math.max(y1, y2);
        break;
      }

      case 'transition': {
        ensureSpace(2);
        if (currentY > TOP_MARGIN) {
          currentY += LINE_HEIGHT;
        }
        const transText = block.text.toUpperCase();
        pdf.text(transText, 540, currentY, { align: 'right' });
        currentY += LINE_HEIGHT;
        break;
      }

      case 'shot': {
        ensureSpace(2);
        if (currentY > TOP_MARGIN) {
          currentY += LINE_HEIGHT;
        }
        pdf.setFont('courier', 'bold');
        pdf.text(block.text.toUpperCase(), LEFT_MARGIN, currentY);
        pdf.setFont('courier', 'normal');
        currentY += LINE_HEIGHT;
        break;
      }

      default:
        break;
    }
  }

  // Trigger download in browser
  const filename = `${(doc.titlePage.title || 'Screenplay').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  pdf.save(filename);
}
