export interface UserReview {
  id: string;
  author: string;
  role: string;
  rating: number; // 1-5
  title: string;
  content: string;
  featureRequest?: string;
  date: string;
  likes: number;
  userLiked?: boolean;
}

const STORAGE_KEY = 'openlipi_community_reviews_v1';

const INITIAL_REVIEWS: UserReview[] = [
  {
    id: 'rev-1',
    author: 'Kiran Varma',
    role: 'Indie Film Director & Screenwriter',
    rating: 5,
    title: 'The 1:1 Hollywood PDF export page matching is unbelievable',
    content:
      'Imported a 131-page director draft and got exactly 131 pages back with perfect margins, automatic (MORE) breaks, and proper scene spacing. Having zero server fees and WebRTC live collaboration right in the browser makes this a must-have tool for our writers room.',
    featureRequest: 'A dark mode corkboard beat card color picker would be nice.',
    date: 'Oct 28, 2026',
    likes: 19,
  },
  {
    id: 'rev-2',
    author: 'Elena Rostova',
    role: 'Script Supervisor & Playwright',
    rating: 5,
    title: 'Version history diffs saved our production draft',
    content:
      'The visual diff inspector is genius. Being able to compare past revisions with green additions and red strike-throughs directly in the browser without losing local draft state is a dream. OpenLipi is remarkably fast and clean.',
    featureRequest: 'Export to final draft revision marks.',
    date: 'Oct 30, 2026',
    likes: 14,
  },
  {
    id: 'rev-3',
    author: 'Marcus Chen',
    role: 'Staff Writer & Film Educator',
    rating: 5,
    title: 'Authentic Courier Prime with zero lag',
    content:
      'Most web-based script editors choke or stutter after page 60. OpenLipi stays buttery smooth all the way through a 130-page feature. The keyboard shortcuts (Tab/Enter progression) feel identical to standard industry software.',
    featureRequest: 'Dual dialogue shortcut is already great; maybe add title page custom logo upload.',
    date: 'Nov 1, 2026',
    likes: 9,
  },
];

export const feedbackService = {
  getReviews(): UserReview[] {
    if (typeof window === 'undefined') return INITIAL_REVIEWS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load reviews from localStorage', e);
    }
    // Save defaults
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
    } catch {
      // ignore
    }
    return INITIAL_REVIEWS;
  },

  addReview(review: Omit<UserReview, 'id' | 'date' | 'likes' | 'userLiked'>): UserReview {
    const reviews = this.getReviews();
    const newReview: UserReview = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      likes: 1,
      userLiked: true,
    };
    const updated = [newReview, ...reviews];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save review', e);
    }
    return newReview;
  },

  toggleLike(reviewId: string): UserReview[] {
    const reviews = this.getReviews();
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        const userLiked = !r.userLiked;
        return {
          ...r,
          userLiked,
          likes: userLiked ? r.likes + 1 : Math.max(0, r.likes - 1),
        };
      }
      return r;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update likes', e);
    }
    return updated;
  },
};
