// ============================================================
// viewer.js — ImageViewer
// ============================================================
// Zoom popup that opens when user taps the zoom icon on a card.
// Features:
//   - Swipeable image strip (same card proportions, not full screen)
//   - Dot navigation for multiple images
//   - Product name (no price — consistent with message policy)
//   - X close button just above Add to Order button
//   - Tap blank overlay to close
//   - Add to Order toggles cart selection and closes viewer
// ============================================================

class ImageViewer {
  constructor(overlayId, cart, onCartChange) {
    this._overlay    = document.getElementById(overlayId);
    this._imgWrap    = document.getElementById("zv-img-wrap");
    this._dotsEl     = document.getElementById("zv-dots");
    this._nameEl     = document.getElementById("zv-name");
    this._addBtn     = document.getElementById("zv-add-btn");
    this.cart        = cart;
    this.onCartChange = onCartChange;  // callback to sync UI after cart change

    this._currentProduct = null;
    this._imgIndex       = 0;
    this._startX         = 0;
  }

  // Open viewer for a given product
  open(product) {
    this._currentProduct = product;
    this._imgIndex = 0;

    // Build swipeable image strip
    this._renderImages(product.images);

    // Set product name
    this._nameEl.textContent = product.name;

    // Set Add to Order button state
    this._syncAddBtn();

    // Show overlay
    this._overlay.classList.add("show");
    document.body.style.overflow = "hidden";  // lock page scroll

    // Bind swipe on the image wrap
    this._bindSwipe();
  }

  close() {
    this._overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  // Called by App.zoomAddToCart() from HTML onclick
  addToCart() {
    if (!this._currentProduct) return;
    const id = this._currentProduct.id;

    // Toggle in cart
    this.cart.toggle(id);
    this.onCartChange(id);  // sync gallery card + UI

    // Update button label immediately
    this._syncAddBtn();

    // Close viewer after short delay so user sees confirmation
    setTimeout(() => this.close(), 320);
  }

  // ── Private ───────────────────────────────────────────────

  _renderImages(images) {
    // Image strip — each image same 3/4 aspect ratio as card
    this._imgWrap.innerHTML = images.map((src, i) =>
      `<div class="zv-slide${i === 0 ? " active" : ""}">
        <img src="${src}" alt="View ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}"/>
      </div>`
    ).join("");

    // Dots — only show if more than 1 image
    this._dotsEl.innerHTML = images.length > 1
      ? images.map((_, i) =>
          `<span class="zv-dot${i === 0 ? " on" : ""}" data-i="${i}"></span>`
        ).join("")
      : "";

    // Dot tap navigation
    this._dotsEl.querySelectorAll(".zv-dot").forEach(d =>
      d.addEventListener("click", () => this._goTo(+d.dataset.i))
    );
  }

  _goTo(i) {
    const slides = this._imgWrap.querySelectorAll(".zv-slide");
    const dots   = this._dotsEl.querySelectorAll(".zv-dot");
    if (!slides[i]) return;

    // Hide current, show new
    slides[this._imgIndex]?.classList.remove("active");
    dots[this._imgIndex]?.classList.remove("on");
    this._imgIndex = i;
    slides[i].classList.add("active");
    dots[i]?.classList.add("on");
  }

  _bindSwipe() {
    // Touch swipe to navigate between images
    this._imgWrap.addEventListener("touchstart", e => {
      this._startX = e.touches[0].clientX;
    }, { passive: true, once: false });

    // Remove old listener then re-add to avoid stacking
    this._imgWrap.onpointerdown = e => { this._startX = e.clientX; };
    this._imgWrap.onpointerup   = e => {
      const dx = e.clientX - this._startX;
      const total = this._currentProduct?.images.length || 1;
      if (Math.abs(dx) > 35) {
        dx < 0
          ? this._goTo(Math.min(this._imgIndex + 1, total - 1))
          : this._goTo(Math.max(this._imgIndex - 1, 0));
      }
    };
  }

  _syncAddBtn() {
    if (!this._currentProduct || !this._addBtn) return;
    const inCart = this.cart.has(this._currentProduct.id);
    // Button text and style changes based on cart state
    this._addBtn.textContent = inCart ? "Remove from Order" : "Add to Order";
    this._addBtn.classList.toggle("in-cart", inCart);
  }
}
