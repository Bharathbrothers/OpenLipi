export type ScreenplayElementType =
  | 'scene_heading'
  | 'action'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'transition'
  | 'shot'
  | 'dual_dialogue'
  | 'section'
  | 'synopsis'
  | 'note';

export interface ScriptBlock {
  id: string;
  type: ScreenplayElementType;
  text: string;
  // Dual dialogue properties
  character1?: string;
  parenthetical1?: string;
  dialogue1?: string;
  character2?: string;
  parenthetical2?: string;
  dialogue2?: string;
  // Scene metadata
  sceneNumber?: string | number;
  synopsisText?: string;
  // Revision tracking
  revisionColor?: string;
  revisionMark?: boolean;
  // Inline notes/comments
  notes?: InlineComment[];
  colorTag?: string;
}

export interface InlineComment {
  id: string;
  author: string;
  authorColor: string;
  text: string;
  timestamp: number;
  resolved?: boolean;
}

export interface TitlePageData {
  title: string;
  credit: string;
  author: string;
  source: string;
  draft: string;
  date: string;
  contact: string;
  copyright: string;
}

export interface ScriptRevision {
  id: string;
  name: string;
  color: string;
  badgeClass: string;
}

export const STANDARD_REVISIONS: ScriptRevision[] = [
  { id: 'white', name: 'White (First Draft)', color: '#ffffff', badgeClass: 'bg-white text-neutral-900 border-neutral-300' },
  { id: 'blue', name: 'Blue Revision', color: '#60a5fa', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { id: 'pink', name: 'Pink Revision', color: '#f472b6', badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  { id: 'yellow', name: 'Yellow Revision', color: '#facc15', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { id: 'green', name: 'Green Revision', color: '#4ade80', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'goldenrod', name: 'Goldenrod Revision', color: '#fb923c', badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
];

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  currentBlockId?: string;
  cursorIndex?: number;
  lastActive: number;
  isHost: boolean;
}

export interface ScriptChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: number;
  blockId?: string;
}

export interface ScreenplayDocument {
  id: string;
  version: number;
  updatedAt: number;
  titlePage: TitlePageData;
  blocks: ScriptBlock[];
  activeRevisionId?: string;
}

export interface ScriptStatistics {
  totalPages: number;
  totalWords: number;
  totalScenes: number;
  intScenes: number;
  extScenes: number;
  dialogueRatio: number; // percentage 0-100
  estimatedRunTimeMinutes: number;
  characterStats: {
    name: string;
    dialogueCount: number;
    wordCount: number;
    scenes: number[];
  }[];
}

export interface ScriptVersion {
  id: string;
  versionNumber: number;
  name: string;
  description?: string;
  timestamp: number;
  author: string;
  authorColor: string;
  trigger: 'auto' | 'manual' | 'restore' | 'import';
  draftColor?: string;
  stats: {
    pageCount: number;
    wordCount: number;
    sceneCount: number;
  };
  snapshot: ScreenplayDocument;
  diffSummary?: {
    added: number;
    removed: number;
    changed: number;
  };
}

export interface DiffBlockResult {
  blockId: string;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
  oldBlock?: ScriptBlock;
  newBlock?: ScriptBlock;
}
