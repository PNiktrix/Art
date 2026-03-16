// ============================================================
// viewerSwipe.js — ViewerSwipeHandler
// ============================================================
// Handles all touch interactions inside the image viewer:
//   - Horizontal swipe to navigate between slides (one at a time)
//   - Pinch to zoom on the current image
//   - Double-tap to reset zoom
//
// Extracted from viewer.js for clarity.
// Used by: ImageViewer (viewer.js)
// ============================================================

class ViewerSwipeHandler {
  constructor(getWrap, getStrip, getIdx, getSlideW, getImgCount, goTo) {
    // Getters — called fresh each use so always have current values
    this._getWrap     = getWrap;
    this._getStrip    = getStrip;
    this._getIdx      = getIdx;
    this._getSlideW   = getSlideW;
    this._getImgCount = getImgCount;
    this._goTo        = goTo;

    // Pinch state
    this._pinch = { active: false, startDist: 0, scale: 1, el: null };
  }

  // Call once after a new strip is built — attaches all listeners
  bind(imgWrap) {
    this._bindSwipe(imgWrap);
    this._bindPinch(imgWrap);
  }

  resetZoom() {
    if (this._pinch.el) this._pinch.el.style.transform = "scale(1)";
    this._pinch = { active: false, startDist: 0, scale: 1, el: null };
  }

  // ── Swipe ─────────────────────────────────────────────────

  _bindSwipe(wrap) {
    let startX = 0, startY = 0, curX = 0;
    let dragging = false, horiz = false;

    const snap = () => {
      const strip = this._getStrip();
      if (strip) strip.classList.remove("dragging");
      const dx    = curX - startX;
      const w     = this._getSlideW();
      const total = this._getImgCount();
      if (Math.abs(dx) > w * 0.15) {
        dx < 0
          ? this._goTo(Math.min(this._getIdx() + 1, total - 1))
          : this._goTo(Math.max(this._getIdx() - 1, 0));
      } else {
        this._goTo(this._getIdx());
      }
    };

    wrap.addEventListener("touchstart", e => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      curX   = startX;
      dragging = true; horiz = false;
    }, { passive: true });

    wrap.addEventListener("touchmove", e => {
      if (!dragging || e.touches.length !== 1) return;
      curX = e.touches[0].clientX;
      const dx = curX - startX, dy = e.touches[0].clientY - startY;
      if (!horiz && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      if (!horiz) {
        horiz = Math.abs(dx) > Math.abs(dy);
        if (!horiz) { dragging = false; return; }
      }
      e.preventDefault();
      const strip = this._getStrip();
      if (strip) {
        strip.classList.add("dragging");
        strip.style.transform = `translateX(-${(this._getIdx() * this._getSlideW()) - dx}px)`;
      }
    }, { passive: false });

    wrap.addEventListener("touchend",    () => { if (!dragging) return; dragging = false; snap(); }, { passive: true });
    wrap.addEventListener("touchcancel", () => { dragging = false; snap(); }, { passive: true });
  }

  // ── Pinch zoom ────────────────────────────────────────────

  _bindPinch(wrap) {
    wrap.addEventListener("touchstart", e => {
      if (e.touches.length !== 2) return;
      this._pinch.active    = true;
      this._pinch.startDist = this._dist(e.touches);
      const strip = this._getStrip();
      this._pinch.el = strip?.querySelector(`.zv-slide[data-i="${this._getIdx()}"] img`) || null;
    }, { passive: true });

    wrap.addEventListener("touchmove", e => {
      if (!this._pinch.active || e.touches.length !== 2) return;
      e.preventDefault();
      const ratio = this._dist(e.touches) / this._pinch.startDist;
      this._pinch.scale = Math.min(Math.max(ratio, 1), 4);
      if (this._pinch.el) this._pinch.el.style.transform = `scale(${this._pinch.scale})`;
    }, { passive: false });

    wrap.addEventListener("touchend", e => {
      if (e.touches.length < 2) this._pinch.active = false;
    }, { passive: true });

    // Double-tap to reset zoom
    let last = 0;
    wrap.addEventListener("touchend", () => {
      const now = Date.now();
      if (now - last < 300) this.resetZoom();
      last = now;
    }, { passive: true });
  }

  _dist(t) {
    return Math.sqrt((t[0].clientX - t[1].clientX) ** 2 + (t[0].clientY - t[1].clientY) ** 2);
  }
}
