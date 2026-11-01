import React, { useState, useMemo } from 'react';
import {
  ScreenplayDocument,
  ScriptVersion,
  DiffBlockResult,
} from '../types/screenplay';
import { versionControl } from '../services/versionControl';
import {
  History,
  GitBranch,
  RotateCcw,
  Plus,
  Trash2,
  Clock,
  Check,
  AlertTriangle,
  FileText,
  Eye,
  GitCommit,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface VersionHistoryModalProps {
  currentDoc: ScreenplayDocument;
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion: (restoredDoc: ScreenplayDocument) => void;
  currentAuthorName: string;
  currentAuthorColor: string;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  currentDoc,
  isOpen,
  onClose,
  onRestoreVersion,
  currentAuthorName,
  currentAuthorColor,
}) => {
  const [versions, setVersions] = useState<ScriptVersion[]>(() =>
    versionControl.getVersions(currentDoc.id)
  );

  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    () => versions[0]?.id || null
  );

  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'manual' | 'auto'>('all');
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Refresh versions when opened or changed
  const refreshVersions = () => {
    const list = versionControl.getVersions(currentDoc.id);
    setVersions(list);
    if (!selectedVersionId && list.length > 0) {
      setSelectedVersionId(list[0].id);
    }
  };

  const handleCreateVersionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionName.trim()) return;

    const created = versionControl.createVersion(
      currentDoc,
      newVersionName.trim(),
      'manual',
      newVersionDesc.trim(),
      currentAuthorName,
      currentAuthorColor
    );

    setNewVersionName('');
    setNewVersionDesc('');
    setIsCreatingManual(false);
    refreshVersions();
    setSelectedVersionId(created.id);
    setSuccessToast(`Created milestone version "${created.name}"`);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleRestore = (ver: ScriptVersion) => {
    const res = versionControl.restoreVersion(ver.id, currentDoc);
    if (res) {
      onRestoreVersion(res.restoredDoc);
      refreshVersions();
      setRestoreConfirmId(null);
      setSuccessToast(`Restored version ${ver.versionNumber}: "${ver.name}"`);
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 1500);
    }
  };

  const handleDelete = (versionId: string) => {
    versionControl.deleteVersion(currentDoc.id, versionId);
    refreshVersions();
    if (selectedVersionId === versionId) {
      const remaining = versions.filter((v) => v.id !== versionId);
      setSelectedVersionId(remaining[0]?.id || null);
    }
  };

  const selectedVersion = useMemo(() => {
    return versions.find((v) => v.id === selectedVersionId) || versions[0] || null;
  }, [versions, selectedVersionId]);

  // Compute Diff between selectedVersion and currentDoc
  const diffResults: DiffBlockResult[] = useMemo(() => {
    if (!selectedVersion) return [];
    return versionControl.computeDiff(selectedVersion.snapshot, currentDoc);
  }, [selectedVersion, currentDoc]);

  const diffCounts = useMemo(() => {
    let added = 0;
    let removed = 0;
    let modified = 0;
    diffResults.forEach((d) => {
      if (d.status === 'added') added++;
      else if (d.status === 'removed') removed++;
      else if (d.status === 'modified') modified++;
    });
    return { added, removed, modified };
  }, [diffResults]);

  const filteredVersions = useMemo(() => {
    if (filterType === 'manual') {
      return versions.filter((v) => v.trigger === 'manual' || v.trigger === 'restore');
    }
    if (filterType === 'auto') {
      return versions.filter((v) => v.trigger === 'auto');
    }
    return versions;
  }, [versions, filterType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-5xl h-[88vh] overflow-hidden shadow-2xl flex flex-col text-xs">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Version History & Diff Inspector</span>
                <span className="text-xs font-mono font-normal text-neutral-400">
                  ({versions.length} {versions.length === 1 ? 'version' : 'versions'} saved)
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingManual(!isCreatingManual)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded text-xs transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Milestone Version</span>
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-950 border-b border-emerald-800 text-emerald-300 px-6 py-2 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Manual Version Creation Banner */}
        {isCreatingManual && (
          <form
            onSubmit={handleCreateVersionSubmit}
            className="p-4 bg-neutral-900 border-b border-neutral-800 flex flex-col sm:flex-row items-center gap-3 shrink-0"
          >
            <input
              type="text"
              required
              placeholder="Milestone name (e.g. Act I Polish, Re-write Elena speech)..."
              value={newVersionName}
              onChange={(e) => setNewVersionName(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-white text-xs outline-hidden focus:border-amber-400"
            />
            <input
              type="text"
              placeholder="Optional notes or changelog..."
              value={newVersionDesc}
              onChange={(e) => setNewVersionDesc(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-white text-xs outline-hidden focus:border-amber-400"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded text-xs transition-colors whitespace-nowrap"
              >
                Commit Snapshot
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingManual(false)}
                className="px-3 py-1.5 text-neutral-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Main Content Split: Left Timeline, Right Diff Viewer */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Timeline Column */}
          <div className="w-80 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0">
            {/* Filter Tabs */}
            <div className="p-2 border-b border-neutral-800 flex items-center gap-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All ({versions.length})
              </button>
              <button
                onClick={() => setFilterType('manual')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterType === 'manual'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Milestones
              </button>
              <button
                onClick={() => setFilterType('auto')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterType === 'auto'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Auto-Saves
              </button>
            </div>

            {/* Versions List */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-900">
              {filteredVersions.length === 0 ? (
                <div className="p-6 text-center text-neutral-500">
                  No versions match this filter.
                </div>
              ) : (
                filteredVersions.map((v) => {
                  const isSelected = selectedVersion?.id === v.id;
                  const dateStr = new Date(v.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVersionId(v.id)}
                      className={`p-3 cursor-pointer transition-colors group relative ${
                        isSelected
                          ? 'bg-neutral-800/90 text-white border-l-2 border-amber-400'
                          : 'hover:bg-neutral-900/60 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            v{v.versionNumber}
                          </span>
                          <span className="font-semibold truncate">{v.name}</span>
                        </div>

                        {v.trigger === 'manual' ? (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-sans shrink-0">
                            Milestone
                          </span>
                        ) : v.trigger === 'restore' ? (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-sans shrink-0">
                            Backup
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-500 font-sans shrink-0">
                            Auto
                          </span>
                        )}
                      </div>

                      {v.description && (
                        <p className="text-[11px] text-neutral-400 line-clamp-1 mb-1.5 leading-relaxed">
                          {v.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: v.authorColor }}
                          />
                          <span>{v.author}</span>
                          <span>·</span>
                          <span>{dateStr}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span>{v.stats.wordCount} words</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(v.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 transition-opacity"
                            title="Delete snapshot"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Diff & Version Details Column */}
          <div className="flex-1 bg-neutral-900 flex flex-col overflow-hidden">
            {selectedVersion ? (
              <>
                {/* Diff Header Bar */}
                <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-amber-400">
                        Version {selectedVersion.versionNumber}:
                      </span>
                      <h4 className="text-sm font-bold text-white">{selectedVersion.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                      <span>Snapshot: {selectedVersion.stats.pageCount} pages</span>
                      <span>·</span>
                      <span>{selectedVersion.stats.sceneCount} scenes</span>
                      <span>·</span>
                      <span>{selectedVersion.stats.wordCount.toLocaleString()} words</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-mono">+{diffCounts.added}</span>
                      <span className="text-rose-400 font-mono">-{diffCounts.removed}</span>
                      <span className="text-amber-400 font-mono">~{diffCounts.modified}</span>
                      <span>relative to current draft</span>
                    </div>
                  </div>

                  {/* Restore Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    {restoreConfirmId === selectedVersion.id ? (
                      <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded border border-neutral-700">
                        <span className="text-[11px] text-amber-300">Restore this version?</span>
                        <button
                          onClick={() => handleRestore(selectedVersion)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium text-xs transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setRestoreConfirmId(null)}
                          className="px-2 py-1 text-neutral-400 hover:text-white text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRestoreConfirmId(selectedVersion.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded border border-neutral-700 font-medium text-xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Restore This Version</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Diff Viewer Body */}
                <div className="flex-1 overflow-y-auto p-6 font-screenplay text-[12px] bg-neutral-900 select-text">
                  <div className="max-w-3xl mx-auto space-y-2">
                    <div className="mb-4 pb-2 border-b border-neutral-800 flex items-center justify-between font-sans text-xs text-neutral-400">
                      <span>Comparison vs. Current Working Draft</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Added in current draft
                        </span>
                        <span className="flex items-center gap-1 text-rose-400">
                          <span className="w-2 h-2 rounded-full bg-rose-400"></span> Removed since version {selectedVersion.versionNumber}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span> Modified line
                        </span>
                      </div>
                    </div>

                    {diffResults.map((item, idx) => {
                      if (item.status === 'added' && item.newBlock) {
                        return (
                          <div
                            key={`diff-${idx}`}
                            className="p-2 bg-emerald-950/40 border border-emerald-800/60 rounded text-emerald-200"
                          >
                            <span className="text-[10px] font-sans font-bold text-emerald-400 block mb-0.5">
                              + [ADDED] {item.newBlock.type.toUpperCase()}
                            </span>
                            <p className="leading-relaxed whitespace-pre-wrap">{item.newBlock.text}</p>
                          </div>
                        );
                      }

                      if (item.status === 'removed' && item.oldBlock) {
                        return (
                          <div
                            key={`diff-${idx}`}
                            className="p-2 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 line-through opacity-80"
                          >
                            <span className="text-[10px] font-sans font-bold text-rose-400 block mb-0.5 no-underline">
                              - [REMOVED] {item.oldBlock.type.toUpperCase()}
                            </span>
                            <p className="leading-relaxed whitespace-pre-wrap">{item.oldBlock.text}</p>
                          </div>
                        );
                      }

                      if (item.status === 'modified' && item.oldBlock && item.newBlock) {
                        return (
                          <div
                            key={`diff-${idx}`}
                            className="p-2 bg-amber-950/30 border border-amber-800/50 rounded text-amber-200 space-y-1"
                          >
                            <span className="text-[10px] font-sans font-bold text-amber-400 block">
                              ~ [MODIFIED] {item.newBlock.type.toUpperCase()}
                            </span>
                            <div className="bg-rose-950/30 p-1.5 rounded text-rose-300 line-through text-[11px]">
                              Old: {item.oldBlock.text}
                            </div>
                            <div className="bg-emerald-950/30 p-1.5 rounded text-emerald-200 text-[11px]">
                              New: {item.newBlock.text}
                            </div>
                          </div>
                        );
                      }

                      // Unchanged block
                      return (
                        <div
                          key={`diff-${idx}`}
                          className="py-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                        >
                          <p className="leading-relaxed">{item.newBlock?.text || item.oldBlock?.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-500">
                No version selected.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-neutral-500">
            Versions are backed up securely in browser offline storage.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
