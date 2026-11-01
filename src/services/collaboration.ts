import Peer, { DataConnection } from 'peerjs';
import { Collaborator, ScriptBlock, ScriptChatMessage, TitlePageData } from '../types/screenplay';

export interface CollabSyncPayload {
  type:
    | 'USER_JOIN'
    | 'USER_LEAVE'
    | 'PRESENCE_UPDATE'
    | 'DOC_SYNC'
    | 'BLOCK_UPDATE'
    | 'BLOCK_INSERT'
    | 'BLOCK_DELETE'
    | 'BLOCKS_REORDER'
    | 'TITLE_UPDATE'
    | 'CHAT_MESSAGE';
  sender: Collaborator;
  payload: any;
  timestamp: number;
}

const COLLAB_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#ec4899', // pink
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
];

export class CollaborationService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  public localUser: Collaborator;
  public roomCode: string | null = null;
  public isHost: boolean = false;
  private listeners: Set<(action: CollabSyncPayload) => void> = new Set();
  public peersList: Map<string, Collaborator> = new Map();

  constructor() {
    const randomColor = COLLAB_COLORS[Math.floor(Math.random() * COLLAB_COLORS.length)];
    const savedName = localStorage.getItem('openscript_user_name');
    const randomId = 'usr-' + Math.random().toString(36).substring(2, 9);

    this.localUser = {
      id: randomId,
      name: savedName || `Writer ${randomId.slice(-4)}`,
      color: randomColor,
      lastActive: Date.now(),
      isHost: false,
    };

    // Setup local BroadcastChannel for tab-to-tab real-time testing
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('openscript_collab_bus');
      this.broadcastChannel.onmessage = (event) => {
        const data = event.data as CollabSyncPayload;
        if (data && data.sender && data.sender.id !== this.localUser.id) {
          this.handleIncomingPayload(data);
        }
      };
    }
  }

  public setUserName(name: string) {
    this.localUser.name = name;
    localStorage.setItem('openscript_user_name', name);
    this.broadcastPresence();
  }

  public subscribe(callback: (action: CollabSyncPayload) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(data: CollabSyncPayload) {
    this.listeners.forEach((listener) => listener(data));
  }

  public async startRoom(customCode?: string): Promise<string> {
    this.isHost = true;
    this.localUser.isHost = true;
    const code = customCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    this.roomCode = code;

    return new Promise((resolve, reject) => {
      try {
        const peerId = `osc-${code}-host`;
        this.peer = new Peer(peerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
            ],
          },
        });

        this.peer.on('open', () => {
          resolve(code);
          this.broadcast({
            type: 'USER_JOIN',
            sender: this.localUser,
            payload: { roomCode: code },
            timestamp: Date.now(),
          });
        });

        this.peer.on('connection', (conn) => {
          this.setupConnection(conn);
        });

        this.peer.on('error', (err) => {
          // If host ID is taken, connect as client
          if (err.type === 'unavailable-id') {
            resolve(code);
          } else {
            console.warn('Peer connection info:', err);
            resolve(code); // Gracefully proceed with BroadcastChannel
          }
        });
      } catch (e) {
        console.warn('WebRTC peer initialization fallback:', e);
        resolve(code);
      }
    });
  }

  public async joinRoom(code: string): Promise<boolean> {
    const cleanCode = code.trim().toUpperCase();
    this.roomCode = cleanCode;
    this.isHost = false;
    this.localUser.isHost = false;

    return new Promise((resolve) => {
      try {
        const peerId = `osc-${cleanCode}-guest-${this.localUser.id.slice(-4)}`;
        this.peer = new Peer(peerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
            ],
          },
        });

        this.peer.on('open', () => {
          const hostId = `osc-${cleanCode}-host`;
          const conn = this.peer!.connect(hostId, { reliable: true });
          this.setupConnection(conn);

          conn.on('open', () => {
            this.broadcast({
              type: 'USER_JOIN',
              sender: this.localUser,
              payload: { roomCode: cleanCode },
              timestamp: Date.now(),
            });
            resolve(true);
          });
        });

        this.peer.on('error', () => {
          // Broadcast local notice
          this.broadcast({
            type: 'USER_JOIN',
            sender: this.localUser,
            payload: { roomCode: cleanCode },
            timestamp: Date.now(),
          });
          resolve(true);
        });

        // Timeout fallback
        setTimeout(() => resolve(true), 2500);
      } catch (err) {
        console.warn('Peer join fallback:', err);
        resolve(true);
      }
    });
  }

  private setupConnection(conn: DataConnection) {
    this.connections.set(conn.peer, conn);

    conn.on('data', (data) => {
      this.handleIncomingPayload(data as CollabSyncPayload);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });
  }

  private handleIncomingPayload(data: CollabSyncPayload) {
    if (!data || !data.sender) return;

    // Update peers registry
    this.peersList.set(data.sender.id, data.sender);

    if (data.type === 'USER_LEAVE') {
      this.peersList.delete(data.sender.id);
    }

    this.notify(data);
  }

  public broadcast(action: CollabSyncPayload) {
    // 1. BroadcastChannel for same origin tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(action);
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // 2. WebRTC DataConnection
    const raw = JSON.stringify(action);
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(JSON.parse(raw));
      }
    });

    // Also notify self
    this.notify(action);
  }

  public updateCursor(blockId?: string, cursorIndex?: number) {
    this.localUser.currentBlockId = blockId;
    this.localUser.cursorIndex = cursorIndex;
    this.localUser.lastActive = Date.now();
    this.broadcastPresence();
  }

  public broadcastPresence() {
    this.broadcast({
      type: 'PRESENCE_UPDATE',
      sender: this.localUser,
      payload: {
        blockId: this.localUser.currentBlockId,
        cursorIndex: this.localUser.cursorIndex,
      },
      timestamp: Date.now(),
    });
  }

  public broadcastBlockUpdate(block: ScriptBlock) {
    this.broadcast({
      type: 'BLOCK_UPDATE',
      sender: this.localUser,
      payload: block,
      timestamp: Date.now(),
    });
  }

  public broadcastBlockInsert(block: ScriptBlock, index: number) {
    this.broadcast({
      type: 'BLOCK_INSERT',
      sender: this.localUser,
      payload: { block, index },
      timestamp: Date.now(),
    });
  }

  public broadcastBlockDelete(blockId: string) {
    this.broadcast({
      type: 'BLOCK_DELETE',
      sender: this.localUser,
      payload: { blockId },
      timestamp: Date.now(),
    });
  }

  public broadcastBlocksReorder(blocks: ScriptBlock[]) {
    this.broadcast({
      type: 'BLOCKS_REORDER',
      sender: this.localUser,
      payload: blocks,
      timestamp: Date.now(),
    });
  }

  public broadcastTitleUpdate(titlePage: TitlePageData) {
    this.broadcast({
      type: 'TITLE_UPDATE',
      sender: this.localUser,
      payload: titlePage,
      timestamp: Date.now(),
    });
  }

  public sendChatMessage(text: string, blockId?: string): ScriptChatMessage {
    const msg: ScriptChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      senderId: this.localUser.id,
      senderName: this.localUser.name,
      senderColor: this.localUser.color,
      text,
      timestamp: Date.now(),
      blockId,
    };

    this.broadcast({
      type: 'CHAT_MESSAGE',
      sender: this.localUser,
      payload: msg,
      timestamp: Date.now(),
    });

    return msg;
  }

  public leaveRoom() {
    this.broadcast({
      type: 'USER_LEAVE',
      sender: this.localUser,
      payload: {},
      timestamp: Date.now(),
    });

    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.roomCode = null;
    this.isHost = false;
    this.localUser.isHost = false;
    this.peersList.clear();
  }
}

export const collabService = new CollaborationService();
