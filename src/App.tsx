import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ScreenplayDocument,
  ScriptBlock,
  ScreenplayElementType,
  Collaborator,
  ScriptChatMessage,
  TitlePageData,
  STANDARD_REVISIONS,
} from './types/screenplay';
import { INITIAL_SAMPLE_SCRIPT } from './utils/sampleScript';
import { calculateScriptStats } from './utils/scriptStats';
import { collabService, CollabSyncPayload } from './services/collaboration';
import { versionControl } from './services/versionControl';
import { Header } from './components/Header';
import { FormatToolbar } from './components/FormatToolbar';
import { Editor } from './components/Editor';
import { SceneNavigator } from './components/SceneNavigator';
import { BeatBoard } from './components/BeatBoard';
import { CharacterTracker } from './components/CharacterTracker';
import { ScriptStatsModal } from './components/ScriptStatsModal';
import { TitlePageModal } from './components/TitlePageModal';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';
import { CollaborationModal } from './components/CollaborationModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { LandingPage } from './components/LandingPage';
import { FeedbackModal } from './components/FeedbackModal';
import { PanelLeftClose, PanelLeft, Check } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'openlipi_current_document_v1';
const LEGACY_STORAGE_KEY = 'openscript_current_document_v1';

export default function App() {
  // Load initial document from localStorage or sample script
  const [doc, setDoc] = useState<ScreenplayDocument>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.blocks && parsed.blocks.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Error loading saved document:', e);
      }
    }
    return INITIAL_SAMPLE_SCRIPT;
  });

  const [activeBlockId, setActiveBlockId] = useState<string | null>(
    doc.blocks[0]?.id || null
  );
  const [currentView, setCurrentView] = useState<'landing' | 'editor' | 'beat_board' | 'characters' | 'stats'>('landing');
  const [paginatedView, setPaginatedView] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [typewriterMode, setTypewriterMode] = useState(false);
  const [activeRevision, setActiveRevision] = useState('white');
  const [isOutlinerOpen, setIsOutlinerOpen] = useState(true);

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [isTitlePageModalOpen, setIsTitlePageModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isVersionHistoryModalOpen, setIsVersionHistoryModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Collaboration State
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [chatMessages, setChatMessages] = useState<ScriptChatMessage[]>([]);
  const [saveIndicator, setSaveIndicator] = useState(false);

  // Auto-versioning timer & tracker
  const lastAutoSaveRef = useRef<number>(Date.now());

  // Initialize version control with baseline if empty
  useEffect(() => {
    const existing = versionControl.getVersions(doc.id);
    if (existing.length === 0) {
      versionControl.createVersion(
        doc,
        'Initial Script Baseline',
        'manual',
        'Automatic initial baseline snapshot created on project load',
        collabService.localUser.name,
        collabService.localUser.color
      );
    }
  }, [doc.id]);

  // Periodic Auto-Snapshotting on significant changes
  useEffect(() => {
    const timer = setInterval(() => {
      const versions = versionControl.getVersions(doc.id);
      const latestVersion = versions[0];
      if (versionControl.shouldAutoSnapshot(doc, latestVersion, 60000)) {
        versionControl.createVersion(
          doc,
          `Auto-Save Draft`,
          'auto',
          'Automatic milestone captured during writing session',
          collabService.localUser.name,
          collabService.localUser.color
        );
        lastAutoSaveRef.current = Date.now();
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [doc]);

  // Autosave to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(doc));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [doc]);

  // Real-time Collaboration Engine subscription
  useEffect(() => {
    const unsubscribe = collabService.subscribe((action: CollabSyncPayload) => {
      if (action.sender.id === collabService.localUser.id && action.type !== 'CHAT_MESSAGE') {
        return;
      }

      switch (action.type) {
        case 'BLOCK_UPDATE': {
          const updated = action.payload as ScriptBlock;
          setDoc((prev) => ({
            ...prev,
            updatedAt: Date.now(),
            blocks: prev.blocks.map((b) => (b.id === updated.id ? updated : b)),
          }));
          break;
        }

        case 'BLOCK_INSERT': {
          const { block, index } = action.payload as { block: ScriptBlock; index: number };
          setDoc((prev) => {
            const nextBlocks = [...prev.blocks];
            nextBlocks.splice(index, 0, block);
            return { ...prev, updatedAt: Date.now(), blocks: nextBlocks };
          });
          break;
        }

        case 'BLOCK_DELETE': {
          const { blockId } = action.payload as { blockId: string };
          setDoc((prev) => ({
            ...prev,
            updatedAt: Date.now(),
            blocks: prev.blocks.filter((b) => b.id !== blockId),
          }));
          break;
        }

        case 'BLOCKS_REORDER': {
          const reordered = action.payload as ScriptBlock[];
          setDoc((prev) => ({ ...prev, updatedAt: Date.now(), blocks: reordered }));
          break;
        }

        case 'TITLE_UPDATE': {
          const updatedTitle = action.payload as TitlePageData;
          setDoc((prev) => ({ ...prev, titlePage: updatedTitle }));
          break;
        }

        case 'CHAT_MESSAGE': {
          const msg = action.payload as ScriptChatMessage;
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          break;
        }

        case 'PRESENCE_UPDATE':
        case 'USER_JOIN':
        case 'USER_LEAVE': {
          const activePeers = Array.from(collabService.peersList.values()).filter(
            (p) => p.id !== collabService.localUser.id
          );
          setCollaborators(activePeers);
          break;
        }

        default:
          break;
      }
    });

    // Check for room query in URL on mount
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      collabService.joinRoom(roomParam).then(() => {
        setRoomCode(roomParam);
      });
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Sync cursor presence to peers
  const handleSetActiveBlockId = useCallback((id: string | null) => {
    setActiveBlockId(id);
    if (id) {
      collabService.updateCursor(id);
    }
  }, []);

  // Update Block handler
  const handleUpdateBlock = useCallback((updated: ScriptBlock) => {
    setDoc((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      blocks: prev.blocks.map((b) => (b.id === updated.id ? updated : b)),
    }));
    collabService.broadcastBlockUpdate(updated);
  }, []);

  // Insert Block handler
  const handleInsertBlock = useCallback((newBlock: ScriptBlock, index: number) => {
    setDoc((prev) => {
      const nextBlocks = [...prev.blocks];
      nextBlocks.splice(index, 0, newBlock);
      return { ...prev, updatedAt: Date.now(), blocks: nextBlocks };
    });
    collabService.broadcastBlockInsert(newBlock, index);
  }, []);

  // Delete Block handler
  const handleDeleteBlock = useCallback((blockId: string) => {
    setDoc((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      blocks: prev.blocks.filter((b) => b.id !== blockId),
    }));
    collabService.broadcastBlockDelete(blockId);
  }, []);

  // Element Type Switcher from FormatToolbar
  const handleSelectElementType = useCallback(
    (type: ScreenplayElementType) => {
      if (!activeBlockId) return;
      const targetBlock = doc.blocks.find((b) => b.id === activeBlockId);
      if (targetBlock) {
        let newText = targetBlock.text;
        if (
          type === 'scene_heading' ||
          type === 'character' ||
          type === 'transition' ||
          type === 'shot'
        ) {
          newText = targetBlock.text.toUpperCase();
        }
        handleUpdateBlock({ ...targetBlock, type, text: newText });
      }
    },
    [activeBlockId, doc.blocks, handleUpdateBlock]
  );

  // Reorder scene
  const handleMoveScene = useCallback(
    (sceneBlockIndex: number, direction: 'up' | 'down') => {
      const blocks = [...doc.blocks];
      const findSceneEnd = (startIdx: number) => {
        for (let j = startIdx + 1; j < blocks.length; j++) {
          if (blocks[j].type === 'scene_heading') return j;
        }
        return blocks.length;
      };

      const currentEnd = findSceneEnd(sceneBlockIndex);
      const currentChunk = blocks.slice(sceneBlockIndex, currentEnd);

      if (direction === 'up') {
        let prevSceneIdx = -1;
        for (let i = sceneBlockIndex - 1; i >= 0; i--) {
          if (blocks[i].type === 'scene_heading') {
            prevSceneIdx = i;
            break;
          }
        }
        if (prevSceneIdx === -1) return;

        blocks.splice(sceneBlockIndex, currentChunk.length);
        blocks.splice(prevSceneIdx, 0, ...currentChunk);
      } else {
        const nextSceneIdx = currentEnd;
        if (nextSceneIdx >= blocks.length) return;
        const nextSceneEnd = findSceneEnd(nextSceneIdx);
        const nextChunk = blocks.slice(nextSceneIdx, nextSceneEnd);

        blocks.splice(
          sceneBlockIndex,
          currentChunk.length + nextChunk.length,
          ...nextChunk,
          ...currentChunk
        );
      }

      setDoc((prev) => ({ ...prev, updatedAt: Date.now(), blocks }));
      collabService.broadcastBlocksReorder(blocks);
    },
    [doc.blocks]
  );

  // Add Comment to Block
  const handleAddComment = useCallback(
    (blockId: string, text: string) => {
      const target = doc.blocks.find((b) => b.id === blockId);
      if (!target) return;

      const newComment = {
        id: 'cm-' + Date.now(),
        author: collabService.localUser.name,
        authorColor: collabService.localUser.color,
        text,
        timestamp: Date.now(),
      };

      const updated = {
        ...target,
        notes: [...(target.notes || []), newComment],
      };

      handleUpdateBlock(updated);
      collabService.sendChatMessage(`Added note on scene: "${text}"`, blockId);
    },
    [doc.blocks, handleUpdateBlock]
  );

  // Jump to Block
  const handleJumpToBlock = useCallback((blockId: string) => {
    setActiveBlockId(blockId);
    setCurrentView('editor');
  }, []);

  // Add New Scene beat from BeatBoard
  const handleAddNewScene = useCallback(() => {
    const sceneNum = doc.blocks.filter((b) => b.type === 'scene_heading').length + 1;
    const newSceneHeading: ScriptBlock = {
      id: `blk-${Date.now()}-scene`,
      type: 'scene_heading',
      text: `INT. NEW SCENE ${sceneNum} - DAY`,
      sceneNumber: sceneNum,
    };
    const newAction: ScriptBlock = {
      id: `blk-${Date.now()}-action`,
      type: 'action',
      text: 'Describe scene beat and character objectives...',
    };

    setDoc((prev) => {
      const nextBlocks = [...prev.blocks, newSceneHeading, newAction];
      return { ...prev, updatedAt: Date.now(), blocks: nextBlocks };
    });

    collabService.broadcastBlockInsert(newSceneHeading, doc.blocks.length);
    collabService.broadcastBlockInsert(newAction, doc.blocks.length + 1);

    setActiveBlockId(newSceneHeading.id);
  }, [doc.blocks]);

  // Title Page Save handler
  const handleSaveTitlePage = useCallback((newTitlePage: TitlePageData) => {
    setDoc((prev) => ({ ...prev, titlePage: newTitlePage }));
    collabService.broadcastTitleUpdate(newTitlePage);
  }, []);

  // Restore previous version
  const handleRestoreVersion = useCallback((restoredDoc: ScreenplayDocument) => {
    setDoc(restoredDoc);
    setActiveBlockId(restoredDoc.blocks[0]?.id || null);
    collabService.broadcastBlocksReorder(restoredDoc.blocks);
    collabService.broadcastTitleUpdate(restoredDoc.titlePage);
  }, []);

  // Stats calculation
  const stats = useMemo(() => calculateScriptStats(doc), [doc]);

  // Current active block element type
  const currentElementType: ScreenplayElementType = useMemo(() => {
    if (!activeBlockId) return 'action';
    const found = doc.blocks.find((b) => b.id === activeBlockId);
    return found ? found.type : 'action';
  }, [activeBlockId, doc.blocks]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        // Manual save triggers both localStorage save and a version milestone
        versionControl.createVersion(
          doc,
          `Saved Snapshot`,
          'manual',
          'Manual save milestone',
          collabService.localUser.name,
          collabService.localUser.color
        );
        setSaveIndicator(true);
        setTimeout(() => setSaveIndicator(false), 2000);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportModalOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setIsImportModalOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsVersionHistoryModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [doc]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 select-none">
      {/* 3-Zone Top Bar Contract */}
      <Header
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'stats') {
            setIsStatsModalOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenCollab={() => setIsCollabModalOpen(true)}
        onOpenTitlePage={() => setIsTitlePageModalOpen(true)}
        onOpenVersionHistory={() => setIsVersionHistoryModalOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        connectedPeersCount={collaborators.length}
        roomCode={roomCode}
        scriptTitle={doc.titlePage.title}
      />

      {/* Screenplay Formatting & View Toolbar (Editor only) */}
      {currentView === 'editor' && (
        <FormatToolbar
          currentType={currentElementType}
          onSelectType={handleSelectElementType}
          paginatedView={paginatedView}
          onTogglePaginatedView={(isPaginated) =>
            setPaginatedView(typeof isPaginated === 'boolean' ? isPaginated : !paginatedView)
          }
          focusMode={focusMode}
          onToggleFocusMode={() => setFocusMode(!focusMode)}
          typewriterMode={typewriterMode}
          onToggleTypewriterMode={() => setTypewriterMode(!typewriterMode)}
          activeRevision={activeRevision}
          onSelectRevision={setActiveRevision}
        />
      )}

      {/* Main Workspace */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Landing Page Overview & Community Reviews */}
        {currentView === 'landing' && (
          <LandingPage
            onOpenEditor={() => setCurrentView('editor')}
            onOpenBeatBoard={() => setCurrentView('beat_board')}
            onOpenImport={() => setIsImportModalOpen(true)}
            onOpenExport={() => setIsExportModalOpen(true)}
            onOpenVersionHistory={() => setIsVersionHistoryModalOpen(true)}
            onOpenCollab={() => setIsCollabModalOpen(true)}
            scriptTitle={doc.titlePage.title}
          />
        )}

        {/* Scene Navigator Sidebar (Editor view only) */}
        {currentView === 'editor' && (
          <SceneNavigator
            blocks={doc.blocks}
            activeBlockId={activeBlockId}
            onJumpToBlock={handleJumpToBlock}
            onMoveScene={handleMoveScene}
            isOpen={isOutlinerOpen}
            onToggle={() => setIsOutlinerOpen(!isOutlinerOpen)}
          />
        )}

        {/* Outliner Sidebar Collapse / Expand Toggle Button */}
        {currentView === 'editor' && (
          <button
            onClick={() => setIsOutlinerOpen(!isOutlinerOpen)}
            className="absolute left-2 bottom-3 z-20 p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded shadow-md border border-neutral-700 transition-colors"
            title={isOutlinerOpen ? 'Collapse Outliner' : 'Expand Outliner'}
          >
            {isOutlinerOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>
        )}

        {/* View Switcher: Editor vs Beat Board vs Character Tracker */}
        {currentView === 'editor' && (
          <Editor
            blocks={doc.blocks}
            onUpdateBlock={handleUpdateBlock}
            onInsertBlock={handleInsertBlock}
            onDeleteBlock={handleDeleteBlock}
            activeBlockId={activeBlockId}
            onSetActiveBlockId={handleSetActiveBlockId}
            collaborators={collaborators}
            paginatedView={paginatedView}
            focusMode={focusMode}
            typewriterMode={typewriterMode}
            activeRevisionColor={
              STANDARD_REVISIONS.find((r) => r.id === activeRevision)?.color
            }
            onAddComment={handleAddComment}
          />
        )}

        {currentView === 'beat_board' && (
          <BeatBoard
            blocks={doc.blocks}
            onUpdateBlock={handleUpdateBlock}
            onJumpToScene={handleJumpToBlock}
            onAddScene={handleAddNewScene}
          />
        )}

        {currentView === 'characters' && (
          <CharacterTracker
            stats={stats}
            blocks={doc.blocks}
            onJumpToBlock={handleJumpToBlock}
          />
        )}
      </div>

      {/* Quiet Status Bar at Bottom (Hidden on Landing page for cleaner presentation) */}
      {currentView !== 'landing' && (
        <footer className="h-8 border-t border-neutral-800 bg-neutral-950 px-3 sm:px-4 flex items-center justify-between text-[11px] text-neutral-400 font-mono shrink-0 select-none no-print">
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            <span className="text-neutral-300 font-semibold">{stats.totalPages} pages</span>
            <span>·</span>
            <span>~{stats.estimatedRunTimeMinutes} min</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{stats.totalWords.toLocaleString()} words</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{stats.totalScenes} scenes</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {saveIndicator && (
              <span className="text-emerald-400 flex items-center gap-1 font-sans">
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">Snapshot committed</span>
              </span>
            )}
            <span className="hidden md:inline">OpenLipi</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">Courier Prime 12pt</span>
            <span className="hidden md:inline">·</span>
            <span className="text-neutral-500">MIT Open Source</span>
          </div>
        </footer>
      )}

      {/* Modals */}
      <ExportModal
        document={doc}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportDocument={(newDoc) => {
          setDoc(newDoc);
          setActiveBlockId(newDoc.blocks[0]?.id || null);
          versionControl.createVersion(
            newDoc,
            `Imported: ${newDoc.titlePage.title || 'Screenplay'}`,
            'import',
            'Imported screenplay draft',
            collabService.localUser.name,
            collabService.localUser.color
          );
        }}
      />

      <CollaborationModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
        localUser={collabService.localUser}
        roomCode={roomCode}
        onStartRoom={async () => {
          const code = await collabService.startRoom();
          setRoomCode(code);
          return code;
        }}
        onJoinRoom={async (code) => {
          const success = await collabService.joinRoom(code);
          if (success) setRoomCode(code);
          return success;
        }}
        onLeaveRoom={() => {
          collabService.leaveRoom();
          setRoomCode(null);
          setCollaborators([]);
        }}
        peers={collaborators}
        chatMessages={chatMessages}
        onSendMessage={(text) => {
          const msg = collabService.sendChatMessage(text);
          setChatMessages((prev) => [...prev, msg]);
        }}
        onUpdateUserName={(name) => {
          collabService.setUserName(name);
        }}
      />

      <TitlePageModal
        titlePage={doc.titlePage}
        isOpen={isTitlePageModalOpen}
        onClose={() => setIsTitlePageModalOpen(false)}
        onSave={handleSaveTitlePage}
      />

      <ScriptStatsModal
        stats={stats}
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
      />

      <VersionHistoryModal
        currentDoc={doc}
        isOpen={isVersionHistoryModalOpen}
        onClose={() => setIsVersionHistoryModalOpen(false)}
        onRestoreVersion={handleRestoreVersion}
        currentAuthorName={collabService.localUser.name}
        currentAuthorColor={collabService.localUser.color}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}
