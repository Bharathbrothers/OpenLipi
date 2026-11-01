import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  FileText,
  ChevronDown,
  Eye,
  Crosshair,
  SlidersHorizontal,
} from 'lucide-react';
import { ScreenplayElementType, STANDARD_REVISIONS } from '../types/screenplay';

interface FormatToolbarProps {
  currentType: ScreenplayElementType;
  onSelectType: (type: ScreenplayElementType) => void;
  paginatedView: boolean;
  onTogglePaginatedView: (isPaginated?: boolean) => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  typewriterMode: boolean;
  onToggleTypewriterMode: () => void;
  activeRevision: string;
  onSelectRevision: (revId: string) => void;
}

const ELEMENT_BUTTONS: { type: ScreenplayElementType; label: string; shortcut: string }[] = [
  { type: 'scene_heading', label: 'Scene', shortcut: '⌘1' },
  { type: 'action', label: 'Action', shortcut: '⌘2' },
  { type: 'character', label: 'Character', shortcut: '⌘3' },
  { type: 'parenthetical', label: 'Paren', shortcut: '⌘4' },
  { type: 'dialogue', label: 'Dialogue', shortcut: '⌘5' },
  { type: 'transition', label: 'Transition', shortcut: '⌘6' },
  { type: 'dual_dialogue', label: 'Dual Dial', shortcut: '⌘7' },
  { type: 'shot', label: 'Shot', shortcut: '⌘8' },
];

