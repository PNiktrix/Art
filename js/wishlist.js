// ============================================================
// wishlist.js — WishlistManager
// ============================================================
// Heart-icon wishlist that slides in from the right.
// Persists in localStorage across sessions.
// Inspired by LV's MyLV wishlist — clean, minimal, luxurious.
// ============================================================

class WishlistManager {
  constructor(repo) {
    this.repo    = repo;
    this._set    = new Set(WishlistManager._load());
    this._panel  = document.getElementById("wishlist-panel");
    this._overlay = document.getElementById("wishlist-overlay");
  }

  // ── Public API ────────────────────────────────────────────

  // Toggle heart on a product — add or remove from wishlist
  toggle(productId) {
    if (this._set.has(productId)) {
      this._set.delete(productId);
    } else {
      this._set.add(productId);
    }
    this._save();
    this._syncHearts();
    this._syncBadge();
  }

  has(id) { return this._set.has(id); }
  count() { return this._set.size; }

  open() {
    this._renderPanel();
    this._panel.classList.add("open");
    this._overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  close() {
    this._panel.classList.remove("open");
    this._overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  // Called after gallery re-renders — re-attach heart states
  syncAfterRender() {
    this._syncHearts();
    this._syncBadge();
  }

  // ── Private ───────────────────────────────────────────────

  _renderPanel() {
    const ids = [...this._set];
    const products = ids.map(id => this.repo.byId(id)).filter(Boolean);

    this._panel.innerHTML = `
      <div class="wl-header">
        <div class="wl-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Wishlist
          <span class="wl-count-label">${products.length} item${products.length !== 1 ? "s" : ""}</span>
        </div>
        <button class="wl-close" onclick="App.wishlistClose()">&#x2715;</button>
      </div>

      <div class="wl-body">
        ${products.length === 0
          ? `<div class="wl-empty">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="48" height="48">
                 <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
               </svg>
               <p>Your wishlist is empty.</p>
               <span>Tap the heart on any print to save it here.</span>
             </div>`
          : products.map(p => `
              <div class="wl-item">
                <div class="wl-item-img">
                  <img src="${p.image}" alt="${p.name}" loading="lazy"/>
                </div>
                <div class="wl-item-info">
                  <div class="wl-item-name">${p.name}</div>
                  <div class="wl-item-price">${p.displayPrice}</div>
                  <div class="wl-item-actions">
                    <button class="wl-add-btn" onclick="App.wishlistAddToCart(${p.id})">
                      Add to Order
                    </button>
                    <button class="wl-remove-btn" onclick="App.wishlistRemove(${p.id})">
                      Remove
                    </button>
                  </div>
                </div>
              </div>`
            ).join("")
        }
      </div>
    `;
  }

  // Sync heart icons on all gallery cards
  _syncHearts() {
    document.querySelectorAll(".heart-btn").forEach(btn => {
      const id = +btn.dataset.id;
      btn.classList.toggle("loved", this._set.has(id));
    });
  }

  // Sync header badge count
  _syncBadge() {
    const badge = document.getElementById("wl-badge");
    const n = this._set.size;
    if (badge) {
      badge.textContent = n;
      badge.style.display = n > 0 ? "flex" : "none";
    }
  }

  remove(id) {
    this._set.delete(id);
    this._save();
    this._syncHearts();
    this._syncBadge();
    this._renderPanel();   // refresh open panel
  }

  // ── Static: localStorage ─────────────────────────────────

  _save() {
    try { localStorage.setItem("pniktrix_wishlist", JSON.stringify([...this._set])); }
    catch(e) {}
  }

  static _load() {
    try { return JSON.parse(localStorage.getItem("pniktrix_wishlist") || "[]"); }
    catch(e) { return []; }
  }
}
