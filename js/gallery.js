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
  }

  render(products) {
    this.el.innerHTML = products.map(p => this._cardHTML(p)).join("");
    this._bindEvents();
    products.forEach(p => {
      if (p.cardImages && p.cardImages.length > 1) this._startSlider(p);
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

    const validImgs = [];
    let checked = 0;

    product.cardImages.forEach((src, i) => {
      const tester = new Image();
      tester.onload = () => {
        validImgs[i] = src;
        checked++;
        if (checked === product.cardImages.length) {
          const imgs = validImgs.filter(Boolean);
          if (imgs.length > 1) {
            // Slide once after a short delay — then stop (manual only)
            setTimeout(() => this._slideOnce(product.id, imgEl, imgs), 1200 + (product.id * 180));
          }
        }
      };
      tester.onerror = () => {
        checked++;
        if (checked === product.cardImages.length) {
          const imgs = validImgs.filter(Boolean);
          if (imgs.length > 1) {
            setTimeout(() => this._slideOnce(product.id, imgEl, imgs), 1200 + (product.id * 180));
          }
        }
      };
      tester.src = src;
    });
  }

  // Slide to the next image exactly once — then bind manual swipe
  _slideOnce(productId, imgEl, imgs) {
    let curr    = imgEl;
    let idx     = 0;
    const wrap  = curr.parentElement;
    const total = imgs.length;

    // One-time intro slide
    this._doSlide(wrap, curr, imgs[1], next => {
      curr = next;
      idx  = 1;
      // After the intro slide, allow manual left/right swipe on the card
      this._bindCardSwipe(wrap, imgs, () => idx, (i) => {
        idx = i;
        this._doSlide(wrap, curr, imgs[i], n => { curr = n; });
      });
    });
  }

  // Animate one slide transition — calls back with the new current element
  _doSlide(wrap, curr, nextSrc, onDone) {
    const preload   = new Image();
    preload.onload  = () => {
      const next = document.createElement("img");
      next.src   = nextSrc;
      next.style.cssText = [
        "position:absolute","top:0","left:0",
        "width:100%","height:100%",
        "object-fit:cover","border-radius:inherit",
        "transform:translateX(100%)",
        "transition:transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)"
      ].join(";");
      wrap.appendChild(next);
      next.getBoundingClientRect();
      next.style.transform = "translateX(0)";
      curr.style.cssText  += ";transition:transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94);transform:translateX(-100%)";
      setTimeout(() => {
        curr.remove();
        next.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit";
        if (onDone) onDone(next);
      }, 520);
    };
    preload.src = nextSrc;
  }

  // Bind swipe left/right on a card image area
  _bindCardSwipe(wrap, imgs, getIdx, goTo) {
    let sx = 0;
    wrap.addEventListener("touchstart", e => {
      sx = e.touches[0].clientX;
    }, { passive: true });
    wrap.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) < 30) return;
      const total = imgs.length;
      const cur   = getIdx();
      if (dx < 0) {
        // Swipe left — next image
        goTo((cur + 1) % total);
      } else {
        // Swipe right — previous image
        goTo((cur - 1 + total) % total);
      }
    }, { passive: true });
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

          <!-- Heart / wishlist button — top left -->
          <button class="heart-btn" data-id="${p.id}" aria-label="Add to wishlist"
            onclick="event.stopPropagation();App.wishlistToggle(${p.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="12" height="12">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

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
