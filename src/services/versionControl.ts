import {
  ScreenplayDocument,
  ScriptBlock,
  ScriptVersion,
  DiffBlockResult,
} from '../types/screenplay';
import { calculateScriptStats } from '../utils/scriptStats';

const STORAGE_PREFIX = 'openscript_versions_';
const MAX_VERSIONS = 50;

export class VersionControlService {
  private getStorageKey(docId: string): string {
    return `${STORAGE_PREFIX}${docId}`;
  }

  public getVersions(docId: string): ScriptVersion[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.getStorageKey(docId));
      if (!raw) return [];
      const list: ScriptVersion[] = JSON.parse(raw);
      return Array.isArray(list) ? list.sort((a, b) => b.timestamp - a.timestamp) : [];
    } catch (e) {
      console.warn('Failed to load script versions:', e);
      return [];
    }
  }

  public saveVersions(docId: string, versions: ScriptVersion[]): void {
    if (typeof window === 'undefined') return;
    try {
      // Prune if exceeds MAX_VERSIONS, but keep manual milestones and initial versions
      let toSave = [...versions];
      if (toSave.length > MAX_VERSIONS) {
        const manuals = toSave.filter((v) => v.trigger === 'manual' || v.trigger === 'restore');
        const autos = toSave.filter((v) => v.trigger === 'auto');
        // keep newest autos
        const prunedAutos = autos.slice(0, MAX_VERSIONS - manuals.length);
        toSave = [...manuals, ...prunedAutos].sort((a, b) => b.timestamp - a.timestamp);
      }
      localStorage.setItem(this.getStorageKey(docId), JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save script versions:', e);
    }
  }

  public createVersion(
    doc: ScreenplayDocument,
    name: string,
    trigger: 'auto' | 'manual' | 'restore' | 'import' = 'manual',
    description: string = '',
    author: string = 'Current Writer',
    authorColor: string = '#f59e0b',
    draftColor: string = '#ffffff'
  ): ScriptVersion {
    const existing = this.getVersions(doc.id);
    const versionNumber = existing.length > 0 ? Math.max(...existing.map((v) => v.versionNumber)) + 1 : 1;

    const stats = calculateScriptStats(doc);
    const lastVersion = existing[0];
    const diffSummary = lastVersion
      ? this.computeDiffSummary(lastVersion.snapshot, doc)
      : { added: doc.blocks.length, removed: 0, changed: 0 };

    // Deep clone snapshot
    const snapshot: ScreenplayDocument = JSON.parse(JSON.stringify(doc));

    const newVersion: ScriptVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      versionNumber,
      name: name || (trigger === 'auto' ? `Auto-Save #${versionNumber}` : `Milestone v${versionNumber}`),
      description: description || (lastVersion ? this.generateChangeDescription(diffSummary) : 'Initial snapshot'),
      timestamp: Date.now(),
      author,
      authorColor,
      trigger,
      draftColor,
      stats: {
        pageCount: stats.totalPages,
        wordCount: stats.totalWords,
        sceneCount: stats.totalScenes,
      },
      snapshot,
      diffSummary,
    };

    const updated = [newVersion, ...existing];
    this.saveVersions(doc.id, updated);
    return newVersion;
  }

  public shouldAutoSnapshot(
    currentDoc: ScreenplayDocument,
    lastVersion?: ScriptVersion,
    minIntervalMs = 45000 // 45 seconds between auto-saves
  ): boolean {
    if (!lastVersion) return true;

    const timeDiff = Date.now() - lastVersion.timestamp;
    if (timeDiff < minIntervalMs) return false;

    // Check if significant changes exist
    const diff = this.computeDiffSummary(lastVersion.snapshot, currentDoc);
    const hasMeaningfulChange = diff.added > 0 || diff.removed > 0 || diff.changed > 0;
    return hasMeaningfulChange;
  }

  public computeDiffSummary(
    oldDoc: ScreenplayDocument,
    newDoc: ScreenplayDocument
  ): { added: number; removed: number; changed: number } {
    let added = 0;
    let removed = 0;
    let changed = 0;

    const oldBlockMap = new Map<string, ScriptBlock>();
    oldDoc.blocks.forEach((b) => oldBlockMap.set(b.id, b));

    const newBlockMap = new Map<string, ScriptBlock>();
    newDoc.blocks.forEach((b) => newBlockMap.set(b.id, b));

    // Check additions and modifications
    newDoc.blocks.forEach((newB) => {
      const oldB = oldBlockMap.get(newB.id);
      if (!oldB) {
        added++;
      } else if (
        oldB.text !== newB.text ||
        oldB.type !== newB.type ||
        oldB.dialogue1 !== newB.dialogue1 ||
        oldB.dialogue2 !== newB.dialogue2
      ) {
        changed++;
      }
    });

    // Check removals
    oldDoc.blocks.forEach((oldB) => {
      if (!newBlockMap.has(oldB.id)) {
        removed++;
      }
    });

    return { added, removed, changed };
  }

  public computeDiff(
    oldDoc: ScreenplayDocument,
    newDoc: ScreenplayDocument
  ): DiffBlockResult[] {
    const results: DiffBlockResult[] = [];
    const oldBlockMap = new Map<string, ScriptBlock>();
    oldDoc.blocks.forEach((b) => oldBlockMap.set(b.id, b));

    const processedOldIds = new Set<string>();

    newDoc.blocks.forEach((newB) => {
      const oldB = oldBlockMap.get(newB.id);
      if (!oldB) {
        results.push({
          blockId: newB.id,
          status: 'added',
          newBlock: newB,
        });
      } else {
        processedOldIds.add(oldB.id);
        const isModified =
          oldB.text !== newB.text ||
          oldB.type !== newB.type ||
          oldB.dialogue1 !== newB.dialogue1 ||
          oldB.dialogue2 !== newB.dialogue2 ||
          oldB.character1 !== newB.character1 ||
          oldB.character2 !== newB.character2;

        results.push({
          blockId: newB.id,
          status: isModified ? 'modified' : 'unchanged',
          oldBlock: oldB,
          newBlock: newB,
        });
      }
    });

    // Detect removed blocks
    oldDoc.blocks.forEach((oldB) => {
      if (!processedOldIds.has(oldB.id)) {
        results.push({
          blockId: oldB.id,
          status: 'removed',
          oldBlock: oldB,
        });
      }
    });

    return results;
  }

  public restoreVersion(
    versionId: string,
    currentDoc: ScreenplayDocument
  ): { restoredDoc: ScreenplayDocument; backupVersion: ScriptVersion } | null {
    const versions = this.getVersions(currentDoc.id);
    const target = versions.find((v) => v.id === versionId);
    if (!target) return null;

    // Create a safety backup version of current state before restoring
    const backupVersion = this.createVersion(
      currentDoc,
      `Pre-Restore Backup (Before v${target.versionNumber})`,
      'restore',
      `Automatic safety backup created before rolling back to version ${target.versionNumber} ("${target.name}")`,
      target.author,
      target.authorColor
    );

    // Deep clone restored document
    const restoredDoc: ScreenplayDocument = JSON.parse(JSON.stringify(target.snapshot));
    restoredDoc.updatedAt = Date.now();

    return { restoredDoc, backupVersion };
  }

  public deleteVersion(docId: string, versionId: string): void {
    const versions = this.getVersions(docId).filter((v) => v.id !== versionId);
    this.saveVersions(docId, versions);
  }

  private generateChangeDescription(diff: { added: number; removed: number; changed: number }): string {
    const parts: string[] = [];
    if (diff.added > 0) parts.push(`+${diff.added} elements`);
    if (diff.changed > 0) parts.push(`~${diff.changed} edited`);
    if (diff.removed > 0) parts.push(`-${diff.removed} deleted`);
    return parts.length > 0 ? parts.join(', ') : 'Minor edits';
  }
}

export const versionControl = new VersionControlService();
