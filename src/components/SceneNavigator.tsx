import React, { useState } from 'react';
import { ScriptBlock } from '../types/screenplay';
import {
  Search,
  ChevronUp,
  ChevronDown,
  Compass,
} from 'lucide-react';

interface SceneNavigatorProps {
  blocks: ScriptBlock[];
  activeBlockId: string | null;
  onJumpToBlock: (blockId: string) => void;
  onMoveScene: (sceneIndex: number, direction: 'up' | 'down') => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const SceneNavigator: React.FC<SceneNavigatorProps> = ({
  blocks,
  activeBlockId,
  onJumpToBlock,
  onMoveScene,
  isOpen,
  onToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all scene headings
  const scenes = React.useMemo(() => {
    const list: {
      block: ScriptBlock;
      index: number;
      sceneNum: number;
      dialogueCount: number;
      snippet: string;
    }[] = [];

    let count = 0;
    blocks.forEach((block, idx) => {
      if (block.type === 'scene_heading') {
        count++;
        // Find next action or dialogue snippet
        let snippet = '';
        for (let j = idx + 1; j < Math.min(idx + 4, blocks.length); j++) {
          if (blocks[j].type === 'action' || blocks[j].type === 'dialogue') {
            snippet = blocks[j].text;
            break;
          }
        }

        list.push({
          block,
          index: idx,
          sceneNum: count,
          dialogueCount: 0,
          snippet,
        });
      }
    });

    return list;
  }, [blocks]);

  const filteredScenes = scenes.filter(
    (s) =>
      s.block.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.snippet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        onClick={onToggle}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
      />

      <aside className="fixed md:static inset-y-0 left-0 w-72 sm:w-80 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0 text-xs text-neutral-300 z-40 shadow-2xl md:shadow-none h-full">
        {/* Top Header */}
        <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">Scene Outliner</span>
            <span className="text-neutral-500 font-mono text-[11px]">({scenes.length})</span>
          </div>
          <button
            onClick={onToggle}
            className="text-neutral-500 hover:text-white p-1 rounded transition-colors"
            title="Close Outliner"
          >
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div className="p-2 border-b border-neutral-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              placeholder="Filter scene headings..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-hidden focus:border-amber-500"
            />
          </div>
        </div>

        {/* Scenes List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-900">
          {filteredScenes.length === 0 ? (
            <div className="p-6 text-center text-neutral-500">
              No scenes match search.
            </div>
          ) : (
            filteredScenes.map((item, i) => {
              const isSelected = activeBlockId === item.block.id;
              return (
                <div
                  key={item.block.id}
                  onClick={() => {
                    onJumpToBlock(item.block.id);
                    if (window.innerWidth < 768) {
                      onToggle();
                    }
                  }}
                  className={`p-3 cursor-pointer group transition-colors ${
                    isSelected
                      ? 'bg-neutral-800/90 text-white'
                      : 'hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-amber-400 font-bold text-[11px] shrink-0">
                        #{item.sceneNum}
                      </span>
                      <span className="font-semibold text-white truncate font-mono text-xs">
                        {item.block.text}
                      </span>
                    </div>

                    {/* Reordering Controls */}
                    <div className="flex items-center gap-0.5 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        disabled={i === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveScene(item.index, 'up');
                        }}
                        className="p-1 hover:text-amber-400 disabled:opacity-20"
                        title="Move scene earlier"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={i === scenes.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveScene(item.index, 'down');
                        }}
                        className="p-1 hover:text-amber-400 disabled:opacity-20"
                        title="Move scene later"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.snippet && (
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.snippet}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
