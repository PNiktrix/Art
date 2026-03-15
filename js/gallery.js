// ============================================================
// gallery.js — GalleryRenderer
// ============================================================
// Renders the product grid and handles card selection visuals.
// Each card has two actions:
//   - Tap card body  → select/deselect (add to cart)
//   - Tap zoom icon  → open image viewer popup
//
// Auto-scroll: grid slowly scrolls down automatically every 1s
// so visitors see all products without manual scrolling.
// Pauses on any user touch/scroll interaction.
// ============================================================

class GalleryRenderer {
  constructor(gridId, cart, onToggle, onZoom) {
    this.el       = document.getElementById(gridId);
    this.cart     = cart;
    this.onToggle = onToggle;
    this.onZoom   = onZoom;

    this._autoTimer  = null;   // interval handle for auto-scroll
    this._userActive = false;  // pauses auto-scroll when user is interacting
    this._resumeTimer = null;
  }

  render(products) {
    this.el.innerHTML = products.map(p => this._cardHTML(p)).join("");
    this._bindEvents();
    // Restart auto-scroll whenever gallery re-renders (e.g. category filter)
    this._startAutoScroll();
  }

  updateCard(id) {
    const card = this.el.querySelector(`.card[data-id="${id}"]`);
    if (card) card.classList.toggle("sel", this.cart.has(id));
  }

  // ── Auto-scroll ───────────────────────────────────────────

  _startAutoScroll() {
    clearInterval(this._autoTimer);

    // Scroll the page down by one card-height every 1 second
    this._autoTimer = setInterval(() => {
      if (this._userActive) return;

      const scrollable = document.scrollingElement || document.documentElement;
      const maxScroll  = scrollable.scrollHeight - scrollable.clientHeight;

      // If at bottom — scroll back to top of gallery smoothly
      if (scrollable.scrollTop >= maxScroll - 10) {
        const gridTop = this.el.offsetTop - 60; // 60px header offset
        scrollable.scrollTo({ top: gridTop, behavior: "smooth" });
      } else {
        // Advance by ~one card row height (approx 120px) per tick
        scrollable.scrollBy({ top: 120, behavior: "smooth" });
      }
    }, 1000);

    // Pause auto-scroll when user touches or scrolls manually
    const pause = () => {
      this._userActive = true;
      clearTimeout(this._resumeTimer);
      // Resume auto-scroll 4 seconds after user stops interacting
      this._resumeTimer = setTimeout(() => { this._userActive = false; }, 4000);
    };

    window.addEventListener("touchstart", pause, { passive: true });
    window.addEventListener("wheel",      pause, { passive: true });
    window.addEventListener("scroll",     pause, { passive: true });
  }

  // ── Private ───────────────────────────────────────────────

  _bindEvents() {
    this.el.querySelectorAll(".card").forEach(card => {
      const id = +card.dataset.id;

      // Zoom icon — opens viewer, does NOT select
      card.querySelector(".zoom-btn")?.addEventListener("click", e => {
        e.stopPropagation();
        this.onZoom(id);
      });

      // Card tap — selects/deselects
      card.addEventListener("click", () => {
        this.onToggle(id);
        card.classList.toggle("sel", this.cart.has(id));
      });
    });
  }

  _cardHTML(p) {
    const isSelected = this.cart.has(p.id);
    return `
      <div class="card${isSelected ? " sel" : ""}" data-id="${p.id}">
        <div class="cimg">
          <img src="${p.image}" alt="${p.name}" loading="lazy"/>
          ${p.tag ? `<span class="ctag">${p.tag}</span>` : ""}

          <!-- Zoom icon — tap to open image viewer popup -->
          <button class="zoom-btn" aria-label="View more images">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          <!-- Gold checkmark — appears when selected -->
          <div class="tick">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <div class="cinfo">
          <div class="cname">${p.name}</div>
          <div class="cprice">${p.displayPrice}</div>
        </div>
      </div>`;
  }
}
