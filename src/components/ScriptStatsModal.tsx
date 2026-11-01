import React from 'react';
import { ScriptStatistics } from '../types/screenplay';
import { Clock, BookOpen, Film, BarChart3, Sun, Moon, MapPin } from 'lucide-react';

interface ScriptStatsModalProps {
  stats: ScriptStatistics;
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptStatsModal: React.FC<ScriptStatsModalProps> = ({
  stats,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const hours = Math.floor(stats.estimatedRunTimeMinutes / 60);
  const minutes = stats.estimatedRunTimeMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Script Analytics & Metrics</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-neutral-900 border border-neutral-800/80 rounded-lg p-3">
              <span className="text-[11px] text-neutral-400 block mb-1">Total Pages</span>
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {stats.totalPages}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Industry Standard US Letter</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800/80 rounded-lg p-3">
              <span className="text-[11px] text-neutral-400 block mb-1">Est. Screen Time</span>
              <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                {timeFormatted}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">1 page ≈ 1 minute rule</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800/80 rounded-lg p-3">
              <span className="text-[11px] text-neutral-400 block mb-1">Total Words</span>
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {stats.totalWords.toLocaleString()}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Dialogue & Action</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800/80 rounded-lg p-3">
              <span className="text-[11px] text-neutral-400 block mb-1">Total Scenes</span>
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {stats.totalScenes}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">{stats.intScenes} INT / {stats.extScenes} EXT</span>
            </div>
          </div>

          {/* Dialogue vs Action Ratio Bar */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-neutral-300 font-medium">Dialogue vs. Action Distribution</span>
              <span className="font-mono text-neutral-400">
                <span className="text-amber-400 font-bold">{stats.dialogueRatio}%</span> Dialogue ·{' '}
                <span className="text-sky-400 font-bold">{100 - stats.dialogueRatio}%</span> Action
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden flex">
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${stats.dialogueRatio}%` }}
                title={`Dialogue: ${stats.dialogueRatio}%`}
              />
              <div
                className="bg-sky-500 h-full transition-all duration-500"
                style={{ width: `${100 - stats.dialogueRatio}%` }}
                title={`Action: ${100 - stats.dialogueRatio}%`}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-neutral-500 mt-2 font-mono">
              <span>Characters Speaking</span>
              <span>Visual Descriptions</span>
            </div>
          </div>

          {/* Location Breakdown */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Production Location Breakdown</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-neutral-950/60 rounded border border-neutral-800">
                <div>
                  <span className="text-xs text-neutral-300 block font-medium">Interior (INT.)</span>
                  <span className="text-[11px] text-neutral-500">Soundstage / indoor sets</span>
                </div>
                <span className="text-lg font-mono font-bold text-white tabular-nums">
                  {stats.intScenes}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-950/60 rounded border border-neutral-800">
                <div>
                  <span className="text-xs text-neutral-300 block font-medium">Exterior (EXT.)</span>
                  <span className="text-[11px] text-neutral-500">On-location / outdoor sets</span>
                </div>
                <span className="text-lg font-mono font-bold text-white tabular-nums">
                  {stats.extScenes}
                </span>
              </div>
            </div>
          </div>

          {/* Top Speaking Roles */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-white mb-2">Top Speaking Roles by Line Count</h4>
            <div className="space-y-2">
              {stats.characterStats.slice(0, 5).map((c, i) => (
                <div key={c.name} className="flex items-center justify-between text-xs py-1 border-b border-neutral-800/60 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 font-mono text-[11px] w-4">{i + 1}.</span>
                    <span className="font-mono uppercase font-bold text-neutral-200">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
                    <span>{c.scenes.length} scenes</span>
                    <span className="text-amber-400 font-semibold">{c.dialogueCount} lines</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
