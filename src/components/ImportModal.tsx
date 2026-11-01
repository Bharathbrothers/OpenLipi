import React, { useState } from 'react';
import { ScreenplayDocument } from '../types/screenplay';
import { parseFountain } from '../utils/fountain';
import { parseFDX } from '../utils/fdx';
import { parseScreenplayPDF } from '../utils/pdfImport';
import {
  Upload,
  FileCode,
  Sparkles,
  FileText,
  AlertCircle,
  Check,
  BookOpen,
  Film
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDocument: (doc: ScreenplayDocument) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportDocument,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const importedDoc = await parseScreenplayPDF(arrayBuffer, file.name);

        if (!importedDoc.blocks || importedDoc.blocks.length === 0) {
          throw new Error('Could not extract readable screenplay text from this PDF.');
        }

        onImportDocument(importedDoc);
        setSuccessMsg(`Successfully imported director reference PDF "${file.name}" with ${importedDoc.blocks.length} elements!`);
        setTimeout(() => {
          onClose();
        }, 1200);
        return;
      }

      // Plain text, Fountain, FDX, or JSON
      const text = await file.text();
      if (!text) throw new Error('File appears to be empty.');

      let importedDoc: Partial<ScreenplayDocument> = {};

      if (file.name.endsWith('.fountain') || file.name.endsWith('.spmd')) {
        importedDoc = parseFountain(text);
      } else if (file.name.endsWith('.fdx') || file.name.endsWith('.xml')) {
        importedDoc = parseFDX(text);
      } else if (file.name.endsWith('.json')) {
        importedDoc = JSON.parse(text);
      } else {
        importedDoc = parseFountain(text);
      }

      if (!importedDoc.blocks || importedDoc.blocks.length === 0) {
        throw new Error('No screenplay blocks were parsed from this file.');
      }

      const fullDoc: ScreenplayDocument = {
        id: `script-${Date.now()}`,
        version: 1,
        updatedAt: Date.now(),
        titlePage: importedDoc.titlePage || {
          title: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
          credit: 'written by',
          author: 'Unknown Author',
          source: '',
          draft: 'Imported Draft',
          date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          contact: '',
          copyright: '',
        },
        blocks: importedDoc.blocks,
      };

      onImportDocument(fullDoc);
      setSuccessMsg(`Successfully imported "${file.name}" with ${fullDoc.blocks.length} elements!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Import error:', err);
      setErrorMsg(err.message || 'Failed to parse screenplay file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Import Reference Scripts & Screenplays</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-neutral-400">
            Import your own director reference scripts, public PDFs, or screenplay drafts in{' '}
            <span className="text-white font-medium">PDF</span>,{' '}
            <span className="text-white font-medium">Fountain (.fountain)</span>,{' '}
            <span className="text-white font-medium">Final Draft (.fdx)</span>, or TXT.
          </p>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-amber-400 bg-amber-950/20'
                : 'border-neutral-700 hover:border-neutral-600 bg-neutral-900/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-7 h-7 text-rose-400" />
              <Upload className="w-7 h-7 text-amber-400" />
              <FileCode className="w-7 h-7 text-blue-400" />
            </div>

            <span className="text-sm font-semibold text-white mb-1">
              {isProcessing ? 'Parsing Screenplay Content...' : 'Click to select or drag and drop script file'}
            </span>
            <span className="text-xs text-neutral-400">
              Supports <strong className="text-neutral-200">Director PDF scripts</strong>, Fountain, Final Draft (.fdx), .txt, .json
            </span>

            <input
              type="file"
              accept=".pdf,.fountain,.fdx,.xml,.txt,.json,.spmd"
              disabled={isProcessing}
              onChange={handleFileInput}
              className="hidden"
            />
          </label>

          {/* Reference Script Notice */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-start gap-2 text-xs text-neutral-300">
            <Film className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px] text-neutral-400">
              <span className="font-semibold text-white block mb-0.5">Director Reference PDF Support</span>
              Director reference PDFs are parsed with coordinate-aware heuristics that extract scene headings, character dialogs, parentheticals, and action descriptions into interactive screenplay blocks.
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
