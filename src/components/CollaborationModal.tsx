import React, { useState } from 'react';
import { Collaborator, ScriptChatMessage } from '../types/screenplay';
import {
  Users,
  Copy,
  Check,
  Send,
  MessageSquare,
  Radio,
  Share2,
  LogOut,
  UserCheck
} from 'lucide-react';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  localUser: Collaborator;
  roomCode: string | null;
  onStartRoom: () => Promise<string>;
  onJoinRoom: (code: string) => Promise<boolean>;
  onLeaveRoom: () => void;
  peers: Collaborator[];
  chatMessages: ScriptChatMessage[];
  onSendMessage: (text: string) => void;
  onUpdateUserName: (name: string) => void;
}

export const CollaborationModal: React.FC<CollaborationModalProps> = ({
  isOpen,
  onClose,
  localUser,
  roomCode,
  onStartRoom,
  onJoinRoom,
  onLeaveRoom,
  peers,
  chatMessages,
  onSendMessage,
  onUpdateUserName,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [userNameInput, setUserNameInput] = useState(localUser.name);
  const [chatInput, setChatInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleStartRoom = async () => {
    setIsConnecting(true);
    try {
      await onStartRoom();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!inputCode.trim()) return;
    setIsConnecting(true);
    try {
      await onJoinRoom(inputCode.trim());
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!roomCode) return;
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomCode);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const handleNameSave = () => {
    if (userNameInput.trim()) {
      onUpdateUserName(userNameInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Real-Time P2P Script Collaboration</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* User Profile settings */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm"
                style={{ backgroundColor: localUser.color }}
              >
                {localUser.name.charAt(0).toUpperCase()}
              </span>
              <div className="flex-1">
                <span className="text-[10px] text-neutral-400 block">Your Display Name</span>
                <input
                  type="text"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  className="bg-transparent font-medium text-white border-b border-neutral-700 hover:border-neutral-500 focus:border-amber-400 outline-hidden py-0.5 text-xs"
                />
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>P2P WebRTC Ready (Zero Server Fees)</span>
            </div>
          </div>

          {/* Active Room vs Create/Join */}
          {roomCode ? (
            <div className="space-y-4">
              {/* Active Room Banner */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="font-bold text-white text-sm">Room Active: {roomCode}</span>
                  </div>
                  <p className="text-[11px] text-emerald-300/80">
                    Collaborating live via direct peer-to-peer browser mesh.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyShareLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium text-xs transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
                  </button>

                  <button
                    onClick={onLeaveRoom}
                    className="p-1.5 bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 border border-neutral-700 rounded transition-colors"
                    title="Leave collaboration room"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Connected Writers List */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-300 mb-2">
                  Writers in this Room ({peers.length + 1})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Self */}
                  <div className="flex items-center gap-2 p-2.5 bg-neutral-900 border border-neutral-800 rounded">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: localUser.color }}
                    />
                    <span className="font-medium text-white truncate">{localUser.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono ml-auto">(You)</span>
                  </div>

                  {/* Connected peers */}
                  {peers.map((peer) => (
                    <div
                      key={peer.id}
                      className="flex items-center gap-2 p-2.5 bg-neutral-900 border border-neutral-800 rounded"
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: peer.color }}
                      />
                      <span className="font-medium text-white truncate">{peer.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono ml-auto">Connected</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* In-Room Chat Drawer */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Room Writers Chat</span>
                </h4>
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg h-44 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
                        No messages yet. Send a message to your co-writers!
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="text-xs">
                          <span
                            className="font-bold mr-1.5"
                            style={{ color: msg.senderColor }}
                          >
                            {msg.senderName}:
                          </span>
                          <span className="text-neutral-200">{msg.text}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Send chat input */}
                  <form onSubmit={handleSendChat} className="p-2 border-t border-neutral-800 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Discuss scene or suggest edits..."
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-white outline-hidden text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded text-xs transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* Start or Join a Room */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Room */}
              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Start Co-Writing Session</h4>
                  <p className="text-[11px] text-neutral-400 mb-4 leading-relaxed">
                    Host a private real-time collaboration room. Share the 6-letter room link with any writer to edit simultaneously.
                  </p>
                </div>
                <button
                  onClick={handleStartRoom}
                  disabled={isConnecting}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {isConnecting ? 'Starting Peer Room...' : 'Create New Collaboration Room'}
                </button>
              </div>

              {/* Join Room */}
              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Join a Friend's Room</h4>
                  <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
                    Have an invite code from another writer? Enter it below to connect directly:
                  </p>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit Room Code"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white font-mono uppercase text-center text-sm outline-hidden focus:border-amber-400 mb-3"
                  />
                </div>
                <button
                  onClick={handleJoinRoom}
                  disabled={isConnecting || !inputCode.trim()}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded text-xs transition-colors disabled:opacity-50"
                >
                  {isConnecting ? 'Connecting...' : 'Join Room'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
