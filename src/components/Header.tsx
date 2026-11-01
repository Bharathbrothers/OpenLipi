import React, { useState } from 'react';
import {
  Users,
  Download,
  Upload,
  GitBranch,
  Menu,
  X,
  FileText,
  BarChart3,
  Film,
  MessageSquareHeart,
  Home
} from 'lucide-react';
import { OpenLipiLogo } from './OpenLipiLogo';

interface HeaderProps {
  currentView: 'editor' | 'beat_board' | 'characters' | 'stats' | 'landing';
  onViewChange: (view: 'editor' | 'beat_board' | 'characters' | 'stats' | 'landing') => void;
  onOpenExport: () => void;
  onOpenImport: () => void;
  onOpenCollab: () => void;
  onOpenTitlePage: () => void;
  onOpenVersionHistory: () => void;
  onOpenFeedback: () => void;
  connectedPeersCount: number;
  roomCode: string | null;
  scriptTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenExport,
  onOpenImport,
  onOpenCollab,
  onOpenTitlePage,
  onOpenVersionHistory,
  onOpenFeedback,
  connectedPeersCount,
  roomCode,
  scriptTitle,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: 'editor' | 'beat_board' | 'characters' | 'stats' | 'landing') => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="relative border-b border-neutral-800 bg-neutral-950 px-3 sm:px-6 shrink-0 z-30">
      <div className="h-14 flex items-center justify-between gap-4">
        {/* Zone 1: OpenLipi Brand Mark with Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('landing')}
            className="hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 flex items-center cursor-pointer text-left"
            title="OpenLipi Home & Feature Showcase"
          >
            <OpenLipiLogo size="md" />
          </button>

          <span className="hidden lg:inline text-neutral-600 text-xs">/</span>
          <button
            onClick={onOpenTitlePage}
            className="hidden lg:block text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-colors truncate max-w-[180px] xl:max-w-xs text-left"
            title="Click to edit Title Page"
          >
            {scriptTitle || 'UNTITLED'}
          </button>
        </div>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-medium text-neutral-400">
          <button
            onClick={() => handleNavClick('landing')}
            className={`px-2.5 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentView === 'landing'
                ? 'text-white bg-neutral-800 font-semibold'
                : 'hover:text-neutral-200'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => handleNavClick('editor')}
            className={`px-2.5 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'editor'
                ? 'text-white bg-neutral-800 font-semibold'
                : 'hover:text-neutral-200'
            }`}
          >
            Studio Editor
          </button>
          <button
            onClick={() => handleNavClick('beat_board')}
            className={`px-2.5 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'beat_board'
                ? 'text-white bg-neutral-800 font-semibold'
                : 'hover:text-neutral-200'
            }`}
          >
            Beat Board
          </button>
          <button
            onClick={() => handleNavClick('characters')}
            className={`px-2.5 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'characters'
                ? 'text-white bg-neutral-800 font-semibold'
                : 'hover:text-neutral-200'
            }`}
          >
            Characters
          </button>
          <button
            onClick={() => handleNavClick('stats')}
            className={`px-2.5 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'stats'
                ? 'text-white bg-neutral-800 font-semibold'
                : 'hover:text-neutral-200'
            }`}
          >
            Stats
          </button>
        </nav>

        {/* Zone 3: Actions & Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Review & Feedback Button */}
          <button
            onClick={onOpenFeedback}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs text-amber-300 hover:text-white bg-neutral-900 border border-amber-500/30 rounded hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Leave a Review or Feature Request"
          >
            <MessageSquareHeart className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Feedback</span>
          </button>

          {/* Version History Button */}
          <button
            onClick={onOpenVersionHistory}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
            title="Version Control & Diff Inspector (⌘H)"
          >
            <GitBranch className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Versions</span>
          </button>

          {/* Import Button */}
          <button
            onClick={onOpenImport}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors hidden sm:flex"
            title="Import PDF, Fountain, or FDX (⌘O)"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Collaborate Button */}
          <button
            onClick={onOpenCollab}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs rounded border transition-colors whitespace-nowrap shrink-0 ${
              roomCode
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
            }`}
            title="Real-time collaborative editing"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {roomCode ? `Live (${connectedPeersCount + 1})` : 'Collaborate'}
            </span>
          </button>

          {/* Export Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Export PDF, Word docx, Fountain (⌘E)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors ml-1"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 px-4 py-3 space-y-3">
          {/* Script Title */}
          <div className="pb-2 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-mono">Current Script</span>
            <button
              onClick={() => {
                onOpenTitlePage();
                setIsMobileMenuOpen(false);
              }}
              className="text-xs font-mono font-semibold text-amber-400 hover:underline truncate max-w-[200px]"
            >
              {scriptTitle || 'UNTITLED'}
            </button>
          </div>

          {/* View navigation links */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNavClick('landing')}
              className={`p-2 rounded text-xs font-medium text-left flex items-center gap-2 ${
                currentView === 'landing'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-300'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => handleNavClick('editor')}
              className={`p-2 rounded text-xs font-medium text-left flex items-center gap-2 ${
                currentView === 'editor'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Studio Editor</span>
            </button>
            <button
              onClick={() => handleNavClick('beat_board')}
              className={`p-2 rounded text-xs font-medium text-left flex items-center gap-2 ${
                currentView === 'beat_board'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-300'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Beat Board</span>
            </button>
            <button
              onClick={() => handleNavClick('characters')}
              className={`p-2 rounded text-xs font-medium text-left flex items-center gap-2 ${
                currentView === 'characters'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Characters</span>
            </button>
            <button
              onClick={() => handleNavClick('stats')}
              className={`p-2 rounded text-xs font-medium text-left flex items-center gap-2 ${
                currentView === 'stats'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-300'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Script Stats</span>
            </button>
            <button
              onClick={() => {
                onOpenFeedback();
                setIsMobileMenuOpen(false);
              }}
              className="p-2 rounded text-xs font-medium text-left flex items-center gap-2 bg-amber-500/10 text-amber-300 border border-amber-500/30"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-amber-400" />
              <span>Review & Feedback</span>
            </button>
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onOpenImport();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-center text-xs flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
            <button
              onClick={() => {
                onOpenCollab();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-center text-xs flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Collab</span>
            </button>
            <button
              onClick={() => {
                onOpenTitlePage();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-center text-xs flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Cover</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

