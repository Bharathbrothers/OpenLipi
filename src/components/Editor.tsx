import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ScriptBlock,
  ScreenplayElementType,
  Collaborator,
} from '../types/screenplay';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

interface EditorProps {
  blocks: ScriptBlock[];
  onUpdateBlock: (block: ScriptBlock) => void;
  onInsertBlock: (block: ScriptBlock, index: number) => void;
  onDeleteBlock: (id: string) => void;
  activeBlockId: string | null;
  onSetActiveBlockId: (id: string | null) => void;
  collaborators: Collaborator[];
  paginatedView: boolean;
  focusMode: boolean;
  typewriterMode: boolean;
  activeRevisionColor?: string;
  onAddComment: (blockId: string, comment: string) => void;
}

const COMMON_SCENE_PREFIXES = ['INT.', 'EXT.', 'INT./EXT.', 'I/E.'];

export const Editor: React.FC<EditorProps> = ({
  blocks,
  onUpdateBlock,
  onInsertBlock,
  onDeleteBlock,
  activeBlockId,
  onSetActiveBlockId,
  collaborators,
  paginatedView,
  focusMode,
  typewriterMode,
  onAddComment,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [autocompleteTarget, setAutocompleteTarget] = useState<{
    blockId: string;
    type: 'scene' | 'character';
  } | null>(null);

  const [commentInputBlockId, setCommentInputBlockId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Collect existing character names for autocomplete
  const existingCharacters = useMemo(() => {
    const chars = new Set<string>();
    blocks.forEach((b) => {
      if (b.type === 'character' && b.text.trim()) {
        chars.add(b.text.trim().toUpperCase());
      }
      if (b.character1) chars.add(b.character1.trim().toUpperCase());
      if (b.character2) chars.add(b.character2.trim().toUpperCase());
    });
    return Array.from(chars);
  }, [blocks]);

  // Set ref callback cleanly in Map
  const setInputRef = useCallback((id: string, el: HTMLTextAreaElement | null) => {
    if (el) {
      inputRefs.current.set(id, el);
      // Auto-size once on mount if needed
      if (!el.style.height) {
        el.style.height = `${Math.max(26, el.scrollHeight)}px`;
      }
    } else {
      inputRefs.current.delete(id);
    }
  }, []);

  // Typewriter mode: center active element vertically
  useEffect(() => {
    if (typewriterMode && activeBlockId) {
      const el = inputRefs.current.get(activeBlockId);
      const container = scrollContainerRef.current;
      if (el && container) {
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const targetScrollTop =
          container.scrollTop +
          (elRect.top - containerRect.top) -
          containerRect.height / 2 +
          elRect.height / 2;

        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [activeBlockId, typewriterMode]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    block: ScriptBlock,
    index: number
  ) => {
    // Cmd / Ctrl + 1-8 element shortcuts
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
      const keyMap: { [key: string]: ScreenplayElementType } = {
        '1': 'scene_heading',
        '2': 'action',
        '3': 'character',
        '4': 'parenthetical',
        '5': 'dialogue',
        '6': 'transition',
        '7': 'dual_dialogue',
        '8': 'shot',
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        onUpdateBlock({ ...block, type: keyMap[e.key] });
        return;
      }
    }

    // Tab smart switching
    if (e.key === 'Tab') {
      e.preventDefault();
      if (block.type === 'action') {
        onUpdateBlock({ ...block, type: 'character', text: block.text.toUpperCase() });
      } else if (block.type === 'character') {
        onUpdateBlock({ ...block, type: 'transition', text: block.text.toUpperCase() });
      } else if (block.type === 'dialogue') {
        const newBlock: ScriptBlock = {
          id: `blk-${Date.now()}`,
          type: 'parenthetical',
          text: '( )',
        };
        onInsertBlock(newBlock, index + 1);
        setTimeout(() => {
          onSetActiveBlockId(newBlock.id);
          const el = inputRefs.current.get(newBlock.id);
          if (el) {
            el.focus();
            el.setSelectionRange(1, 1);
          }
        }, 10);
      }
      return;
    }

    // Enter key smart progression
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      let nextType: ScreenplayElementType = 'action';
      if (block.type === 'scene_heading') nextType = 'action';
      else if (block.type === 'action') nextType = 'action';
      else if (block.type === 'character') nextType = 'dialogue';
      else if (block.type === 'parenthetical') nextType = 'dialogue';
      else if (block.type === 'dialogue') nextType = 'action';
      else if (block.type === 'transition') nextType = 'scene_heading';
      else if (block.type === 'shot') nextType = 'action';

      const sceneCount = blocks.filter((b) => b.type === 'scene_heading').length;
      const newBlock: ScriptBlock = {
        id: `blk-${Date.now()}`,
        type: nextType,
        text: '',
        sceneNumber: nextType === 'scene_heading' ? sceneCount + 1 : undefined,
      };

      onInsertBlock(newBlock, index + 1);
      setTimeout(() => {
        onSetActiveBlockId(newBlock.id);
        const el = inputRefs.current.get(newBlock.id);
        if (el) {
          el.focus();
        }
      }, 20);
      return;
    }

    // Backspace on empty block: delete and focus previous
    if (e.key === 'Backspace' && block.text === '' && blocks.length > 1) {
      e.preventDefault();
      onDeleteBlock(block.id);
      const prevBlock = blocks[index - 1];
      if (prevBlock) {
        onSetActiveBlockId(prevBlock.id);
        const el = inputRefs.current.get(prevBlock.id);
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      }
      return;
    }

    // Arrow keys navigation between blocks
    if (e.key === 'ArrowUp' && e.currentTarget.selectionStart === 0 && index > 0) {
      const prevBlock = blocks[index - 1];
      if (prevBlock) {
        const el = inputRefs.current.get(prevBlock.id);
        if (el) {
          e.preventDefault();
          onSetActiveBlockId(prevBlock.id);
          el.focus();
        }
      }
    } else if (
      e.key === 'ArrowDown' &&
      e.currentTarget.selectionStart === e.currentTarget.value.length &&
      index < blocks.length - 1
    ) {
      const nextBlock = blocks[index + 1];
      if (nextBlock) {
        const el = inputRefs.current.get(nextBlock.id);
        if (el) {
          e.preventDefault();
          onSetActiveBlockId(nextBlock.id);
          el.focus();
        }
      }
    }
  };

  const handleTextChange = (val: string, block: ScriptBlock) => {
    let newText = val;

    // Auto-uppercase rules for screenplay standard
    if (
      block.type === 'scene_heading' ||
      block.type === 'character' ||
      block.type === 'transition' ||
      block.type === 'shot'
    ) {
      newText = val.toUpperCase();
    }

    onUpdateBlock({ ...block, text: newText });

    // Autocomplete triggers
    if (block.type === 'character' && newText.trim().length > 0) {
      const matches = existingCharacters.filter(
        (c) => c.startsWith(newText.trim().toUpperCase()) && c !== newText.trim().toUpperCase()
      );
      if (matches.length > 0) {
        setAutocompleteSuggestions(matches.slice(0, 5));
        setAutocompleteTarget({ blockId: block.id, type: 'character' });
      } else {
        setAutocompleteTarget(null);
      }
    } else if (block.type === 'scene_heading') {
      if (newText.length <= 4) {
        const matches = COMMON_SCENE_PREFIXES.filter((p) => p.startsWith(newText.toUpperCase()));
        setAutocompleteSuggestions(matches);
        setAutocompleteTarget({ blockId: block.id, type: 'scene' });
      } else {
        setAutocompleteTarget(null);
      }
    } else {
      setAutocompleteTarget(null);
    }
  };

  const applyAutocomplete = (suggestion: string, block: ScriptBlock) => {
    onUpdateBlock({ ...block, text: suggestion });
    setAutocompleteTarget(null);
    const el = inputRefs.current.get(block.id);
    if (el) {
      el.focus();
      el.setSelectionRange(suggestion.length, suggestion.length);
    }
  };

  const handleAddCommentSubmit = (blockId: string) => {
    if (!commentText.trim()) return;
    onAddComment(blockId, commentText.trim());
    setCommentText('');
    setCommentInputBlockId(null);
  };

  // Group blocks into simulated pages (~51 lines per page matching Hollywood PDF export)
  const paginatedPages = useMemo(() => {
    const pages: ScriptBlock[][] = [];
    let currentPage: ScriptBlock[] = [];
    let currentLineCount = 0;

    blocks.forEach((block) => {
      let lines = 1;
      if (block.type === 'scene_heading') lines = 3;
      else if (block.type === 'action') lines = Math.max(1, Math.ceil((block.text?.length || 0) / 58)) + 1;
      else if (block.type === 'dialogue') lines = Math.max(1, Math.ceil((block.text?.length || 0) / 35)) + 1;
      else if (block.type === 'character') lines = 1;
      else if (block.type === 'parenthetical') lines = 1;
      else if (block.type === 'dual_dialogue') lines = 5;

      if (currentLineCount + lines > 51 && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [block];
        currentLineCount = lines;
      } else {
        currentPage.push(block);
        currentLineCount += lines;
      }
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages.length > 0 ? pages : [[]];
  }, [blocks]);

  // Helper to render an individual Script Block
  const renderBlock = (block: ScriptBlock) => {
    const globalIndex = blocks.findIndex((b) => b.id === block.id);
    const isActive = activeBlockId === block.id;

    // Collaborators presence
    const blockCollaborators = collaborators.filter((c) => c.currentBlockId === block.id);

    // Focus mode dimming
    const isDimmed = focusMode && !isActive;

    return (
      <div
        key={block.id}
        className={`relative group transition-opacity duration-150 ${
          isDimmed ? 'opacity-25' : 'opacity-100'
        }`}
      >
        {/* Collaborator Cursor Indicators */}
        {blockCollaborators.length > 0 && (
          <div className="absolute -top-3 left-0 flex items-center gap-1 z-10 pointer-events-none">
            {blockCollaborators.map((c) => (
              <span
                key={c.id}
                className="px-1.5 py-0.5 rounded text-[10px] text-white font-sans font-medium flex items-center gap-1 shadow-xs"
                style={{ backgroundColor: c.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                {c.name}
              </span>
            ))}
          </div>
        )}

        {/* Dual Dialogue rendering */}
        {block.type === 'dual_dialogue' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-2 border border-dashed border-amber-300/40 p-2 rounded bg-amber-50/30">
            {/* Column 1 */}
            <div>
              <input
                type="text"
                value={block.character1 || ''}
                placeholder="CHARACTER 1"
                onChange={(e) =>
                  onUpdateBlock({
                    ...block,
                    character1: e.target.value.toUpperCase(),
                  })
                }
                className="w-full text-center font-bold uppercase text-xs outline-hidden tracking-wider mb-1"
              />
              <input
                type="text"
                value={block.parenthetical1 || ''}
                placeholder="(parenthetical)"
                onChange={(e) =>
                  onUpdateBlock({
                    ...block,
                    parenthetical1: e.target.value,
                  })
                }
                className="w-full text-center text-xs italic text-neutral-600 outline-hidden mb-1"
              />
              <textarea
                value={block.dialogue1 || ''}
                placeholder="Simultaneous dialogue..."
                onChange={(e) =>
                  onUpdateBlock({
                    ...block,
                    dialogue1: e.target.value,
                  })
                }
                rows={2}
                className="w-full text-xs outline-hidden resize-none leading-relaxed screenplay-input"
              />
            </div>

            {/* Column 2 */}
            <div>
              <input
                type="text"
                value={block.character2 || ''}
                placeholder="CHARACTER 2"
                onChange={(e) =>
                  onUpdateBlock({
                    ...block,
                    character2: e.target.value.toUpperCase(),
                  })
                }
                className="w-full text-center font-bold uppercase text-xs outline-hidden tracking-wider mb-1"
              />
              <input
                type="text"
                value={block.parenthetical2 || ''}
                placeholder="(parenthetical)"
                onChange={(e) =>
                  onUpdateBlock({
                    ...block,
                    parenthetical2: e.target.value,
                  })
                }
                className="w-full text-center text-xs italic text-neutral-600 outline-hidden mb-1"
              />
              <textarea
                value={block.dialogue2 || ''}
                placeholder="Simultaneous dialogue..."
                onChange={(e) =>
                  onUpdateBlock({
                    ...block,
                    dialogue2: e.target.value,
                  })
                }
                rows={2}
                className="w-full text-xs outline-hidden resize-none leading-relaxed screenplay-input"
              />
            </div>
          </div>
        ) : (
          /* Standard Screenplay Elements */
          <div
            className={`relative flex items-start ${
              block.type === 'character'
                ? 'pl-[20%] sm:pl-[37%] pr-[5%] sm:pr-[20%]'
                : block.type === 'dialogue'
                ? 'pl-[10%] sm:pl-[25%] pr-[5%] sm:pr-[25%]'
                : block.type === 'parenthetical'
                ? 'pl-[15%] sm:pl-[31%] pr-[8%] sm:pr-[28%]'
                : block.type === 'transition'
                ? 'pl-[40%] sm:pl-[60%] text-right'
                : block.type === 'shot'
                ? 'pl-0 font-bold'
                : 'pl-0'
            }`}
          >
            {/* Scene Number Display for Scene Headings */}
            {block.type === 'scene_heading' && block.sceneNumber && (
              <span className="absolute -left-6 sm:-left-10 top-0.5 text-xs font-mono text-neutral-400 select-none">
                {block.sceneNumber}
              </span>
            )}

            <textarea
              ref={(el) => setInputRef(block.id, el)}
              value={block.text}
              rows={1}
              placeholder={
                block.type === 'scene_heading'
                  ? 'INT./EXT. LOCATION - TIME'
                  : block.type === 'character'
                  ? 'CHARACTER'
                  : block.type === 'parenthetical'
                  ? '(action/inflection)'
                  : block.type === 'dialogue'
                  ? 'Dialogue spoken here...'
                  : block.type === 'transition'
                  ? 'CUT TO:'
                  : block.type === 'shot'
                  ? 'ANGLE ON...'
                  : 'Action description...'
              }
              onFocus={() => {
                onSetActiveBlockId(block.id);
              }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${el.scrollHeight}px`;
              }}
              onChange={(e) => {
                handleTextChange(e.target.value, block);
              }}
              onKeyDown={(e) => handleKeyDown(e, block, globalIndex)}
              className={`w-full bg-transparent resize-none outline-hidden overflow-hidden transition-colors screenplay-input ${
                block.type === 'scene_heading'
                  ? 'font-bold uppercase tracking-wide mt-4 mb-2 text-black'
                  : block.type === 'character'
                  ? 'font-bold uppercase tracking-wide text-center text-black mt-2'
                  : block.type === 'parenthetical'
                  ? 'italic text-center text-neutral-800'
                  : block.type === 'dialogue'
                  ? 'text-left leading-normal text-black mb-2'
                  : block.type === 'transition'
                  ? 'font-bold uppercase tracking-wider text-right my-2 text-black'
                  : block.type === 'shot'
                  ? 'font-bold uppercase text-black my-2'
                  : 'leading-normal text-black my-1'
              } ${
                isActive ? 'bg-neutral-50/80 rounded-xs ring-1 ring-amber-400/40' : ''
              }`}
              style={{
                fontSize: '12pt',
                fontFamily: 'Courier Prime, Courier, monospace',
              }}
            />

            {/* Side Actions (Hover menu to add note or delete block) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 opacity-60 hover:opacity-100 no-print">
              <button
                onClick={() => setCommentInputBlockId(block.id)}
                className="p-1 rounded text-neutral-500 hover:text-amber-600 hover:bg-neutral-100 transition-colors"
                title="Add Script Note / Collaborator Comment"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteBlock(block.id)}
                className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 transition-colors"
                title="Delete element"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Render Existing Script Notes / Comments */}
        {block.notes && block.notes.length > 0 && (
          <div className="ml-[15%] my-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs font-sans text-amber-900 flex flex-col gap-1 shadow-xs no-print">
            {block.notes.map((note) => (
              <div key={note.id} className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: note.authorColor }}
                  />
                  <span className="font-semibold text-[11px] text-amber-950">
                    {note.author}:
                  </span>
                  <span>{note.text}</span>
                </div>
                <span className="text-[10px] text-amber-700 font-mono">
                  {new Date(note.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment Popover */}
        {commentInputBlockId === block.id && (
          <div className="my-2 p-2 bg-neutral-900 border border-neutral-700 rounded text-xs text-white flex items-center gap-2 no-print shadow-lg">
            <input
              type="text"
              value={commentText}
              autoFocus
              placeholder="Add note for collaborators..."
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCommentSubmit(block.id);
                if (e.key === 'Escape') setCommentInputBlockId(null);
              }}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white outline-hidden"
            />
            <button
              onClick={() => handleAddCommentSubmit(block.id)}
              className="px-2 py-1 bg-amber-400 text-black font-semibold rounded text-xs hover:bg-amber-300 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setCommentInputBlockId(null)}
              className="text-neutral-400 hover:text-white text-xs px-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 min-h-0 h-full w-full overflow-y-auto overflow-x-hidden bg-neutral-900 py-8 px-2 sm:px-6 flex flex-col items-center select-text"
      style={{ overscrollBehavior: 'contain' }}
      onClick={(e) => {
        if (e.target === scrollContainerRef.current && blocks.length > 0) {
          const lastBlock = blocks[blocks.length - 1];
          onSetActiveBlockId(lastBlock.id);
          const el = inputRefs.current.get(lastBlock.id);
          if (el) el.focus();
        }
      }}
    >
      {/* Script Pages: Same stable DOM structure in both Pages & Continuous view */}
      <div className="w-full max-w-[850px] flex flex-col items-center">
        {paginatedPages.map((pageBlocks, pageIndex) => {
          return (
            <div
              key={`page-section-${pageIndex}`}
              className={`screenplay-page relative w-full bg-white text-black font-screenplay transition-all ${
                paginatedView
                  ? 'mb-8 sm:mb-10 min-h-[600px] sm:min-h-[1056px] p-4 sm:p-10 md:p-16 border border-neutral-300 rounded-xs shadow-xl'
                  : `p-4 sm:p-10 md:p-16 border-x border-neutral-300 shadow-lg ${
                      pageIndex === 0 ? 'border-t rounded-t-xs' : ''
                    } ${
                      pageIndex === paginatedPages.length - 1
                        ? 'border-b rounded-b-xs mb-8 sm:mb-10'
                        : 'border-b-2 border-b-dashed border-b-neutral-300'
                    }`
              }`}
              style={{ letterSpacing: '0px' }}
            >
              {/* Simulated 3-hole punch markers (Paginated mode, visible on sm+ screens) */}
              {paginatedView && (
                <div className="hidden sm:flex absolute left-3 top-0 bottom-0 flex-col justify-between py-24 pointer-events-none opacity-20 no-print">
                  <div className="w-3.5 h-3.5 rounded-full border border-neutral-600 bg-neutral-200"></div>
                  <div className="w-3.5 h-3.5 rounded-full border border-neutral-600 bg-neutral-200"></div>
                  <div className="w-3.5 h-3.5 rounded-full border border-neutral-600 bg-neutral-200"></div>
                </div>
              )}

              {/* Page Number top-right */}
              {pageIndex > 0 && (
                <div className="text-right text-xs text-neutral-700 mb-6 font-mono font-medium select-none">
                  {pageIndex + 1}.
                </div>
              )}

              {/* Script Blocks */}
              <div className="space-y-1">
                {pageBlocks.map((block) => renderBlock(block))}
              </div>

              {/* Continuous mode subtle page divider footer */}
              {!paginatedView && pageIndex < paginatedPages.length - 1 && (
                <div className="mt-8 pt-4 flex justify-end no-print select-none text-[11px] font-mono text-neutral-400">
                  --- End of Page {pageIndex + 1} ---
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Add Block button at the bottom */}
      <div className="w-full max-w-[850px] flex justify-center py-4 no-print shrink-0">
        <button
          onClick={() => {
            const newBlock: ScriptBlock = {
              id: `blk-${Date.now()}`,
              type: 'action',
              text: '',
            };
            onInsertBlock(newBlock, blocks.length);
            setTimeout(() => {
              onSetActiveBlockId(newBlock.id);
              const el = inputRefs.current.get(newBlock.id);
              if (el) el.focus();
            }, 10);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add Screenplay Block</span>
        </button>
      </div>

      {/* Autocomplete Dropdown Popup */}
      {autocompleteTarget && autocompleteSuggestions.length > 0 && (
        <div className="fixed left-1/3 top-28 bg-neutral-900 border border-neutral-700 text-white rounded shadow-2xl py-1 z-50 w-64 no-print text-xs">
          <div className="px-3 py-1 text-[10px] text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
            Suggestions
          </div>
          {autocompleteSuggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => {
                const blk = blocks.find((b) => b.id === autocompleteTarget.blockId);
                if (blk) applyAutocomplete(sug, blk);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 font-mono text-xs flex items-center justify-between transition-colors text-amber-300"
            >
              <span>{sug}</span>
              <span className="text-[10px] text-neutral-500 font-sans">Apply</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