export const FormatToolbar: React.FC<FormatToolbarProps> = ({
  currentType,
  onSelectType,
  paginatedView,
  onTogglePaginatedView,
  focusMode,
  onToggleFocusMode,
  typewriterMode,
  onToggleTypewriterMode,
  activeRevision,
  onSelectRevision,
}) => {
  const [isRevisionDropdownOpen, setIsRevisionDropdownOpen] = useState(false);
  const [isElementDropdownOpen, setIsElementDropdownOpen] = useState(false);
  const [revisionMenuPos, setRevisionMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const [elementMenuPos, setElementMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const revisionButtonRef = useRef<HTMLButtonElement>(null);
  const elementButtonRef = useRef<HTMLButtonElement>(null);

  const currentRev =
    STANDARD_REVISIONS.find((r) => r.id === activeRevision) || STANDARD_REVISIONS[0];
  const activeElementObj =
    ELEMENT_BUTTONS.find((b) => b.type === currentType) || ELEMENT_BUTTONS[1];

  // Open revision dropdown and compute unclipped viewport coordinates
  const toggleRevisionDropdown = () => {
    if (!isRevisionDropdownOpen && revisionButtonRef.current) {
      const rect = revisionButtonRef.current.getBoundingClientRect();
      setRevisionMenuPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
      setIsRevisionDropdownOpen(true);
      setIsElementDropdownOpen(false);
    } else {
      setIsRevisionDropdownOpen(false);
    }
  };

  // Open element dropdown on mobile
  const toggleElementDropdown = () => {
    if (!isElementDropdownOpen && elementButtonRef.current) {
      const rect = elementButtonRef.current.getBoundingClientRect();
      setElementMenuPos({
        top: rect.bottom + 6,
        left: rect.left,
      });
      setIsElementDropdownOpen(true);
      setIsRevisionDropdownOpen(false);
    } else {
      setIsElementDropdownOpen(false);
    }
  };

  // Close menus on outside click or window resize
  useEffect(() => {
    const handleClose = () => {
      setIsRevisionDropdownOpen(false);
      setIsElementDropdownOpen(false);
    };
    window.addEventListener('resize', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, []);

  return (
    <div className="h-11 border-b border-neutral-800 bg-neutral-900/95 px-2 sm:px-4 flex items-center justify-between gap-2 text-xs select-none shrink-0 z-10">
      {/* Mobile Element Selector Dropdown (visible on < md screens) */}
      <div className="md:hidden">
        <button
          ref={elementButtonRef}
          onClick={toggleElementDropdown}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-400 text-black font-semibold text-xs shadow-xs"
        >
          <span>{activeElementObj.label}</span>
          <ChevronDown className="w-3 h-3 text-black" />
        </button>
      </div>

      {/* Desktop Element Type Selector Strip (visible on >= md screens) */}
      <div className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
        <span className="text-[11px] font-mono text-neutral-500 uppercase mr-1 hidden lg:inline">
          Element:
        </span>
        {ELEMENT_BUTTONS.map((btn) => {
          const isActive = currentType === btn.type;
          return (
            <button
              key={btn.type}
              onClick={() => onSelectType(btn.type)}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-amber-400 text-black font-semibold shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
              title={`${btn.label} (${btn.shortcut})`}
            >
              <span>{btn.label}</span>
              <span
                className={`text-[10px] hidden xl:inline ${
                  isActive ? 'text-neutral-700' : 'text-neutral-500'
                }`}
              >
                {btn.shortcut}
              </span>
            </button>
          );
        })}
      </div>

      {/* View Options & Revision Colors (Right cluster) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Revision Draft Selector (White / Blue / Pink, etc.) */}
        <div className="relative">
          <button
            ref={revisionButtonRef}
            onClick={toggleRevisionDropdown}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs rounded border border-neutral-700 bg-neutral-800 text-neutral-200 hover:text-white hover:border-neutral-500 transition-colors shadow-xs"
            title="Screenplay Revision Draft Color"
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block border border-black/40 shrink-0"
              style={{ backgroundColor: currentRev.color }}
            />
            <span className="font-medium truncate max-w-[85px] sm:max-w-[110px]">
              {currentRev.name.split(' ')[0]}
            </span>
            <ChevronDown
              className={`w-3 h-3 text-neutral-400 transition-transform ${
                isRevisionDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* View mode Segmented Control: Pages vs Continuous */}
        <div className="flex items-center p-0.5 bg-neutral-800 rounded border border-neutral-700">
          <button
            onClick={() => onTogglePaginatedView(true)}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded text-xs transition-colors ${
              paginatedView
                ? 'bg-amber-400 text-black font-semibold shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Paginated View (US Letter Page Sheets)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pages</span>
          </button>
          <button
            onClick={() => onTogglePaginatedView(false)}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded text-xs transition-colors ${
              !paginatedView
                ? 'bg-amber-400 text-black font-semibold shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Continuous View (Single Continuous Manuscript)"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Continuous</span>
          </button>
        </div>

        {/* Typewriter Scrolling Toggle */}
        <button
          onClick={onToggleTypewriterMode}
          className={`p-1 sm:px-2 sm:py-1 rounded transition-colors flex items-center gap-1 ${
            typewriterMode
              ? 'text-amber-300 bg-amber-950/50 border border-amber-800/60'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title="Typewriter Mode (locks active line in vertical center)"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Typewriter</span>
        </button>

        {/* Focus Mode Toggle */}
        <button
          onClick={onToggleFocusMode}
          className={`p-1 sm:px-2 sm:py-1 rounded transition-colors flex items-center gap-1 ${
            focusMode
              ? 'text-amber-300 bg-amber-950/50 border border-amber-800/60'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title="Focus Mode (dim non-active lines)"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Focus</span>
        </button>
      </div>

      {/* Floating Fixed-Position Revision Dropdown (100% immune to overflow clipping) */}
      {isRevisionDropdownOpen && (
        <div
          className="fixed bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl py-1 z-50 w-52 text-xs"
          style={{
            top: `${revisionMenuPos.top}px`,
            right: `${Math.max(8, revisionMenuPos.right)}px`,
          }}
        >
          <div className="px-3 py-1.5 text-[10px] text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800 flex items-center justify-between">
            <span>Industry Draft Colors</span>
            <button
              onClick={() => setIsRevisionDropdownOpen(false)}
              className="text-neutral-500 hover:text-white"
            >
              ✕
            </button>
          </div>
          {STANDARD_REVISIONS.map((rev) => {
            const isSelected = activeRevision === rev.id;
            return (
              <button
                key={rev.id}
                onClick={() => {
                  onSelectRevision(rev.id);
                  setIsRevisionDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-neutral-800 transition-colors ${
                  isSelected
                    ? 'text-amber-400 font-semibold bg-neutral-800/60'
                    : 'text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-3 h-3 rounded-full inline-block shrink-0 border border-black/40"
                    style={{ backgroundColor: rev.color }}
                  />
                  <span className="truncate">{rev.name}</span>
                </div>
                {isSelected && <span className="text-[10px] text-amber-400">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Fixed-Position Mobile Element Menu */}
      {isElementDropdownOpen && (
        <div
          className="fixed bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl py-1 z-50 w-44 text-xs md:hidden"
          style={{
            top: `${elementMenuPos.top}px`,
            left: `${Math.max(8, elementMenuPos.left)}px`,
          }}
        >
          <div className="px-3 py-1.5 text-[10px] text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800 flex items-center justify-between">
            <span>Element Type</span>
            <button
              onClick={() => setIsElementDropdownOpen(false)}
              className="text-neutral-500 hover:text-white"
            >
              ✕
            </button>
          </div>
          {ELEMENT_BUTTONS.map((btn) => {
            const isActive = currentType === btn.type;
            return (
              <button
                key={btn.type}
                onClick={() => {
                  onSelectType(btn.type);
                  setIsElementDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-neutral-800 transition-colors ${
                  isActive ? 'text-amber-400 font-semibold bg-neutral-800/60' : 'text-neutral-300'
                }`}
              >
                <span>{btn.label}</span>
                <span className="text-[10px] text-neutral-500">{btn.shortcut}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
