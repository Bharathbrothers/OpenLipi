import React, { useState } from 'react';
import { TitlePageData } from '../types/screenplay';
import { FileText, Save } from 'lucide-react';

interface TitlePageModalProps {
  titlePage: TitlePageData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TitlePageData) => void;
}

export const TitlePageModal: React.FC<TitlePageModalProps> = ({
  titlePage,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<TitlePageData>({ ...titlePage });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Screenplay Title Page</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Screenplay Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value.toUpperCase() })}
              placeholder="e.g. THE CHRONO HEIST"
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white font-mono uppercase text-sm outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Credit Line</label>
              <select
                value={formData.credit}
                onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white outline-hidden focus:border-amber-400"
              >
                <option value="written by">written by</option>
                <option value="screenplay by">screenplay by</option>
                <option value="story by">story by</option>
                <option value="created by">created by</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Author / Writers</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author Name(s)"
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white outline-hidden focus:border-amber-400"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Source / Based On (Optional)</label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="e.g. Based on the novel by Jane Doe"
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Draft Edition</label>
              <input
                type="text"
                value={formData.draft}
                onChange={(e) => setFormData({ ...formData, draft: e.target.value })}
                placeholder="e.g. First Draft / White Draft"
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Draft Date</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="e.g. November 2026"
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Contact & Representation</label>
            <textarea
              rows={3}
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="Production Company, Agent, Email, Phone..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white outline-hidden focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Copyright / WGA Registration</label>
            <input
              type="text"
              value={formData.copyright}
              onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
              placeholder="e.g. © 2026 Author Name. WGAw Registered."
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-400 hover:text-white rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Title Page</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
