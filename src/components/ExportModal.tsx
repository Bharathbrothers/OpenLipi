import React, { useState } from 'react';
import { ScreenplayDocument } from '../types/screenplay';
import { exportScript, ExportFormat } from '../utils/scriptExporter';
import {
  Download,
  FileText,
  Printer,
  FileCode,
  FileSpreadsheet,
  Check,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  document: ScreenplayDocument;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  document: doc,
  isOpen,
  onClose,
}) => {
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [successFormat, setSuccessFormat] = useState<ExportFormat | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (format: ExportFormat) => {
    setExportingFormat(format);
    setErrorMessage(null);
    try {
      await exportScript(doc, format);
      setSuccessFormat(format);
      setTimeout(() => setSuccessFormat(null), 2500);
    } catch (e: any) {
      console.error(`Export to ${format} error:`, e);
      setErrorMessage(`Failed to export as ${format.toUpperCase()}: ${e?.message || 'Error generating file'}`);
    } finally {
      setExportingFormat(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Export Screenplay</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Options */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-neutral-400">
            Export your script via the dedicated export engine in production-ready formats compatible with industry standard screenwriting software.
          </p>

          {errorMessage && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* PDF Option */}
            <button
              onClick={() => handleExport('pdf')}
              disabled={exportingFormat === 'pdf'}
              className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-amber-500/60 transition-all text-left group flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold text-white text-sm">Hollywood PDF</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Exact 12pt Courier screenplay format, 1.5" brad margins & page numbers.
                </p>
              </div>
              <span className="shrink-0 p-1.5 rounded bg-neutral-800 text-neutral-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                {successFormat === 'pdf' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:text-black" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {/* Word DOCX Option */}
            <button
              onClick={() => handleExport('docx')}
              disabled={exportingFormat === 'docx'}
              className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-amber-500/60 transition-all text-left group flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-white text-sm">Microsoft Word (.docx)</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Standard screenplay paragraph styles & margins for MS Word / Google Docs.
                </p>
              </div>
              <span className="shrink-0 p-1.5 rounded bg-neutral-800 text-neutral-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                {successFormat === 'docx' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:text-black" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {/* Fountain Option */}
            <button
              onClick={() => handleExport('fountain')}
              disabled={exportingFormat === 'fountain'}
              className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-amber-500/60 transition-all text-left group flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white text-sm">Fountain (.fountain)</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Universal open-source plain-text standard for Highland, Fade In, Scrivener.
                </p>
              </div>
              <span className="shrink-0 p-1.5 rounded bg-neutral-800 text-neutral-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                {successFormat === 'fountain' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:text-black" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {/* Final Draft FDX Option */}
            <button
              onClick={() => handleExport('fdx')}
              disabled={exportingFormat === 'fdx'}
              className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-amber-500/60 transition-all text-left group flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white text-sm">Final Draft (.fdx)</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Industry standard studio XML format compatible with Final Draft 8-13.
                </p>
              </div>
              <span className="shrink-0 p-1.5 rounded bg-neutral-800 text-neutral-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                {successFormat === 'fdx' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:text-black" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {/* Plain Text */}
            <button
              onClick={() => handleExport('txt')}
              disabled={exportingFormat === 'txt'}
              className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-amber-500/60 transition-all text-left group flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-neutral-400" />
                  <span className="font-semibold text-white text-sm">Plain Text (.txt)</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Formatted ASCII tabbed screenplay text file.
                </p>
              </div>
              <span className="shrink-0 p-1.5 rounded bg-neutral-800 text-neutral-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                {successFormat === 'txt' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:text-black" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {/* Project Backup JSON */}
            <button
              onClick={() => handleExport('json')}
              disabled={exportingFormat === 'json'}
              className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-amber-500/60 transition-all text-left group flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-white text-sm">OpenLipi Backup (.json)</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Full project snapshot with revisions, notes, and cover metadata.
                </p>
              </div>
              <span className="shrink-0 p-1.5 rounded bg-neutral-800 text-neutral-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                {successFormat === 'json' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:text-black" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </span>
            </button>
          </div>

          {/* Direct Print Option */}
          <div className="pt-2">
            <button
              onClick={handlePrint}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-medium text-neutral-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Direct Browser Print / Save as PDF (Standard US Letter Layout)</span>
            </button>
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
