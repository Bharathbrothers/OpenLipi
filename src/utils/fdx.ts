import { ScreenplayDocument, ScriptBlock, ScreenplayElementType } from '../types/screenplay';

/**
 * Exports screenplay document into Final Draft XML (.fdx) format.
 */
export function exportToFDX(doc: ScreenplayDocument): string {
  const escapeXml = (unsafe: string) => {
    return (unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const paragraphs: string[] = [];

  for (const block of doc.blocks) {
    let fdxType = 'Action';

    switch (block.type) {
      case 'scene_heading':
        fdxType = 'Scene Heading';
        break;
      case 'action':
        fdxType = 'Action';
        break;
      case 'character':
        fdxType = 'Character';
        break;
      case 'parenthetical':
        fdxType = 'Parenthetical';
        break;
      case 'dialogue':
        fdxType = 'Dialogue';
        break;
      case 'transition':
        fdxType = 'Transition';
        break;
      case 'shot':
        fdxType = 'Shot';
        break;
      case 'dual_dialogue': {
        // Dual dialogue in FDX uses DualDialogue wrapper or separate paragraphs
        paragraphs.push(`    <Paragraph Type="Character">
      <Text>${escapeXml((block.character1 || '').toUpperCase())}</Text>
    </Paragraph>`);
        if (block.parenthetical1) {
          paragraphs.push(`    <Paragraph Type="Parenthetical">
      <Text>(${escapeXml(block.parenthetical1.replace(/^\(|\)$/g, ''))})</Text>
    </Paragraph>`);
        }
        paragraphs.push(`    <Paragraph Type="Dialogue">
      <Text>${escapeXml(block.dialogue1 || '')}</Text>
    </Paragraph>`);
        paragraphs.push(`    <Paragraph Type="Character">
      <Text>${escapeXml((block.character2 || '').toUpperCase())}</Text>
    </Paragraph>`);
        if (block.parenthetical2) {
          paragraphs.push(`    <Paragraph Type="Parenthetical">
      <Text>(${escapeXml(block.parenthetical2.replace(/^\(|\)$/g, ''))})</Text>
    </Paragraph>`);
        }
        paragraphs.push(`    <Paragraph Type="Dialogue">
      <Text>${escapeXml(block.dialogue2 || '')}</Text>
    </Paragraph>`);
        continue;
      }
      default:
        fdxType = 'Action';
    }

    const sceneNumAttr = block.sceneNumber ? ` Number="${escapeXml(String(block.sceneNumber))}"` : '';

    paragraphs.push(`    <Paragraph Type="${fdxType}"${sceneNumAttr}>
      <Text>${escapeXml(block.text)}</Text>
    </Paragraph>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="No" Version="3">
  <Content>
${paragraphs.join('\n')}
  </Content>
  <TitlePage>
    <Content>
      <Paragraph Alignment="Center">
        <Text>${escapeXml(doc.titlePage.title)}</Text>
      </Paragraph>
      <Paragraph Alignment="Center">
        <Text>${escapeXml(doc.titlePage.credit)}</Text>
      </Paragraph>
      <Paragraph Alignment="Center">
        <Text>${escapeXml(doc.titlePage.author)}</Text>
      </Paragraph>
      <Paragraph Alignment="Center">
        <Text>${escapeXml(doc.titlePage.source)}</Text>
      </Paragraph>
      <Paragraph Alignment="Left">
        <Text>${escapeXml(doc.titlePage.draft)} - ${escapeXml(doc.titlePage.date)}</Text>
      </Paragraph>
      <Paragraph Alignment="Right">
        <Text>${escapeXml(doc.titlePage.contact)}</Text>
      </Paragraph>
    </Content>
  </TitlePage>
</FinalDraft>`;

  return xml;
}

/**
 * Parses Final Draft XML string into screenplay blocks.
 */
export function parseFDX(fdxXml: string): Partial<ScreenplayDocument> {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(fdxXml, 'application/xml');

  const titleNode = xmlDoc.querySelector('TitlePage Paragraph Text');
  const title = titleNode?.textContent || 'Imported Screenplay';

  const paragraphNodes = Array.from(xmlDoc.querySelectorAll('Content > Paragraph'));
  const blocks: ScriptBlock[] = [];
  let sceneIndex = 1;

  for (let i = 0; i < paragraphNodes.length; i++) {
    const node = paragraphNodes[i];
    const typeAttr = node.getAttribute('Type') || 'Action';
    const numberAttr = node.getAttribute('Number');

    // Collect all text in paragraph
    const textNodes = Array.from(node.querySelectorAll('Text'));
    const text = textNodes.map((t) => t.textContent || '').join('').trim();

    if (!text) continue;

    let elementType: ScreenplayElementType = 'action';
    switch (typeAttr.toLowerCase()) {
      case 'scene heading':
        elementType = 'scene_heading';
        break;
      case 'character':
        elementType = 'character';
        break;
      case 'parenthetical':
        elementType = 'parenthetical';
        break;
      case 'dialogue':
        elementType = 'dialogue';
        break;
      case 'transition':
        elementType = 'transition';
        break;
      case 'shot':
        elementType = 'shot';
        break;
      default:
        elementType = 'action';
    }

    blocks.push({
      id: `fdx-${Date.now()}-${i}`,
      type: elementType,
      text: elementType === 'scene_heading' || elementType === 'character' ? text.toUpperCase() : text,
      sceneNumber: elementType === 'scene_heading' ? numberAttr || sceneIndex++ : undefined
    });
  }

  return {
    titlePage: {
      title,
      credit: 'written by',
      author: 'Imported Author',
      source: '',
      draft: 'Imported Draft',
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      contact: '',
      copyright: ''
    },
    blocks: blocks.length > 0 ? blocks : undefined
  };
}
