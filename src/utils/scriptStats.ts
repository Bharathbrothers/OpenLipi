import { ScreenplayDocument, ScriptStatistics } from '../types/screenplay';

/**
 * Calculates industry-standard statistics and script breakdown.
 */
export function calculateScriptStats(doc: ScreenplayDocument): ScriptStatistics {
  let totalWords = 0;
  let totalScenes = 0;
  let intScenes = 0;
  let extScenes = 0;
  let dialogueWordCount = 0;
  let actionWordCount = 0;
  let estimatedTotalLines = 0;

  const characterMap: Map<
    string,
    { dialogueCount: number; wordCount: number; scenes: Set<number> }
  > = new Map();

  let currentSceneNumber = 1;

  for (const block of doc.blocks) {
    const words = block.text.trim() ? block.text.trim().split(/\s+/).length : 0;
    totalWords += words;

    switch (block.type) {
      case 'scene_heading': {
        totalScenes++;
        const num = typeof block.sceneNumber === 'number' ? block.sceneNumber : totalScenes;
        currentSceneNumber = num;

        const headingUpper = block.text.toUpperCase();
        if (headingUpper.includes('INT.') || headingUpper.startsWith('INT ')) {
          intScenes++;
        }
        if (headingUpper.includes('EXT.') || headingUpper.startsWith('EXT ')) {
          extScenes++;
        }
        estimatedTotalLines += 3; // Scene heading + blank lines
        break;
      }

      case 'action': {
        actionWordCount += words;
        // ~60 characters per line in screenplay
        const lines = Math.max(1, Math.ceil(block.text.length / 60));
        estimatedTotalLines += lines + 1;
        break;
      }

      case 'character': {
        estimatedTotalLines += 1;
        break;
      }

      case 'parenthetical': {
        estimatedTotalLines += 1;
        break;
      }

      case 'dialogue': {
        dialogueWordCount += words;
        // ~35 characters per dialogue line
        const lines = Math.max(1, Math.ceil(block.text.length / 35));
        estimatedTotalLines += lines + 1;
        break;
      }

      case 'dual_dialogue': {
        const d1Words = (block.dialogue1 || '').trim().split(/\s+/).length;
        const d2Words = (block.dialogue2 || '').trim().split(/\s+/).length;
        totalWords += d1Words + d2Words;
        dialogueWordCount += d1Words + d2Words;

        // Character 1 stats
        if (block.character1) {
          const c1 = block.character1.trim().toUpperCase();
          const entry = characterMap.get(c1) || { dialogueCount: 0, wordCount: 0, scenes: new Set() };
          entry.dialogueCount++;
          entry.wordCount += d1Words;
          entry.scenes.add(currentSceneNumber);
          characterMap.set(c1, entry);
        }

        // Character 2 stats
        if (block.character2) {
          const c2 = block.character2.trim().toUpperCase();
          const entry = characterMap.get(c2) || { dialogueCount: 0, wordCount: 0, scenes: new Set() };
          entry.dialogueCount++;
          entry.wordCount += d2Words;
          entry.scenes.add(currentSceneNumber);
          characterMap.set(c2, entry);
        }

        estimatedTotalLines += 5;
        break;
      }

      case 'transition': {
        estimatedTotalLines += 2;
        break;
      }

      default:
        estimatedTotalLines += 1;
        break;
    }

    // Single dialogue character mapping
    if (block.type === 'character' && block.text.trim()) {
      const charName = block.text.trim().toUpperCase().replace(/\s*\(.*\)$/, '');
      const entry = characterMap.get(charName) || { dialogueCount: 0, wordCount: 0, scenes: new Set() };
      entry.dialogueCount++;
      entry.scenes.add(currentSceneNumber);
      characterMap.set(charName, entry);
    }
  }

  // 1 standard screenplay page is ~54-56 lines
  const totalPages = Math.max(1, Math.ceil(estimatedTotalLines / 54));
  const estimatedRunTimeMinutes = totalPages; // 1 page = 1 minute

  const totalContentWords = dialogueWordCount + actionWordCount;
  const dialogueRatio = totalContentWords > 0 ? Math.round((dialogueWordCount / totalContentWords) * 100) : 50;

  const characterStats = Array.from(characterMap.entries())
    .map(([name, data]) => ({
      name,
      dialogueCount: data.dialogueCount,
      wordCount: data.wordCount,
      scenes: Array.from(data.scenes).sort((a, b) => a - b),
    }))
    .sort((a, b) => b.dialogueCount - a.dialogueCount);

  return {
    totalPages,
    totalWords,
    totalScenes,
    intScenes,
    extScenes,
    dialogueRatio,
    estimatedRunTimeMinutes,
    characterStats,
  };
}
