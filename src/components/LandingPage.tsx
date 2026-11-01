import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  GitBranch,
  Users,
  Download,
  LayoutGrid,
  Star,
  ThumbsUp,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Film,
  MessageSquareQuote,
  Feather,
} from 'lucide-react';
import { OpenLipiLogo } from './OpenLipiLogo';
import { feedbackService, UserReview } from '../services/feedbackService';

interface LandingPageProps {
  onOpenEditor: () => void;
  onOpenBeatBoard: () => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
  onOpenVersionHistory: () => void;
  onOpenCollab: () => void;
  scriptTitle: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenEditor,
  onOpenBeatBoard,
  onOpenImport,
  onOpenExport,
  onOpenVersionHistory,
  onOpenCollab,
  scriptTitle,
}) => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [filterRating, setFilterRating] = useState<number>(0);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('Screenwriter');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [featureRequest, setFeatureRequest] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    setReviews(feedbackService.getReviews());
  }, []);

  const handleLike = (id: string) => {
    const updated = feedbackService.toggleLike(id);
    setReviews(updated);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    const newRev = feedbackService.addReview({
      author: name.trim(),
      role: role.trim() || 'Writer',
      rating,
      title: title.trim() || 'Screenwriter Review',
      content: content.trim(),
      featureRequest: featureRequest.trim() || undefined,
    });

    setReviews([newRev, ...reviews]);
    setFormSubmitted(true);
    setName('');
    setTitle('');
    setContent('');
    setFeatureRequest('');

    setTimeout(() => {
      setFormSubmitted(false);
    }, 4000);
  };

  const filteredReviews = filterRating > 0
    ? reviews.filter((r) => r.rating >= filterRating)
    : reviews;

  return (
    <div className="min-h-full bg-neutral-950 text-neutral-100 overflow-y-auto selection:bg-amber-500/20 selection:text-amber-300">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-b border-neutral-800/80">
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo & Brand Display */}
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-neutral-900/90 rounded-2xl border border-amber-500/30 shadow-xl shadow-amber-500/5">
              <OpenLipiLogo size="xl" showText={false} />
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            Open<span className="text-amber-400">Lipi</span>
          </h1>

          <p className="text-xl sm:text-2xl text-neutral-300 font-light mb-6 leading-relaxed">
            Studio-Grade Screenplay Writing & Director Reference Suite
          </p>

          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto mb-8 leading-normal">
            Free, open-source, and 100% client-side. Calibrated to Hollywood standard 51 lines per page,
            real-time peer-to-peer co-authoring, automated version control diffs, director PDF import, and universal multi-format exports.
          </p>

          {/* Clean Unboxed Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-400 mb-10">
            <span>100% Free & Open Source</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>Hollywood Standard 1:1 Page Calibration</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>Zero Server Fees (WebRTC P2P)</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>Created by Bharath Sathuri</span>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onOpenEditor}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm rounded-lg shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Launch Studio Editor</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenImport}
              className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm rounded-lg border border-neutral-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Import Reference Script (PDF / FDX)</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('reviews-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-5 py-3.5 text-neutral-300 hover:text-white font-medium text-sm rounded-lg hover:bg-neutral-900/60 transition-all cursor-pointer"
            >
              <span>Read & Give Feedback</span>
            </button>
          </div>

          {/* Active Working Script Notice if one is loaded */}
          {scriptTitle && (
            <div className="mt-8 text-xs text-neutral-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Working Draft in Memory:</span>
              <span className="font-mono text-neutral-300 font-semibold">{scriptTitle}</span>
              <button
                onClick={onOpenEditor}
                className="text-amber-400 underline hover:text-amber-300 ml-1"
              >
                Resume writing →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-b border-neutral-800/80">
        <div className="mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Crafted for Professional Screenwriters & Directors
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            Everything you need from initial beat outlining to production draft delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-neutral-900/60 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Exact Hollywood 1:1 Formatting</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Strict Courier Prime 12pt with authentic 1.5&quot; brad margin, 35-character dialogue columns, and precision 51-line page height with automatic <code className="text-amber-300">(MORE)</code> and <code className="text-amber-300">(CONT&apos;D)</code> page-break splits.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-neutral-900/60 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Director Reference PDF Ingestion</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Import public and director reference PDFs. OpenLipi extracts cover page metadata, strips running headers and page numbers, and preserves scene flow so you can read, study, or edit directly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-neutral-900/60 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Version Control & Visual Diff</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Take snapshots, save revision milestones, and inspect changes with an interactive visual diff engine highlighting additions in green, deletions in red, and modifications in amber.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-neutral-900/60 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Serverless P2P Real-Time Co-Authoring</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Collaborate live with co-writers over WebRTC DataChannels. Instant 6-letter room codes, live cursor indicators, and script chat with zero subscriptions and zero server costs.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 bg-neutral-900/60 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Multi-Format Studio Exporter</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Export to studio-ready PDF with cover pages, Microsoft Word <code className="text-amber-300">.docx</code> with screenplay paragraph styles, Fountain plain text, Final Draft <code className="text-amber-300">.fdx</code>, and full JSON project archives.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 bg-neutral-900/60 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Beat Board, Character Tracker & Stats</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Organize your narrative with an interactive corkboard beat board, track dialogue lines and scene appearances per character, and monitor estimated runtime (1 page ≈ 1 minute).
            </p>
          </div>
        </div>
      </section>

      {/* Screenplay Formatting Sample Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-b border-neutral-800/80">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Authentic Script Experience</h2>
          <p className="text-xs text-neutral-400">Courier Prime typography preview with authentic Hollywood margins</p>
        </div>

        <div className="p-8 sm:p-12 bg-white text-neutral-900 rounded-xl shadow-2xl font-mono text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto border border-neutral-300 select-none">
          <p className="font-bold mb-4">EXT. RAIN-SLICKED ALLEY - NIGHT</p>
          <p className="mb-4">
            Water cascades down rusted fire escapes. A single neon sign hums with amber light.
          </p>
          <p className="text-center font-bold mb-1">SARAH</p>
          <p className="text-center italic text-neutral-600 mb-1">(checking her pocket watch)</p>
          <p className="max-w-xs mx-auto text-center mb-4">
            We only have five minutes before the courier arrives. Keep your eyes on the corner.
          </p>
          <p className="text-right italic text-neutral-600">CUT TO:</p>
        </div>
      </section>

      {/* Interactive Review & Feedback Section */}
      <section id="reviews-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-semibold mb-2">
            <MessageSquareQuote className="w-4 h-4" />
            <span>COMMUNITY FEEDBACK & REVIEWS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Screenwriter & Filmmaker Reviews
          </h2>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto">
            Share your experience using OpenLipi, report feedback, or request features directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Submit Review Form */}
          <div className="lg:col-span-5 bg-neutral-900/80 p-6 rounded-xl border border-neutral-800">
            <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
              <Feather className="w-4 h-4 text-amber-400" />
              <span>Leave a Review or Feature Request</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-5">
              Your feedback helps shape the future of OpenLipi.
            </p>

            {formSubmitted && (
              <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Thank you! Your review has been added to the community wall.</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Your Name / Moniker *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chris Nolan or IndieWriter42"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Role in Filmmaking / Writing
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Screenwriter">Screenwriter</option>
                  <option value="Film Director">Film Director</option>
                  <option value="Script Supervisor">Script Supervisor</option>
                  <option value="Indie Filmmaker">Indie Filmmaker</option>
                  <option value="Playwright">Playwright</option>
                  <option value="Film Student">Film Student</option>
                  <option value="Story Editor">Story Editor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-neutral-400 ml-2 font-mono">{rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Review Headline / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Perfect for my writers room collaboration"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Your Review / Experience *
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share what you like about the editor, page count accuracy, formatting, or workflow..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Feature Request or Suggestion (Optional)
                </label>
                <input
                  type="text"
                  value={featureRequest}
                  onChange={(e) => setFeatureRequest(e.target.value)}
                  placeholder="e.g. Dark mode corkboard or Final Draft revision markers"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs rounded shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Review to Community</span>
                </button>

                <a
                  href={`mailto:bharathsathuri@gmail.com?subject=OpenLipi%20Feedback%20from%20${encodeURIComponent(name || 'User')}&body=${encodeURIComponent(content || '')}`}
                  className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email Bharath Sathuri Directly</span>
                </a>
              </div>
            </form>
          </div>

          {/* Right Column: Community Reviews Wall */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filter segmented buttons */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="text-xs text-neutral-400 font-medium">
                {filteredReviews.length} Community Reviews
              </div>

              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                <button
                  onClick={() => setFilterRating(0)}
                  className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                    filterRating === 0 ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterRating(5)}
                  className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                    filterRating === 5 ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  ★ 5 Stars
                </button>
                <button
                  onClick={() => setFilterRating(4)}
                  className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                    filterRating === 4 ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  ★ 4+ Stars
                </button>
              </div>
            </div>

            {/* Review Cards */}
            <div className="space-y-3.5">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-neutral-900/60 rounded-xl border border-neutral-800/80 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{rev.author}</span>
                        <span className="text-[11px] text-neutral-400">· {rev.role}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-neutral-500 ml-1.5">{rev.date}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLike(rev.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        rev.userLiked
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-[11px]">{rev.likes}</span>
                    </button>
                  </div>

                  <h4 className="text-xs font-medium text-amber-300 mb-1.5">{rev.title}</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed mb-3">{rev.content}</p>

                  {rev.featureRequest && (
                    <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-start gap-1.5 text-[11px] text-neutral-400">
                      <span className="text-amber-400 font-medium">Idea:</span>
                      <span className="italic">{rev.featureRequest}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Author & Maintainer Footer Section */}
      <footer className="mt-16 py-12 border-t border-neutral-800 bg-neutral-950 px-4 sm:px-6 lg:px-8 text-center text-xs text-neutral-400">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center">
            <OpenLipiLogo size="md" />
          </div>

          <p className="text-neutral-300">
            <strong>OpenLipi</strong> is an open-source, studio-grade screenplay writing web app designed and maintained by{' '}
            <strong className="text-white">Bharath Sathuri</strong>.
          </p>

          <p className="text-neutral-500">
            Ownership and project attribution belong to <strong>Bharath Sathuri</strong> now and in all future releases.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400 pt-2">
            <a
              href="mailto:bharathsathuri@gmail.com"
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>bharathsathuri@gmail.com</span>
            </a>
            <span aria-hidden="true">·</span>
            <button onClick={onOpenEditor} className="hover:text-amber-400 transition-colors">
              Studio Editor
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={onOpenBeatBoard} className="hover:text-amber-400 transition-colors">
              Beat Board
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={onOpenImport} className="hover:text-amber-400 transition-colors">
              Import Script
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={onOpenExport} className="hover:text-amber-400 transition-colors">
              Export (PDF/Word/FDX)
            </button>
          </div>

          <div className="text-[11px] text-neutral-600 pt-4">
            Released under MIT License. No server fees, no tracking, free forever.
          </div>
        </div>
      </footer>
    </div>
  );
};
