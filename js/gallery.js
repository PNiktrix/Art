// ============================================================
// gallery.js — GalleryRenderer
// ============================================================
// Renders the product grid and handles card selection visuals.
// Each card has two actions:
//   - Tap card body  → select/deselect (add to cart)
//   - Tap zoom icon  → open image viewer popup
//
// Image auto-slide: each card cycles through its own images
// (art1 → art1s1 → art1s2 → art1 ...) every 1.5 seconds.
// Only valid/loaded images are shown — broken ones skipped.
// ============================================================

class GalleryRenderer {
  constructor(gridId, cart, onToggle, onZoom) {
    this.el       = document.getElementById(gridId);
    this.cart     = cart;
    this.onToggle = onToggle;
    this.onZoom   = onZoom;

    // Map of productId → { imgs[], idx, timer }
    this._sliders = new Map();
  }

  render(products) {
    // Stop all running slide timers before re-render
    this._stopAllSliders();

    this.el.innerHTML = products.map(p => this._cardHTML(p)).join("");
    this._bindEvents();

    // Start image auto-slider for every card that has multiple images
    products.forEach(p => {
      if (p.images && p.images.length > 1) {
        this._startSlider(p);
      }
    });
  }

  updateCard(id) {
    const card = this.el.querySelector(`.card[data-id="${id}"]`);
    if (card) card.classList.toggle("sel", this.cart.has(id));
  }

  // ── Image auto-slider per card ────────────────────────────

  _startSlider(product) {
    const card = this.el.querySelector(`.card[data-id="${product.id}"]`);
    if (!card) return;

    const imgEl = card.querySelector(".cimg img");
    if (!imgEl) return;

    // Validate images first — only cycle through ones that load
    const validImgs = [];
    let checked = 0;

    product.images.forEach((src, i) => {
      const tester = new Image();
      tester.onload = () => {
        validImgs[i] = src;   // keep order
        checked++;
        if (checked === product.images.length) {
          // All checked — filter out nulls and start cycling
          const imgs = validImgs.filter(Boolean);
          if (imgs.length > 1) this._cycleCard(product.id, imgEl, imgs);
        }
      };
      tester.onerror = () => {
        checked++;
        if (checked === product.images.length) {
          const imgs = validImgs.filter(Boolean);
          if (imgs.length > 1) this._cycleCard(product.id, imgEl, imgs);
        }
      };
      tester.src = src;
    });
  }

 _cycleCard(productId, imgEl, imgs) {
  let idx = 0;
  const wrap = imgEl.parentElement;

  const timer = setInterval(() => {
    idx = (idx + 1) % imgs.length;

    // Preload next image before animating
    const preload = new Image();
    preload.onload = () => {

      // Create incoming image element — starts positioned to the right
      const next = document.createElement("img");
      next.src = imgs[idx];
      next.style.cssText = `
        position:absolute; inset:0;
        width:100%; height:100%;
        object-fit:cover;
        transform:translateX(100%);
        transition:transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94);
      `;
      wrap.appendChild(next);

      // Force reflow so transition fires
      next.offsetHeight;

      // Slide both in sync — next slides in from right, current slides out to left
      next.style.transform = "translateX(0)";
      imgEl.style.cssText += "transition:transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94); transform:translateX(-100%);";

      // After animation ends — remove old image, reset new one as the base
      setTimeout(() => {
        imgEl.remove();
        next.style.transition = "";
        next.style.transform  = "";
        next.style.position   = "";
        // next becomes the new imgEl reference for next cycle
        imgEl = next;
      }, 560);

    };
    preload.src = imgs[idx];

  }, 2500);

  this._sliders.set(productId, timer);
}

  _stopAllSliders() {
    this._sliders.forEach(timer => clearInterval(timer));
    this._sliders.clear();
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

          <!-- Zoom icon — tap to open full image viewer -->
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
