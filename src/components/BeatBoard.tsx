import React, { useState } from 'react';
import { ScriptBlock } from '../types/screenplay';
import { Plus, Tag, MoveRight, Compass, Film } from 'lucide-react';

interface BeatBoardProps {
  blocks: ScriptBlock[];
  onUpdateBlock: (block: ScriptBlock) => void;
  onJumpToScene: (blockId: string) => void;
  onAddScene: () => void;
}

const CARD_COLORS = [
  { name: 'Neutral', bg: 'bg-neutral-800 border-neutral-700 text-neutral-200' },
  { name: 'Amber', bg: 'bg-amber-950/40 border-amber-700/50 text-amber-200' },
  { name: 'Blue', bg: 'bg-blue-950/40 border-blue-700/50 text-blue-200' },
  { name: 'Emerald', bg: 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200' },
  { name: 'Purple', bg: 'bg-purple-950/40 border-purple-700/50 text-purple-200' },
  { name: 'Rose', bg: 'bg-rose-950/40 border-rose-700/50 text-rose-200' },
];

export const BeatBoard: React.FC<BeatBoardProps> = ({
  blocks,
  onUpdateBlock,
  onJumpToScene,
  onAddScene,
}) => {
  const scenes = React.useMemo(() => {
    const list: {
      block: ScriptBlock;
      sceneNum: number;
      actionLines: string[];
      dialogues: { character: string; text: string }[];
    }[] = [];

    let count = 0;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === 'scene_heading') {
        count++;
        const actions: string[] = [];
        const dials: { character: string; text: string }[] = [];

        // Scan subsequent blocks until next scene
        for (let j = i + 1; j < blocks.length; j++) {
          if (blocks[j].type === 'scene_heading') break;
          if (blocks[j].type === 'action' && actions.length < 2) {
            actions.push(blocks[j].text);
          }
          if (blocks[j].type === 'dialogue' && dials.length < 2) {
            const charBlock = blocks[j - 1]?.type === 'character' ? blocks[j - 1].text : 'CHAR';
            dials.push({ character: charBlock, text: blocks[j].text });
          }
        }

        list.push({
          block: b,
          sceneNum: count,
          actionLines: actions,
          dialogues: dials,
        });
      }
    }
    return list;
  }, [blocks]);

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-900 p-6 md:p-8">
      {/* Beat Board Header */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            <span>Beat Board & Scene Index Cards</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Visual index card board for plotting story arcs, beats, and pacing.
          </p>
        </div>

        <button
          onClick={onAddScene}
          className="flex items-center gap-2 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded text-xs transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Scene Beat</span>
        </button>
      </div>

      {/* Grid of Index Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scenes.map((scene) => {
          const cardColorClass =
            CARD_COLORS.find((c) => c.name === scene.block.colorTag)?.bg ||
            'bg-neutral-800/80 border-neutral-700/80 text-neutral-200';

          return (
            <div
              key={scene.block.id}
              className={`border rounded-lg p-4 flex flex-col justify-between min-h-[220px] transition-shadow hover:shadow-lg ${cardColorClass}`}
            >
              <div>
                {/* Card Top: Scene Number & Heading */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-black/40 rounded text-amber-300">
                    Scene #{scene.sceneNum}
                  </span>
                  <div className="flex items-center gap-1">
                    {/* Color picker */}
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() =>
                          onUpdateBlock({ ...scene.block, colorTag: c.name })
                        }
                        className={`w-2.5 h-2.5 rounded-full border border-black/30 transition-transform ${
                          scene.block.colorTag === c.name ? 'scale-125 ring-1 ring-white' : ''
                        }`}
                        style={{
                          backgroundColor:
                            c.name === 'Amber'
                              ? '#f59e0b'
                              : c.name === 'Blue'
                              ? '#3b82f6'
                              : c.name === 'Emerald'
                              ? '#10b981'
                              : c.name === 'Purple'
                              ? '#8b5cf6'
                              : c.name === 'Rose'
                              ? '#f43f5e'
                              : '#737373',
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-tight mb-2">
                  {scene.block.text}
                </h3>

                {/* Editable Synopsis / Beat summary */}
                <textarea
                  value={scene.block.synopsisText || ''}
                  placeholder="Describe the dramatic beat, conflict, or goal of this scene..."
                  onChange={(e) =>
                    onUpdateBlock({
                      ...scene.block,
                      synopsisText: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full bg-black/20 border border-black/20 rounded p-2 text-xs text-neutral-300 placeholder-neutral-500 outline-hidden resize-none mb-3"
                />

                {/* Excerpt preview */}
                {scene.actionLines.length > 0 && (
                  <p className="text-[11px] text-neutral-400 line-clamp-2 italic mb-2">
                    "{scene.actionLines[0]}"
                  </p>
                )}
              </div>

              {/* Bottom Jump Button */}
              <div className="pt-2 border-t border-black/20 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-mono">
                  {scene.dialogues.length} dialogues
                </span>
                <button
                  onClick={() => onJumpToScene(scene.block.id)}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  <span>Open in Editor</span>
                  <MoveRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
