// ============================================================
// gallery.js — GalleryRenderer
// ============================================================
// Renders the product grid and handles card selection visuals.
// Each card has two actions:
//   - Tap card body  → select/deselect (add to cart)
//   - Tap zoom icon  → open image viewer popup
// ============================================================

class GalleryRenderer {
  constructor(gridId, cart, onToggle, onZoom) {
    this.el       = document.getElementById(gridId);
    this.cart     = cart;
    this.onToggle = onToggle;
    this.onZoom   = onZoom;   // callback to open viewer for a product id
  }

  // Render full list or filtered subset
  render(products) {
    this.el.innerHTML = products.map(p => this._cardHTML(p)).join("");
    this._bindEvents();
  }

  // Re-render a single card (used after external remove from strip)
  updateCard(id) {
    const card = this.el.querySelector(`.card[data-id="${id}"]`);
    if (card) card.classList.toggle("sel", this.cart.has(id));
  }

  // ── Private ───────────────────────────────────────────────
  _bindEvents() {
    this.el.querySelectorAll(".card").forEach(card => {
      const id = +card.dataset.id;

      // Tapping the zoom icon opens the viewer — does NOT select
      card.querySelector(".zoom-btn")?.addEventListener("click", e => {
        e.stopPropagation();   // prevent card tap from also firing
        this.onZoom(id);
      });

      // Tapping anywhere else on the card selects/deselects
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
          <button class="zoom-btn" aria-label="View more images" title="View more images">
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
