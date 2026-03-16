// ============================================================
// viewer.js — ImageViewer (main orchestrator)
// ============================================================
// Coordinates the zoom popup. Delegates to:
//   viewerSwipe.js  — swipe + pinch touch handling
//   viewer3d.js     — 3D model loading, colour, orbit
//
// Load order in index.html:
//   viewerSwipe.js → viewer3d.js → viewer.js
// ============================================================

class ImageViewer {
  constructor(overlayId, cart, onCartChange) {
    // DOM refs
    this._overlay  = document.getElementById(overlayId);
    this._imgWrap  = document.getElementById("zv-img-wrap");
    this._dotsEl   = document.getElementById("zv-dots");
    this._nameEl   = document.getElementById("zv-name");
    this._priceEl  = document.getElementById("zv-price");
    this._addBtn   = document.getElementById("zv-add-btn");
    this._panelImg = document.getElementById("zv-panel-img");
    this._panel3d  = document.getElementById("zv-panel-3d");

    this.cart         = cart;
    this.onCartChange = onCartChange;

    // State
    this._product   = null;
    this._validImgs = [];
    this._idx       = 0;
    this._strip     = null;
    this._slideW    = 0;

    // Sub-controllers
    this._swipe = new ViewerSwipeHandler(
      () => this._imgWrap,
      () => this._strip,
      () => this._idx,
      () => this._slideW,
      () => this._validImgs.length,
      (i) => this._goTo(i)
    );
    this._3d = new Viewer3DController("zv-panel-3d", "zv-model");
  }

  // ── Public API ────────────────────────────────────────────

  open(product) {
    this._product   = product;
    this._idx       = 0;
    this._validImgs = (product.zoomImages || product.cardImages || [product.image]).filter(Boolean);
    if (!this._validImgs.length) return;

    // Show/hide 3D tab
    const tab3d = document.getElementById("tab-3d");
    if (tab3d) tab3d.style.display = product.hasModel ? "" : "none";

    this._showTab("img");

    if (this._nameEl)  this._nameEl.textContent = product.name;
    if (this._priceEl) this._priceEl.textContent = product.displayPrice;
    this._syncAddBtn();

    this._overlay.classList.add("show");
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      this._slideW = this._imgWrap.offsetWidth;
      this._buildStrip();
      this._buildDots();
    });
  }

  close() {
    this._overlay.classList.remove("show");
    document.body.style.overflow = "";
    this._3d.stop();
    this._swipe.resetZoom();
  }

  addToCart() {
    if (!this._product) return;
    this.cart.toggle(this._product.id);
    this.onCartChange(this._product.id);
    this._syncAddBtn();
    setTimeout(() => this.close(), 300);
  }

  // Tab switch — called from HTML onclick via App.viewerTab()
  switchTab(tab) {
    this._showTab(tab);
    if (tab === "3d") this._3d.load(this._product);
  }

  // Delegated to 3D controller
  setWall(btn)       { this._3d.setWall(btn); }
  setModelColor(btn) { this._3d.setModelColor(btn); }

  // ── Private: tab ─────────────────────────────────────────

  _showTab(tab) {
    document.querySelectorAll(".zv-tab").forEach(t =>
      t.classList.toggle("active", t.id === `tab-${tab}`)
    );
    if (this._panelImg) this._panelImg.style.display = tab === "img" ? "" : "none";
    if (this._panel3d)  this._panel3d.style.display  = tab === "3d"  ? "" : "none";
  }

  // ── Private: image strip ──────────────────────────────────

  _buildStrip() {
    // Clone to wipe all stacked touch listeners — prevents the skip bug
    const fresh = this._imgWrap.cloneNode(false);
    this._imgWrap.parentNode.replaceChild(fresh, this._imgWrap);
    this._imgWrap = fresh;

    this._imgWrap.innerHTML = `<div class="zv-strip" id="zv-strip">${
      this._validImgs.map((src, i) =>
        `<div class="zv-slide" data-i="${i}">
          <img src="${src}" alt="View ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}"/>
        </div>`
      ).join("")
    }</div>`;

    this._strip = document.getElementById("zv-strip");
    this._strip.style.transform = "translateX(0)";

    // Hand off to swipe handler
    this._swipe.bind(this._imgWrap);
  }

  _buildDots() {
    if (!this._dotsEl) return;
    if (this._validImgs.length <= 1) { this._dotsEl.innerHTML = ""; return; }
    this._dotsEl.innerHTML = this._validImgs.map((_, i) =>
      `<span class="zv-dot${i === 0 ? " on" : ""}" data-i="${i}"></span>`
    ).join("");
    this._dotsEl.querySelectorAll(".zv-dot").forEach(d =>
      d.addEventListener("click", () => this._goTo(+d.dataset.i))
    );
  }

  _goTo(i, animate = true) {
    if (!this._strip || !this._slideW) return;
    this._idx    = Math.max(0, Math.min(i, this._validImgs.length - 1));
    const offset = this._idx * this._slideW;

    if (!animate) {
      this._strip.classList.add("dragging");
      this._strip.style.transform = `translateX(-${offset}px)`;
      this._strip.offsetHeight;
      this._strip.classList.remove("dragging");
    } else {
      this._strip.classList.remove("dragging");
      this._strip.style.transform = `translateX(-${offset}px)`;
    }

    if (this._dotsEl) {
      this._dotsEl.querySelectorAll(".zv-dot").forEach((d, j) =>
        d.classList.toggle("on", j === this._idx)
      );
    }
    this._swipe.resetZoom();
  }

  _syncAddBtn() {
    if (!this._product || !this._addBtn) return;
    const inCart = this.cart.has(this._product.id);
    this._addBtn.textContent = inCart ? "Remove from Order" : "Add to Order";
    this._addBtn.classList.toggle("in-cart", inCart);
  }
}
