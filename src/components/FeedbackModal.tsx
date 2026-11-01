import React, { useState } from 'react';
import { X, Star, Send, Mail, CheckCircle2, MessageSquareHeart } from 'lucide-react';
import { feedbackService } from '../services/feedbackService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Screenwriter');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [featureRequest, setFeatureRequest] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    feedbackService.addReview({
      author: name.trim(),
      role: role.trim() || 'Writer',
      rating,
      title: title.trim() || 'Editor Feedback',
      content: content.trim(),
      featureRequest: featureRequest.trim() || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 text-neutral-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-amber-400 mb-1">
          <MessageSquareHeart className="w-5 h-5" />
          <h2 className="text-base font-semibold text-white">OpenLipi Review & Feedback</h2>
        </div>
        <p className="text-xs text-neutral-400 mb-4">
          Share your review or request a feature. Your input directly shapes OpenLipi updates.
        </p>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">Review Received!</h3>
            <p className="text-xs text-neutral-400">
              Thank you for supporting OpenLipi. Your feedback has been recorded.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Writer Name"
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Screenwriter">Screenwriter</option>
                  <option value="Film Director">Film Director</option>
                  <option value="Script Supervisor">Script Supervisor</option>
                  <option value="Indie Filmmaker">Indie Filmmaker</option>
                  <option value="Playwright">Playwright</option>
                  <option value="Film Student">Film Student</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-neutral-400 ml-2 font-mono">{rating}/5 Stars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Feedback / Review *</label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you think of OpenLipi? Any bugs or formatting notes?"
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Feature Request (Optional)
              </label>
              <input
                type="text"
                value={featureRequest}
                onChange={(e) => setFeatureRequest(e.target.value)}
                placeholder="e.g. Dialogue audio reader, Dark mode cards"
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <a
                href={`mailto:bharathsathuri@gmail.com?subject=OpenLipi%20Review&body=${encodeURIComponent(content || '')}`}
                className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Owner</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
