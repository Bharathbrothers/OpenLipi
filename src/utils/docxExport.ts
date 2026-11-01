import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  convertInchesToTwip,
  Packer,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} from 'docx';
import { ScreenplayDocument } from '../types/screenplay';

/**
 * Exports ScreenplayDocument as an industry-standard formatted Microsoft Word (.docx) document.
 */
export async function generateScreenplayDocx(doc: ScreenplayDocument): Promise<void> {
  const FONT_FAMILY = 'Courier New';
  const FONT_SIZE = 24; // 12pt in half-points

  const paragraphs: (Paragraph | Table)[] = [];

  // Title Page
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: convertInchesToTwip(3), after: convertInchesToTwip(0.3) },
      children: [
        new TextRun({
          text: (doc.titlePage.title || 'UNTITLED SCREENPLAY').toUpperCase(),
          font: FONT_FAMILY,
          size: 36,
          bold: true
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: convertInchesToTwip(0.2) },
      children: [
        new TextRun({
          text: (doc.titlePage.credit || 'written by').toLowerCase(),
          font: FONT_FAMILY,
          size: FONT_SIZE
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: convertInchesToTwip(0.5) },
      children: [
        new TextRun({
          text: doc.titlePage.author || 'Anonymous',
          font: FONT_FAMILY,
          size: 28,
          bold: true
        })
      ]
    })
  );

  if (doc.titlePage.source) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: convertInchesToTwip(1) },
        children: [
          new TextRun({
            text: doc.titlePage.source,
            font: FONT_FAMILY,
            size: FONT_SIZE
          })
        ]
      })
    );
  }

  // Draft info on Title page
  paragraphs.push(
    new Paragraph({
      spacing: { before: convertInchesToTwip(2.5), after: convertInchesToTwip(0.1) },
      children: [
        new TextRun({
          text: `${doc.titlePage.draft || 'First Draft'} - ${doc.titlePage.date || ''}`,
          font: FONT_FAMILY,
          size: 20
        })
      ]
    })
  );

  if (doc.titlePage.contact) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: doc.titlePage.contact,
            font: FONT_FAMILY,
            size: 20
          })
        ]
      })
    );
  }

  // Page Break after title page
  paragraphs.push(
    new Paragraph({
      pageBreakBefore: true,
      children: []
    })
  );

  // Script Blocks
  for (const block of doc.blocks) {
    switch (block.type) {
      case 'scene_heading':
        paragraphs.push(
          new Paragraph({
            spacing: { before: convertInchesToTwip(0.3), after: convertInchesToTwip(0.15) },
            children: [
              new TextRun({
                text: block.text.toUpperCase(),
                font: FONT_FAMILY,
                size: FONT_SIZE,
                bold: true
              })
            ]
          })
        );
        break;

      case 'action':
        paragraphs.push(
          new Paragraph({
            spacing: { after: convertInchesToTwip(0.15) },
            children: [
              new TextRun({
                text: block.text,
                font: FONT_FAMILY,
                size: FONT_SIZE
              })
            ]
          })
        );
        break;

      case 'character':
        paragraphs.push(
          new Paragraph({
            indent: { left: convertInchesToTwip(2.2) },
            spacing: { before: convertInchesToTwip(0.15), after: 0 },
            children: [
              new TextRun({
                text: block.text.toUpperCase(),
                font: FONT_FAMILY,
                size: FONT_SIZE,
                bold: true
              })
            ]
          })
        );
        break;

      case 'parenthetical':
        paragraphs.push(
          new Paragraph({
            indent: { left: convertInchesToTwip(1.6), right: convertInchesToTwip(2.0) },
            spacing: { after: 0 },
            children: [
              new TextRun({
                text: block.text.startsWith('(') && block.text.endsWith(')') ? block.text : `(${block.text.replace(/^\(|\)$/g, '')})`,
                font: FONT_FAMILY,
                size: FONT_SIZE
              })
            ]
          })
        );
        break;

      case 'dialogue':
        paragraphs.push(
          new Paragraph({
            indent: { left: convertInchesToTwip(1.0), right: convertInchesToTwip(1.5) },
            spacing: { after: convertInchesToTwip(0.15) },
            children: [
              new TextRun({
                text: block.text,
                font: FONT_FAMILY,
                size: FONT_SIZE
              })
            ]
          })
        );
        break;

      case 'dual_dialogue': {
        const noBorder = {
          style: BorderStyle.NONE,
          size: 0,
          color: 'auto'
        };
        const table = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: noBorder,
            bottom: noBorder,
            left: noBorder,
            right: noBorder,
            insideHorizontal: noBorder,
            insideVertical: noBorder
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: (block.character1 || 'CHAR 1').toUpperCase(),
                          font: FONT_FAMILY,
                          size: FONT_SIZE,
                          bold: true
                        })
                      ]
                    }),
                    ...(block.parenthetical1
                      ? [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: `(${block.parenthetical1.replace(/^\(|\)$/g, '')})`,
                                font: FONT_FAMILY,
                                size: FONT_SIZE
                              })
                            ]
                          })
                        ]
                      : []),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: block.dialogue1 || '',
                          font: FONT_FAMILY,
                          size: FONT_SIZE
                        })
                      ]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: (block.character2 || 'CHAR 2').toUpperCase(),
                          font: FONT_FAMILY,
                          size: FONT_SIZE,
                          bold: true
                        })
                      ]
                    }),
                    ...(block.parenthetical2
                      ? [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: `(${block.parenthetical2.replace(/^\(|\)$/g, '')})`,
                                font: FONT_FAMILY,
                                size: FONT_SIZE
                              })
                            ]
                          })
                        ]
                      : []),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: block.dialogue2 || '',
                          font: FONT_FAMILY,
                          size: FONT_SIZE
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        });
        paragraphs.push(table);
        break;
      }

      case 'transition':
        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: convertInchesToTwip(0.15), after: convertInchesToTwip(0.2) },
            children: [
              new TextRun({
                text: block.text.toUpperCase(),
                font: FONT_FAMILY,
                size: FONT_SIZE,
                bold: true
              })
            ]
          })
        );
        break;

      case 'shot':
        paragraphs.push(
          new Paragraph({
            spacing: { before: convertInchesToTwip(0.15), after: convertInchesToTwip(0.15) },
            children: [
              new TextRun({
                text: block.text.toUpperCase(),
                font: FONT_FAMILY,
                size: FONT_SIZE,
                bold: true
              })
            ]
          })
        );
        break;

      default:
        break;
    }
  }

  const wordDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1.0),
              right: convertInchesToTwip(1.0),
              bottom: convertInchesToTwip(1.0),
              left: convertInchesToTwip(1.5) // Standard 1.5" left margin for brad binding
            }
          }
        },
        children: paragraphs
      }
    ]
  });

  const blob = await Packer.toBlob(wordDoc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(doc.titlePage.title || 'Screenplay').replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
