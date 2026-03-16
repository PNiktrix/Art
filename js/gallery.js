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

    // Start image auto-slider for every card that has multiple card images
    products.forEach(p => {
      if (p.cardImages && p.cardImages.length > 1) {
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

    // Use cardImages — max 3 images for the card auto-slide
    product.cardImages.forEach((src, i) => {
      const tester = new Image();
      tester.onload = () => {
        validImgs[i] = src;
        checked++;
        if (checked === product.cardImages.length) {
          const imgs = validImgs.filter(Boolean);
          if (imgs.length > 1) this._cycleCard(product.id, imgEl, imgs);
        }
      };
      tester.onerror = () => {
        checked++;
        if (checked === product.cardImages.length) {
          const imgs = validImgs.filter(Boolean);
          if (imgs.length > 1) this._cycleCard(product.id, imgEl, imgs);
        }
      };
      tester.src = src;
    });
  }

  _cycleCard(productId, imgEl, imgs) {
    let idx  = 0;
    // Keep a live reference — gets updated as new img elements are created
    let curr = imgEl;
    const wrap = curr.parentElement;

    const timer = setInterval(() => {
      idx = (idx + 1) % imgs.length;

      // Preload next image before animating — prevents flash
      const preload = new Image();
      preload.onload = () => {
        // Create the incoming image starting off-screen right
        const next = document.createElement("img");
        next.src = imgs[idx];
        next.style.cssText = [
          "position:absolute",
          "top:0", "left:0",
          "width:100%", "height:100%",
          "object-fit:cover",
          "border-radius:inherit",
          "transform:translateX(100%)",
          "transition:transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)"
        ].join(";");

        wrap.appendChild(next);

        // Force reflow so transition fires
        next.getBoundingClientRect();

        // Slide next in from right, current out to left simultaneously
        next.style.transform = "translateX(0)";
        curr.style.cssText  += ";transition:transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94);transform:translateX(-100%)";

        setTimeout(() => {
          curr.remove();
          // Clean up inline styles from next so it behaves as a normal img
          next.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit";
          // Update live reference for next cycle
          curr = next;
        }, 580);
      };
      preload.src = imgs[idx];

    }, 2800); // 2.8s between slides — enough time to see each image clearly

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

      card.addEventListener("click", e => {
        // Zoom button — open image viewer
        if (e.target.closest(".zoom-btn")) {
          e.stopPropagation();
          this.onZoom(id);
          return;
        }
        // 3D button — open viewer directly on 3D tab
        if (e.target.closest(".card-3d-btn")) {
          e.stopPropagation();
          this.onZoom(id, "3d");   // pass tab hint to app
          return;
        }
        // Card body — select/deselect
        this.onToggle(id);
        card.classList.toggle("sel", this.cart.has(id));
      });
    });
  }

  _cardHTML(p) {
    const isSelected = this.cart.has(p.id);

    const btn3d = p.hasModel
      ? `<button class="card-3d-btn" aria-label="View in 3D">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M12 2L2 7l10 5 10-5-10-5z"/>
             <path d="M2 17l10 5 10-5"/>
             <path d="M2 12l10 5 10-5"/>
           </svg>
         </button>`
      : "";

    return `
      <div class="card${isSelected ? " sel" : ""}" data-id="${p.id}">
        <div class="cimg">
          <img src="${p.image}" alt="${p.name}" loading="lazy"/>
          ${p.tag ? `<span class="ctag">${p.tag}</span>` : ""}

          ${btn3d}

          <button class="zoom-btn" aria-label="Photos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

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