import React, { useState } from 'react';
import { ScriptBlock, ScriptStatistics } from '../types/screenplay';
import { Users, MessageSquare, BookOpen, Search, ArrowRight } from 'lucide-react';

interface CharacterTrackerProps {
  stats: ScriptStatistics;
  blocks: ScriptBlock[];
  onJumpToBlock: (blockId: string) => void;
}

export const CharacterTracker: React.FC<CharacterTrackerProps> = ({
  stats,
  blocks,
  onJumpToBlock,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    stats.characterStats[0]?.name || null
  );
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCharacters = stats.characterStats.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find all dialogues spoken by selected character
  const characterSpeeches = React.useMemo(() => {
    if (!selectedCharacter) return [];

    const speeches: { blockId: string; parenthetical?: string; dialogue: string; sceneHeading: string }[] = [];
    let currentScene = 'UNKNOWN SCENE';

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === 'scene_heading') {
        currentScene = b.text;
      }
      if (b.type === 'character' && b.text.trim().toUpperCase() === selectedCharacter) {
        let parenthetical = '';
        let dialogue = '';
        if (blocks[i + 1]?.type === 'parenthetical') {
          parenthetical = blocks[i + 1].text;
          if (blocks[i + 2]?.type === 'dialogue') {
            dialogue = blocks[i + 2].text;
          }
        } else if (blocks[i + 1]?.type === 'dialogue') {
          dialogue = blocks[i + 1].text;
        }

        if (dialogue) {
          speeches.push({
            blockId: b.id,
            parenthetical,
            dialogue,
            sceneHeading: currentScene,
          });
        }
      }
      // Dual dialogue checking
      if (b.type === 'dual_dialogue') {
        if (b.character1?.trim().toUpperCase() === selectedCharacter) {
          speeches.push({
            blockId: b.id,
            parenthetical: b.parenthetical1,
            dialogue: b.dialogue1 || '',
            sceneHeading: currentScene,
          });
        }
        if (b.character2?.trim().toUpperCase() === selectedCharacter) {
          speeches.push({
            blockId: b.id,
            parenthetical: b.parenthetical2,
            dialogue: b.dialogue2 || '',
            sceneHeading: currentScene,
          });
        }
      }
    }
    return speeches;
  }, [blocks, selectedCharacter]);

  const totalAllDialogues = stats.characterStats.reduce((acc, c) => acc + c.dialogueCount, 0) || 1;

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          <span>Character Dialogue & Arc Tracker</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Detailed breakdown of speaking roles, dialogue density, and scene presence.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Characters Roster */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 flex flex-col h-[650px]">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              placeholder="Search characters..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-hidden"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-900">
            {filteredCharacters.map((char) => {
              const isSelected = selectedCharacter === char.name;
              const percentage = Math.round((char.dialogueCount / totalAllDialogues) * 100);

              return (
                <button
                  key={char.name}
                  onClick={() => setSelectedCharacter(char.name)}
                  className={`w-full text-left p-3 rounded transition-colors flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-900 text-neutral-300'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-bold text-xs uppercase font-mono block truncate">
                      {char.name}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {char.scenes.length} {char.scenes.length === 1 ? 'scene' : 'scenes'} · {char.wordCount} words
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-semibold text-amber-400">
                      {char.dialogueCount} lines
                    </span>
                    <span className="text-[10px] text-neutral-500 block font-mono">
                      {percentage}% of script
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Character Speech Excerpts & Scene Occurrences */}
        <div className="lg:col-span-2 bg-neutral-950 border border-neutral-800 rounded-lg p-5 flex flex-col h-[650px]">
          {selectedCharacter ? (
            <>
              <div className="border-b border-neutral-800 pb-4 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase font-mono">
                    {selectedCharacter}
                  </h3>
                  <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                    <span>{characterSpeeches.length} Speaking Lines</span>
                    <span>·</span>
                    <span>Scenes: {stats.characterStats.find((c) => c.name === selectedCharacter)?.scenes.join(', ') || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Speeches List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {characterSpeeches.map((speech, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-900 border border-neutral-800/80 rounded hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono mb-1.5">
                      <span className="text-amber-400/90 truncate">{speech.sceneHeading}</span>
                      <button
                        onClick={() => onJumpToBlock(speech.blockId)}
                        className="text-neutral-400 hover:text-white flex items-center gap-1 font-sans"
                      >
                        <span>Jump</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {speech.parenthetical && (
                      <p className="text-xs italic text-neutral-400 mb-1">
                        {speech.parenthetical}
                      </p>
                    )}

                    <p className="text-xs font-screenplay text-neutral-200 leading-relaxed">
                      "{speech.dialogue}"
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
              Select a character to view dialogue breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
